'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import type { TranscriptMessage } from '@/lib/types/transcript';
import type { DeepgramConfig } from '@/lib/types/agent';
import type { VoiceAgentState, DeepgramEvent } from '@/lib/types/deepgram';

interface UseDeepgramAgentOptions {
  onMessage?: (message: TranscriptMessage) => void;
  onError?: (error: string) => void;
  onStateChange?: (state: VoiceAgentState) => void;
}

interface UseDeepgramAgentReturn {
  state: VoiceAgentState;
  messages: TranscriptMessage[];
  connect: (config: DeepgramConfig) => Promise<void>;
  disconnect: () => void;
  toggleMute: () => void;
  isMuted: boolean;
}

const DEEPGRAM_AGENT_URL = 'wss://agent.deepgram.com/v1/agent/converse';
const DG_INPUT_SAMPLE_RATE = 16000;
const DG_OUTPUT_SAMPLE_RATE = 24000;
const PLAYBACK_JITTER_BUFFER_SEC = 0.1;

export function useDeepgramAgent(options: UseDeepgramAgentOptions = {}): UseDeepgramAgentReturn {
  const { onMessage, onError, onStateChange } = options;

  const [state, setState] = useState<VoiceAgentState>({
    isConnected: false,
    isListening: false,
    isSpeaking: false,
    isThinking: false,
    error: null,
  });

  const [messages, setMessages] = useState<TranscriptMessage[]>([]);
  const [isMuted, setIsMuted] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const playbackAudioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const workletRef = useRef<AudioWorkletNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const audioQueueRef = useRef<Float32Array[]>([]);
  const nextPlaybackTimeRef = useRef(0);
  const configRef = useRef<DeepgramConfig | null>(null);
  const settingsAppliedRef = useRef(false);
  const settingsSentRef = useRef(false);
  const sessionIdRef = useRef(0);
  const startMicrophoneRef = useRef<(sessionId: number) => Promise<void>>(async () => {});

  // Update state and notify
  const updateState = useCallback((updates: Partial<VoiceAgentState>) => {
    setState(prev => {
      const newState = { ...prev, ...updates };
      onStateChange?.(newState);
      return newState;
    });
  }, [onStateChange]);

  // Add message and notify
  const addMessage = useCallback((message: TranscriptMessage) => {
    setMessages(prev => [...prev, message]);
    onMessage?.(message);
  }, [onMessage]);

  const ensurePlaybackContext = useCallback(async (sessionId: number) => {
    if (!playbackAudioContextRef.current) {
      playbackAudioContextRef.current = new AudioContext({ sampleRate: DG_OUTPUT_SAMPLE_RATE });
      nextPlaybackTimeRef.current = 0;
    }

    if (sessionId !== sessionIdRef.current) return;

    if (playbackAudioContextRef.current.state === 'suspended') {
      await playbackAudioContextRef.current.resume();
    }
  }, []);

  // Schedule audio playback with a small jitter buffer to avoid crackling.
  const playAudioQueue = useCallback(() => {
    const ctx = playbackAudioContextRef.current;
    if (!ctx || audioQueueRef.current.length === 0) return;

    if (nextPlaybackTimeRef.current < ctx.currentTime + PLAYBACK_JITTER_BUFFER_SEC) {
      nextPlaybackTimeRef.current = ctx.currentTime + PLAYBACK_JITTER_BUFFER_SEC;
    }

    while (audioQueueRef.current.length > 0) {
      const audioData = audioQueueRef.current.shift();
      if (!audioData) break;

      try {
        const audioBuffer = ctx.createBuffer(1, audioData.length, DG_OUTPUT_SAMPLE_RATE);
        audioBuffer.getChannelData(0).set(audioData);

        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.start(nextPlaybackTimeRef.current);
        nextPlaybackTimeRef.current += audioBuffer.duration;
      } catch (e) {
        console.error('Audio playback error:', e);
      }
    }
  }, []);

  // Handle WebSocket messages
  const handleMessage = useCallback((event: MessageEvent) => {
    // Handle binary audio data
    if (event.data instanceof ArrayBuffer) {
      const int16Array = new Int16Array(event.data);
      const float32Array = new Float32Array(int16Array.length);
      
      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768;
      }

      audioQueueRef.current.push(float32Array);
      playAudioQueue();
      return;
    }

    // Handle Blob data (convert to ArrayBuffer)
    if (event.data instanceof Blob) {
      event.data.arrayBuffer().then(buffer => {
        const int16Array = new Int16Array(buffer);
        const float32Array = new Float32Array(int16Array.length);
        
        for (let i = 0; i < int16Array.length; i++) {
          float32Array[i] = int16Array[i] / 32768;
        }

        audioQueueRef.current.push(float32Array);
        playAudioQueue();
      });
      return;
    }

    // Handle JSON messages
    try {
      const data: DeepgramEvent = JSON.parse(event.data);
      console.log('Deepgram event:', data.type, data);
      
      switch (data.type) {
        case 'Welcome':
          console.log('Deepgram agent connected');
          // Fallback: if settings were not sent on open for any reason, send now.
          if (!settingsSentRef.current && wsRef.current && configRef.current) {
            wsRef.current.send(JSON.stringify(configRef.current));
            settingsSentRef.current = true;
            console.log('Deepgram settings sent after Welcome fallback');
          }
          break;

        case 'SettingsApplied':
          settingsAppliedRef.current = true;
          console.log('Deepgram settings applied, microphone streaming enabled');
          updateState({ isConnected: true, error: null });
          if (!mediaStreamRef.current) {
            void startMicrophoneRef.current(sessionIdRef.current).catch((error) => {
              const errorMsg = error instanceof Error ? error.message : 'Failed to start microphone';
              console.error('Microphone start error:', errorMsg);
              updateState({ error: errorMsg, isConnected: false });
              onError?.(errorMsg);
            });
          }
          break;

        case 'History':
          // Optional context snapshot from Deepgram; safe to ignore in UI.
          break;

        case 'ConversationText':
          if ('role' in data && 'content' in data) {
            addMessage({
              role: data.role as 'user' | 'assistant',
              content: data.content as string,
            });
          }
          break;

        case 'UserStartedSpeaking':
          updateState({ isListening: true, isSpeaking: false });
          break;

        case 'AgentStartedSpeaking':
          updateState({ isSpeaking: true, isListening: false, isThinking: false });
          break;

        case 'AgentThinking':
          updateState({ isThinking: true });
          break;

        case 'AgentAudioDone':
          updateState({ isSpeaking: false });
          break;

        case 'Error':
          const errorMsg =
            (data as { description?: string; message?: string }).description ||
            (data as { description?: string; message?: string }).message ||
            'Unknown error';
          console.error('Deepgram error:', errorMsg);
          updateState({ error: errorMsg });
          onError?.(errorMsg);
          break;

        default:
          // Log unknown events for debugging
          console.log('Unknown Deepgram event:', data.type);
      }
    } catch (error) {
      console.error('Failed to parse Deepgram message:', error, event.data);
    }
  }, [addMessage, updateState, playAudioQueue, onError]);

  // Get Deepgram API key from server
  const getApiKey = async (): Promise<string> => {
    const response = await fetch('/api/deepgram/token');
    if (!response.ok) {
      throw new Error('Failed to get Deepgram API key');
    }
    const data = await response.json();
    if (!data.apiKey) {
      throw new Error('No API key returned from server');
    }
    return data.apiKey;
  };

  // Start microphone capture
  const startMicrophone = useCallback(async (sessionId: number) => {
    try {
      console.log('Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: DG_INPUT_SAMPLE_RATE,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      if (sessionId !== sessionIdRef.current) {
        stream.getTracks().forEach(track => track.stop());
        return;
      }

      console.log('Microphone access granted');
      mediaStreamRef.current = stream;

      // Create audio context for processing
      audioContextRef.current = new AudioContext({ sampleRate: DG_INPUT_SAMPLE_RATE });
      await audioContextRef.current.resume();
      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);

      const sendPcmFrame = (inputData: Float32Array) => {
        if (
          wsRef.current?.readyState !== WebSocket.OPEN ||
          !settingsAppliedRef.current ||
          isMuted
        ) {
          return;
        }

        const int16Data = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          int16Data[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
        }

        wsRef.current.send(int16Data.buffer);
      };

      if (audioContextRef.current.audioWorklet) {
        const workletCode = `
          class PcmCaptureProcessor extends AudioWorkletProcessor {
            process(inputs) {
              const input = inputs[0];
              if (!input || input.length === 0) return true;
              const channel = input[0];
              if (!channel) return true;
              this.port.postMessage(new Float32Array(channel));
              return true;
            }
          }
          registerProcessor('pcm-capture-processor', PcmCaptureProcessor);
        `;
        const blob = new Blob([workletCode], { type: 'application/javascript' });
        const moduleUrl = URL.createObjectURL(blob);
        try {
          await audioContextRef.current.audioWorklet.addModule(moduleUrl);
        } finally {
          URL.revokeObjectURL(moduleUrl);
        }

        if (sessionId !== sessionIdRef.current) {
          return;
        }

        workletRef.current = new AudioWorkletNode(audioContextRef.current, 'pcm-capture-processor', {
          numberOfInputs: 1,
          numberOfOutputs: 0,
          channelCount: 1,
        });

        workletRef.current.port.onmessage = (message: MessageEvent<Float32Array>) => {
          sendPcmFrame(message.data);
        };

        sourceRef.current.connect(workletRef.current);
      } else {
        // Fallback for older browsers that do not support AudioWorklet.
        processorRef.current = audioContextRef.current.createScriptProcessor(2048, 1, 1);
        processorRef.current.onaudioprocess = (e) => {
          sendPcmFrame(e.inputBuffer.getChannelData(0));
        };
        sourceRef.current.connect(processorRef.current);
        processorRef.current.connect(audioContextRef.current.destination);
      }

      console.log('Microphone started and streaming');
    } catch (error) {
      console.error('Failed to start microphone:', error);
      throw new Error('Microphone access denied. Please allow microphone access to use voice features.');
    }
  }, [isMuted]);

  useEffect(() => {
    startMicrophoneRef.current = startMicrophone;
  }, [startMicrophone]);

  // Connect to Deepgram
  const connect = useCallback(async (config: DeepgramConfig) => {
    const sessionId = ++sessionIdRef.current;
    try {
      updateState({ error: null });
      configRef.current = config;
      settingsAppliedRef.current = false;
      settingsSentRef.current = false;

      // Get API key from server
      console.log('Fetching Deepgram API key...');
      const apiKey = await getApiKey();
      if (sessionId !== sessionIdRef.current) return;
      console.log('API key retrieved');

      await ensurePlaybackContext(sessionId);
      if (sessionId !== sessionIdRef.current) return;

      // Create WebSocket connection with token in Sec-WebSocket-Protocol
      console.log('Connecting to Deepgram WebSocket...');
      const ws = new WebSocket(DEEPGRAM_AGENT_URL, ['token', apiKey]);
      wsRef.current = ws;

      ws.binaryType = 'arraybuffer';

      ws.onopen = () => {
        if (sessionId !== sessionIdRef.current) return;
        console.log('WebSocket connected to Deepgram');
        // Send settings immediately as first message for a valid Deepgram handshake.
        ws.send(JSON.stringify(config));
        settingsSentRef.current = true;
        console.log('Deepgram settings sent');
      };

      ws.onmessage = (event) => {
        if (sessionId !== sessionIdRef.current) return;
        handleMessage(event);
      };

      ws.onerror = (error) => {
        if (sessionId !== sessionIdRef.current) return;
        console.error('WebSocket error:', error);
        settingsAppliedRef.current = false;
      settingsSentRef.current = false;
      nextPlaybackTimeRef.current = 0;
        updateState({ error: 'Connection error. Please check your API key and try again.', isConnected: false });
        onError?.('Connection error. Please check your API key and try again.');
      };

      ws.onclose = (event) => {
        if (sessionId !== sessionIdRef.current) return;
        console.log('WebSocket closed:', event.code, event.reason);
        settingsAppliedRef.current = false;
        settingsSentRef.current = false;
        if (event.code !== 1000) {
          // Abnormal closure
          const reason = event.reason || `Connection closed with code ${event.code}`;
          updateState({ error: reason, isConnected: false, isListening: false, isSpeaking: false });
          onError?.(reason);
        } else {
          updateState({ isConnected: false, isListening: false, isSpeaking: false });
        }
      };

    } catch (error) {
      if (sessionId !== sessionIdRef.current) return;
      const errorMsg = error instanceof Error ? error.message : 'Failed to connect';
      console.error('Connection error:', errorMsg);
      updateState({ error: errorMsg, isConnected: false });
      onError?.(errorMsg);
      throw error;
    }
  }, [handleMessage, updateState, onError, ensurePlaybackContext]);

  // Disconnect
  const disconnect = useCallback(() => {
    console.log('Disconnecting from Deepgram...');
    sessionIdRef.current += 1;
    
    // Close WebSocket
    if (wsRef.current) {
      wsRef.current.close(1000, 'User ended session');
      wsRef.current = null;
    }

    // Stop audio processing
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    if (workletRef.current) {
      workletRef.current.port.onmessage = null;
      workletRef.current.disconnect();
      workletRef.current = null;
    }

    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }

    // Stop media stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Close playback context
    if (playbackAudioContextRef.current) {
      playbackAudioContextRef.current.close();
      playbackAudioContextRef.current = null;
    }

    // Clear audio queue
    audioQueueRef.current = [];
    nextPlaybackTimeRef.current = 0;
    configRef.current = null;
    settingsAppliedRef.current = false;
    settingsSentRef.current = false;

    updateState({
      isConnected: false,
      isListening: false,
      isSpeaking: false,
      isThinking: false,
    });

    console.log('Disconnected from Deepgram');
  }, [updateState]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    state,
    messages,
    connect,
    disconnect,
    toggleMute,
    isMuted,
  };
}

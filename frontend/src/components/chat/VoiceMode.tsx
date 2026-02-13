import React, { useEffect, useRef, useState } from 'react';
import { X, Mic, MicOff, Volume2, Loader2 } from 'lucide-react';
import api from '@/lib/axios';

interface VoiceModeProps {
    isOpen: boolean;
    onClose: () => void;
    onSend: (message: string) => void;
    currentMessage: string; // The text AI is currently speaking (or last spoke)
}

export const VoiceMode: React.FC<VoiceModeProps> = ({ isOpen, onClose, onSend, currentMessage }) => {
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>();
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null); // For AI speech playback

    // Speech Recognition Refs
    const recognitionRef = useRef<any>(null);
    const useNativeSpeech = useRef<boolean>(false);

    // Media Recorder Refs (Fallback)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    // Initialize Audio Context for Visualizer
    useEffect(() => {
        if (!isOpen) return;

        const initAudio = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                const analyser = audioContext.createAnalyser();
                const source = audioContext.createMediaStreamSource(stream);

                source.connect(analyser);
                analyser.fftSize = 256;

                audioContextRef.current = audioContext;
                analyserRef.current = analyser;
                sourceRef.current = source;

                startVisualizer();

                // Initialize Speech Recognition
                setupSpeechRecognition();

            } catch (err) {
                console.error("Error accessing microphone:", err);
            }
        };

        initAudio();

        return () => {
            stopVisualizer();
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
            if (sourceRef.current) {
                // Don't verify if tracks are stopped by this Disconnect
                sourceRef.current.disconnect();
            }
            // Ensure recorder is stopped
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                mediaRecorderRef.current.stop();
            }
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [isOpen]);

    // Handle AI Speech (TTS)
    useEffect(() => {
        // If message changes and we are open, speak it
        if (isOpen && currentMessage && !isSpeaking && !isListening && !isProcessing) {
            playAiSpeech(currentMessage);
        }
    }, [currentMessage, isOpen]); // removed isSpeaking/Listening/Processing to avoid loops, handled in logic

    const stopListening = () => {
        setIsListening(false);
        if (useNativeSpeech.current && recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch (e) { /* ignore */ }
        } else {
            stopRecordingFallback();
        }
    };

    const playAiSpeech = async (text: string) => {
        // Stop listening immediately when AI starts speaking
        stopListening();

        setIsSpeaking(true);
        setIsProcessing(true); // Loading TTS

        try {
            const response = await api.post('/chat/speak/', { text }, { responseType: 'blob' });
            const audioUrl = URL.createObjectURL(response.data);

            if (audioRef.current) {
                audioRef.current.src = audioUrl;
                audioRef.current.play();
                audioRef.current.onended = () => {
                    setIsSpeaking(false);

                    // Native Mode: Auto-resume listening after a short delay (to avoid echo)
                    if (useNativeSpeech.current) {
                        setTimeout(() => {
                            startListening();
                        }, 500);
                    }
                    // Fallback Mode: Do NOT auto-resume. User must tap to reply.
                };
            }
        } catch (error) {
            console.error("TTS Error:", error);
            setIsSpeaking(false);
        } finally {
            setIsProcessing(false);
        }
    };

    const setupSpeechRecognition = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            useNativeSpeech.current = true;
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onstart = () => setIsListening(true);

            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setIsListening(false);
                setIsProcessing(true);
                onSend(transcript);
            };

            recognition.onerror = (event: any) => {
                console.error("Speech Rec Error", event.error);
                setIsListening(false);
            };

            recognitionRef.current = recognition;
            // Native: Auto start
            recognition.start();

        } else {
            console.log("Native speech recognition not supported. Using fallback.");
            useNativeSpeech.current = false;
            // Fallback: Manual start only. Do NOT auto-start.
        }
    };

    const startRecordingFallback = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                stream.getTracks().forEach(track => track.stop()); // Stop this stream

                if (audioBlob.size > 0) {
                    handleTranscribe(audioBlob);
                } else {
                    setIsListening(false);
                }
            };

            mediaRecorder.start();
            setIsListening(true);
        } catch (error) {
            console.error("Fallback Mic Error:", error);
            setIsListening(false);
        }
    };

    const stopRecordingFallback = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
        // Ensure state is updated
        setIsListening(false);
    };

    const handleTranscribe = async (audioBlob: Blob) => {
        setIsProcessing(true);
        setIsListening(false);

        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');

        try {
            const response = await api.post('/chat/transcribe/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.text) {
                onSend(response.data.text);
            }
        } catch (error) {
            console.error("Transcription failed:", error);
        } finally {
            // Processing state clears when AI replies or we manually reset? 
            // Actually AI reply will trigger `playAiSpeech` which sets processing true again. 
            // So we can leave it or set false. If AI replies fast, we might flicker. 
            // But let's set false here.
            setIsProcessing(false);
        }
    };

    const startListening = (force = false) => {
        if (!force && (isSpeaking || isProcessing)) return;

        if (useNativeSpeech.current) {
            try {
                recognitionRef.current.start();
            } catch (e) { /* ignore if already started */ }
        } else {
            startRecordingFallback();
        }
    };

    const toggleListening = () => {
        // Allow interruption: If speaking, stop audio and start listening
        if (isSpeaking) {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
            setIsSpeaking(false);
            startListening(true); // Force start
            return;
        }

        if (isListening) {
            if (useNativeSpeech.current) {
                recognitionRef.current.stop();
            } else {
                stopRecordingFallback();
            }
        } else {
            startListening();
        }
    };

    const startVisualizer = () => {
        const canvas = canvasRef.current;
        const analyser = analyserRef.current;
        if (!canvas || !analyser) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            animationRef.current = requestAnimationFrame(draw);
            analyser.getByteFrequencyData(dataArray);

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw Orb / Waveform
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const radius = 50;

            // Calculate volume/energy
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
                sum += dataArray[i];
            }
            const average = sum / bufferLength;

            // Pulse effect
            const scale = 1 + (average / 256) * 1.5;

            ctx.beginPath();
            ctx.arc(centerX, centerY, radius * scale, 0, 2 * Math.PI);
            ctx.fillStyle = isListening ? 'rgba(59, 130, 246, 0.5)' : (isSpeaking ? 'rgba(16, 185, 129, 0.5)' : 'rgba(209, 213, 219, 0.5)');
            ctx.fill();

            // Inner core
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius * 0.5, 0, 2 * Math.PI);
            ctx.fillStyle = isListening ? '#3B82F6' : (isSpeaking ? '#10B981' : '#9CA3AF');
            ctx.fill();

            // Ripple rings
            if (average > 10) {
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius * scale * 1.5, 0, 2 * Math.PI);
                ctx.strokeStyle = isListening ? 'rgba(59, 130, 246, 0.2)' : 'rgba(16, 185, 129, 0.2)';
                ctx.stroke();
            }
        };

        draw();
    };

    const stopVisualizer = () => {
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center text-white">
            <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 transition-colors"
                title="Close Voice Mode"
            >
                <X size={32} />
            </button>

            <div className="flex-1 flex flex-col items-center justify-center w-full max-w-lg p-6">
                <div className="relative w-64 h-64 mb-12 flex items-center justify-center">
                    <canvas
                        ref={canvasRef}
                        width={300}
                        height={300}
                        className="absolute inset-0 w-full h-full"
                    />
                    {isProcessing && !isSpeaking && (
                        <Loader2 className="absolute w-12 h-12 animate-spin text-white/50" />
                    )}
                </div>

                <h2 className="text-2xl font-light mb-4 text-center">
                    {isSpeaking ? "AI Speaking..." : (isListening ? "Listening..." : "Tap mic to speak")}
                </h2>

                <p className="text-center text-white/60 mb-8 px-4 h-16 line-clamp-2">
                    {currentMessage || "Start talking to begin..."}
                </p>

                <div className="flex gap-6">
                    <button
                        onClick={toggleListening}
                        className={`p-6 rounded-full transition-all duration-300 ${isListening
                            ? 'bg-red-500/20 hover:bg-red-500/30 text-red-500 scale-110'
                            : 'bg-white/10 hover:bg-white/20 text-white'
                            }`}
                        title={isListening ? "Stop Listening" : "Start Listening"}
                    >
                        {isListening ? <MicOff size={40} /> : <Mic size={40} />}
                    </button>
                </div>
                <p className="mt-4 text-sm text-white/30">
                    {useNativeSpeech.current ? "Auto-detecting speech" : "Tap to start/stop recording"}
                </p>
            </div>

            <audio ref={audioRef} className="hidden" />
        </div>
    );
};

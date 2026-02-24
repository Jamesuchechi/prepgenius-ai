import React, { useState, useRef, KeyboardEvent, ChangeEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { ImageIcon, Mic, MicOff, Send, X, Loader2, Headphones, Download, Copy } from 'lucide-react';
import api from '@/lib/axios';

interface ChatInputProps {
    onSend: (message: string, imageData?: string) => void;
    onVoiceMode?: () => void;
    disabled?: boolean;
    placeholder?: string;
    initialValue?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
    onSend,
    onVoiceMode,
    disabled = false,
    placeholder = 'Type your message...',
    initialValue = '',
}) => {
    const [message, setMessage] = useState(initialValue);
    const [image, setImage] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isListening, setIsListening] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messageRef = useRef(message);

    // Update message if initialValue changes
    useEffect(() => {
        if (initialValue) {
            setMessage(initialValue);
            // Auto-resize textarea after pre-fill
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
                textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
            }
        }
    }, [initialValue]);

    // Keep messageRef in sync with message state
    useEffect(() => {
        messageRef.current = message;
    }, [message]);

    // Speech Recognition Refs
    const recognitionRef = useRef<any>(null);
    const useNativeSpeech = useRef<boolean>(false);

    // Media Recorder Refs (Fallback)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const maxLength = 2000;

    // Initialize Speech Recognition or Check Support
    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (SpeechRecognition) {
            useNativeSpeech.current = true;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event: any) => {
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                }

                if (finalTranscript) {
                    setMessage(prev => (prev ? prev + ' ' : '') + finalTranscript);
                }
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
                // Auto-send for native speech
                if (messageRef.current.trim()) {
                    onSend(messageRef.current.trim(), undefined);
                    setMessage('');
                    if (textareaRef.current) textareaRef.current.style.height = 'auto';
                }
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
            };
        } else {
            console.log("Native speech recognition not supported. Using backend fallback.");
            useNativeSpeech.current = false;
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                mediaRecorderRef.current.stop();
            }
        };
    }, []);

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

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());

                if (audioBlob.size > 0) {
                    handleTranscribe(audioBlob);
                }
            };

            mediaRecorder.start();
            setIsListening(true);
        } catch (error) {
            console.error("Error accessing microphone:", error);
            alert("Could not access microphone. Please check permissions.");
            setIsListening(false);
        }
    };

    const stopRecordingFallback = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
            setIsListening(false);
        }
    };

    const handleTranscribe = async (audioBlob: Blob) => {
        setIsTranscribing(true);
        const formData = new FormData();
        // Use .webm extension as typical for MediaRecorder
        formData.append('audio', audioBlob, 'recording.webm');

        try {
            // Use shared axios instance which handles auth and tokens
            const response = await api.post(
                '/chat/transcribe/',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                }
            );

            if (response.data.text) {
                const transcribedText = response.data.text;
                // Auto-send immediately
                const finalMessage = (messageRef.current ? messageRef.current + ' ' : '') + transcribedText;

                onSend(finalMessage, image || undefined);
                setMessage('');
                setImage(null);
                setImagePreview(null);
                if (textareaRef.current) {
                    textareaRef.current.style.height = 'auto';
                }
            }
        } catch (error) {
            console.error("Transcription failed:", error);
            alert("Failed to transcribe audio.");
        } finally {
            setIsTranscribing(false);
        }
    };

    const toggleListening = () => {
        if (isTranscribing) return;

        if (useNativeSpeech.current) {
            if (isListening) {
                recognitionRef.current.stop();
            } else {
                setIsListening(true);
                recognitionRef.current.start();
            }
        } else {
            // Fallback to MediaRecorder + Backend
            if (isListening) {
                stopRecordingFallback();
            } else {
                startRecordingFallback();
            }
        }
    };

    const handleSend = () => {
        const trimmedMessage = message.trim();
        if ((trimmedMessage || image) && !disabled) {
            if (isListening) {
                if (useNativeSpeech.current) {
                    recognitionRef.current.stop();
                } else {
                    stopRecordingFallback();
                }
            }
            onSend(trimmedMessage, image || undefined);
            setMessage('');
            setImage(null);
            setImagePreview(null);

            // Reset textarea height
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        }
    };

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('Image size should be less than 5MB');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setImage(base64String);
                setImagePreview(base64String);
            };
            reader.readAsDataURL(file);
        }
        // Reset file input so same file can be selected again
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeImage = () => {
        setImage(null);
        setImagePreview(null);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        if (value.length <= maxLength) {
            setMessage(value);

            // Auto-resize textarea
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
                textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
            }
        }
    };

    const remainingChars = maxLength - message.length;
    const showCharCount = message.length > maxLength * 0.8;

    return (
        <div className="border-t border-gray-100 bg-white p-4 md:p-6">
            <div className="max-w-4xl mx-auto">
                {/* Image Preview */}
                {imagePreview && (
                    <div className="mb-4 relative inline-block animate-[fadeInUp_0.3s_ease-out]">
                        <img
                            src={imagePreview}
                            alt="Preview"
                            className="h-24 w-24 md:h-32 md:w-32 object-cover rounded-2xl border-2 border-primary/20 shadow-md"
                        />
                        <button
                            onClick={removeImage}
                            className="absolute -top-3 -right-3 bg-destructive text-white rounded-full p-1.5 shadow-lg hover:scale-110 transition-transform"
                            aria-label="Remove image"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="relative group bg-gray-50 rounded-[2rem] border-2 border-gray-100 focus-within:border-primary/30 focus-within:bg-white focus-within:shadow-xl transition-all duration-300 p-2 md:p-3"
                >
                    <div className="flex gap-2 items-end">
                        {/* Action Buttons Group */}
                        <div className="flex items-center pb-1 pl-1">
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => fileInputRef.current?.click()}
                                disabled={disabled}
                                className="w-10 h-10 md:w-12 md:h-12 rounded-full text-gray-400 hover:text-primary hover:bg-primary/5 flex items-center justify-center transition-all disabled:opacity-50"
                                title="Upload image"
                            >
                                <ImageIcon size={22} />
                            </motion.button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />

                            {onVoiceMode && (
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={onVoiceMode}
                                    disabled={disabled}
                                    className="w-10 h-10 md:w-12 md:h-12 rounded-full text-gray-400 hover:text-secondary hover:bg-secondary/5 flex items-center justify-center transition-all disabled:opacity-50"
                                    title="Voice Mode"
                                >
                                    <Headphones size={22} />
                                </motion.button>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <textarea
                                ref={textareaRef}
                                value={message}
                                onChange={handleChange}
                                onKeyDown={handleKeyDown}
                                placeholder={isListening ? 'Listening...' : (isTranscribing ? 'Transcribing...' : placeholder)}
                                disabled={disabled}
                                rows={1}
                                className="w-full px-2 py-3 md:py-4 bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none resize-none disabled:opacity-50 text-base md:text-lg leading-relaxed"
                                style={{ minHeight: '48px', maxHeight: '200px' }}
                            />
                        </div>

                        {/* Control Buttons Group */}
                        <div className="flex items-center gap-2 pb-1 pr-1">
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={toggleListening}
                                disabled={disabled || isTranscribing}
                                className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all ${isListening
                                    ? 'bg-destructive/10 text-destructive'
                                    : 'text-gray-400 hover:text-primary hover:bg-primary/5'
                                    }`}
                                title={isListening ? 'Stop listening' : 'Speak message'}
                            >
                                {isTranscribing ? <Loader2 size={22} className="animate-spin" /> : (isListening ? <MicOff size={22} /> : <Mic size={22} />)}
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleSend}
                                disabled={disabled || (!message.trim() && !image)}
                                className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary hover:bg-primary/90 disabled:bg-gray-200 text-white flex items-center justify-center transition-all shadow-lg hover:shadow-primary/30 disabled:shadow-none"
                                aria-label="Send message"
                            >
                                <Send size={22} />
                            </motion.button>
                        </div>
                    </div>

                    {showCharCount && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute -top-6 right-8 text-[10px] font-bold text-gray-400 bg-white px-2 py-0.5 rounded-full border border-gray-100 shadow-sm"
                        >
                            {remainingChars} characters left
                        </motion.div>
                    )}
                </motion.div>

                <div className="flex justify-center mt-3 gap-4">
                    <p className="text-[10px] md:text-xs text-gray-400 font-medium">
                        {isListening ? 'Listening... Speak clearly' : (isTranscribing ? 'AI is processing...' : 'Press Enter to send, Shift+Enter for new line')}
                    </p>
                </div>
            </div>
        </div>
    );
};

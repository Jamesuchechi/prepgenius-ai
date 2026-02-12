import React, { useState, useRef, KeyboardEvent, ChangeEvent, useEffect } from 'react';
import { Send, Image as ImageIcon, X, Mic, MicOff } from 'lucide-react';

interface ChatInputProps {
    onSend: (message: string, imageData?: string) => void;
    disabled?: boolean;
    placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
    onSend,
    disabled = false,
    placeholder = 'Type your message...',
}) => {
    const [message, setMessage] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isListening, setIsListening] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const recognitionRef = useRef<any>(null);
    const maxLength = 2000;

    // Initialize Speech Recognition
    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event: any) => {
                let interimTranscript = '';
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }

                if (finalTranscript) {
                    setMessage(prev => (prev ? prev + ' ' : '') + finalTranscript);
                }
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
            };
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    const toggleListening = () => {
        if (!recognitionRef.current) {
            alert('Speech recognition is not supported in your browser.');
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
        } else {
            setIsListening(true);
            recognitionRef.current.start();
        }
    };

    const handleSend = () => {
        const trimmedMessage = message.trim();
        if ((trimmedMessage || image) && !disabled) {
            if (isListening) {
                recognitionRef.current.stop();
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
        <div className="border-t border-gray-100 bg-white p-4">
            {/* Image Preview */}
            {imagePreview && (
                <div className="mb-3 relative inline-block">
                    <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-20 w-20 object-cover rounded-lg border border-gray-200 shadow-sm"
                    />
                    <button
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                        aria-label="Remove image"
                    >
                        <X size={12} />
                    </button>
                </div>
            )}

            <div className="flex gap-2 items-end">
                {/* Image Upload Button */}
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled}
                    className="flex-shrink-0 w-12 h-12 rounded-full border border-gray-200 text-gray-400 hover:text-blue-500 hover:border-blue-200 flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Upload image"
                >
                    <ImageIcon size={20} />
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                />

                {/* Voice Input Button */}
                <button
                    onClick={toggleListening}
                    disabled={disabled}
                    className={`flex-shrink-0 w-12 h-12 rounded-full border flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed ${isListening
                        ? 'bg-red-50 border-red-200 text-red-500 animate-pulse'
                        : 'border-gray-200 text-gray-400 hover:text-blue-500 hover:border-blue-200'
                        }`}
                    title={isListening ? 'Stop listening' : 'Speak message'}
                >
                    {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                </button>

                <div className="flex-1 relative">
                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        placeholder={isListening ? 'Listening...' : placeholder}
                        disabled={disabled}
                        rows={1}
                        className="w-full px-4 py-3 pr-12 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
                        style={{ minHeight: '48px', maxHeight: '150px' }}
                    />

                    {showCharCount && (
                        <span className={`absolute bottom-2 right-2 text-xs ${remainingChars < 100 ? 'text-red-500' : 'text-gray-400'
                            }`}>
                            {remainingChars}
                        </span>
                    )}
                </div>

                <button
                    onClick={handleSend}
                    disabled={disabled || (!message.trim() && !image)}
                    className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 text-white flex items-center justify-center transition-all disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                    aria-label="Send message"
                >
                    <Send size={20} />
                </button>
            </div>

            <p className="text-xs text-gray-400 mt-2 text-center font-medium">
                {isListening ? 'AI is listening... speak clearly' : 'Press Enter to send, Shift+Enter for new line'}
            </p>
        </div>
    );
};

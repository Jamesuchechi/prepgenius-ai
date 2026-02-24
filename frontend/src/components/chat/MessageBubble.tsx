/**
 * Message bubble component for displaying chat messages
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { format } from 'date-fns';
import { Bot, User, Copy, RotateCw, ThumbsUp, ThumbsDown, Check, Volume2, VolumeX, Sparkles, FileText, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { copyToClipboard } from '../../utils/exportUtils';
import { useChatStore } from '../../store/chatStore';
import { API_BASE_URL } from '../../lib/api-config';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/Avatar';

interface MessageBubbleProps {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
    onRegenerate?: () => void;
    isStreaming?: boolean;
    image?: string;
}

/**
 * Component to trigger MathJax rendering for equations
 */
const MathJaxRenderer: React.FC = () => {
    useEffect(() => {
        // Trigger MathJax to re-render equations
        if (typeof window !== 'undefined' && (window as any).MathJax) {
            (window as any).MathJax.contentDocument?.querySelectorAll('script[type="math/tex"]').forEach(() => {
                (window as any).MathJax.typesetPromise?.().catch((err: any) => console.log(err));
            });
            (window as any).MathJax.typesetPromise?.().catch((err: any) => console.log(err));
        }
    }, []);
    return null;
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({
    id,
    role,
    content,
    timestamp,
    onRegenerate,
    isStreaming,
    image,
}) => {
    const isUser = role === 'user';
    const isSystem = role === 'system';
    const isAssistant = role === 'assistant';

    // Append blinking cursor if streaming
    const displayContent = isStreaming ? `${content} ▍` : content;

    const [copied, setCopied] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [showSpeedMenu, setShowSpeedMenu] = useState(false);

    const { messageFeedback, setMessageFeedback } = useChatStore();
    const feedback = messageFeedback[id];

    // Handle Speech Synthesis
    useEffect(() => {
        return () => {
            if (isSpeaking) {
                window.speechSynthesis.cancel();
            }
        };
    }, [isSpeaking]);

    const handleToggleSpeech = () => {
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }

        if (!('speechSynthesis' in window)) {
            toast.error('Text-to-speech is not supported in your browser.');
            return;
        }

        // Clean markdown for better speech
        const plainText = content.replace(/[#*_\[\]()>]/g, '');
        const utterance = new SpeechSynthesisUtterance(plainText);
        utterance.rate = playbackRate;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
            setIsSpeaking(false);
            toast.error('Failed to read message aloud');
        };

        window.speechSynthesis.speak(utterance);
    };

    const handleCopyMarkdown = async () => {
        const success = await copyToClipboard(content);
        if (success) {
            setCopied(true);
            toast.success('Message copied to clipboard');
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleRegenerate = async () => {
        if (onRegenerate && !isRegenerating) {
            setIsRegenerating(true);
            await onRegenerate();
            setIsRegenerating(false);
        }
    };

    const handleFeedback = (type: 'like' | 'dislike') => {
        // Toggle feedback: if clicking same button, remove feedback
        setMessageFeedback(id, feedback === type ? null : type);
    };

    const [imageExpanded, setImageExpanded] = useState(false);

    const handleToggleImage = () => {
        setImageExpanded(!imageExpanded);
    };

    if (isSystem) {
        return (
            <div className="flex justify-center my-4">
                <div className="bg-gray-100 text-gray-600 text-sm px-4 py-2 rounded-full shadow-sm">
                    {content}
                </div>
            </div>
        );
    }

    return (
        <div className={`group flex gap-3 mb-6 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-[fadeInUp_0.4s_ease-out]`}>
            {/* Avatar */}
            <div className={`flex-shrink-0 transition-transform duration-300 group-hover:scale-110`}>
                <Avatar className={`w-9 h-9 rounded-xl border border-gray-100 shadow-sm ${isUser
                    ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white'
                    : 'bg-gradient-to-br from-green-500 to-emerald-600 text-white'
                    }`}>
                    <AvatarFallback>
                        {isUser ? <User size={20} /> : <Bot size={20} />}
                    </AvatarFallback>
                </Avatar>
            </div>

            {/* Message content */}
            <div className={`flex flex-col max-w-[85%] md:max-w-[70%] ${isUser ? 'items-end' : 'items-start'}`}>
                {image && (
                    <div className={`mb-2 rounded-2xl overflow-hidden border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-lg bg-gray-50 ${imageExpanded ? 'max-w-full ring-2 ring-primary/20' : 'max-w-[120px] md:max-w-[200px]'
                        }`}>
                        <img
                            src={image.startsWith('/media/')
                                ? `${API_BASE_URL.replace('/api', '')}${image}`
                                : image
                            }
                            alt="Attachment"
                            className={`w-full h-auto object-contain cursor-zoom-in transition-all duration-300 ${imageExpanded ? 'max-h-[500px]' : 'max-h-32 md:max-h-48'
                                }`}
                            onClick={handleToggleImage}
                        />
                        {!imageExpanded && (
                            <div
                                className="bg-black/40 text-white text-[10px] text-center py-1 cursor-pointer hover:bg-black/60 transition-colors"
                                onClick={handleToggleImage}
                            >
                                Tap to expand
                            </div>
                        )}
                    </div>
                )}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                    className={`rounded-2xl px-4 py-3 shadow-sm relative group/bubble ${isUser
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
                        }`}
                >
                    {isAssistant && !isUser && (
                        <div className="absolute -top-3 -left-3 bg-white rounded-full p-1 shadow-sm border border-gray-100 text-blue-500 animate-pulse">
                            <Sparkles size={12} />
                        </div>
                    )}

                    {isUser ? (
                        <p className="whitespace-pre-wrap break-words">{content}</p>
                    ) : (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown
                                remarkPlugins={[remarkMath, remarkGfm]}
                                components={{
                                    p: ({ children }) => <p className="mb-4 last:mb-0 leading-relaxed">{children}</p>,
                                    ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-2">{children}</ul>,
                                    ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-2">{children}</ol>,
                                    li: ({ children }) => <li className="mb-1">{children}</li>,
                                    h1: ({ children }) => <h1 className="text-xl font-bold mb-4 mt-6 text-gray-900 border-b pb-1">{children}</h1>,
                                    h2: ({ children }) => <h2 className="text-lg font-bold mb-3 mt-5 text-gray-800">{children}</h2>,
                                    h3: ({ children }) => <h3 className="text-base font-semibold mb-2 mt-4 text-blue-700 flex items-center gap-2">
                                        <span className="w-1 h-5 bg-blue-500 rounded-full inline-block"></span>
                                        {children}
                                    </h3>,
                                    code({ node, inline, className, children, ...props }: any) {
                                        const match = /language-(\w+)/.exec(className || '');
                                        const codeContent = String(children).replace(/\n$/, '');

                                        return !inline && match ? (
                                            <div className="relative group/code my-4 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                                                <div className="flex items-center justify-between px-4 py-2 bg-gray-800 text-gray-300 text-xs font-mono">
                                                    <span>{match[1]}</span>
                                                    <button
                                                        onClick={() => {
                                                            copyToClipboard(codeContent);
                                                            toast.success('Code copied to clipboard');
                                                        }}
                                                        className="flex items-center gap-1 hover:text-white transition-colors"
                                                    >
                                                        <Copy size={12} />
                                                        Copy
                                                    </button>
                                                </div>
                                                <SyntaxHighlighter
                                                    style={vscDarkPlus}
                                                    language={match[1]}
                                                    PreTag="div"
                                                    customStyle={{
                                                        margin: 0,
                                                        padding: '1.25rem',
                                                        fontSize: '0.875rem',
                                                        lineHeight: '1.5',
                                                        backgroundColor: '#1E1E1E',
                                                    }}
                                                    {...props}
                                                >
                                                    {codeContent}
                                                </SyntaxHighlighter>
                                            </div>
                                        ) : (
                                            <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm text-blue-600 font-mono font-medium" {...props}>
                                                {children}
                                            </code>
                                        );
                                    },
                                }}
                            >
                                {displayContent}
                            </ReactMarkdown>
                            <MathJaxRenderer key={displayContent} />
                        </div>
                    )}
                </motion.div>

                {/* Action Buttons - Only for assistant messages */}
                {isAssistant && (
                    <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                        <div className="flex bg-white shadow-sm border border-gray-100 rounded-lg p-0.5">
                            {/* Copy Button */}
                            <button
                                onClick={handleCopyMarkdown}
                                className="p-1.5 rounded-md hover:bg-gray-50 text-gray-500 hover:text-blue-600 transition-all"
                                title="Copy as Markdown"
                            >
                                {copied ? <Check size={14} className="text-green-600" /> : <FileText size={14} />}
                            </button>

                            {/* Read Aloud Group */}
                            <div className="relative flex items-center">
                                <button
                                    onClick={handleToggleSpeech}
                                    className={`p-1.5 rounded-md transition-all ${isSpeaking
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'hover:bg-gray-50 text-gray-500 hover:text-blue-600'
                                        }`}
                                    title={isSpeaking ? 'Stop reading' : 'Read aloud'}
                                >
                                    {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
                                </button>

                                {isSpeaking && (
                                    <button
                                        onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                                        className="text-[10px] font-bold px-1 text-blue-600 hover:bg-blue-50 rounded"
                                    >
                                        {playbackRate}x
                                    </button>
                                )}

                                <AnimatePresence>
                                    {showSpeedMenu && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute bottom-full left-0 mb-2 bg-white border border-gray-100 rounded-lg shadow-xl p-1 z-50 flex flex-col min-w-[60px]"
                                        >
                                            {[0.8, 1, 1.2, 1.5, 2].map((rate) => (
                                                <button
                                                    key={rate}
                                                    onClick={() => {
                                                        setPlaybackRate(rate);
                                                        setShowSpeedMenu(false);
                                                        if (isSpeaking) {
                                                            window.speechSynthesis.cancel();
                                                            handleToggleSpeech(); // Restart with new rate
                                                        }
                                                    }}
                                                    className={`px-2 py-1 text-[10px] rounded hover:bg-gray-50 text-left ${playbackRate === rate ? 'text-blue-600 font-bold' : 'text-gray-600'}`}
                                                >
                                                    {rate}x
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Regenerate Button */}
                            {onRegenerate && (
                                <button
                                    onClick={handleRegenerate}
                                    disabled={isRegenerating}
                                    className="p-1.5 rounded-md hover:bg-gray-50 text-gray-500 hover:text-green-600 transition-all disabled:opacity-50"
                                    title="Regenerate response"
                                >
                                    <RotateCw size={14} className={isRegenerating ? 'animate-spin' : ''} />
                                </button>
                            )}
                        </div>

                        {/* Feedback Buttons */}
                        <div className="flex bg-white shadow-sm border border-gray-100 rounded-lg p-0.5 ml-1">
                            <button
                                onClick={() => handleFeedback('like')}
                                className={`p-1.5 rounded-md transition-all ${feedback === 'like'
                                    ? 'bg-blue-50 text-blue-600'
                                    : 'hover:bg-gray-50 text-gray-500 hover:text-blue-500'
                                    }`}
                                title="Helpful"
                            >
                                <ThumbsUp size={14} />
                            </button>
                            <button
                                onClick={() => handleFeedback('dislike')}
                                className={`p-1.5 rounded-md transition-all ${feedback === 'dislike'
                                    ? 'bg-red-50 text-red-600'
                                    : 'hover:bg-gray-50 text-gray-500 hover:text-red-500'
                                    }`}
                                title="Not helpful"
                            >
                                <ThumbsDown size={14} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Timestamp */}
                <div className="flex items-center gap-2 mt-1 px-2">
                    <span className="text-[10px] text-gray-400 font-medium">
                        {format(new Date(timestamp), 'HH:mm')}
                    </span>
                    {isAssistant && (
                        <span className="text-[10px] text-gray-300">• AI Verified</span>
                    )}
                </div>
            </div>
        </div>
    );
};

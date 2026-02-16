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
import { Bot, User, Copy, RotateCw, ThumbsUp, ThumbsDown, Check, Volume2, VolumeX } from 'lucide-react';
import { copyToClipboard } from '@/utils/exportUtils';
import { useChatStore } from '@/store/chatStore';

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
            alert('Text-to-speech is not supported in your browser.');
            return;
        }

        // Clean markdown for better speech
        const plainText = content.replace(/[#*_\[\]()>]/g, '');
        const utterance = new SpeechSynthesisUtterance(plainText);

        utterance.onend = () => {
            setIsSpeaking(false);
        };

        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
            setIsSpeaking(false);
        };

        setIsSpeaking(true);
        window.speechSynthesis.speak(utterance);
    };

    const handleCopy = async () => {
        const success = await copyToClipboard(content);
        if (success) {
            setCopied(true);
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
        <div className={`group flex gap-3 mb-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
            {/* Avatar */}
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border border-gray-100 shadow-sm ${isUser
                ? 'bg-blue-600 text-white'
                : 'bg-green-500 text-white'
                }`}>
                {isUser ? <User size={18} /> : <Bot size={18} />}
            </div>

            {/* Message content */}
            <div className={`flex flex-col max-w-[70%] ${isUser ? 'items-end' : 'items-start'}`}>
                {image && (
                    <div className="mb-2 rounded-xl overflow-hidden border border-gray-100 shadow-sm transition-all hover:shadow-md max-w-full">
                        <img
                            src={image.startsWith('/media/')
                                ? `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000'}${image}`
                                : image
                            }
                            alt="Attachment"
                            className="max-h-72 w-auto object-contain cursor-zoom-in"
                            onClick={() => window.open(image.startsWith('/media/')
                                ? `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000'}${image}`
                                : image, '_blank')}
                        />
                    </div>
                )}
                <div className={`rounded-2xl px-4 py-3 shadow-sm ${isUser
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
                    }`}>
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
                                            <div className="relative group/code my-4 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                                                <div className="flex items-center justify-between px-4 py-2 bg-gray-800 text-gray-300 text-xs font-mono">
                                                    <span>{match[1]}</span>
                                                    <button
                                                        onClick={() => copyToClipboard(codeContent)}
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
                </div>

                {/* Action Buttons - Only for assistant messages */}
                {isAssistant && (
                    <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Copy Button */}
                        <button
                            onClick={handleCopy}
                            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600 hover:text-blue-600 transition-all"
                            title="Copy message"
                        >
                            {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                        </button>

                        {/* Read Aloud Button */}
                        <button
                            onClick={handleToggleSpeech}
                            className={`p-1.5 rounded-md transition-all ${isSpeaking
                                ? 'bg-blue-50 text-blue-600'
                                : 'hover:bg-gray-100 text-gray-600 hover:text-blue-600'
                                }`}
                            title={isSpeaking ? 'Stop reading' : 'Read aloud'}
                        >
                            {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
                        </button>

                        {/* Regenerate Button */}
                        {onRegenerate && (
                            <button
                                onClick={handleRegenerate}
                                disabled={isRegenerating}
                                className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600 hover:text-green-600 transition-all disabled:opacity-50"
                                title="Regenerate response"
                            >
                                <RotateCw size={14} className={isRegenerating ? 'animate-spin' : ''} />
                            </button>
                        )}

                        {/* Feedback Buttons */}
                        <div className="flex items-center gap-0.5 ml-1">
                            <button
                                onClick={() => handleFeedback('like')}
                                className={`p-1.5 rounded-md transition-all ${feedback === 'like'
                                    ? 'bg-blue-100 text-blue-600'
                                    : 'hover:bg-gray-100 text-gray-600 hover:text-blue-600'
                                    }`}
                                title="Like this response"
                            >
                                <ThumbsUp size={14} />
                            </button>
                            <button
                                onClick={() => handleFeedback('dislike')}
                                className={`p-1.5 rounded-md transition-all ${feedback === 'dislike'
                                    ? 'bg-red-100 text-red-600'
                                    : 'hover:bg-gray-100 text-gray-600 hover:text-red-600'
                                    }`}
                                title="Dislike this response"
                            >
                                <ThumbsDown size={14} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Timestamp */}
                <span className="text-xs text-gray-400 mt-1 px-2 font-medium">
                    {format(new Date(timestamp), 'HH:mm')}
                </span>
            </div>
        </div>
    );
};

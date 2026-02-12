/**
 * Export chat button component
 */

'use client';

import React, { useState } from 'react';
import { FileDown, FileText, FileCode } from 'lucide-react';
import { ChatMessage } from '@/services/chatService';
import { exportAsText, exportAsMarkdown } from '@/utils/exportUtils';

interface ExportChatButtonProps {
    messages: ChatMessage[];
    sessionTitle?: string;
}

export const ExportChatButton: React.FC<ExportChatButtonProps> = ({
    messages,
    sessionTitle = 'Chat Session',
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleExportText = () => {
        exportAsText(messages, sessionTitle);
        setIsOpen(false);
    };

    const handleExportMarkdown = () => {
        exportAsMarkdown(messages, sessionTitle);
        setIsOpen(false);
    };

    if (messages.length === 0) {
        return null; // Don't show export if no messages
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 hover:text-blue-600 transition-all shadow-sm"
            >
                <FileDown size={16} />
                <span>Export</span>
            </button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown Menu */}
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
                        <button
                            onClick={handleExportText}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left transition-colors"
                        >
                            <FileText size={18} className="text-gray-600" />
                            <div>
                                <div className="text-sm font-medium text-gray-900">Plain Text</div>
                                <div className="text-xs text-gray-500">Download as .txt</div>
                            </div>
                        </button>

                        <div className="h-px bg-gray-100" />

                        <button
                            onClick={handleExportMarkdown}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left transition-colors"
                        >
                            <FileCode size={18} className="text-gray-600" />
                            <div>
                                <div className="text-sm font-medium text-gray-900">Markdown</div>
                                <div className="text-xs text-gray-500">Download as .md</div>
                            </div>
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

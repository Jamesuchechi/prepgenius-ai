/**
 * Export utilities for chat functionality
 */

import { ChatMessage } from '@/services/chatService';
import { format } from 'date-fns';

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            const success = document.execCommand('copy');
            textArea.remove();
            return success;
        }
    } catch (err) {
        console.error('Failed to copy to clipboard:', err);
        return false;
    }
};

/**
 * Export chat as plain text
 */
export const exportAsText = (
    messages: ChatMessage[],
    sessionTitle: string = 'Chat Session'
): void => {
    const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm');

    let content = `${sessionTitle}\n`;
    content += `Exported: ${timestamp}\n`;
    content += `Messages: ${messages.length}\n`;
    content += `${'='.repeat(50)}\n\n`;

    messages.forEach((message) => {
        const role = message.role === 'user' ? 'You' : 'AI Tutor';
        const time = format(new Date(message.timestamp), 'HH:mm');
        content += `[${time}] ${role}:\n${message.content}\n\n`;
    });

    downloadFile(content, `${sanitizeFilename(sessionTitle)}.txt`, 'text/plain');
};

/**
 * Export chat as markdown
 */
export const exportAsMarkdown = (
    messages: ChatMessage[],
    sessionTitle: string = 'Chat Session'
): void => {
    const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm');

    let content = `# ${sessionTitle}\n\n`;
    content += `**Exported**: ${timestamp}  \n`;
    content += `**Messages**: ${messages.length}\n\n`;
    content += `---\n\n`;

    messages.forEach((message) => {
        const role = message.role === 'user' ? '👤 **You**' : '🤖 **AI Tutor**';
        const time = format(new Date(message.timestamp), 'HH:mm');

        content += `### ${role} *(${time})*\n\n`;
        content += `${message.content}\n\n`;
    });

    downloadFile(content, `${sanitizeFilename(sessionTitle)}.md`, 'text/markdown');
};

/**
 * Trigger file download
 */
const downloadFile = (content: string, filename: string, mimeType: string): void => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

/**
 * Sanitize filename to remove invalid characters
 */
const sanitizeFilename = (filename: string): string => {
    return filename
        .replace(/[^a-z0-9_\-]/gi, '_')
        .replace(/_+/g, '_')
        .substring(0, 100) || 'chat_export';
};

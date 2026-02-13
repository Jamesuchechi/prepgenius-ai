import React, { useEffect, useState } from 'react';
import { Document, studyService } from '@/services/studyService';
import { useChatStore } from '@/store/chatStore';
import { FileText, Upload, Trash2, RefreshCw, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface StudySidebarProps {
    onDocumentSelect?: (doc: Document) => void;
}

export const StudySidebar: React.FC<StudySidebarProps> = ({ onDocumentSelect }) => {
    const { activeDocumentId, setActiveDocumentId } = useChatStore();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const docs = await studyService.getDocuments();
            setDocuments(docs);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch documents:', err);
            setError('Failed to load documents');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            setError(null);
            // Default title to filename
            await studyService.uploadDocument(file, file.name);
            await fetchDocuments();
        } catch (err) {
            console.error('Upload failed:', err);
            setError('Failed to upload document');
        } finally {
            setUploading(false);
            // Reset input
            e.target.value = '';
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this document?')) return;

        try {
            await studyService.deleteDocument(id);
            setDocuments(docs => docs.filter(d => d.id !== id));
        } catch (err) {
            console.error('Delete failed:', err);
            setError('Failed to delete document');
        }
    };

    const getStatusIcon = (status: Document['processing_status']) => {
        switch (status) {
            case 'completed': return <CheckCircle size={14} className="text-green-500" />;
            case 'processing': return <Loader2 size={14} className="text-blue-500 animate-spin" />;
            case 'failed': return <AlertCircle size={14} className="text-red-500" />;
            default: return <div className="w-3 h-3 rounded-full bg-gray-300" />;
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-50 border-r border-gray-100">
            {/* Header */}
            <div className="flex-shrink-0 p-4 border-b border-gray-100 bg-white">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Knowledge Base</h2>

                <label className={`
                    w-full flex items-center justify-center gap-2 px-4 py-3 
                    bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg 
                    transition-all shadow-sm hover:shadow-md font-medium cursor-pointer
                    ${uploading ? 'opacity-70 cursor-not-allowed' : ''}
                `}>
                    {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                    <span>{uploading ? 'Uploading...' : 'Upload Document'}</span>
                    <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.txt,.md"
                        onChange={handleFileUpload}
                        disabled={uploading}
                    />
                </label>

                {error && (
                    <div className="mt-2 text-xs text-red-500 bg-red-50 p-2 rounded">
                        {error}
                    </div>
                )}
            </div>

            {/* Document List */}
            <div className="flex-1 overflow-y-auto p-2">
                {loading ? (
                    <div className="flex justify-center p-4">
                        <Loader2 className="animate-spin text-gray-400" />
                    </div>
                ) : documents.length === 0 ? (
                    <div className="text-center p-8 text-gray-400">
                        <FileText size={48} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No documents uploaded</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {documents.map(doc => {
                            const isActive = activeDocumentId === doc.id;
                            return (
                                <div
                                    key={doc.id}
                                    className={`
                                        group flex items-start gap-3 p-3 border rounded-lg hover:shadow-sm transition-all cursor-pointer
                                        ${isActive ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-gray-100'}
                                    `}
                                    onClick={() => {
                                        setActiveDocumentId(doc.id);
                                        onDocumentSelect?.(doc);
                                    }}
                                >
                                    <div className={`mt-1 ${isActive ? 'text-indigo-600' : 'text-indigo-500'}`}>
                                        <FileText size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h3 className={`text-sm font-medium truncate pr-2 ${isActive ? 'text-indigo-900' : 'text-gray-900'}`} title={doc.title}>
                                                {doc.title}
                                            </h3>
                                            {getStatusIcon(doc.processing_status)}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                            <span className="uppercase">{doc.file_type}</span>
                                            <span>•</span>
                                            <span>{formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}</span>
                                        </div>
                                        {doc.error_message && (
                                            <p className="text-xs text-red-500 mt-1 truncate">{doc.error_message}</p>
                                        )}
                                    </div>
                                    <button
                                        onClick={(e) => handleDelete(doc.id, e)}
                                        className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

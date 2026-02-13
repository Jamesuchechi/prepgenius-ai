
import React, { useEffect, useState } from 'react';
import { FileText, Loader2, X } from 'lucide-react';
import { useChatStore } from '@/store/chatStore';

interface Document {
    id: string;
    title: string;
    file_type: string;
    created_at: string;
    processed: boolean;
}

export const DocumentSelector: React.FC = () => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const { activeDocumentId, setActiveDocumentId } = useChatStore();

    useEffect(() => {
        const fetchDocuments = async () => {
            setLoading(true);
            try {
                // Fetch only processed documents
                const response = await fetch('/api/study-tools/documents/?processed=true');
                if (response.ok) {
                    const data = await response.json();
                    setDocuments(data.results || []);
                }
            } catch (error) {
                console.error('Failed to fetch documents:', error);
            } finally {
                setLoading(false);
            }
        };

        if (isOpen) {
            fetchDocuments();
        }
    }, [isOpen]);

    const activeDoc = documents.find(d => d.id === activeDocumentId);

    return (
        <div className="relative">
            {activeDocumentId ? (
                <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium border border-blue-100">
                    <FileText size={14} />
                    <span className="truncate max-w-[150px]">{activeDoc?.title || 'Document'}</span>
                    <button
                        onClick={() => setActiveDocumentId(null)}
                        className="p-0.5 hover:bg-blue-100 rounded-full transition-colors"
                    >
                        <X size={14} />
                    </button>
                </div>
            ) : (
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${isOpen
                            ? 'bg-blue-50 border-blue-200 text-blue-700'
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                >
                    <FileText size={16} />
                    <span>Chat with Document</span>
                </button>
            )}

            {isOpen && !activeDocumentId && (
                <div className="absolute top-full mt-2 left-0 w-72 max-h-96 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-2">
                    <div className="flex items-center justify-between px-2 py-1 mb-2">
                        <span className="text-xs font-semibold text-gray-500 uppercase">Select a document</span>
                        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                            <X size={14} />
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center p-4">
                            <Loader2 className="animate-spin text-blue-500" size={20} />
                        </div>
                    ) : documents.length === 0 ? (
                        <div className="text-center p-4 text-gray-500 text-sm">
                            <p>No processed documents found.</p>
                            <p className="text-xs mt-1">Upload files in Study Tools first.</p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {documents.map((doc) => (
                                <button
                                    key={doc.id}
                                    onClick={() => {
                                        setActiveDocumentId(doc.id);
                                        setIsOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg text-left transition-colors"
                                >
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                        <FileText size={18} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{doc.title}</p>
                                        <p className="text-xs text-gray-500">{new Date(doc.created_at).toLocaleDateString()}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

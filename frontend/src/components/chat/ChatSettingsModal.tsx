import React, { useState } from 'react';
import { X, Settings, Sparkles, BrainCircuit, MessageSquare, Zap } from 'lucide-react';
import { ChatSession, chatService } from '@/services/chatService';
import { useChatStore } from '@/store/chatStore';

interface ChatSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    session: ChatSession;
}

export const ChatSettingsModal: React.FC<ChatSettingsModalProps> = ({
    isOpen,
    onClose,
    session,
}) => {
    const { updateSession } = useChatStore();
    const [loading, setLoading] = useState(false);

    // Form state initialized from session
    const [tone, setTone] = useState<'formal' | 'casual'>(session.tone || 'casual');
    const [detailLevel, setDetailLevel] = useState<'concise' | 'detailed'>(session.detail_level || 'detailed');
    const [useAnalogies, setUseAnalogies] = useState<boolean>(session.use_analogies ?? true);
    const [socraticMode, setSocraticMode] = useState<boolean>(session.socratic_mode ?? false);

    if (!isOpen) return null;

    const handleSave = async () => {
        setLoading(true);
        try {
            const updates = {
                tone,
                detail_level: detailLevel,
                use_analogies: useAnalogies,
                socratic_mode: socraticMode,
            };

            // Update on backend
            const updatedSession = await chatService.updateSession(session.id, updates);

            // Update in store
            updateSession(session.id, updatedSession);

            onClose();
        } catch (error) {
            console.error('Failed to update session settings:', error);
            // Optionally show error toast
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2 text-gray-900">
                        <Settings className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold text-lg">AI Tutor Settings</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {/* Tone Selection */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <MessageSquare size={16} />
                            Teaching Tone
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setTone('casual')}
                                className={`px-4 py-3 rounded-lg border text-sm font-medium transition-all ${tone === 'casual'
                                        ? 'bg-blue-50 border-blue-200 text-blue-700 ring-1 ring-blue-200'
                                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <span className="block mb-0.5">Friendly</span>
                                <span className="text-xs opacity-75 font-normal">Approachable & warm</span>
                            </button>
                            <button
                                onClick={() => setTone('formal')}
                                className={`px-4 py-3 rounded-lg border text-sm font-medium transition-all ${tone === 'formal'
                                        ? 'bg-blue-50 border-blue-200 text-blue-700 ring-1 ring-blue-200'
                                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <span className="block mb-0.5">Academic</span>
                                <span className="text-xs opacity-75 font-normal">Professional & precise</span>
                            </button>
                        </div>
                    </div>

                    {/* Detail Level */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Zap size={16} />
                            Response Length
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setDetailLevel('concise')}
                                className={`px-4 py-3 rounded-lg border text-sm font-medium transition-all ${detailLevel === 'concise'
                                        ? 'bg-blue-50 border-blue-200 text-blue-700 ring-1 ring-blue-200'
                                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <span className="block mb-0.5">Concise</span>
                                <span className="text-xs opacity-75 font-normal">Short & direct</span>
                            </button>
                            <button
                                onClick={() => setDetailLevel('detailed')}
                                className={`px-4 py-3 rounded-lg border text-sm font-medium transition-all ${detailLevel === 'detailed'
                                        ? 'bg-blue-50 border-blue-200 text-blue-700 ring-1 ring-blue-200'
                                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <span className="block mb-0.5">Detailed</span>
                                <span className="text-xs opacity-75 font-normal">Thorough explanations</span>
                            </button>
                        </div>
                    </div>

                    {/* Toggles */}
                    <div className="space-y-4 pt-2">
                        <label className="flex items-center justify-between cursor-pointer group">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${useAnalogies ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-500'}`}>
                                    <Sparkles size={18} />
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-gray-900">Use Analogies</div>
                                    <div className="text-xs text-gray-500">Explain active concepts using real-world examples</div>
                                </div>
                            </div>
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={useAnalogies}
                                    onChange={(e) => setUseAnalogies(e.target.checked)}
                                />
                                <div className={`w-11 h-6 rounded-full transition-colors ${useAnalogies ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                                <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${useAnalogies ? 'translate-x-5' : 'translate-x-0'}`}></div>
                            </div>
                        </label>

                        <label className="flex items-center justify-between cursor-pointer group">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${socraticMode ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-500'}`}>
                                    <BrainCircuit size={18} />
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-gray-900">Socratic Mode</div>
                                    <div className="text-xs text-gray-500">Ask guiding questions instead of giving answers</div>
                                </div>
                            </div>
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={socraticMode}
                                    onChange={(e) => setSocraticMode(e.target.checked)}
                                />
                                <div className={`w-11 h-6 rounded-full transition-colors ${socraticMode ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                                <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${socraticMode ? 'translate-x-5' : 'translate-x-0'}`}></div>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </div>
        </div>
    );
};

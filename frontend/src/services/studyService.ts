import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface Document {
    id: string;
    title: string;
    file: string;
    file_type: 'pdf' | 'txt' | 'md';
    processed: boolean;
    processing_status: 'pending' | 'processing' | 'completed' | 'failed';
    error_message?: string;
    created_at: string;
}

const getAuthHeader = () => {
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const studyService = {
    getDocuments: async (): Promise<Document[]> => {
        const response = await axios.get(`${API_URL}/study-tools/documents/`, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    uploadDocument: async (file: File, title: string): Promise<Document> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title);

        const response = await axios.post(`${API_URL}/study-tools/documents/`, formData, {
            headers: {
                ...getAuthHeader(),
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    deleteDocument: async (id: string): Promise<void> => {
        await axios.delete(`${API_URL}/study-tools/documents/${id}/`, {
            headers: getAuthHeader(),
        });
    },
};

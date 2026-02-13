import axiosInstance from '../lib/axios';

const API_BASE_URL = '/study-tools/documents/';

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

export const studyService = {
    getDocuments: async (): Promise<Document[]> => {
        const response = await axiosInstance.get(API_BASE_URL);
        // Handle paginated response (DRF default)
        if (response.data.results) {
            return response.data.results;
        }
        return response.data;
    },

    uploadDocument: async (file: File, title: string): Promise<Document> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title);

        const response = await axiosInstance.post(API_BASE_URL, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    deleteDocument: async (id: string): Promise<void> => {
        await axiosInstance.delete(`${API_BASE_URL}${id}/`);
    },
};

import axiosInstance from '../lib/axios'
import { Topic, Subject } from '../lib/api'

export const ContentService = {
    /**
     * Generates or fetches topics for a given subject string.
     */
    generateTopics: async (subject: string): Promise<Topic[]> => {
        const response = await axiosInstance.post<Topic[]>('/content/topics/generate/', { subject })
        return response.data
    },

    /**
     * Fetches all subjects.
     */
    getSubjects: async (): Promise<Subject[]> => {
        const response = await axiosInstance.get<{ results: Subject[] }>('/content/subjects/')
        // Handle potential pagination wrapper or direct array
        return response.data.results || response.data
    }
}

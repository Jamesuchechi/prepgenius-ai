import { apiCall } from '@/lib/api'
import { User } from '@/types/user'

export interface Institution {
    id: string
    name: string
    code: string
    admin: string // admin id
    admin_details: User
    address: string
    contact_email: string
    website: string
    logo: string | null
    student_count: number
    created_at: string
}

export interface StudentLink {
    id: number
    institution: string
    institution_name: string
    student: number
    student_details: User
    status: 'pending' | 'active' | 'rejected'
    joined_at: string
}

export const InstitutionService = {
    // Get institutions associated with user (admin or student)
    getMyInstitutions: async () => {
        const response: any = await apiCall('/institutions/institutions/')
        // Handle pagination
        if (response.results && Array.isArray(response.results)) {
            return response.results as Institution[]
        }
        return (Array.isArray(response) ? response : []) as Institution[]
    },

    // Create a new institution
    create: async (data: Partial<Institution>) => {
        return apiCall<Institution>('/institutions/institutions/', {
            method: 'POST',
            body: JSON.stringify(data),
        })
    },

    // Update institution details
    update: async (id: string, data: Partial<Institution>) => {
        return apiCall<Institution>(`/institutions/institutions/${id}/`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        })
    },

    // Join an institution via code
    join: async (code: string) => {
        return apiCall<{ message: string }>('/institutions/institutions/join/', {
            method: 'POST',
            body: JSON.stringify({ code }),
        })
    },

    // Get students for an institution (for admins)
    getStudents: async (institutionId?: string) => {
        // The backend filters based on user, so we might just hit the list endpoint
        // If we need to filter by specific institution if user manages multiple, we'd need query param
        // But currently backend filters by 'institutions managed by user'
        const response: any = await apiCall('/institutions/students/')
        if (response.results && Array.isArray(response.results)) {
            return response.results as StudentLink[]
        }
        return (Array.isArray(response) ? response : []) as StudentLink[]
    },

    approveStudent: async (linkId: number) => {
        return apiCall(`/institutions/students/${linkId}/approve/`, {
            method: 'POST',
        })
    },

    rejectStudent: async (linkId: number) => {
        return apiCall(`/institutions/students/${linkId}/reject/`, {
            method: 'POST',
        })
    }
}

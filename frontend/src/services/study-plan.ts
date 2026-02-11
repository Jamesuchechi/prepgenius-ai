/**
 * Study Plan API Service
 * Handles all API calls related to study plans
 */

import axiosInstance from '../lib/axios'
import {
  StudyPlan,
  StudyTask,
  StudyReminder,
  AdjustmentHistory,
  CreateStudyPlanRequest,
  StudyPlanListResponse,
  StudyTaskUpdateRequest,
  CompleteTaskRequest,
  LogStudySessionRequest,
  PlanStatistics,
  DailyGoalProgress
} from '../types/study-plan'

const BASE_URL = '/study-plans'
const TASKS_URL = '/study-tasks'
const REMINDERS_URL = '/reminders'

export const studyPlanApi = {
  /**
   * Get all study plans for the current user
   */
  getPlans: async (status?: string): Promise<StudyPlan[]> => {
    try {
      const url = status ? `${BASE_URL}/?status=${status}` : BASE_URL
      const response = await axiosInstance.get<StudyPlanListResponse>(url)
      return response.data.results || []
    } catch (error) {
      console.error('Failed to fetch study plans:', error)
      throw error
    }
  },

  /**
   * Get a single study plan by ID
   */
  getPlan: async (planId: number): Promise<StudyPlan> => {
    try {
      const response = await axiosInstance.get<StudyPlan>(`${BASE_URL}/${planId}/`)
      return response.data
    } catch (error) {
      console.error(`Failed to fetch study plan ${planId}:`, error)
      throw error
    }
  },

  /**
   * Create a new study plan (AI-generated)
   */
  generatePlan: async (data: CreateStudyPlanRequest): Promise<StudyPlan> => {
    try {
      const response = await axiosInstance.post<StudyPlan>(`${BASE_URL}/generate/`, data)
      return response.data
    } catch (error) {
      console.error('Failed to generate study plan:', error)
      throw error
    }
  },

  /**
   * Get the current active study plan
   */
  getCurrentPlan: async (): Promise<StudyPlan | null> => {
    try {
      const response = await axiosInstance.get<StudyPlan>(`${BASE_URL}/current/`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch current study plan:', error)
      return null
    }
  },

  /**
   * Activate a study plan
   */
  activatePlan: async (planId: number): Promise<StudyPlan> => {
    try {
      const response = await axiosInstance.post<StudyPlan>(`${BASE_URL}/${planId}/activate/`)
      return response.data
    } catch (error) {
      console.error(`Failed to activate study plan ${planId}:`, error)
      throw error
    }
  },

  /**
   * Pause a study plan
   */
  pausePlan: async (planId: number): Promise<StudyPlan> => {
    try {
      const response = await axiosInstance.post<StudyPlan>(`${BASE_URL}/${planId}/pause/`)
      return response.data
    } catch (error) {
      console.error(`Failed to pause study plan ${planId}:`, error)
      throw error
    }
  },

  /**
   * Resume a paused study plan
   */
  resumePlan: async (planId: number): Promise<StudyPlan> => {
    try {
      const response = await axiosInstance.post<StudyPlan>(`${BASE_URL}/${planId}/resume/`)
      return response.data
    } catch (error) {
      console.error(`Failed to resume study plan ${planId}:`, error)
      throw error
    }
  },

  /**
   * Get statistics for a study plan
   */
  getPlanStatistics: async (planId: number): Promise<PlanStatistics> => {
    try {
      const response = await axiosInstance.get<PlanStatistics>(`${BASE_URL}/${planId}/statistics/`)
      return response.data
    } catch (error) {
      console.error(`Failed to fetch plan statistics:`, error)
      throw error
    }
  },

  /**
   * Adjust a study plan based on performance
   */
  adjustPlan: async (planId: number, data: Record<string, any>): Promise<StudyPlan> => {
    try {
      const response = await axiosInstance.post<StudyPlan>(`${BASE_URL}/${planId}/adjust/`, data)
      return response.data
    } catch (error) {
      console.error(`Failed to adjust study plan:`, error)
      throw error
    }
  },

  /**
   * Delete a study plan
   */
  deletePlan: async (planId: number): Promise<void> => {
    try {
      await axiosInstance.delete(`${BASE_URL}/${planId}/`)
    } catch (error) {
      console.error(`Failed to delete study plan ${planId}:`, error)
      throw error
    }
  }
}

export const studyTaskApi = {
  /**
   * Get all tasks for a study plan
   */
  getTasksForPlan: async (planId: number): Promise<StudyTask[]> => {
    try {
      const response = await axiosInstance.get<{ results: StudyTask[] }>(
        `${TASKS_URL}/?study_plan=${planId}`
      )
      return response.data.results || []
    } catch (error) {
      console.error('Failed to fetch study tasks:', error)
      throw error
    }
  },

  /**
   * Get a single task by ID
   */
  getTask: async (taskId: number): Promise<StudyTask> => {
    try {
      const response = await axiosInstance.get<StudyTask>(`${TASKS_URL}/${taskId}/`)
      return response.data
    } catch (error) {
      console.error(`Failed to fetch study task ${taskId}:`, error)
      throw error
    }
  },

  /**
   * Get pending tasks
   */
  getPendingTasks: async (): Promise<StudyTask[]> => {
    try {
      const response = await axiosInstance.get<{ results: StudyTask[] }>(`${TASKS_URL}/pending/`)
      return response.data.results || []
    } catch (error) {
      console.error('Failed to fetch pending tasks:', error)
      throw error
    }
  },

  /**
   * Get overdue tasks
   */
  getOverdueTasks: async (): Promise<StudyTask[]> => {
    try {
      const response = await axiosInstance.get<{ results: StudyTask[] }>(`${TASKS_URL}/overdue/`)
      return response.data.results || []
    } catch (error) {
      console.error('Failed to fetch overdue tasks:', error)
      throw error
    }
  },

  /**
   * Update a task
   */
  updateTask: async (taskId: number, data: StudyTaskUpdateRequest): Promise<StudyTask> => {
    try {
      const response = await axiosInstance.patch<StudyTask>(
        `${TASKS_URL}/${taskId}/`,
        data
      )
      return response.data
    } catch (error) {
      console.error(`Failed to update study task ${taskId}:`, error)
      throw error
    }
  },

  /**
   * Mark a task as complete
   */
  completeTask: async (taskId: number, data: CompleteTaskRequest): Promise<StudyTask> => {
    try {
      const response = await axiosInstance.post<StudyTask>(
        `${TASKS_URL}/${taskId}/complete/`,
        data
      )
      return response.data
    } catch (error) {
      console.error(`Failed to complete study task ${taskId}:`, error)
      throw error
    }
  },

  /**
   * Start a task
   */
  startTask: async (taskId: number): Promise<StudyTask> => {
    try {
      const response = await axiosInstance.post<StudyTask>(`${TASKS_URL}/${taskId}/start/`)
      return response.data
    } catch (error) {
      console.error(`Failed to start study task ${taskId}:`, error)
      throw error
    }
  },

  /**
   * Log a study session for a task
   */
  logSession: async (taskId: number, data: LogStudySessionRequest): Promise<StudyTask> => {
    try {
      const response = await axiosInstance.post<StudyTask>(
        `${TASKS_URL}/${taskId}/log_session/`,
        data
      )
      return response.data
    } catch (error) {
      console.error(`Failed to log study session:`, error)
      throw error
    }
  },

  /**
   * Skip a task
   */
  skipTask: async (taskId: number): Promise<StudyTask> => {
    try {
      const response = await axiosInstance.post<StudyTask>(`${TASKS_URL}/${taskId}/skip/`)
      return response.data
    } catch (error) {
      console.error(`Failed to skip study task ${taskId}:`, error)
      throw error
    }
  }
}

export const studyReminderApi = {
  /**
   * Get all reminders for the current user
   */
  getReminders: async (): Promise<StudyReminder[]> => {
    try {
      const response = await axiosInstance.get<{ results: StudyReminder[] }>(REMINDERS_URL)
      return response.data.results || []
    } catch (error) {
      console.error('Failed to fetch reminders:', error)
      throw error
    }
  },

  /**
   * Get pending reminders to send
   */
  getPendingReminders: async (): Promise<StudyReminder[]> => {
    try {
      const response = await axiosInstance.get<{ results: StudyReminder[] }>(`${REMINDERS_URL}/pending/`)
      return response.data.results || []
    } catch (error) {
      console.error('Failed to fetch pending reminders:', error)
      throw error
    }
  },

  /**
   * Mark a reminder as sent
   */
  markReminderSent: async (reminderId: number): Promise<StudyReminder> => {
    try {
      const response = await axiosInstance.post<StudyReminder>(
        `${REMINDERS_URL}/${reminderId}/mark_sent/`
      )
      return response.data
    } catch (error) {
      console.error(`Failed to mark reminder as sent:`, error)
      throw error
    }
  },

  /**
   * Delete a reminder
   */
  deleteReminder: async (reminderId: number): Promise<void> => {
    try {
      await axiosInstance.delete(`${REMINDERS_URL}/${reminderId}/`)
    } catch (error) {
      console.error(`Failed to delete reminder:`, error)
      throw error
    }
  }
}

export default {
  studyPlanApi,
  studyTaskApi,
  studyReminderApi
}

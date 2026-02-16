import { Question } from './question';
import { ChatSession } from './ai-tutor';

/**
 * Study Plan TypeScript Types
 * Types for managing user study plans, tasks, and reminders
 */

// Main Study Plan
export interface StudyPlan {
  id: number
  user: number
  name: string
  description: string
  plan_type: 'ai_generated' | 'template' | 'custom'
  exam_type: number | ExamTypeDetail
  exam_date: string // ISO date format
  start_date: string // ISO date format
  estimated_completion_date?: string // ISO date format
  actual_completion_date?: string // ISO date format
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived'
  is_favourite: boolean
  subjects: number[] | SubjectDetail[]
  total_topics: number
  completed_topics: number
  total_estimated_study_hours: number
  actual_study_hours: number
  study_hours_per_day: number
  study_days_per_week: number
  difficulty_preference: 'beginner' | 'intermediate' | 'advanced'
  include_weekends: boolean
  ai_prompt_used: string
  ai_provider: string
  confidence_score: number
  average_daily_progress: number
  created_at: string
  updated_at: string
  is_mock_period: boolean
  can_complete: boolean
  assessments: StudyPlanAssessment[]
}

export interface StudyPlanAssessment {
  id: number
  assessment_type: 'exit_quiz' | 'mock_exam'
  quiz: number
  quiz_details: any // Simplified quiz object from serializers
  last_attempt?: number
  passing_score: number
  is_passed: boolean
  created_at: string
}

// Study Task
export interface StudyTask {
  id: number
  study_plan: number
  subject: number | SubjectDetail
  subject_name?: string
  topic: number | TopicDetail
  topic_name?: string
  scheduled_start_date: string // ISO date
  scheduled_end_date: string // ISO date
  scheduled_start_time?: string // HH:MM format
  scheduled_end_time?: string // HH:MM format
  actual_start_date?: string // ISO date
  actual_completion_date?: string // ISO date
  actual_time_spent_seconds: number
  estimated_duration_hours: number
  description: string
  learning_objectives: string[]
  status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'postponed'
  priority: 'critical' | 'high' | 'medium' | 'low'
  difficulty_level: 'beginner' | 'intermediate' | 'advanced'
  completion_percentage: number
  understanding_level: number // 0-100
  is_repeatable: boolean
  repeat_count: number
  max_repeats: number
  reminder_sent: boolean
  reminder_date?: string // ISO date
  reminder_time?: string // HH:MM format
  notes: string
  resource_links: string[] // URLs
  question_ids: number[] // Related question IDs
  questions?: Question[] // Full question objects if available
  chat_session?: ChatSession // Linked AI session if available
  created_at: string
  updated_at: string
}

// Study Reminder
export interface StudyReminder {
  id: number
  user: number
  study_plan?: number
  study_task?: number
  reminder_type: 'task_start' | 'task_deadline' | 'weak_topic' | 'daily_goal'
  frequency: 'once' | 'daily' | 'weekly'
  scheduled_datetime: string // ISO datetime
  last_sent?: string // ISO datetime
  next_send?: string // ISO datetime
  title: string
  message: string
  is_active: boolean
  created_at: string
}

// Adjustment History
export interface AdjustmentHistory {
  id: number
  study_plan: number
  task?: number
  adjustment_type: 'difficulty_increase' | 'difficulty_decrease' | 'pace_adjustment' | 'deadline_extended'
  reason: string
  old_value?: Record<string, any>
  new_value?: Record<string, any>
  performance_metric: string
  performance_threshold?: number
  actual_performance?: number
  created_at: string
}

// Related entity details
export interface ExamTypeDetail {
  id: number
  name: string
  full_name: string
  level: string
}

export interface SubjectDetail {
  id: number
  name: string
  category: string
  icon: string
  color: string
}

export interface TopicDetail {
  id: number
  name: string
  subject: number | SubjectDetail
}

// Requests/Responses for API calls

export interface CreateStudyPlanRequest {
  exam_type_id: number
  exam_date: string // ISO date format
  subject_ids: number[]
  study_hours_per_day: number
  study_days_per_week: number
  difficulty_preference: 'beginner' | 'intermediate' | 'advanced'
  include_weekends: boolean
  name?: string
}

export interface GenerateStudyPlanRequest extends CreateStudyPlanRequest {
  // Same as CreateStudyPlanRequest for AI generation
}

export interface StudyPlanListResponse {
  count: number
  next?: string
  previous?: string
  results: StudyPlan[]
}

export interface StudyTaskUpdateRequest {
  status?: StudyTask['status']
  completion_percentage?: number
  understanding_level?: number
  notes?: string
  actual_time_spent_seconds?: number
  actual_start_date?: string
  actual_completion_date?: string
}

export interface CompleteTaskRequest {
  understanding_level: number // 0-100
  notes?: string
}

export interface LogStudySessionRequest {
  duration_seconds: number
  understanding_level: number // 0-100
}

export interface PlanStatistics {
  completion_percentage: number
  tasks_completed: number
  tasks_pending: number
  tasks_overdue: number
  days_until_exam: number
  pace_ratio: number // actual_progress / expected_progress
  estimated_completion_date: string
  average_daily_hours: number
}

export interface DailyGoalProgress {
  date: string // ISO date
  target_hours: number
  actual_hours: number
  tasks_planned: number
  tasks_completed: number
  completion_percentage: number
}

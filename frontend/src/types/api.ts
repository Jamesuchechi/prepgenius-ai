export interface ApiResponse<T = any> {
  data?: T
  detail?: string
  error?: string
}

export interface ApiError {
  response?: {
    status: number
    data: any
  }
  message: string
}

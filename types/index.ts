export interface Invitation {
  _id: string
  name: string
  normalizedName: string
  url: string
  createdAt: string
  updatedAt: string
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

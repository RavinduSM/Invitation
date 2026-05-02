export interface Invitation {
  _id: string
  name: string
  normalizedName: string
  url: string
  createdAt: string
  updatedAt: string
}

export interface EventDetail {
  label: string
  value: string
}

export interface EventContent {
  _id?: string
  title: string
  details?: EventDetail[]
  date?: string
  time?: string
  venue?: string
  dressCode?: string
  rsvp: string
  createdAt?: string
  updatedAt?: string
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

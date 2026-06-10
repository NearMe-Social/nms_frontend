export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token')
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  })

  const data = await res.json()

  if (!res.ok) {
    // Backend returns { message: string } on errors
    throw new Error(data.message ?? 'Something went wrong')
  }

  return data as T
}

export interface AuthResponse {
  message: string
  token: string
  user: {
    userId?: number
    user_id?: number
    username: string
    email: string
    role: string
    profile_completed?: boolean
    onboarding_completed?: boolean
    profile_image?: string | null
  }
}

export interface RegistrationResponse {
  message: string
  email: string
}

export interface PostUser {
  user_id: number
  username: string
  profile_image?: string | null
}

export interface ApiPost {
  post_id: number
  title: string
  content: string
  image_url?: string | null
  visibility_radius: number
  status: string
  expires_at: string
  created_at: string
  updated_at: string
  image_url?: string | null
  user?: PostUser | null
  comments?: unknown[]
  reactions?: unknown[]
  comments_count?: number
  reactions_count?: number
  distance_m?: number
  distance_label?: string
}

export interface ApiSearchUser {
  user_id: number
  username: string
  first_name: string
  last_name: string
  profile_image?: string | null
}

export interface ApiCommentUser {
  user_id: number
  username: string
  profile_image?: string | null
}

export interface ApiComment {
  comment_id: number
  content: string
  status: string
  created_at: string
  updated_at: string
  user?: ApiCommentUser | null
}

export interface ApiConversationParticipant {
  conversation_participant_id: number
  conversation_id: number
  user_id: number
  joined_at: string
  user?: PostUser | null
}

export interface ApiMessage {
  message_id: number
  conversation_id: number
  sender_id: number
  content: string
  status: string
  read_at: string | null
  created_at: string
  sender?: PostUser | null
}

export interface ApiConversation {
  conversation_id: number
  created_at: string
  updated_at: string
  participants?: ApiConversationParticipant[]
  messages?: ApiMessage[]
}

export interface ApiMessagePage {
  total: number
  data: ApiMessage[]
}

export interface ApiAdminReportUser {
  userId: number
  username: string
  email?: string
}

export interface ApiAdminReport {
  reportId: number
  reporter: ApiAdminReportUser | null
  targetType: 'POST' | 'COMMENT' | 'USER' | 'MESSAGE'
  targetId: number
  reason: string
  status: 'PENDING' | 'REVIEWED'
  reviewedBy: Omit<ApiAdminReportUser, 'email'> | null
  reviewedAt: string | null
  moderatorNote: string | null
  createdAt: string
}

export interface UpdateAdminReportStatusPayload {
  status: 'PENDING' | 'REVIEWED'
  moderatorNote?: string
}

export interface ApiAdminTargetSnapshot {
  type: 'POST' | 'COMMENT' | 'USER' | 'MESSAGE'
  id: number
  title?: string
  content?: string | null
  status?: string
  username?: string
  email?: string
  role?: string
  isActive?: boolean
  postId?: number | null
  note?: string
  author?: {
    userId: number
    username: string
  } | null
  createdAt?: string
  updatedAt?: string
}

export interface ApiFlaggedContent {
  report: ApiAdminReport
  target: ApiAdminTargetSnapshot | null
}

export interface ApiAdminUser {
  userId: number
  username: string
  email: string
  firstName: string
  lastName: string
  role: string
  isActive: boolean
  profileImage: string | null
  bio: string | null
  locationUpdatedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateReportPayload {
  reporter_id: number
  target_type: 'POST' | 'COMMENT' | 'USER' | 'MESSAGE'
  target_id: number
  reason: string
}

export interface CreateBlockPayload {
  blocker_id: number
  blocked_user_id: number
}

export interface CreatePostPayload {
  title: string
  content: string
  latitude: number
  longitude: number
  visibility_radius: number
  expires_at: string
}

export const authApi = {
  login(email: string, password: string): Promise<AuthResponse> {
    return request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  },

  register(payload: {
    username: string
    first_name: string
    last_name: string
    email: string
    password: string
    birthday?: string
    gender?: string
  }): Promise<RegistrationResponse> {
    return request<RegistrationResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  sendOtp(email: string): Promise<{ message: string }> {
    return request<{ message: string }>('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  },

  verifyOtp(email: string, otp: string): Promise<AuthResponse> {
    return request<AuthResponse>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    })
  },
  me(): Promise<AuthResponse['user']> {
    return request<AuthResponse['user']>('/auth/me')
  },
}

export const postApi = {
  list(sort: 'latest' | 'active' = 'latest'): Promise<ApiPost[]> {
    return request<ApiPost[]>(`/posts?sort=${sort}`)
  },

  get(postId: number): Promise<ApiPost> {
    return request<ApiPost>(`/posts/${postId}`)
  },

  async create(payload: CreatePostPayload, image?: File | null): Promise<ApiPost> {
    const formData = new FormData()
    formData.append('title', payload.title)
    formData.append('content', payload.content)
    formData.append('latitude', String(payload.latitude))
    formData.append('longitude', String(payload.longitude))
    formData.append('visibility_radius', String(payload.visibility_radius))
    formData.append('expires_at', payload.expires_at)
    if (image) formData.append('image', image)

    const token = localStorage.getItem('token')
    const response = await fetch(`${API_URL}/posts`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    })

    const body = await response.json().catch(() => ({}))
    if (!response.ok) {
      const message = Array.isArray(body?.message) ? body.message.join(', ') : body?.message
      throw new Error(message || `Post creation failed: HTTP ${response.status}`)
    }

    return body as ApiPost
  },
}

export const searchApi = {
  async search(query: string): Promise<{ users: ApiSearchUser[]; posts: ApiPost[] }> {
    const encodedQuery = encodeURIComponent(query.trim())
    const [users, posts] = await Promise.all([
      request<ApiSearchUser[]>(`/users/search?q=${encodedQuery}`),
      request<ApiPost[]>(`/posts/search?q=${encodedQuery}`),
    ])

    return { users, posts }
  },
}

export const commentApi = {
  listByPost(postId: number): Promise<ApiComment[]> {
    return request<ApiComment[]>(`/comments/post/${postId}`)
  },

  create(payload: { post_id: number; user_id: number; content: string }): Promise<ApiComment> {
    return request<ApiComment>('/comments', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
}

export const conversationApi = {
  list(): Promise<ApiConversation[]> {
    return request<ApiConversation[]>('/conversations')
  },

  create(participantIds: number[]): Promise<ApiConversation> {
    return request<ApiConversation>('/conversations', {
      method: 'POST',
      body: JSON.stringify({ participantIds }),
    })
  },
}

export const messageApi = {
  list(conversationId: number, page = 0, size = 50): Promise<ApiMessagePage> {
    return request<ApiMessagePage>(
      `/conversations/${conversationId}/messages?page=${page}&size=${size}`,
    )
  },

  create(conversationId: number, content: string): Promise<ApiMessage> {
    return request<ApiMessage>(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    })
  },

  markSeen(conversationId: number): Promise<{ success: true }> {
    return request<{ success: true }>(`/conversations/${conversationId}/messages/seen`, {
      method: 'PATCH',
    })
  },
}

export const adminReportsApi = {
  list(): Promise<ApiAdminReport[]> {
    return request<ApiAdminReport[]>('/admin/reports')
  },

  get(reportId: number): Promise<ApiAdminReport> {
    return request<ApiAdminReport>(`/admin/reports/${reportId}`)
  },

  updateStatus(reportId: number, payload: UpdateAdminReportStatusPayload): Promise<ApiAdminReport> {
    return request<ApiAdminReport>(`/admin/reports/${reportId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },
}

export const adminContentApi = {
  flagged(): Promise<ApiFlaggedContent[]> {
    return request<ApiFlaggedContent[]>('/admin/content/flagged')
  },

  updateStatus(
    targetType: 'POST' | 'COMMENT',
    targetId: number,
    action: 'hide' | 'remove' | 'restore',
  ): Promise<ApiAdminTargetSnapshot> {
    return request<ApiAdminTargetSnapshot>(`/admin/content/${targetType}/${targetId}/${action}`, {
      method: 'PATCH',
    })
  },
}

export const adminUsersApi = {
  list(): Promise<ApiAdminUser[]> {
    return request<ApiAdminUser[]>('/admin/users')
  },

  updateStatus(userId: number, isActive: boolean): Promise<ApiAdminUser> {
    return request<ApiAdminUser>(`/admin/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    })
  },

  suspend(userId: number): Promise<ApiAdminUser> {
    return request<ApiAdminUser>(`/admin/users/${userId}/suspend`, {
      method: 'PATCH',
    })
  },

  activate(userId: number): Promise<ApiAdminUser> {
    return request<ApiAdminUser>(`/admin/users/${userId}/activate`, {
      method: 'PATCH',
    })
  },
}

export const reportApi = {
  create(payload: CreateReportPayload): Promise<unknown> {
    return request<unknown>('/reports', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
}

export const blockApi = {
  create(payload: CreateBlockPayload): Promise<unknown> {
    return request<unknown>('/blocks', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
}

export interface UserProfile {
  userId?: number
  user_id?: number
  username: string
  email: string
  role: string
  first_name: string
  last_name: string
  bio?: string
  location?: string
  website?: string
  twitter_handle?: string
  instagram_handle?: string
  linkedin_url?: string
  tags?: string[]
  profile_image?: string | null
  profile_completed?: boolean
  onboarding_completed?: boolean
}

export interface UpdateProfilePayload {
  username?: string
  bio?: string
  profile_image?: string
}

export const userApi = {
  getProfile(): Promise<UserProfile> {
    return request<UserProfile>('/users/me')
  },

  getById(userId: number): Promise<UserProfile> {
    return request<UserProfile>(`/users/${userId}`)
  },

  updateProfile(payload: UpdateProfilePayload): Promise<UserProfile> {
    return request<UserProfile>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },

  completeProfile(payload: { username?: string }): Promise<UserProfile> {
    return request<UserProfile>('/users/me/complete-profile', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },

  completeOnboarding(): Promise<UserProfile> {
    return request<UserProfile>('/users/me/complete-onboarding', {
      method: 'PATCH',
    })
  },

  updateLocation(lat: number, lng: number): Promise<{ message: string }> {
    return request<{ message: string }>('/users/me/location', {
      method: 'PATCH',
      body: JSON.stringify({ lat, lng }),
    })
  },

  async uploadProfileImage(file: File): Promise<{ url: string; user: UserProfile }> {
    const formData = new FormData()
    formData.append('file', file)
    const response = await fetch(`${API_URL}/users/me/profile-image`, {
      method: 'POST',
      headers: localStorage.getItem('token')
        ? { Authorization: `Bearer ${localStorage.getItem('token')}` }
        : {},
      body: formData,
    })

    const body = await response.json().catch(() => ({}))
    if (!response.ok) {
      const message = Array.isArray(body?.message) ? body.message.join(', ') : body?.message
      throw new Error(message || `Profile image upload failed: HTTP ${response.status}`)
    }

    return body
  },
}

const BASE_URL = 'http://localhost:3000'

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token')
  const res = await fetch(`${BASE_URL}${path}`, {
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
  }
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
  visibility_radius: number
  status: string
  expires_at: string
  created_at: string
  updated_at: string
  user?: PostUser | null
  comments?: unknown[]
  reactions?: unknown[]
  comments_count?: number
  reactions_count?: number
  distance_m?: number
  distance_label?: string
}

export interface CreatePostPayload {
  user_id: number
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
  }): Promise<AuthResponse> {
    return request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
}

export const postApi = {
  list(sort: 'latest' | 'active' = 'latest'): Promise<ApiPost[]> {
    return request<ApiPost[]>(`/posts?sort=${sort}`)
  },

  create(payload: CreatePostPayload): Promise<ApiPost> {
    return request<ApiPost>('/posts', {
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
  first_name: string
  last_name: string
  bio?: string
  location?: string
  website?: string
  twitter_handle?: string
  instagram_handle?: string
  linkedin_url?: string
  tags?: string[]
  profile_image?: string
}

export interface UpdateProfilePayload {
  first_name?: string
  last_name?: string
  bio?: string
  location?: string
  website?: string
  twitter_handle?: string
  instagram_handle?: string
  linkedin_url?: string
  tags?: string[]
  profile_image?: string
}

export const userApi = {
  getProfile(): Promise<UserProfile> {
    return request<UserProfile>('/user/profile')
  },

  updateProfile(payload: UpdateProfilePayload): Promise<UserProfile> {
    return request<UserProfile>('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  },

  uploadProfileImage(file: File): Promise<{ url: string }> {
    const formData = new FormData()
    formData.append('file', file)
    return fetch(`${BASE_URL}/user/profile-image`, {
      method: 'POST',
      headers: {
        ...(localStorage.getItem('token')
          ? { Authorization: `Bearer ${localStorage.getItem('token')}` }
          : {}),
      },
      body: formData,
    }).then((res) => res.json())
  },
}

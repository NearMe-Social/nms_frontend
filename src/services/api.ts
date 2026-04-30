const BASE_URL = 'http://localhost:3000'

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
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
    userId: number
    username: string
    email: string
    role: string
  }
}

export const authApi = {
  login(email: string, password: string): Promise<AuthResponse> {
    return request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  },

  register(username: string, email: string, password: string): Promise<AuthResponse> {
    return request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    })
  },
}

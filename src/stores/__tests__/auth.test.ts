import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

function createToken(expiresAtSeconds: number) {
  const encode = (value: object) =>
    btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ exp: expiresAtSeconds })}.signature`
}

describe('auth session persistence', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-15T08:00:00Z'))
    localStorage.clear()
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('restores a remembered user while the signed token is active', async () => {
    const token = createToken(Math.floor(Date.now() / 1000) + 3600)
    localStorage.setItem('token', token)
    localStorage.setItem(
      'auth_user',
      JSON.stringify({
        userId: 1,
        username: 'sophat.odom',
        email: 'sophat@example.com',
        role: 'USER',
      }),
    )

    const { useAuthStore } = await import('../auth')
    const auth = useAuthStore()

    expect(auth.hasValidSession()).toBe(true)
    expect(auth.user?.username).toBe('sophat.odom')
  })

  it('removes an expired token instead of showing a false logged-in state', async () => {
    localStorage.setItem('token', createToken(Math.floor(Date.now() / 1000) - 1))
    localStorage.setItem(
      'auth_user',
      JSON.stringify({
        userId: 1,
        username: 'sophat.odom',
        email: 'sophat@example.com',
        role: 'USER',
      }),
    )

    const { useAuthStore } = await import('../auth')
    const auth = useAuthStore()

    expect(auth.hasValidSession()).toBe(false)
    expect(auth.isLoggedIn).toBe(false)
    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem('auth_user')).toBeNull()
  })

  it('expires an active remembered session when its signed lifetime ends', async () => {
    const token = createToken(Math.floor(Date.now() / 1000) + 60)
    const { useAuthStore } = await import('../auth')
    const auth = useAuthStore()

    auth.setAuth(token, {
      userId: 1,
      username: 'sophat.odom',
      email: 'sophat@example.com',
      role: 'USER',
    })

    await vi.advanceTimersByTimeAsync(60_000)

    expect(auth.isLoggedIn).toBe(false)
    expect(localStorage.getItem('token')).toBeNull()
  })
})

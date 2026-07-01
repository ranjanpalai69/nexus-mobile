import { API_BASE } from '@/constants/config'

export async function signupApi(data: {
  username: string
  email: string
  password: string
  fullName: string
}): Promise<void> {
  const res = await fetch(`${API_BASE}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Signup failed')
}

export async function verifyEmailApi(email: string, code: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/auth/verify-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Verification failed')
}

export async function forgotPasswordApi(email: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Request failed')
}

export async function resetPasswordApi(email: string, code: string, password: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code, password }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Reset failed')
}

export async function resendOtpApi(email: string, type: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/auth/resend-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, type }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Failed to resend')
}

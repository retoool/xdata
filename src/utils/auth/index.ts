export interface TokenInfo {
  accessToken: string
  refreshToken: string
  expires: string
}

const TOKEN_KEY = 'ACCESS_TOKEN'

export function getToken(): TokenInfo | null {
  try {
    const tokenStr = localStorage.getItem(TOKEN_KEY)
    return tokenStr ? JSON.parse(tokenStr) : null
  } catch {
    return null
  }
}

export function setToken(token: TokenInfo) {
  localStorage.setItem(TOKEN_KEY, JSON.stringify(token))
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export function formatToken(token: string): string {
  return `Bearer ${token}`
} 
export interface LoginCredentials {
  username: string
  password: string
}

export interface User {
  username: string
  email?: string
}

export interface AuthResponse {
  access_token: string
}
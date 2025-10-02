const API_URL = process.env.API_URL || 'http://localhost:3001'

export const api = {
  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_URL}${endpoint}`
    const config: RequestInit = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'ネットワークエラーが発生しました' }))
        throw new Error(error.error || 'リクエストに失敗しました')
      }

      return response.json()
    } catch (error) {
      // Handle network errors like "Failed to fetch"
      if (error instanceof Error) {
        if (error.message === 'Failed to fetch' || error.message.includes('fetch')) {
          throw new Error('サーバーに接続できません。ネットワーク接続を確認してください。')
        }
        // Re-throw our custom errors (from the if (!response.ok) block above)
        throw error
      }
      throw new Error('予期しないエラーが発生しました')
    }
  },

  // Auth endpoints
  auth: {
    login: (email: string, password: string) =>
      api.request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    
    logout: () =>
      api.request('/api/auth/logout', {
        method: 'POST',
      }),
    
    me: () =>
      api.request('/api/auth/me'),
  },

  // Admin endpoints
  admin: {
    getParameters: () =>
      api.request('/api/admin/parameters'),
    
    updateParameter: (key: string, value: number, description?: string) =>
      api.request('/api/admin/parameters', {
        method: 'POST',
        body: JSON.stringify({ key, value, description }),
      }),
  },

  // User endpoints
  user: {
    getInputs: (sheet?: string) => {
      const params = sheet ? `?sheet=${sheet}` : ''
      return api.request(`/api/user/inputs${params}`)
    },
    
    saveInput: (sheet: string, cellKey: string, value: number) =>
      api.request('/api/user/inputs', {
        method: 'POST',
        body: JSON.stringify({ sheet, cellKey, value }),
      }),
  },

  // Calculate endpoints
  calculate: (sheet: string, inputs: Record<string, number>) =>
    api.request('/api/calculate', {
      method: 'POST',
      body: JSON.stringify({ sheet, inputs }),
    }),

  // PDF endpoints
  pdf: {
    generate: (sheetName: string) =>
      api.request('/api/pdf/generate', {
        method: 'POST',
        body: JSON.stringify({ sheetName }),
      }),
  },
}

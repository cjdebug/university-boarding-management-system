const API_URL = import.meta.env.VITE_API_URL


export const apiRequest = async (
  endpoint,
  options = {}
) => {
  const token = localStorage.getItem('access_token')

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,
      headers,
    }
  )

  if (!response.ok) {
    let errorMessage = 'Something went wrong'

    try {
      const errorData = await response.json()

      errorMessage =
        errorData.detail || errorMessage
    } catch {
      errorMessage = 'Server request failed'
    }

    throw new Error(errorMessage)
  }

  return response.json()
}


export const loginUser = async (
  username,
  password
) => {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      username,
      password,
    }),
  })
}


export const getCurrentUser = async () => {
  return apiRequest('/auth/me')
}


export const logoutUser = () => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('user_role')
}
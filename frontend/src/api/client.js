// Small fetch wrapper shared by the API modules

export class ApiError extends Error {
  constructor(kind, { status = null, data = null } = {}) {
    super(kind)
    this.kind = kind // 'network' | 'validation' | 'unauthorized' | 'server' | 'unavailable'
    this.status = status
    this.data = data
  }
}

function getCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

export async function postJson(url, body) {
  const headers = { 'Content-Type': 'application/json', Accept: 'application/json' }

  // Django session login will need the CSRF token once the backend exposes it
  const csrfToken = getCookie('csrftoken')
  if (csrfToken) headers['X-CSRFToken'] = csrfToken

  let response
  try {
    response = await fetch(url, {
      method: 'POST',
      headers,
      credentials: 'same-origin',
      body: JSON.stringify(body),
    })
  } catch {
    throw new ApiError('network')
  }

  let data = null
  try {
    data = await response.json()
  } catch {
    // Some error responses are not JSON
  }

  if (response.ok) return data
  if (response.status === 400) throw new ApiError('validation', { status: 400, data })
  if (response.status === 401 || response.status === 403) {
    throw new ApiError('unauthorized', { status: response.status, data })
  }
  throw new ApiError('server', { status: response.status, data })
}

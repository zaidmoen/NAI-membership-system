const STUDENTS_ENDPOINT = '/api/students/'
const SUMMARY_ENDPOINT = '/api/students/summary/'

function getCookie(name) {
  const cookie = document.cookie.split('; ').find((item) => item.startsWith(`${name}=`))
  return cookie ? decodeURIComponent(cookie.slice(name.length + 1)) : null
}

async function request(url, options = {}) {
  let response
  try {
    response = await fetch(url, {
      credentials: 'same-origin',
      ...options,
      headers: {
        Accept: 'application/json',
        ...(options.headers || {}),
      },
    })
  } catch {
    throw new Error('تعذر الاتصال بالخادم، تأكد أن Django يعمل وحاول مرة ثانية')
  }

  const data = await response.json().catch(() => null)
  if (response.status === 401 || response.status === 403) {
    const error = new Error('لازم تسجل دخولك بحساب أدمن عشان تفتح لوحة الإدارة')
    error.kind = 'unauthorized'
    throw error
  }
  if (!response.ok) {
    throw new Error(data?.detail || 'صار خطأ أثناء تحميل البيانات، حاول مرة ثانية')
  }

  return data
}

export function getStudents({ search = '', status = '' } = {}) {
  const params = new URLSearchParams()
  if (search.trim()) params.set('search', search.trim())
  if (status) params.set('status', status)
  const query = params.toString()
  return request(`${STUDENTS_ENDPOINT}${query ? `?${query}` : ''}`)
}

export function getMembershipSummary() {
  return request(SUMMARY_ENDPOINT)
}

export function confirmStudentPayment(studentId) {
  const csrfToken = getCookie('csrftoken')
  return request(`${STUDENTS_ENDPOINT}${studentId}/confirm-payment/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(csrfToken ? { 'X-CSRFToken': csrfToken } : {}),
    },
    body: JSON.stringify({}),
  })
}

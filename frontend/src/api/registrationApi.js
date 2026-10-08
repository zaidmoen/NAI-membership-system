import { postJson } from './client'

// Send the four fields that the Django endpoint accepts
export const REGISTER_ENDPOINT = '/api/students/register/'

export function buildRegistrationPayload(values) {
  return {
    full_name: values.full_name.trim(),
    major: values.major.trim(),
    university_id: values.university_id.trim(),
    whatsapp: values.whatsapp.trim(),
  }
}

// Turn backend error keys back into form field keys
export function mapBackendErrors(data) {
  const errors = {}
  if (!data || typeof data !== 'object') return errors

  for (const field of ['full_name', 'major', 'university_id', 'whatsapp']) {
    if (data[field]) errors[field] = [].concat(data[field]).join(' ')
  }

  return errors
}

export function registerStudent(values) {
  return postJson(REGISTER_ENDPOINT, buildRegistrationPayload(values))
}

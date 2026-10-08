import { postJson } from './client'

// Send the same two fields that the Django endpoint accepts
export const REGISTER_ENDPOINT = '/api/students/register/'

export function buildRegistrationPayload(values) {
  return {
    full_name: values.full_name.trim(),
    university_id: values.university_id.trim(),
  }
}

// Turn backend error keys back into form field keys
export function mapBackendErrors(data) {
  const errors = {}
  if (!data || typeof data !== 'object') return errors
  if (data.full_name) errors.full_name = [].concat(data.full_name).join(' ')
  if (data.university_id) errors.university_id = [].concat(data.university_id).join(' ')
  return errors
}

export function registerStudent(values) {
  return postJson(REGISTER_ENDPOINT, buildRegistrationPayload(values))
}

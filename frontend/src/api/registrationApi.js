import { postJson } from './client'

// Keep the public form payload aligned with the Django registration serializer
export const REGISTER_ENDPOINT = '/api/students/register/'

export function buildRegistrationPayload(values) {
  return {
    full_name: values.full_name.trim(),
    major: values.major.trim(),
    university_id: values.university_id.trim(),
    whatsapp: values.whatsapp.trim(),
    is_volunteer: values.is_volunteer,
    volunteer_committee: values.is_volunteer ? values.volunteer_committee : '',
  }
}

// Turn backend error keys back into form field keys
export function mapBackendErrors(data) {
  const errors = {}
  if (!data || typeof data !== 'object') return errors
  if (data.full_name) errors.full_name = [].concat(data.full_name).join(' ')
  if (data.major) errors.major = [].concat(data.major).join(' ')
  if (data.university_id) errors.university_id = [].concat(data.university_id).join(' ')
  if (data.whatsapp) errors.whatsapp = [].concat(data.whatsapp).join(' ')
  if (data.is_volunteer) errors.is_volunteer = [].concat(data.is_volunteer).join(' ')
  if (data.volunteer_committee) errors.volunteer_committee = [].concat(data.volunteer_committee).join(' ')
  return errors
}

export function registerStudent(values) {
  return postJson(REGISTER_ENDPOINT, buildRegistrationPayload(values))
}

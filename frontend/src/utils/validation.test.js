import { describe, expect, it } from 'vitest'
import { validateRegistration, translateBackendMessage } from './validation'
import { buildRegistrationPayload, mapBackendErrors } from '../api/registrationApi'

const valid = { full_name: 'سارة أحمد', university_id: '12001234' }

describe('validateRegistration', () => {
  it('accepts valid values', () => {
    expect(validateRegistration(valid)).toEqual({})
  })

  it('requires the full name and university ID', () => {
    const errors = validateRegistration({ full_name: '  ', university_id: '' })
    expect(Object.keys(errors).sort()).toEqual(['full_name', 'university_id'])
  })
})

describe('registration API mapping', () => {
  it('sends only the fields the backend supports today', () => {
    expect(buildRegistrationPayload({ ...valid, full_name: '  سارة ', major: 'ignored', whatsapp: 'ignored' })).toEqual({
      full_name: 'سارة',
      university_id: '12001234',
    })
  })

  it('maps backend errors to form fields', () => {
    const errors = mapBackendErrors({ university_id: ['This university ID is already registered'] })
    expect(errors).toEqual({ university_id: 'This university ID is already registered' })
    expect(translateBackendMessage(errors.university_id)).toBe('هذا الرقم الجامعي مسجل مسبقًا')
  })
})

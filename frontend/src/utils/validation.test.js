import { describe, expect, it } from 'vitest'
import { validateRegistration, translateBackendMessage } from './validation'
import { buildRegistrationPayload, mapBackendErrors } from '../api/registrationApi'

const valid = {
  full_name: 'سارة أحمد',
  major: 'علم الحاسوب',
  university_id: '12001234',
  whatsapp: '+970 59 123 4567',
}

describe('validateRegistration', () => {
  it('accepts valid values', () => {
    expect(validateRegistration(valid)).toEqual({})
  })

  it('requires all membership fields', () => {
    const errors = validateRegistration({
      full_name: '  ',
      major: '',
      university_id: '',
      whatsapp: ' ',
    })

    expect(Object.keys(errors).sort()).toEqual(['full_name', 'major', 'university_id', 'whatsapp'])
  })

  it('rejects an invalid WhatsApp number', () => {
    expect(validateRegistration({ ...valid, whatsapp: 'abc' }).whatsapp).toBeTruthy()
  })
})

describe('registration API mapping', () => {
  it('sends the same fields that the backend accepts', () => {
    expect(buildRegistrationPayload({ ...valid, full_name: '  سارة ', major: ' علم الحاسوب ' })).toEqual({
      full_name: 'سارة',
      major: 'علم الحاسوب',
      university_id: '12001234',
      whatsapp: '+970 59 123 4567',
    })
  })

  it('maps backend errors to form fields', () => {
    const errors = mapBackendErrors({ university_id: ['This university ID is already registered'] })
    expect(errors).toEqual({ university_id: 'This university ID is already registered' })
    expect(translateBackendMessage(errors.university_id)).toBe('هذا الرقم الجامعي مسجل مسبقًا')
  })
})

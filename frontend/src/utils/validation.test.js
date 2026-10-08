import { describe, expect, it } from 'vitest'
import { validateRegistration, translateBackendMessage } from './validation'
import { buildRegistrationPayload, mapBackendErrors } from '../api/registrationApi'

const valid = {
  full_name: 'سارة أحمد',
  major: 'هندسة الحاسوب',
  university_id: '12001234',
  whatsapp: '+970 59 123 4567',
}

describe('validateRegistration', () => {
  it('accepts valid values', () => {
    expect(validateRegistration(valid)).toEqual({})
  })

  it('requires all four registration fields', () => {
    const errors = validateRegistration({ full_name: '  ', university_id: '' })
    expect(Object.keys(errors).sort()).toEqual(['full_name', 'major', 'university_id', 'whatsapp'])
  })

  it('accepts a WhatsApp number with common separators', () => {
    expect(validateRegistration({ ...valid, whatsapp: '059-123-4567' })).toEqual({})
  })

  it('rejects an invalid WhatsApp number', () => {
    expect(validateRegistration({ ...valid, whatsapp: 'not a number' }).whatsapp).toBe('أدخل رقم واتساب صحيح')
  })
})

describe('registration API mapping', () => {
  it('sends all required registration fields', () => {
    expect(buildRegistrationPayload({ ...valid, full_name: '  سارة ', major: ' هندسة الحاسوب ', whatsapp: ' +970 59 123 4567 ' })).toEqual({
      full_name: 'سارة',
      major: 'هندسة الحاسوب',
      university_id: '12001234',
      whatsapp: '+970 59 123 4567',
    })
  })

  it('maps backend errors to form fields', () => {
    const errors = mapBackendErrors({ university_id: ['This university ID is already registered'] })
    expect(errors).toEqual({ university_id: 'This university ID is already registered' })
    expect(translateBackendMessage(errors.university_id)).toBe('هذا الرقم الجامعي مسجل مسبقًا')
  })

  it('maps validation errors for the new required fields', () => {
    expect(mapBackendErrors({ major: ['Enter the student major'], whatsapp: ['Enter a valid WhatsApp number'] })).toEqual({
      major: 'Enter the student major',
      whatsapp: 'Enter a valid WhatsApp number',
    })
  })
})

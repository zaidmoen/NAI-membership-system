const REQUIRED = 'هذا الحقل مطلوب'

export function validateRegistration(values) {
  const errors = {}
  const name = (values.full_name || '').trim()
  const major = (values.major || '').trim()
  const universityId = (values.university_id || '').trim()
  const whatsapp = (values.whatsapp || '').trim()

  if (!name) errors.full_name = REQUIRED
  else if (name.length > 150) errors.full_name = 'الاسم طويل جدًا'

  if (!major) errors.major = REQUIRED
  else if (major.length > 100) errors.major = 'التخصص طويل جدًا'

  if (!universityId) errors.university_id = REQUIRED
  else if (universityId.length > 30) errors.university_id = 'الرقم الجامعي طويل جدًا'

  if (!whatsapp) errors.whatsapp = REQUIRED
  else {
    const cleanedNumber = whatsapp.replace(/[\s()-]/g, '')
    if (whatsapp.length > 25 || !/^\+?\d{7,15}$/.test(cleanedNumber)) {
      errors.whatsapp = 'أدخل رقم واتساب صحيح'
    }
  }

  return errors
}

// Backend messages are in English, so show Arabic text for the ones we know about
export function translateBackendMessage(message) {
  const text = String(message).toLowerCase()
  if (text.includes('already registered')) return 'هذا الرقم الجامعي مسجل مسبقًا'
  if (text.includes('valid whatsapp')) return 'أدخل رقم واتساب صحيح'
  if (text.includes('blank') || text.includes('required') || text.includes('enter the')) return REQUIRED
  if (text.includes('no more than')) return 'القيمة المدخلة طويلة جدًا'
  return 'تحقق من القيمة المدخلة'
}

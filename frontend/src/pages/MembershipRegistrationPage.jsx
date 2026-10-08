import { useState } from 'react'
import AuthShell from '../components/AuthShell'
import Field from '../components/Field'
import Alert from '../components/Alert'
import { BookIcon, CheckIcon, IdIcon, PhoneIcon, UserIcon } from '../components/Icons'
import { registerStudent, mapBackendErrors } from '../api/registrationApi'
import { translateBackendMessage, validateRegistration } from '../utils/validation'

const EMPTY = { full_name: '', major: '', university_id: '', whatsapp: '' }

export default function MembershipRegistrationPage() {
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setValues((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormError('')

    const clientErrors = validateRegistration(values)
    setErrors(clientErrors)
    if (Object.keys(clientErrors).length > 0) return

    setLoading(true)
    try {
      await registerStudent(values)
      setDone(true)
    } catch (err) {
      if (err.kind === 'validation') {
        const fieldErrors = mapBackendErrors(err.data)
        const translated = Object.fromEntries(
          Object.entries(fieldErrors).map(([key, message]) => [key, translateBackendMessage(message)]),
        )
        setErrors(translated)
        if (Object.keys(translated).length === 0) setFormError('تعذر إرسال الطلب، تحقق من البيانات وحاول مرة أخرى')
      } else if (err.kind === 'network') {
        setFormError('تعذر الاتصال بالخادم، تحقق من اتصالك بالإنترنت وحاول مرة أخرى')
      } else {
        setFormError('حدث خطأ غير متوقع، حاول مرة أخرى لاحقًا')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      variant="student"
      title="بوابة الانتساب وإدارة العضوية"
      subtitle="انضم إلى مجتمع الذكاء الاصطناعي في جامعة النجاح"
    >
      {done ? (
        <div className="success" role="status">
          <div className="success__badge"><CheckIcon /></div>
          <h2 id="card-title" className="card__title">أهلًا وسهلًا فيك في جمعية ناي! 🎉</h2>
          <p className="success__text">تم استلام طلب انتسابك بنجاح.</p>
          <p className="notice">ملاحظة: لتأكيد وتثبيت تسجيلك في الجمعية، يرجى دفع رسوم الانتساب.</p>
        </div>
      ) : (
        <>
          <div className="card__icon"><UserIcon /></div>
          <h2 id="card-title" className="card__title">انتسب إلى الجمعية</h2>
          <p className="card__subtitle">أدخل بياناتك لتسجيل طلب الانتساب</p>

          <form onSubmit={handleSubmit} noValidate>
            {formError && <Alert>{formError}</Alert>}

            <Field label="الاسم الكامل" icon={<UserIcon />} name="full_name" value={values.full_name}
              onChange={handleChange} error={errors.full_name} placeholder="الاسم الكامل" autoComplete="name" />
            <Field label="التخصص" icon={<BookIcon />} name="major" value={values.major}
              onChange={handleChange} error={errors.major} placeholder="مثال: علم الحاسوب" autoComplete="organization-title" />
            <Field label="الرقم الجامعي" icon={<IdIcon />} name="university_id" value={values.university_id}
              onChange={handleChange} error={errors.university_id} placeholder="مثال: 12001234" ltr inputMode="numeric" autoComplete="off" />
            <Field label="رقم الواتساب" icon={<PhoneIcon />} name="whatsapp" type="tel" value={values.whatsapp}
              onChange={handleChange} error={errors.whatsapp} placeholder="مثال: +970 59 123 4567" ltr autoComplete="tel" />

            <button className="btn btn--primary" type="submit" disabled={loading}>
              {loading ? 'جارٍ الإرسال...' : 'انتسب الآن'}
            </button>
          </form>
          <p className="admin-access">
            مسؤول الجمعية؟ <a href="/admin/">الدخول إلى لوحة الإدارة</a>
          </p>
        </>
      )}
    </AuthShell>
  )
}

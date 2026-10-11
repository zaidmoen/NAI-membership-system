import { useEffect, useRef, useState } from 'react'
import AuthShell from '../components/AuthShell'
import Field from '../components/Field'
import Alert from '../components/Alert'
import { CheckIcon, GraduationIcon, IdIcon, PhoneIcon, UserIcon } from '../components/Icons'
import { registerStudent, mapBackendErrors } from '../api/registrationApi'
import { translateBackendMessage, validateRegistration } from '../utils/validation'

const EMPTY = {
  full_name: '',
  major: '',
  university_id: '',
  whatsapp: '',
  is_volunteer: null,
  volunteer_committee: '',
}

export default function MembershipRegistrationPage() {
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const formRef = useRef(null)

  useEffect(() => {
    if (!formOpen) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    formRef.current?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' })
    formRef.current?.focus({ preventScroll: true })
  }, [formOpen])

  const handleChange = (event) => {
    const { name, value } = event.target
    setValues((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const handleVolunteerChange = (event) => {
    const isVolunteer = event.target.value === 'yes'
    setValues((previous) => ({
      ...previous,
      is_volunteer: isVolunteer,
      volunteer_committee: isVolunteer ? previous.volunteer_committee : '',
    }))
    setErrors((previous) => ({ ...previous, is_volunteer: undefined, volunteer_committee: undefined }))
  }

  const handleBackToWelcome = () => {
    setFormOpen(false)
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' })
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
      formOpen={formOpen}
      formRef={formRef}
      onStartRegistration={() => setFormOpen(true)}
    >
      {done ? (
        <div className="success" role="status" aria-live="polite">
          <div className="success__badge"><CheckIcon /></div>
          <h2 id="card-title" className="card__title">أهلًا وسهلًا فيك في جمعية ناي! 🎉</h2>
          <p className="success__text">تم استلام طلب انتسابك بنجاح.</p>
          <div className="success__status">
            <span className="success__status-dot" aria-hidden="true" />
            <span>حالة طلبك: بانتظار الدفع</span>
          </div>
          <p className="notice">رسوم الانتساب {values.is_volunteer ? 10 : 20} شيكل. بعد الدفع عند طاولة الجمعية، الإدارة بتأكد عضويتك وبتصير عضو فعال. ما في داعي تعيد التسجيل.</p>
        </div>
      ) : (
        <>
          {formOpen && (
            <button className="mobile-back" type="button" onClick={handleBackToWelcome}>
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
              <span>رجوع</span>
            </button>
          )}
          <div className="card__icon"><UserIcon /></div>
          <h2 id="card-title" className="card__title">انتسب إلى الجمعية</h2>
          <p className="card__subtitle">أدخل بياناتك عشان نكمل طلب انتسابك</p>

          <form onSubmit={handleSubmit} noValidate>
            {formError && <Alert>{formError}</Alert>}

            <Field label="الاسم الكامل" icon={<UserIcon />} name="full_name" value={values.full_name}
              onChange={handleChange} error={errors.full_name} hint="اكتب اسمك زي ما هو مسجل بالجامعة" placeholder="مثال: محمد أحمد" autoComplete="name" />
            <Field label="التخصص" icon={<GraduationIcon />} name="major" value={values.major}
              onChange={handleChange} error={errors.major} hint="مثال: هندسة الحاسوب" placeholder="اكتب تخصصك" autoComplete="organization-title" />
            <Field label="الرقم الجامعي" icon={<IdIcon />} name="university_id" value={values.university_id}
              onChange={handleChange} error={errors.university_id} hint="تأكد من الرقم الموجود على بطاقتك الجامعية" placeholder="مثال: 12001234" ltr inputMode="numeric" autoComplete="off" />
            <Field label="رقم الواتساب" icon={<PhoneIcon />} name="whatsapp" type="tel" value={values.whatsapp}
              onChange={handleChange} error={errors.whatsapp} hint="عشان نقدر نتواصل معك بخصوص الانتساب" placeholder="مثال: 0591234567" ltr inputMode="tel" autoComplete="tel" />

            <fieldset className={`choice-field${errors.is_volunteer ? ' choice-field--error' : ''}`}>
              <legend>هل أنت من متطوعي جمعية ناي حاليًا؟</legend>
              <p>هذا السؤال للمتطوعين الحاليين فقط، والتسجيل هنا للانتساب كعضو</p>
              <div className="choice-field__options">
                <label><input type="radio" name="current-volunteer" value="yes" checked={values.is_volunteer === true} onChange={handleVolunteerChange} /> نعم، أنا متطوع حالي</label>
                <label><input type="radio" name="current-volunteer" value="no" checked={values.is_volunteer === false} onChange={handleVolunteerChange} /> لا</label>
              </div>
              {errors.is_volunteer && <span className="choice-field__error" role="alert">{errors.is_volunteer}</span>}
            </fieldset>

            {values.is_volunteer === true && (
              <div className={`choice-field choice-field--committee${errors.volunteer_committee ? ' choice-field--error' : ''}`}>
                <label htmlFor="volunteer-committee">اللجنة التي تتطوع فيها</label>
                <select id="volunteer-committee" name="volunteer_committee" value={values.volunteer_committee} onChange={handleChange} aria-invalid={Boolean(errors.volunteer_committee)}>
                  <option value="">اختر لجنتك</option>
                  <option value="public_relations">العلاقات العامة</option>
                  <option value="activities">الأنشطة</option>
                  <option value="technical">اللجنة التقنية</option>
                  <option value="media">اللجنة الإعلامية</option>
                  <option value="ai_activities">أنشطة الذكاء الاصطناعي المتخصصة</option>
                </select>
                {errors.volunteer_committee && <span className="choice-field__error" role="alert">{errors.volunteer_committee}</span>}
              </div>
            )}

            <p className="form-note">
              <span className="form-note__dot" aria-hidden="true" />
              {values.is_volunteer === null
                ? 'حدد إذا كنت متطوعًا حاليًا عشان تظهر رسوم الانتساب المناسبة'
                : `رسوم الانتساب ${values.is_volunteer ? 10 : 20} شيكل. طلبك بضل بانتظار الدفع لحد ما تأكد الإدارة استلامها عند الطاولة`}
            </p>

            <button className="btn btn--primary" type="submit" disabled={loading} aria-busy={loading}>
              {loading ? 'جارٍ الإرسال...' : 'انتسب الآن'}
            </button>
          </form>
          <p className="admin-access">
            مسؤول الجمعية؟ <a href="/admin/login/?next=/manage">الدخول إلى لوحة الإدارة</a>
          </p>
        </>
      )}
    </AuthShell>
  )
}

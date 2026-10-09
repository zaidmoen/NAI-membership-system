import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { confirmStudentPayment, getMembershipSummary, getStudents } from '../api/adminApi'
import naiLogo from '../assets/nai-logo.png'
import './admin-dashboard.css'

function readCookie(name) {
  const cookie = document.cookie.split('; ').find((item) => item.startsWith(`${name}=`))
  return cookie ? decodeURIComponent(cookie.slice(name.length + 1)) : ''
}

const STATUS_LABELS = {
  pending_payment: 'بانتظار الدفع',
  active_member: 'عضو فعال',
}

function Icon({ name }) {
  const paths = {
    members: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    pending: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    active: <><path d="m5 12 4 4L19 6" /><circle cx="12" cy="12" r="9" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    logout: <><path d="M10 17l5-5-5-5" /><path d="M15 12H3" /><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" /></>,
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    check: <><path d="m5 12 4 4L19 6" /></>,
    close: <><path d="m18 6-12 12M6 6l12 12" /></>,
  }

  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

function formatDate(value) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('ar-JO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

function StatCard({ icon, label, value, tone, selected, onClick }) {
  return (
    <button className={`admin-stat admin-stat--${tone} ${selected ? 'admin-stat--selected' : ''}`} type="button" aria-pressed={selected} onClick={onClick}>
      <span className="admin-stat__icon"><Icon name={icon} /></span>
      <span className="admin-stat__copy">
        <span>{label}</span>
        <strong>{value ?? '—'}</strong>
      </span>
    </button>
  )
}

function LogoutForm({ compact = false }) {
  return (
    <form className={compact ? 'admin-logout-form admin-logout-form--compact' : 'admin-logout-form'} action="/admin/logout/" method="post">
      <input type="hidden" name="csrfmiddlewaretoken" value={readCookie('csrftoken')} />
      <input type="hidden" name="next" value="/register" />
      <button className="admin-logout" type="submit" aria-label="تسجيل الخروج">
        <Icon name="logout" /> <span>تسجيل الخروج</span>
      </button>
    </form>
  )
}

function LoginRequired() {
  return (
    <main className="admin-login-state" dir="rtl">
      <section className="admin-login-card">
        <img className="admin-login-card__mark" src={naiLogo} alt="شعار جمعية ناي" />
        <span className="admin-eyebrow">إدارة العضوية</span>
        <h1>أهلًا بعودتك</h1>
        <p>سجّل دخولك بحساب الأدمن عشان تراجع طلبات الانتساب وتأكد الدفعات</p>
        <a className="admin-primary-link" href="/admin/login/?next=/manage">
          الدخول بحساب الأدمن <Icon name="arrow" />
        </a>
        <a className="admin-back-link" href="/register">العودة لصفحة الانتساب</a>
      </section>
    </main>
  )
}

export default function AdminDashboardPage() {
  const [students, setStudents] = useState([])
  const [summary, setSummary] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [loginRequired, setLoginRequired] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [savingPayment, setSavingPayment] = useState(false)
  const [notice, setNotice] = useState('')
  const [lastUpdated, setLastUpdated] = useState(null)
  const requestNumber = useRef(0)
  const cancelButtonRef = useRef(null)

  const loadDashboard = useCallback(async () => {
    const currentRequest = ++requestNumber.current
    setLoading(true)
    setError('')
    try {
      const [studentRows, totals] = await Promise.all([
        getStudents({ search, status: statusFilter }),
        getMembershipSummary(),
      ])
      if (currentRequest !== requestNumber.current) return
      setStudents(studentRows)
      setSummary(totals)
      setLastUpdated(new Date())
      setLoginRequired(false)
    } catch (loadError) {
      if (currentRequest !== requestNumber.current) return
      if (loadError.kind === 'unauthorized') setLoginRequired(true)
      else setError(loadError.message)
    } finally {
      if (currentRequest === requestNumber.current) setLoading(false)
    }
  }, [search, statusFilter])

  useEffect(() => {
    const timeout = window.setTimeout(loadDashboard, search ? 250 : 0)
    return () => window.clearTimeout(timeout)
  }, [loadDashboard, search])

  useEffect(() => {
    if (!selectedStudent) return undefined

    const previousFocus = document.activeElement
    const previousOverflow = document.body.style.overflow
    cancelButtonRef.current?.focus()
    document.body.style.overflow = 'hidden'

    const handleDialogKeys = (event) => {
      if (event.key === 'Escape' && !savingPayment) {
        setSelectedStudent(null)
      }
      if (event.key !== 'Tab') return

      const controls = document.querySelectorAll('.admin-modal button:not(:disabled)')
      if (!controls.length) {
        event.preventDefault()
        return
      }

      const firstControl = controls[0]
      const lastControl = controls[controls.length - 1]
      if (event.shiftKey && document.activeElement === firstControl) {
        event.preventDefault()
        lastControl.focus()
      } else if (!event.shiftKey && document.activeElement === lastControl) {
        event.preventDefault()
        firstControl.focus()
      }
    }

    window.addEventListener('keydown', handleDialogKeys)
    return () => {
      window.removeEventListener('keydown', handleDialogKeys)
      document.body.style.overflow = previousOverflow
      previousFocus?.focus?.()
    }
  }, [selectedStudent, savingPayment])

  const filteredLabel = useMemo(() => {
    if (statusFilter === 'pending_payment') return 'طلبات بانتظار الدفع'
    if (statusFilter === 'active_member') return 'الأعضاء الفعالون'
    return 'كل الطلاب'
  }, [statusFilter])

  const handleConfirm = async () => {
    if (!selectedStudent) return
    setSavingPayment(true)
    setNotice('')
    try {
      await confirmStudentPayment(selectedStudent.id)
      setSelectedStudent(null)
      setNotice(`تم تأكيد انتساب ${selectedStudent.full_name} بنجاح`)
      await loadDashboard()
    } catch (confirmError) {
      if (confirmError.kind === 'unauthorized') setLoginRequired(true)
      else setError(confirmError.message)
    } finally {
      setSavingPayment(false)
    }
  }

  if (loginRequired) return <LoginRequired />

  return (
    <main className="admin-app" dir="rtl">
      <aside className="admin-sidebar">
        <a className="admin-brand" href="/manage" aria-label="لوحة إدارة جمعية ناي">
          <img className="admin-brand__logo" src={naiLogo} alt="جمعية ناي للذكاء الاصطناعي" />
        </a>
        <div className="admin-sidebar__section">القائمة الرئيسية</div>
        <a className="admin-nav-item admin-nav-item--active" href="#members">
          <Icon name="members" /> <span>الطلاب والعضوية</span>
        </a>
        <div className="admin-sidebar__bottom">
          <div className="admin-user">
            <span className="admin-user__avatar">أ</span>
            <span><strong>مسؤول الجمعية</strong><small>حساب إداري</small></span>
          </div>
          <LogoutForm />
        </div>
      </aside>

      <section className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar__title">
            <span className="admin-eyebrow">بوابة الإدارة</span>
            <h1>إدارة العضوية</h1>
          </div>
          <div className="admin-topbar__actions">
            <a className="admin-topbar__public" href="/register">عرض صفحة الانتساب <Icon name="arrow" /></a>
            <LogoutForm compact />
          </div>
        </header>

        <div className="admin-content">
          <div className="admin-welcome">
            <div>
              <h2>أهلًا فيك 👋</h2>
              <p>تابع طلبات الطلاب وسجّل الدفعات من مكان واحد</p>
            </div>
            <span className={`admin-welcome__badge ${error ? 'admin-welcome__badge--offline' : ''}`}>
              <span /> {loading && !lastUpdated ? 'جارٍ الاتصال' : error ? 'تعذر الاتصال' : 'النظام متصل'}
            </span>
          </div>

          <section className="admin-stats" aria-label="ملخص العضوية">
            <StatCard icon="members" label="إجمالي المسجلين" value={summary?.total_students} tone="purple" selected={!statusFilter} onClick={() => setStatusFilter('')} />
            <StatCard icon="pending" label="بانتظار الدفع" value={summary?.pending_payment} tone="amber" selected={statusFilter === 'pending_payment'} onClick={() => setStatusFilter('pending_payment')} />
            <StatCard icon="active" label="أعضاء فعالون" value={summary?.active_members} tone="green" selected={statusFilter === 'active_member'} onClick={() => setStatusFilter('active_member')} />
          </section>

          <section className="admin-panel" id="members">
            <div className="admin-panel__heading">
              <div>
                <h2>سجل الطلاب</h2>
                <p>{filteredLabel} · {students.length} نتيجة{lastUpdated ? ` · آخر تحديث ${new Intl.DateTimeFormat('ar-JO', { hour: 'numeric', minute: '2-digit' }).format(lastUpdated)}` : ''}</p>
              </div>
              <button className="admin-refresh" type="button" onClick={loadDashboard} disabled={loading}>
                {loading ? 'جارٍ التحديث...' : 'تحديث البيانات'}
              </button>
            </div>

            {notice && <p className="admin-notice" role="status"><Icon name="check" /> {notice}</p>}
            {error && <div className="admin-error" role="alert">{error} <button type="button" onClick={loadDashboard}>إعادة المحاولة</button></div>}

            <div className="admin-toolbar">
              <div className="admin-search">
                <Icon name="search" />
                <label className="sr-only" htmlFor="admin-student-search">ابحث بالاسم أو الرقم الجامعي أو الواتساب</label>
                <input id="admin-student-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ابحث بالاسم، الرقم الجامعي، أو الواتساب" />
                {search && <button className="admin-search__clear" type="button" onClick={() => setSearch('')} aria-label="مسح البحث"><Icon name="close" /></button>}
              </div>
              <div className="admin-filters" role="group" aria-label="فلترة حسب حالة العضوية">
                <button className={!statusFilter ? 'is-selected' : ''} type="button" aria-pressed={!statusFilter} onClick={() => setStatusFilter('')}>الكل</button>
                <button className={statusFilter === 'pending_payment' ? 'is-selected' : ''} type="button" aria-pressed={statusFilter === 'pending_payment'} onClick={() => setStatusFilter('pending_payment')}>بانتظار الدفع</button>
                <button className={statusFilter === 'active_member' ? 'is-selected' : ''} type="button" aria-pressed={statusFilter === 'active_member'} onClick={() => setStatusFilter('active_member')}>أعضاء فعالون</button>
              </div>
            </div>

            <div className="admin-table-wrap" aria-busy={loading}>
              {loading && students.length > 0 && <p className="admin-loading-note" role="status">جارٍ تحديث النتائج...</p>}
              <table className="admin-table">
                <thead><tr>
                  <th scope="col">الطالب</th><th scope="col">الرقم الجامعي</th><th scope="col">التخصص</th>
                  <th scope="col">رقم الواتساب</th><th scope="col">تاريخ التسجيل</th><th scope="col">تأكيد الدفع</th><th scope="col">أكده</th><th scope="col">الحالة</th><th scope="col">الإجراء</th>
                </tr></thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id}>
                      <td data-label="الطالب"><strong className="admin-student-name">{student.full_name}</strong></td>
                      <td data-label="الرقم الجامعي" dir="ltr">{student.university_id}</td>
                      <td data-label="التخصص">{student.major}</td>
                      <td data-label="رقم الواتساب" dir="ltr">{student.whatsapp}</td>
                      <td data-label="تاريخ التسجيل">{formatDate(student.registered_at)}</td>
                      <td data-label="تأكيد الدفع">{formatDate(student.payment_confirmed_at)}</td>
                      <td data-label="أكده">{student.payment_confirmed_by || '—'}</td>
                      <td data-label="الحالة"><span className={`admin-status admin-status--${student.status}`}><i />{STATUS_LABELS[student.status]}</span></td>
                      <td data-label="الإجراء">
                        {student.status === 'pending_payment' ? (
                          <button className="admin-confirm" type="button" onClick={() => setSelectedStudent(student)}>تأكيد الدفع</button>
                        ) : <span className="admin-confirmed"><Icon name="check" /> تم التأكيد</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {loading && <div className="admin-empty"><span className="admin-spinner" /> جارٍ تحميل بيانات الطلاب</div>}
              {!loading && !error && students.length === 0 && (
                <div className="admin-empty"><span className="admin-empty__icon"><Icon name="search" /></span><strong>ما لقينا نتائج</strong><span>جرّب تغيّر كلمة البحث أو فلتر الحالة</span></div>
              )}
            </div>
            <p className="admin-data-note">تأكيد الدفع بسجّل وقت العملية واسم المسؤول اللي أكدها</p>
          </section>
        </div>
      </section>

      {selectedStudent && (
        <div className="admin-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !savingPayment) setSelectedStudent(null) }}>
          <section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="confirm-title" dir="rtl">
            <span className="admin-modal__icon"><Icon name="check" /></span>
            <h2 id="confirm-title">تأكيد استلام الدفعة</h2>
            <p>متأكد إنك استلمت رسوم الانتساب من <strong>{selectedStudent.full_name}</strong>؟</p>
            <div className="admin-modal__student">الرقم الجامعي <b dir="ltr">{selectedStudent.university_id}</b></div>
            <div className="admin-modal__actions">
              <button type="button" className="admin-modal__cancel" ref={cancelButtonRef} onClick={() => setSelectedStudent(null)} disabled={savingPayment}>رجوع</button>
              <button type="button" className="admin-modal__confirm" onClick={handleConfirm} disabled={savingPayment}>
                {savingPayment ? 'جارٍ التأكيد...' : 'نعم، أكد الدفع'}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  )
}

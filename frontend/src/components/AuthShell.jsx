import logo from '../assets/nai-logo.png'

// Shared layout for both pages: brand panel next to a white card
export default function AuthShell({ variant, title, subtitle, children }) {
  return (
    <div className={`shell shell--${variant}`}>
      <div className="shell__glow shell__glow--one" />
      <div className="shell__glow shell__glow--two" />

      <main className="shell__inner">
        <section className="card" aria-labelledby="card-title">
          {children}
        </section>

        <aside className="brand">
          <div className="brand__logo">
            <img src={logo} alt="شعار جمعية عين NAI - Najah AI Society" />
          </div>
          <h1 className="brand__title">جمعية النجاح للذكاء الاصطناعي</h1>
          <p className="brand__subtitle">{title}</p>
          <p className="brand__text">{subtitle}</p>
          <p className="brand__tagline">
            <span>طلابنا</span><i /><span>أفكارنا</span><i /><span>مجتمعنا</span><i /><span>لمستقبل أذكى</span>
          </p>
        </aside>
      </main>
    </div>
  )
}

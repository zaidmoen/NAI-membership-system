import logo from '../assets/nai-logo.png'
import GooeyTextReveal from './ui/gooey-text-reveal'
import AnimatedJoinButton from './AnimatedJoinButton'

// Shared layout for both pages: brand panel next to a white card
export default function AuthShell({ variant, title, subtitle, children, formOpen = true, formRef, onStartRegistration }) {
  return (
    <div className={`shell shell--${variant}`}>
      <div className="shell__glow shell__glow--one" />
      <div className="shell__glow shell__glow--two" />
      <div className="shell__network" aria-hidden="true">
        <svg viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice">
          <g className="network__lines">
            <path d="M0 120 95 70 180 138 270 42 365 110 460 55 555 132 650 62 745 118 840 35 935 96 1035 48 1200 115" />
            <path d="M0 245 110 190 205 255 300 170 395 230 495 160 590 238 685 176 780 245 880 160 975 230 1075 165 1200 220" />
            <path d="M95 70 110 190M180 138 205 255M270 42 300 170M365 110 395 230M460 55 495 160M555 132 590 238M650 62 685 176M745 118 780 245M840 35 880 160M935 96 975 230M1035 48 1075 165" />
          </g>
          <g className="network__nodes">
            <circle cx="95" cy="70" r="4" /><circle cx="180" cy="138" r="3" />
            <circle cx="270" cy="42" r="4" /><circle cx="365" cy="110" r="3" />
            <circle cx="460" cy="55" r="4" /><circle cx="555" cy="132" r="3" />
            <circle cx="650" cy="62" r="4" /><circle cx="745" cy="118" r="3" />
            <circle cx="840" cy="35" r="4" /><circle cx="935" cy="96" r="3" />
            <circle cx="1035" cy="48" r="4" /><circle cx="110" cy="190" r="3" />
            <circle cx="300" cy="170" r="3" /><circle cx="495" cy="160" r="3" />
            <circle cx="685" cy="176" r="3" /><circle cx="880" cy="160" r="3" />
            <circle cx="1075" cy="165" r="3" />
          </g>
        </svg>
      </div>

      <main className="shell__inner">
        <section
          ref={formRef}
          className={`card${variant === 'student' && !formOpen ? ' card--mobile-hidden' : ''}`}
          id={variant === 'student' ? 'membership-form' : undefined}
          tabIndex={variant === 'student' ? -1 : undefined}
          aria-labelledby="card-title"
        >
          {children}
        </section>

        <aside className={`brand${variant === 'student' && formOpen ? ' brand--hidden-mobile' : ''}`}>
          <div className="brand__logo">
            <img src={logo} alt="شعار جمعية النجاح للذكاء الاصطناعي NAI" />
          </div>
          <GooeyTextReveal
            className="brand__copy"
            mode="scroll"
            duration={1.4}
            stagger={0.12}
            blurAmount={0.4}
          >
            <h1 className="brand__title" data-gooey-reveal-item>جمعية النجاح للذكاء الاصطناعي</h1>
            <p className="brand__subtitle" data-gooey-reveal-item>{title}</p>
            <p className="brand__text" data-gooey-reveal-item>{subtitle}</p>
          </GooeyTextReveal>
          {variant === 'student' && (
            <AnimatedJoinButton onComplete={onStartRegistration} expanded={formOpen} />
          )}
          <p className="brand__tagline">
            <span>طلابنا</span><i /><span>أفكارنا</span><i /><span>مجتمعنا</span><i /><span>لمستقبل أذكى</span>
          </p>
        </aside>
      </main>
    </div>
  )
}

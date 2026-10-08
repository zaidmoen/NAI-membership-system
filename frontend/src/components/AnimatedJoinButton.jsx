import { useState } from 'react'

export default function AnimatedJoinButton({ onComplete, expanded }) {
  const [animating, setAnimating] = useState(false)

  const handleAnimationEnd = (event) => {
    if (event.animationName !== 'join-button-activation') return

    setAnimating(false)
    onComplete()
  }

  return (
    <button
      className={`join-button${animating ? ' join-button--animating' : ''}`}
      type="button"
      onClick={() => setAnimating(true)}
      disabled={animating || expanded}
      aria-controls="membership-form"
      aria-expanded={expanded}
      aria-busy={animating}
    >
      <span className="join-button__stars" aria-hidden="true"><span /></span>
      <svg className="join-button__currents" viewBox="0 0 250 58" preserveAspectRatio="none" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="join-current-a" x1="0" y1="0" x2="250" y2="58" gradientUnits="userSpaceOnUse">
            <stop stopColor="#9D71FF" stopOpacity="0" />
            <stop offset=".48" stopColor="#E9DCFF" />
            <stop offset="1" stopColor="#A98AFF" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="join-current-b" x1="0" y1="58" x2="250" y2="0" gradientUnits="userSpaceOnUse">
            <stop stopColor="#B79CFF" stopOpacity="0" />
            <stop offset=".5" stopColor="#FFFFFF" />
            <stop offset="1" stopColor="#8B65F0" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M-18 44C24 7 53 56 98 31S169 8 268 35" pathLength="100" stroke="url(#join-current-a)" />
        <path d="M-20 15C25 49 69 8 112 25S192 48 270 12" pathLength="100" stroke="url(#join-current-b)" />
      </svg>
      <span className="join-button__glow" aria-hidden="true">
        <span className="join-button__glow-circle" />
        <span className="join-button__glow-circle" />
      </span>
      <strong className="join-button__labels">
        <span className="join-button__label join-button__label--initial">انتسب الآن</span>
        <span className="join-button__label join-button__label--loading">جاري فتح النموذج</span>
      </strong>
      <span
        className="join-button__activation"
        aria-hidden="true"
        onAnimationEnd={handleAnimationEnd}
      />
    </button>
  )
}

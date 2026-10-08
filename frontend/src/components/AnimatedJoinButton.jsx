import { useState } from 'react'

export default function AnimatedJoinButton({ onComplete, expanded }) {
  const [animating, setAnimating] = useState(false)

  const handleAnimationEnd = (event) => {
    if (event.animationName !== 'join-outline-draw') return

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
      <span className="join-button__base" aria-hidden="true" />
      <span className="join-button__frame">
        <svg
          className="join-button__path"
          viewBox="0 0 221 42"
          fill="none"
          aria-hidden="true"
          onAnimationEnd={handleAnimationEnd}
        >
          <path d="M182 2h21c9 0 16 7 16 16v6c0 9-7 16-16 16H18C9 40 2 33 2 24v-6C2 9 9 2 18 2h30" />
        </svg>
        <span className="join-button__outline" aria-hidden="true" />
        <span className="join-button__content">
          <span className="join-button__labels">
            <span className="join-button__label join-button__label--initial">انتسب الآن</span>
            <span className="join-button__label join-button__label--loading">جاري فتح النموذج</span>
          </span>
          <svg className="join-button__arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 12h15m-6-6 6 6-6 6" />
          </svg>
        </span>
      </span>
      <svg className="join-button__splash" viewBox="0 0 100 70" fill="none" aria-hidden="true">
        <path d="M9 34h18M73 34h18M50 3v16M50 51v16M23 10l12 12m30 25 12 12M77 10 65 22M35 47 23 59" />
      </svg>
    </button>
  )
}

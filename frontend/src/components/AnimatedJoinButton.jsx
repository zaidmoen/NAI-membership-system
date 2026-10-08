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

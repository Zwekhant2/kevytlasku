import { useEffect, useRef, useState } from 'react'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Counts up from 0 on first mount, then animates from the previous value to
 * `target` whenever it changes (e.g. the dashboard numbers shifting after an
 * invoice is created elsewhere and you come back). */
export function useCountUp(target, duration = 700) {
  const [value, setValue] = useState(0)
  const fromRef = useRef(0)

  useEffect(() => {
    if (prefersReducedMotion()) {
      setValue(target)
      fromRef.current = target
      return
    }

    const from = fromRef.current
    const start = performance.now()
    let raf

    function step(now) {
      const p = Math.min((now - start) / duration, 1)
      const eased = 1 - (1 - p) ** 3
      setValue(from + (target - from) * eased)
      if (p < 1) {
        raf = requestAnimationFrame(step)
      } else {
        fromRef.current = target
      }
    }
    raf = requestAnimationFrame(step)

    return () => cancelAnimationFrame(raf)
  }, [target, duration])

  return value
}

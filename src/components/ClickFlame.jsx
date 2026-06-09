import { useEffect, useState, useCallback, useRef } from 'react'

const DURATION = 650

const css = `
/* alive — looping flicker while held */
@keyframes aliveOuter {
  0%, 100% { transform: scaleX(1)    scaleY(1);    opacity: 0.95; }
  40%       { transform: scaleX(0.88) scaleY(1.1);  opacity: 1;    }
  70%       { transform: scaleX(1.05) scaleY(0.93); opacity: 0.9;  }
}
@keyframes aliveMid {
  0%, 100% { transform: scaleX(1)    scaleY(1)    rotate(0deg);   opacity: 0.9;  }
  35%       { transform: scaleX(0.82) scaleY(1.14) rotate(-6deg);  opacity: 1;    }
  70%       { transform: scaleX(1.07) scaleY(0.9)  rotate(5deg);   opacity: 0.82; }
}
@keyframes aliveCore {
  0%, 100% { transform: scaleX(1)    scaleY(1);   opacity: 1; }
  45%       { transform: scaleX(0.76) scaleY(1.2); opacity: 1; }
}

/* die — plays once on mouseup */
@keyframes dieOuter {
  0%   { transform: translateY(0)     scaleX(1)    scaleY(1);   opacity: 1; }
  100% { transform: translateY(-38px) scaleX(0.3)  scaleY(0.4); opacity: 0; }
}
@keyframes dieMid {
  0%   { transform: translateY(0)     scaleX(1)    scaleY(1)    rotate(0deg);  opacity: 1; }
  100% { transform: translateY(-58px) scaleX(0.25) scaleY(0.35) rotate(-4deg); opacity: 0; }
}
@keyframes dieCore {
  0%   { transform: translateY(0)     scaleX(1)   scaleY(1);   opacity: 1; }
  100% { transform: translateY(-72px) scaleX(0.2) scaleY(0.3); opacity: 0; }
}
`

function FlameBody({ dying }) {
  const base = {
    position: 'absolute',
    pointerEvents: 'none',
    transformOrigin: 'bottom center',
    willChange: 'transform, opacity',
  }
  return (
    <>
      <div style={{
        ...base,
        width: 18, height: 28, marginLeft: -9, marginTop: -28,
        background: '#7B0D0D',
        borderRadius: '50% 50% 20% 20% / 80% 80% 20% 20%',
        animation: dying
          ? `dieOuter ${DURATION}ms cubic-bezier(0.2,0,0.4,1) forwards`
          : `aliveOuter 0.52s ease-in-out infinite`,
      }} />
      <div style={{
        ...base,
        width: 12, height: 22, marginLeft: -6, marginTop: -22,
        background: '#A52020',
        borderRadius: '50% 50% 20% 20% / 80% 80% 20% 20%',
        animation: dying
          ? `dieMid ${DURATION}ms cubic-bezier(0.2,0,0.4,1) forwards`
          : `aliveMid 0.64s ease-in-out infinite 0.06s`,
      }} />
      <div style={{
        ...base,
        width: 7, height: 14, marginLeft: -3.5, marginTop: -14,
        background: '#D04040',
        borderRadius: '50% 50% 20% 20% / 80% 80% 20% 20%',
        animation: dying
          ? `dieCore ${DURATION}ms cubic-bezier(0.15,0,0.35,1) forwards`
          : `aliveCore 0.37s ease-in-out infinite 0.12s`,
      }} />
    </>
  )
}

export default function ClickFlame() {
  const [flame, setFlame] = useState(null)  // { x, y } | null
  const [dying, setDying] = useState(false)
  const isDown = useRef(false)
  const posRef = useRef(null)
  const wrapperRef = useRef(null)
  const velRef = useRef(0)
  const lastXRef = useRef(0)
  const lastTRef = useRef(0)
  const cleanupRef = useRef(null)

  const handleMouseDown = useCallback((e) => {
    // Cancel any pending die-cleanup from a previous quick release
    if (cleanupRef.current) {
      clearTimeout(cleanupRef.current)
      cleanupRef.current = null
    }
    isDown.current = true
    velRef.current = 0
    lastXRef.current = e.clientX
    lastTRef.current = Date.now()
    setDying(false)
    setFlame({ x: e.clientX, y: e.clientY })
  }, [])

  const handleMouseMove = useCallback((e) => {
    if (!isDown.current || !wrapperRef.current) return
    const now = Date.now()
    const dt = Math.max(now - lastTRef.current, 1)
    const rawVel = (e.clientX - lastXRef.current) / dt  // px/ms
    velRef.current = velRef.current * 0.75 + rawVel * 0.25  // EMA smoothing
    lastXRef.current = e.clientX
    lastTRef.current = now

    // Track mouse position
    if (posRef.current) {
      posRef.current.style.left = `${e.clientX}px`
      posRef.current.style.top  = `${e.clientY}px`
    }

    // Lean opposite to movement direction; faster = more lean, cap at ±45°
    const lean = Math.max(-45, Math.min(45, -velRef.current * 80))
    wrapperRef.current.style.transform = `rotate(${lean}deg)`
  }, [])

  const handleMouseUp = useCallback(() => {
    if (!isDown.current) return
    isDown.current = false
    // Ease lean back to upright as the flame dies
    if (wrapperRef.current) {
      wrapperRef.current.style.transition = 'transform 0.35s cubic-bezier(0.4,0,0.2,1)'
      wrapperRef.current.style.transform = 'rotate(0deg)'
    }
    setDying(true)
    cleanupRef.current = setTimeout(() => {
      cleanupRef.current = null
      setFlame(null)
      setDying(false)
    }, DURATION + 60)
  }, [])

  useEffect(() => {
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleMouseDown, handleMouseMove, handleMouseUp])

  return (
    <>
      <style>{css}</style>
      {flame && (
        <div ref={posRef} style={{ position: 'fixed', left: flame.x, top: flame.y, pointerEvents: 'none', zIndex: 9999 }}>
          <div ref={wrapperRef} style={{ transformOrigin: 'bottom center' }}>
            <FlameBody dying={dying} />
          </div>
        </div>
      )}
    </>
  )
}

import { useEffect, useRef, useState } from 'react'
import { STRINGS, frequencyForMidi } from '../lib/notes.js'
import { pluck } from '../lib/audio.js'

const FRET_WINDOW = 4
const HOLD_THRESHOLD_MS = 250
const ARPEGGIO_GAP_MS = 110

export default function ChordDiagram({
  roman,
  name,
  root,
  frets,
  caption = null,
  selected = false,
  onSelect = () => {},
}) {
  const [arpeggiating, setArpeggiating] = useState(false)
  const holdTimerRef = useRef(null)
  const arpTimeoutsRef = useRef([])
  const heldRef = useRef(false)

  // chord boxes read low string to high string, left to right — the
  // opposite of the tab convention used elsewhere in this app
  const lowToHigh = [...frets].reverse()

  const numericFrets = lowToHigh.filter((f) => typeof f === 'number' && f > 0)
  const minFret = numericFrets.length ? Math.min(...numericFrets) : 1
  const maxFret = numericFrets.length ? Math.max(...numericFrets) : 1
  // a shape with open strings is played against the nut, so it's drawn from
  // fret 1 whenever it fits — an open G is 2nd and 3rd fret, not "2fr"
  const hasOpenString = lowToHigh.includes(0)
  const startFret = minFret <= 1 || (hasOpenString && maxFret <= FRET_WINDOW) ? 1 : minFret

  // the root is always the lowest-pitched string actually played, since
  // every shape here is a standard root-position voicing
  const rootIndex = lowToHigh.findIndex((f) => f !== 'x')

  useEffect(() => {
    return () => {
      clearTimeout(holdTimerRef.current)
      arpTimeoutsRef.current.forEach(clearTimeout)
    }
  }, [])

  function strumChord() {
    frets.forEach((fret, i) => {
      if (fret === 'x') return
      const string = STRINGS[i]
      pluck(frequencyForMidi(string.midi + fret), { bright: string.type === 'plain' })
    })
  }

  function arpeggiateChord() {
    // low string to high string, the way a real strum or arpeggio actually
    // moves across the strings — frets is stored high-to-low, so walk it
    // back to front
    const order = [5, 4, 3, 2, 1, 0].filter((i) => frets[i] !== 'x')
    setArpeggiating(true)
    order.forEach((i, seq) => {
      const t = setTimeout(() => {
        const string = STRINGS[i]
        pluck(frequencyForMidi(string.midi + frets[i]), { bright: string.type === 'plain' })
      }, seq * ARPEGGIO_GAP_MS)
      arpTimeoutsRef.current.push(t)
    })
    const endT = setTimeout(() => setArpeggiating(false), order.length * ARPEGGIO_GAP_MS)
    arpTimeoutsRef.current.push(endT)
  }

  function handlePressStart(e) {
    if (e.type === 'touchstart') e.preventDefault()
    heldRef.current = false
    holdTimerRef.current = setTimeout(() => {
      heldRef.current = true
      arpeggiateChord()
    }, HOLD_THRESHOLD_MS)
  }

  function handlePressEnd(e) {
    if (e.type === 'touchend') e.preventDefault()
    clearTimeout(holdTimerRef.current)
    if (!heldRef.current) strumChord()
    heldRef.current = false
    onSelect()
  }

  function handlePressCancel() {
    clearTimeout(holdTimerRef.current)
    heldRef.current = false
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      strumChord()
      onSelect()
    }
  }

  return (
    <button
      className={[
        'chord-diagram',
        selected ? 'selected' : '',
        arpeggiating ? 'arpeggiating' : '',
      ].join(' ').trim()}
      onMouseDown={handlePressStart}
      onMouseUp={handlePressEnd}
      onMouseLeave={handlePressCancel}
      onTouchStart={handlePressStart}
      onTouchEnd={handlePressEnd}
      onKeyDown={handleKeyDown}
      aria-pressed={selected}
      aria-label={`Play ${name} chord — press and hold for an arpeggio — and show it on the fretboard`}
    >
      <div className="chord-diagram-name">
        <span className="roman">{roman}</span>
        {name}
        {caption && <span className="scale-diagram-fret">{caption}</span>}
      </div>

      <div className="chord-markers">
        {lowToHigh.map((f, i) => {
          if (i === rootIndex && f === 0) {
            return (
              <span key={`marker-${i}`} className="marker">
                <span className="root-badge">{root}</span>
              </span>
            )
          }
          return (
            <span key={`marker-${i}`} className="marker">
              {f === 'x' ? '×' : f === 0 ? 'O' : ''}
            </span>
          )
        })}
      </div>

      <div className="chord-box">
        {startFret === 1 ? (
          <div className="nut" />
        ) : (
          <div className="position-label">{startFret}fr</div>
        )}
        {Array.from({ length: FRET_WINDOW + 1 }, (_, i) => (
          <div key={`fret-${i}`} className="fret-line" style={{ top: `${(i / FRET_WINDOW) * 100}%` }} />
        ))}
        {lowToHigh.map((_, i) => (
          <div key={`string-${i}`} className="string-line" style={{ left: `${(i / 5) * 100}%` }} />
        ))}
        {lowToHigh.map((f, i) => {
          if (typeof f !== 'number' || f === 0) return null
          const row = f - startFret
          if (row < 0 || row >= FRET_WINDOW) return null
          const isRoot = i === rootIndex
          return (
            <span
              key={`dot-${i}`}
              className={isRoot ? 'dot dot-root' : 'dot'}
              style={{ left: `${(i / 5) * 100}%`, top: `${((row + 0.5) / FRET_WINDOW) * 100}%` }}
            >
              {isRoot ? root : null}
            </span>
          )
        })}
      </div>
    </button>
  )
}

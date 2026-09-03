import { useState } from 'react'
import { FLATS, isNatural } from '../lib/notes.js'
import { pluck } from '../lib/audio.js'

export default function NoteChip({
  note,
  freq,
  label,
  bright = true,
  hoveredNote = null,
  onHover = () => {},
  onLeave = () => {},
  outOfKey = false,
  isRoot = false,
  chordActive = false,
  isChordRoot = false,
  isWrongGuess = false,
  onNoteClick = () => {},
}) {
  const [playing, setPlaying] = useState(false)
  const natural = isNatural(note)
  const classes = ['chip', natural ? 'natural' : 'accidental']

  if (hoveredNote) {
    classes.push(hoveredNote === note ? 'echo' : 'dim')
  }
  if (outOfKey) classes.push('out-of-key')
  if (isRoot) classes.push('root-note')
  if (chordActive) classes.push('chord-active')
  if (isChordRoot) classes.push('chord-root')
  if (isWrongGuess) classes.push('wrong-guess')
  if (playing) classes.push('played')

  function play() {
    pluck(freq, { bright })
    setPlaying(true)
    window.setTimeout(() => setPlaying(false), 280)
    onNoteClick()
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      play()
    }
  }

  return (
    <span
      className={classes.join(' ')}
      role="button"
      tabIndex={0}
      aria-label={`Play ${label}, ${freq.toFixed(1)} hertz`}
      onMouseEnter={() => onHover(note)}
      onMouseLeave={onLeave}
      onClick={play}
      onKeyDown={handleKeyDown}
      onAnimationEnd={() => setPlaying(false)}
    >
      {natural ? note : (
        <>
          <span>{note}</span>
          <span>{FLATS[note]}</span>
        </>
      )}
    </span>
  )
}

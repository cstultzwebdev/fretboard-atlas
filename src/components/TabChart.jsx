import { useEffect, useRef, useState } from 'react'
import { buildTabLines } from '../lib/tabFormat.js'
import { STRINGS, frequencyForMidi } from '../lib/notes.js'
import { pluck } from '../lib/audio.js'

export default function TabChart({
  heading,
  song,
  artist,
  chords,
  playLabel = 'Play chords',
  noteGapMs = 1200,
  onStep = () => {},
}) {
  const [isPlaying, setIsPlaying] = useState(false)
  const timeoutsRef = useRef([])
  const activeNotesRef = useRef([])

  function stopSequence() {
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []
    activeNotesRef.current.forEach((n) => n.stop())
    activeNotesRef.current = []
    setIsPlaying(false)
    onStep(null)
  }

  // switching songs (i.e. picking a different key) should cut off any
  // playback left over from the one before it
  useEffect(() => stopSequence, [song])

  function playSequence() {
    setIsPlaying(true)
    chords.forEach((chord, i) => {
      const t = setTimeout(() => {
        onStep(i)
        chord.frets.forEach((fret, stringIndex) => {
          if (fret === 'x') return
          const string = STRINGS[stringIndex]
          const midi = string.midi + fret
          activeNotesRef.current.push(
            pluck(frequencyForMidi(midi), { bright: string.type === 'plain' })
          )
        })
      }, i * noteGapMs)
      timeoutsRef.current.push(t)
    })
    const endT = setTimeout(() => {
      activeNotesRef.current = []
      timeoutsRef.current = []
      setIsPlaying(false)
      onStep(null)
    }, chords.length * noteGapMs)
    timeoutsRef.current.push(endT)
  }

  function togglePlay() {
    if (isPlaying) stopSequence()
    else playSequence()
  }

  return (
    <div className="tab-chart">
      {heading && <p className="tab-heading">{heading}</p>}
      <div className="tab-chart-head">
        <span className="tab-song">{song}</span>
        <span className="tab-artist">{artist}</span>
        <button
          className="play-scale-btn tab-play-btn"
          onClick={togglePlay}
          aria-pressed={isPlaying}
        >
          {isPlaying ? '■ Stop' : `▶ ${playLabel}`}
        </button>
      </div>
      <div className="tab-scroll">
        <pre className="tab-body">{buildTabLines(chords)}</pre>
      </div>
    </div>
  )
}

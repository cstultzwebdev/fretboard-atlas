import { useEffect, useRef, useState } from 'react'
import { STRINGS, frequencyForMidi } from '../lib/notes.js'
import { pluck } from '../lib/audio.js'
import ShapeGrid, { ascendingNotes, cellKey, SHAPE_NOTE_GAP_MS } from './ShapeGrid.jsx'

export default function ScaleDiagram({
  position,
  startFret,
  endFret,
  notes,
  selected = false,
  playingPosition = null,
  onSelect = () => {},
  onStep = () => {},
  onPlayStart = () => {},
}) {
  const [playing, setPlaying] = useState(false)
  const [stepKey, setStepKey] = useState(null)
  const timeoutsRef = useRef([])

  useEffect(() => () => timeoutsRef.current.forEach(clearTimeout), [])

  // only one shape sounds at a time: when another one starts (or everything
  // is stopped), this one drops whatever it still had queued up
  useEffect(() => {
    if (playingPosition === position) return
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []
    setPlaying(false)
    setStepKey(null)
  }, [playingPosition, position])

  const ascending = ascendingNotes(notes)

  function playShape() {
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []
    setPlaying(true)
    ascending.forEach((note, i) => {
      const t = setTimeout(() => {
        pluck(frequencyForMidi(note.midi), {
          bright: STRINGS[note.stringIndex].type === 'plain',
        })
        // the note sounding right now, so the neck above can follow along
        setStepKey(cellKey(note))
        onStep(note)
      }, i * SHAPE_NOTE_GAP_MS)
      timeoutsRef.current.push(t)
    })
    const endT = setTimeout(() => {
      setPlaying(false)
      setStepKey(null)
      onStep(null)
    }, ascending.length * SHAPE_NOTE_GAP_MS)
    timeoutsRef.current.push(endT)
  }

  function handleClick() {
    // clicking the shape that's already up shouldn't set it off again — use
    // "Clear selection" and click back in to hear it a second time
    if (selected) return
    onPlayStart(position) // cuts off any other shape mid-run
    playShape()
    onSelect()
  }

  return (
    <button
      className={[
        'chord-diagram',
        'scale-diagram',
        selected ? 'selected' : '',
        playing ? 'arpeggiating' : '',
      ].join(' ').trim()}
      onClick={handleClick}
      aria-pressed={selected}
      aria-label={`Play position ${position}, frets ${startFret} to ${endFret}, and show it on the fretboard`}
    >
      <div className="chord-diagram-name">
        <span className="roman">Position</span>
        {position}
        <span className="scale-diagram-fret">
          {startFret === 0 ? 'open' : `${startFret}fr`}
        </span>
      </div>

      <ShapeGrid startFret={startFret} endFret={endFret} notes={notes} soundingKey={stepKey} />
    </button>
  )
}

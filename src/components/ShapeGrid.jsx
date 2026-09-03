import { STRINGS } from '../lib/notes.js'

export const ROW_HEIGHT = 23

// how fast a shape is played back, wherever one is played — the scale
// position boxes and the mode rows run at the same tempo
export const SHAPE_NOTE_GAP_MS = 380

// shape boxes read low string to high string, left to right — the same way
// the chord diagrams do, and the opposite of the tab convention elsewhere
const COLUMNS = STRINGS.length - 1

export const cellKey = (note) => `${note.stringIndex}:${note.fret}`

// The box itself, with no behaviour of its own — a fret window with a dot on
// every note in it. ScaleDiagram wraps this in a button that plays the shape;
// the modes list drops it straight into a row.
export default function ShapeGrid({ startFret, endFret, notes, soundingKey = null }) {
  const fretCount = endFret - startFret + 1

  return (
    <div className="chord-box scale-box" style={{ height: `${fretCount * ROW_HEIGHT}px` }}>
      {startFret === 0 && <div className="nut" />}

      {Array.from({ length: fretCount + 1 }, (_, i) => (
        <div key={`fret-${i}`} className="fret-line" style={{ top: `${(i / fretCount) * 100}%` }} />
      ))}
      {Array.from({ length: STRINGS.length }, (_, i) => (
        <div key={`string-${i}`} className="string-line" style={{ left: `${(i / COLUMNS) * 100}%` }} />
      ))}

      {notes.map((note) => {
        // STRINGS runs high string to low, the diagram runs low to high
        const column = COLUMNS - note.stringIndex
        const row = note.fret - startFret
        const classes = ['dot']
        if (note.isRoot) classes.push('dot-root')
        if (soundingKey === cellKey(note)) classes.push('dot-sounding')
        return (
          <span
            key={cellKey(note)}
            className={classes.join(' ')}
            style={{
              left: `${(column / COLUMNS) * 100}%`,
              top: `${((row + 0.5) / fretCount) * 100}%`,
            }}
          >
            {note.degree}
          </span>
        )
      })}
    </div>
  )
}

// the order you'd practice a shape in: lowest string first, walking up the
// frets on each string before crossing to the next
export function ascendingNotes(notes) {
  return [...notes].sort((a, b) => b.stringIndex - a.stringIndex || a.fret - b.fret)
}

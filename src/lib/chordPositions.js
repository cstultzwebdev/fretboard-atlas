import { SCALES } from './scales.js'

// The five open chord shapes of the CAGED system, high string to low
// (e, B, G, D, A, E) like every other shape in the app. Each one is written
// in its own open key; sliding it up the neck by n frets turns it into the
// same chord n semitones higher, which is how one chord ends up with five
// places to play it.
const SHAPES = {
  major: [
    { shape: 'C', root: 0, frets: [0, 1, 0, 2, 3, 'x'] },
    { shape: 'A', root: 9, frets: [0, 2, 2, 2, 0, 'x'] },
    { shape: 'G', root: 7, frets: [3, 0, 0, 0, 2, 3] },
    { shape: 'E', root: 4, frets: [0, 0, 1, 2, 2, 0] },
    { shape: 'D', root: 2, frets: [2, 3, 2, 0, 'x', 'x'] },
  ],
  minor: [
    { shape: 'C', root: 0, frets: ['x', 1, 0, 1, 3, 'x'] },
    { shape: 'A', root: 9, frets: [0, 1, 2, 2, 0, 'x'] },
    { shape: 'G', root: 7, frets: [3, 3, 0, 0, 1, 3] },
    { shape: 'E', root: 4, frets: [0, 0, 0, 2, 2, 0] },
    { shape: 'D', root: 2, frets: [1, 3, 2, 0, 'x', 'x'] },
  ],
}

export const CHORD_QUALITIES = {
  major: { key: 'major', label: 'Major', suffix: '', scale: SCALES.major, degrees: ['1', '3', '5'] },
  minor: { key: 'minor', label: 'Minor', suffix: 'm', scale: SCALES.minor, degrees: ['1', '♭3', '5'] },
}

// a triad is the 1st, 3rd and 5th of its scale, so it borrows that scale's
// spelling — A# major reads Bb D F, the same way the Scales tab writes it
export function spellTriad(rootName, quality) {
  const spelled = CHORD_QUALITIES[quality].scale.spell(rootName)
  return [spelled[0], spelled[2], spelled[4]]
}

// Every CAGED shape moved up to this root, lowest on the neck first. Each
// shape is slid the smallest distance that reaches the root, so the five
// voicings between them cover the neck from the nut to around fret 15.
export function chordPositions(rootPitch, quality) {
  const voicings = SHAPES[quality].map(({ shape, root, frets }) => {
    const shift = (rootPitch - root + 12) % 12
    return { shape, frets: frets.map((f) => (f === 'x' ? 'x' : f + shift)) }
  })

  return voicings
    .map((v) => {
      const played = v.frets.filter((f) => f !== 'x')
      return { ...v, startFret: Math.min(...played), endFret: Math.max(...played) }
    })
    .sort((a, b) => a.startFret - b.startFret || a.endFret - b.endFret)
    .map((v, i) => ({ ...v, position: i + 1 }))
}

// the string/fret cells a voicing presses, keyed the same way the boards are
export function voicingCells(frets) {
  return new Set(frets.flatMap((f, stringIndex) => (f === 'x' ? [] : [`${stringIndex}:${f}`])))
}

// the lowest string actually played — every CAGED shape keeps its root there
export function voicingRootString(frets) {
  return frets.reduce((root, fret, i) => (fret !== 'x' ? i : root), -1)
}

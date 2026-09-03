import { NOTE_TO_INDEX, spellMajorScale } from './notes.js'

// Every shape below is high-string-to-low-string (e, B, G, D, A, E), matching
// the convention used everywhere else in the app (NoteChip, keyTabs, tab.js).

// hand-known open-position shapes — used whenever a scale degree happens to
// land on one of these roots, so the chart reads like a normal beginner
// chord sheet instead of an unbroken wall of barre chords
const OPEN_MAJOR = {
  C: [0, 1, 0, 2, 3, 'x'],
  G: [3, 0, 0, 0, 2, 3],
  D: [2, 3, 2, 0, 'x', 'x'],
  A: [0, 2, 2, 2, 0, 'x'],
  E: [0, 0, 1, 2, 2, 0],
}
const OPEN_MINOR = {
  A: [0, 1, 2, 2, 0, 'x'],
  E: [0, 0, 0, 2, 2, 0],
  D: [1, 3, 2, 0, 'x', 'x'],
}

function fretOnLowE(pitchClass) {
  return (pitchClass - 4 + 12) % 12
}
function fretOnA(pitchClass) {
  return (pitchClass - 9 + 12) % 12
}

// E-shape / A-shape barre templates, derived the same way as the reference
// open shapes: barring the open E/A/Am/E7-style shape at fret n.
function majorShape(rootName) {
  if (OPEN_MAJOR[rootName]) return OPEN_MAJOR[rootName]
  const p = NOTE_TO_INDEX[rootName]
  const nE = fretOnLowE(p)
  const nA = fretOnA(p)
  if (nE <= nA) return [nE, nE, nE + 1, nE + 2, nE + 2, nE] // E-shape barre
  return [nA, nA + 2, nA + 2, nA + 2, nA, 'x'] // A-shape barre
}

function minorShape(rootName) {
  if (OPEN_MINOR[rootName]) return OPEN_MINOR[rootName]
  const p = NOTE_TO_INDEX[rootName]
  const nE = fretOnLowE(p)
  const nA = fretOnA(p)
  if (nE <= nA) return [nE, nE, nE, nE + 2, nE + 2, nE] // E-shape minor barre
  return [nA, nA + 1, nA + 2, nA + 2, nA, 'x'] // A-shape minor barre
}

// movable diminished triad, root on the A string: A=n B=n+1 G=n+2 D=n+1
// (verified against the well-known "x-2-3-4-3-x" B diminished shape, which
// is exactly this pattern at n=2 and spells out B-D-F)
function diminishedShape(rootName) {
  const p = NOTE_TO_INDEX[rootName]
  const n = fretOnA(p)
  return ['x', n + 1, n + 2, n + 1, n, 'x']
}

const DEGREE_QUALITY = ['major', 'minor', 'minor', 'major', 'major', 'minor', 'dim']
const DEGREE_ROMAN = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°']

const QUALITY_SUFFIX = { major: '', minor: 'm', dim: 'dim' }
const SHAPE_FN = { major: majorShape, minor: minorShape, dim: diminishedShape }

// the 7 diatonic triads of a major key, each with a real, playable shape
export function diatonicChords(keyName) {
  const roots = spellMajorScale(keyName)
  return roots.map((root, i) => {
    const quality = DEGREE_QUALITY[i]
    return {
      roman: DEGREE_ROMAN[i],
      name: root + QUALITY_SUFFIX[quality],
      root,
      quality,
      frets: SHAPE_FN[quality](root),
    }
  })
}

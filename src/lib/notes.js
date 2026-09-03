export const CHROMATIC = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

export const FLATS = {
  'C#': 'D♭',
  'D#': 'E♭',
  'F#': 'G♭',
  'G#': 'A♭',
  'A#': 'B♭',
}

// top to bottom, as viewed on the neck (high E on top, low E on bottom)
// midi = standard MIDI note number of the open string (E2=40, A2=45, D3=50, G3=55, B3=59, E4=64)
export const STRINGS = [
  { name: 'E', midi: 64, num: 1, type: 'plain' },
  { name: 'B', midi: 59, num: 2, type: 'plain' },
  { name: 'G', midi: 55, num: 3, type: 'plain' },
  { name: 'D', midi: 50, num: 4, type: 'wound' },
  { name: 'A', midi: 45, num: 5, type: 'wound' },
  { name: 'E', midi: 40, num: 6, type: 'wound' },
]

export const FRET_COUNT = 12
export const MARKERS = { 3: 1, 5: 1, 7: 1, 9: 1, 12: 2 }

export function noteAt(openName, fret) {
  const startIdx = CHROMATIC.indexOf(openName)
  const idx = (startIdx + fret) % 12
  return CHROMATIC[idx]
}

// Real fret spacing: distance from nut to fret n = L * (1 - 1/2^(n/12)).
// Returns the proportional width of the space between fret n-1 and fret n,
// suitable for use directly as a CSS flex-grow value.
export function fretGrow(n) {
  const pos = (f) => 1 - 1 / Math.pow(2, f / 12)
  return (pos(n) - pos(n - 1)) * 1000
}

export function isNatural(note) {
  return note.length === 1
}

// every valid spelling (natural, sharp, flat) mapped to its chromatic index,
// so a quiz answer of "Bb" is accepted as equivalent to "A#"
export const NOTE_TO_INDEX = {
  C: 0, 'C#': 1, Db: 1,
  D: 2, 'D#': 3, Eb: 3,
  E: 4, Fb: 4,
  F: 5, 'E#': 5, 'F#': 6, Gb: 6,
  G: 7, 'G#': 8, Ab: 8,
  A: 9, 'A#': 10, Bb: 10,
  B: 11, Cb: 11, 'B#': 0,
}

// parses a free-typed guess like "f#", "Bb", "g" into a chromatic index,
// or null if it isn't a recognizable note
export function parseNoteInput(raw) {
  const s = raw.trim()
  if (!s) return null
  const letter = s[0].toUpperCase()
  if (!'ABCDEFG'.includes(letter)) return null
  if (s.length === 1) return NOTE_TO_INDEX[letter] ?? null
  if (s.length === 2) {
    const accidental = s[1].toLowerCase()
    if (accidental === '#') return NOTE_TO_INDEX[letter + '#'] ?? null
    if (accidental === 'b') return NOTE_TO_INDEX[letter + 'b'] ?? null
  }
  return null
}

// concert pitch (Hz) for an absolute MIDI note number, via A4 = 440Hz = MIDI 69
export function frequencyForMidi(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12)
}

// concert pitch (Hz) for a given open-string MIDI number + fret
export function frequencyAt(openMidi, fret) {
  return frequencyForMidi(openMidi + fret)
}

// the 12 major keys in circle-of-fifths order, starting at C
export const CIRCLE_OF_FIFTHS = [
  { name: 'C', root: 0 },
  { name: 'G', root: 7 },
  { name: 'D', root: 2 },
  { name: 'A', root: 9 },
  { name: 'E', root: 4 },
  { name: 'B', root: 11 },
  { name: 'F#', root: 6 },
  { name: 'Db', root: 1 },
  { name: 'Ab', root: 8 },
  { name: 'Eb', root: 3 },
  { name: 'Bb', root: 10 },
  { name: 'F', root: 5 },
]

export const MAJOR_SCALE_STEPS = [0, 2, 4, 5, 7, 9, 11]

// chromatic indices of every note in a major scale, for highlighting/fading
export function majorScaleIndices(root) {
  return new Set(MAJOR_SCALE_STEPS.map((step) => (root + step) % 12))
}

const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
const NATURAL_INDEX = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }

// the correctly spelled 7 notes of a major scale (each letter used exactly
// once, so F major reads as Bb not A#, Db major reads as Gb not F#, etc.)
export function spellMajorScale(rootName) {
  const rootLetter = rootName[0]
  const rootIndex = NOTE_TO_INDEX[rootName]
  const startPos = LETTERS.indexOf(rootLetter)

  return MAJOR_SCALE_STEPS.map((step, i) => {
    const letter = LETTERS[(startPos + i) % 7]
    const expected = (rootIndex + step) % 12
    const diff = (expected - NATURAL_INDEX[letter] + 12) % 12
    const accidental = diff === 1 ? '#' : diff === 11 ? 'b' : diff === 2 ? '##' : diff === 10 ? 'bb' : ''
    return letter + accidental
  })
}

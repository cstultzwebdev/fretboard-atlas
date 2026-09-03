import { CHROMATIC, MAJOR_SCALE_STEPS } from './notes.js'
import { spellFrom } from './scales.js'

// Every mode here is the major scale started from a different degree, so the
// steps are derived by rotating that one pattern rather than written out —
// Dorian is degree 2, Phrygian degree 3, and so on.
function rotate(degreeIndex) {
  const offset = MAJOR_SCALE_STEPS[degreeIndex]
  return MAJOR_SCALE_STEPS.map(
    (_, i) => (MAJOR_SCALE_STEPS[(degreeIndex + i) % 7] - offset + 12) % 12,
  )
}

const ORDINALS = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th']
const NUMERALS = ['1', '2', '3', '4', '5', '6', '7']

// Each degree named against the major scale it came from, which is what makes
// a mode's signature note obvious: Dorian's 6 is natural where Aeolian's is
// flat, Lydian's 4 is sharp, and so on.
function degreeLabels(steps) {
  return steps.map((step, i) => {
    const diff = step - MAJOR_SCALE_STEPS[i]
    const accidental = diff === -1 ? '♭' : diff === 1 ? '♯' : ''
    return accidental + NUMERALS[i]
  })
}

function mode(degreeIndex, name, signature, mood, description) {
  const steps = rotate(degreeIndex)
  return {
    name,
    signature,
    mood,
    description,
    degreeIndex,
    ordinal: ORDINALS[degreeIndex],
    offset: MAJOR_SCALE_STEPS[degreeIndex], // semitones above the parent tonic
    steps,
    degrees: degreeLabels(steps),
  }
}

const MODES = [
  mode(
    0,
    'Ionian',
    'major scale',
    'Bright, settled',
    'The major scale itself, and the reference point for the six below it. Every other mode on this list is these same seven notes started somewhere else, so each one differs from Ionian by only an altered degree or two — that single changed note is what gives each its character.',
  ),
  mode(
    1,
    'Dorian',
    '♮6',
    'Minor, but hopeful',
    "A minor mode with a raised 6th, and that one note is the whole story — it lifts Dorian out of plain natural minor into something cooler and more open. It's the standard sound of minor-key funk and modal jazz; Miles Davis's 'So What' famously sits on it for pages at a time.",
  ),
  mode(
    2,
    'Phrygian',
    '♭2',
    'Dark, Spanish',
    "Natural minor with a flattened 2nd. That half-step sitting right above the root is unmistakable — it's where flamenco gets its edge, and why the mode turns up constantly in metal riffing: the ♭2 reads as tension that never quite resolves.",
  ),
  mode(
    3,
    'Lydian',
    '♯4',
    'Bright, floating',
    "Major with a raised 4th. The natural 4th normally pulls back toward the 3rd; sharpening it removes that pull and leaves everything hanging in the air, which is why film composers reach for Lydian when a scene should feel wondrous or weightless.",
  ),
  mode(
    4,
    'Mixolydian',
    '♭7',
    'Major, bluesy',
    "Major with a flattened 7th. Losing the leading tone takes away the hard pull home, which is exactly what makes it sit so naturally over dominant 7th chords — it's the everyday sound of blues, rock, and a great deal of Celtic and jam-band playing.",
  ),
  mode(
    5,
    'Aeolian',
    'natural minor',
    'Dark, plain',
    "The natural minor scale, and the default minor sound. No raised 6th like Dorian, no flat 2nd like Phrygian — just the plain, serious minor that underpins most minor-key rock and pop.",
  ),
  mode(
    6,
    'Locrian',
    '♭2 ♭5',
    'Unstable, unresolved',
    "The odd one out: a flat 2nd and a flat 5th, which makes the chord built on its root diminished rather than major or minor. With no stable home to return to it's vanishingly rare as a key centre, and mostly shows up as a passing colour over half-diminished chords.",
  ),
]

const FLAT_NAME = { 'C#': 'Db', 'D#': 'Eb', 'F#': 'Gb', 'G#': 'Ab', 'A#': 'Bb' }

// A mode spelled from its parent major scale — C Dorian is the Bb major scale
// started on its 2nd degree, so it reads C D Eb F G A Bb.
//
// A parent key can be written two ways, and usually only one of them spells
// the mode's own tonic on the letter you asked for: C Locrian is Db major's
// 7th degree (C Db Eb F Gb Ab Bb), not C# major's (B# C# D# E# F# G# A#).
export function spellMode(rootPitch, mode) {
  const sharpParent = CHROMATIC[(rootPitch - mode.offset + 12) % 12]
  const rootLetter = CHROMATIC[rootPitch][0]

  const candidates = [sharpParent, FLAT_NAME[sharpParent]].filter(Boolean).map((name) => {
    const parent = spellFrom(name, MAJOR_SCALE_STEPS)
    return {
      parentKey: parent[0],
      notes: parent.map((_, i) => parent[(mode.degreeIndex + i) % 7]),
    }
  })

  return candidates.find((c) => c.notes[0][0] === rootLetter) ?? candidates[0]
}

export default MODES

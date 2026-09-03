import { MAJOR_SCALE_STEPS, STRINGS, spellScale } from './notes.js'

const NATURAL_MINOR_STEPS = [0, 2, 3, 5, 7, 8, 10]

const MAJOR_DEGREES = ['1', '2', '3', '4', '5', '6', '7']
const MINOR_DEGREES = ['1', '2', '♭3', '4', '5', '♭6', '♭7']

// each pentatonic is its parent seven-note scale minus two degrees, so it
// inherits that scale's spelling — A minor pentatonic reads A C D E G, and
// C major pentatonic reads C D E G A
const MAJOR_PENTATONIC_PICK = [0, 1, 2, 4, 5] // 1 2 3 5 6
const MINOR_PENTATONIC_PICK = [0, 2, 3, 4, 6] // 1 ♭3 4 5 ♭7

function pick(indexes, values) {
  return indexes.map((i) => values[i])
}

const FLAT_NAME = { 'C#': 'Db', 'D#': 'Eb', 'F#': 'Gb', 'G#': 'Ab', 'A#': 'Bb' }

// A# major spells out A# B# C## D# E# F## G##, which is correct and which
// nobody reads — so whenever a sharp root forces double accidentals, the
// scale is respelled from that root's flat name (Bb major) instead
export function spellFrom(rootName, steps) {
  const sharp = spellScale(rootName, steps)
  if (!sharp.some((note) => note.length > 2)) return sharp
  const flat = FLAT_NAME[rootName]
  return flat ? spellScale(flat, steps) : sharp
}

function scale(key, label, degrees, steps, parentSteps) {
  return {
    key,
    label,
    degrees,
    steps,
    spell: (rootName) => spellFrom(rootName, parentSteps),
  }
}

function pentatonic(key, label, indexes, parentDegrees, parentSteps) {
  return {
    key,
    label,
    degrees: pick(indexes, parentDegrees),
    steps: pick(indexes, parentSteps),
    spell: (rootName) => pick(indexes, spellFrom(rootName, parentSteps)),
  }
}

export const SCALES = {
  major: scale('major', 'Major', MAJOR_DEGREES, MAJOR_SCALE_STEPS, MAJOR_SCALE_STEPS),
  minor: scale('minor', 'Natural Minor', MINOR_DEGREES, NATURAL_MINOR_STEPS, NATURAL_MINOR_STEPS),
  majorPentatonic: pentatonic(
    'majorPentatonic',
    'Major Pentatonic',
    MAJOR_PENTATONIC_PICK,
    MAJOR_DEGREES,
    MAJOR_SCALE_STEPS,
  ),
  minorPentatonic: pentatonic(
    'minorPentatonic',
    'Minor Pentatonic',
    MINOR_PENTATONIC_PICK,
    MINOR_DEGREES,
    NATURAL_MINOR_STEPS,
  ),
}

// chromatic indices of every note in a scale, for highlighting/fading
export function scaleIndices(root, steps) {
  return new Set(steps.map((step) => (root + step) % 12))
}

// 1 fret is a half step, 2 is a whole one; the pentatonics also skip a
// whole-and-a-half at a time
const STEP_LABEL = { 1: 'h', 2: 'W', 3: 'W+h' }

// The gaps between one note of the scale and the next, written the way scales
// are taught — major comes out W W h W W W h. The pattern closes on the octave,
// so there's one more step than there are gaps inside the octave.
export function stepPattern(steps) {
  const toOctave = [...steps, 12]
  return toOctave.slice(1).map((step, i) => {
    const gap = step - toOctave[i]
    return STEP_LABEL[gap] ?? `${gap}`
  })
}

// A position box reaches from one fret below its anchor to three frets above
// it — the window that makes the classic pentatonic boxes come out at two
// notes per string, and the seven-note shapes at two or three.
const REACH_BELOW = 1
const REACH_ABOVE = 3

// anchors this high would run a box off the end of a 15-fret diagram, so the
// shape is shown an octave lower instead — same fingering, playable frets
const WRAP_ABOVE = 13

// The position shapes of a scale, in the order guitarists count them: box 1
// is anchored on the root on the low E string, and each box after it starts
// on the next scale degree up that same string.
export function scalePositions(rootPitch, { steps, degrees }) {
  const lowE = STRINGS[STRINGS.length - 1]
  const rootFret = (rootPitch - (lowE.midi % 12) + 12) % 12
  const degreeOfPitch = new Map(steps.map((step, i) => [(rootPitch + step) % 12, i]))

  return steps.map((step, i) => {
    let anchor = rootFret + step
    if (anchor >= WRAP_ABOVE) anchor -= 12

    const windowStart = Math.max(0, anchor - REACH_BELOW)
    const windowEnd = anchor + REACH_ABOVE
    const notes = []

    STRINGS.forEach((string, stringIndex) => {
      for (let fret = windowStart; fret <= windowEnd; fret++) {
        const midi = string.midi + fret
        const degreeIndex = degreeOfPitch.get(midi % 12)
        if (degreeIndex === undefined) continue
        notes.push({
          stringIndex,
          fret,
          midi,
          degree: degrees[degreeIndex],
          isRoot: degreeIndex === 0,
        })
      }
    })

    // crop the box to the frets it actually uses, so no shape is drawn with
    // a dead row hanging off one end
    const frets = notes.map((n) => n.fret)

    return {
      position: i + 1,
      startFret: Math.min(...frets),
      endFret: Math.max(...frets),
      notes,
    }
  })
}

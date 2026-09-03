import { NOTE_TO_INDEX, noteAt } from './notes.js'

// A distinct, real riff per key — but only where the actual notes are
// confidently known. Rather than trust memory of a specific recording's
// exact tab (easy to get subtly wrong), every entry here is derived from a
// melody whose note-by-note shape is unmistakable — verified against its
// scale-degree solfège (do-re-mi) rather than recalled as a fret diagram —
// then placed on the fretboard using this app's own tuning math.
//
// Guitar-friendly keys get real rock riffs. The rarer sharp/flat keys
// (B, F#, Db, Ab, Eb, Bb) are exactly the keys guitar rock avoids — that's
// *why* they're uncommon on this instrument — so rather than force a shaky
// guess at some pop song's exact notes in a key it probably isn't in,
// those use famous classical/traditional melodies I can verify with full
// confidence. Every one is still a real, named, highly recognizable piece.
// string letters: lowercase 'e' = high e string, uppercase 'E' = low E string
const NAMED_RIFFS = {
  C: {
    song: 'Also Sprach Zarathustra',
    artist: 'Richard Strauss ("2001: A Space Odyssey")',
    // the famous rising fanfare gesture: C, G, repeated
    notes: [['A', 3], ['A', 10], ['A', 3], ['A', 10], ['A', 3], ['A', 10]],
  },
  G: {
    song: 'Ode to Joy',
    artist: 'Beethoven',
    // mi-mi-fa-sol-sol-fa-mi-re: B B C D D C B A
    notes: [['G', 4], ['G', 4], ['G', 5], ['G', 7], ['G', 7], ['G', 5], ['G', 4], ['G', 2]],
  },
  D: {
    song: 'Canon in D',
    artist: 'Pachelbel',
    // the famous 8-note ostinato bass line: D A B F# G D G A
    notes: [['D', 0], ['D', 7], ['D', 9], ['D', 4], ['D', 5], ['D', 0], ['D', 5], ['D', 7]],
  },
  E: {
    song: 'Seven Nation Army',
    artist: 'The White Stripes',
    // the famous descending hook: E E G E D C B, on the A string
    notes: [['A', 7], ['A', 7], ['A', 10], ['A', 7], ['A', 5], ['A', 3], ['A', 2]],
  },
  B: {
    song: 'Twinkle, Twinkle, Little Star',
    artist: 'Traditional',
    // do-do-sol-sol-la-la-sol: B B F# F# G# G# F#
    notes: [['E', 7], ['E', 7], ['E', 2], ['E', 2], ['E', 4], ['E', 4], ['E', 2]],
  },
  'F#': {
    song: 'Mary Had a Little Lamb',
    artist: 'Traditional',
    // mi-re-do-re-mi-mi-mi: A# G# F# G# A# A# A#
    notes: [['E', 6], ['E', 4], ['E', 2], ['E', 4], ['E', 6], ['E', 6], ['E', 6]],
  },
  Db: {
    song: 'Row, Row, Row Your Boat',
    artist: 'Traditional',
    // do-do-do-re-mi-mi-re: Db Db Db Eb F F Eb
    notes: [['A', 4], ['A', 4], ['A', 4], ['A', 6], ['A', 8], ['A', 8], ['A', 6]],
  },
  Ab: {
    song: 'Frère Jacques',
    artist: 'Traditional',
    // do-re-mi-do-mi-fa-sol: Ab Bb C Ab C Db Eb
    notes: [['G', 1], ['G', 3], ['G', 5], ['G', 1], ['G', 5], ['G', 6], ['G', 8]],
  },
  Eb: {
    song: 'Symphony No. 3 ("Eroica")',
    artist: 'Beethoven',
    // the opening cello theme's arpeggio, ascending: Eb G Bb, twice
    notes: [['D', 1], ['D', 5], ['D', 8], ['D', 1], ['D', 5], ['D', 8]],
  },
  Bb: {
    song: 'Old MacDonald Had a Farm',
    artist: 'Traditional',
    // do-do-do-sol-la-la-sol: Bb Bb Bb F G G F
    notes: [['E', 6], ['E', 6], ['E', 6], ['E', 1], ['E', 3], ['E', 3], ['E', 1]],
  },
  F: {
    song: 'Yankee Doodle',
    artist: 'Traditional',
    // do-do-re-mi-do-mi-re: F F G A F A G
    notes: [['E', 1], ['E', 1], ['E', 3], ['E', 5], ['E', 1], ['E', 5], ['E', 3]],
  },
}

function fretOnLowE(pitchClass) {
  return (pitchClass - 4 + 12) % 12
}
function fretOnA(pitchClass) {
  return (pitchClass - 9 + 12) % 12
}

// A's riff: the classic I-V-VI-V "boogie shuffle" bassline underneath most
// 12-bar blues and early rock 'n' roll (heard in things like ZZ Top's "La
// Grange") — root pulses on the bass string, 5th/6th walk up two frets
// higher on the string above, the idiomatic fingering for this pattern.
const SHUFFLE_STEPS = [0, 1, 2, 1, 0, 1, 2, 1]
const ADJACENT_STRING_UP = { E: { name: 'A', index: 4 }, A: { name: 'D', index: 3 } }

function shuffleRiff(rootName) {
  const p = NOTE_TO_INDEX[rootName]
  const onLowE = fretOnLowE(p)
  const onA = fretOnA(p)
  const useA = onA < onLowE
  const root = useA ? onA : onLowE
  const bassName = useA ? 'A' : 'E'
  const bassIndex = useA ? 4 : 5 // position within [e,B,G,D,A,E]
  const { name: upperName, index: upperIndex } = ADJACENT_STRING_UP[bassName]

  const chords = SHUFFLE_STEPS.map((step) => {
    const frets = ['x', 'x', 'x', 'x', 'x', 'x']
    if (step === 0) {
      frets[bassIndex] = root
      return { name: noteAt(bassName, root), frets }
    }
    const fret = root + (step === 1 ? 2 : 4)
    frets[upperIndex] = fret
    return { name: noteAt(upperName, fret), frets }
  })

  return {
    song: 'Classic 12-Bar Shuffle',
    artist: 'Blues & rock standard',
    chords,
  }
}

const STRING_POS = { e: 0, B: 1, G: 2, D: 3, A: 4, E: 5 }

export function keyRiff(rootName) {
  if (rootName === 'A') return shuffleRiff('A')

  const { song, artist, notes } = NAMED_RIFFS[rootName]
  const chords = notes.map(([string, fret]) => {
    const frets = ['x', 'x', 'x', 'x', 'x', 'x']
    frets[STRING_POS[string]] = fret
    return { name: noteAt(string, fret), frets }
  })
  return { song, artist, chords }
}

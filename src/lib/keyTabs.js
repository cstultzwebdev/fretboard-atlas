// One recognizable chord progression per key, rendered as guitar tab.
// Frets are given high-string-to-low-string (e, B, G, D, A, E) to match
// standard tab reading order. Shapes are either the standard open-position
// chord, or a barre chord derived from the E-shape/A-shape templates, so
// every voicing here is a real, playable chord — nothing invented.
const KEY_TABS = {
  C: {
    song: 'Imagine',
    artist: 'John Lennon',
    chords: [
      { name: 'C', frets: [0, 1, 0, 2, 3, 'x'] },
      { name: 'Cmaj7', frets: [0, 0, 0, 2, 3, 'x'] },
      { name: 'F', frets: [1, 1, 2, 3, 3, 1] },
      { name: 'C', frets: [0, 1, 0, 2, 3, 'x'] },
    ],
  },
  G: {
    song: 'Brown Eyed Girl',
    artist: 'Van Morrison',
    chords: [
      { name: 'G', frets: [3, 0, 0, 0, 2, 3] },
      { name: 'C', frets: [0, 1, 0, 2, 3, 'x'] },
      { name: 'G', frets: [3, 0, 0, 0, 2, 3] },
      { name: 'D', frets: [2, 3, 2, 0, 'x', 'x'] },
    ],
  },
  D: {
    song: 'Sweet Home Alabama',
    artist: 'Lynyrd Skynyrd',
    chords: [
      { name: 'D', frets: [2, 3, 2, 0, 'x', 'x'] },
      { name: 'C', frets: [0, 1, 0, 2, 3, 'x'] },
      { name: 'G', frets: [3, 0, 0, 0, 2, 3] },
    ],
  },
  A: {
    song: 'Here Comes the Sun',
    artist: 'The Beatles',
    chords: [
      { name: 'A', frets: [0, 2, 2, 2, 0, 'x'] },
      { name: 'E', frets: [0, 0, 1, 2, 2, 0] },
      { name: 'F#m', frets: [2, 2, 2, 4, 4, 2] },
      { name: 'D', frets: [2, 3, 2, 0, 'x', 'x'] },
    ],
  },
  E: {
    song: 'Amazing Grace',
    artist: 'Traditional',
    chords: [
      { name: 'E', frets: [0, 0, 1, 2, 2, 0] },
      { name: 'A', frets: [0, 2, 2, 2, 0, 'x'] },
      { name: 'E', frets: [0, 0, 1, 2, 2, 0] },
      { name: 'B7', frets: [2, 0, 2, 1, 2, 'x'] },
      { name: 'E', frets: [0, 0, 1, 2, 2, 0] },
    ],
  },
  B: {
    song: 'Happy Birthday to You',
    artist: 'Traditional',
    chords: [
      { name: 'B', frets: [2, 4, 4, 4, 2, 'x'] },
      { name: 'E', frets: [0, 0, 1, 2, 2, 0] },
      { name: 'B', frets: [2, 4, 4, 4, 2, 'x'] },
      { name: 'F#7', frets: [2, 2, 3, 2, 4, 2] },
      { name: 'B', frets: [2, 4, 4, 4, 2, 'x'] },
    ],
  },
  'F#': {
    song: 'Auld Lang Syne',
    artist: 'Traditional',
    chords: [
      { name: 'F#', frets: [2, 2, 3, 4, 4, 2] },
      { name: 'B', frets: [2, 4, 4, 4, 2, 'x'] },
      { name: 'F#', frets: [2, 2, 3, 4, 4, 2] },
      { name: 'C#7', frets: [4, 6, 4, 6, 4, 'x'] },
      { name: 'F#', frets: [2, 2, 3, 4, 4, 2] },
    ],
  },
  Db: {
    song: 'You Are My Sunshine',
    artist: 'Traditional',
    chords: [
      { name: 'Db', frets: [4, 6, 6, 6, 4, 'x'] },
      { name: 'Gb', frets: [2, 2, 3, 4, 4, 2] },
      { name: 'Db', frets: [4, 6, 6, 6, 4, 'x'] },
      { name: 'Ab7', frets: [4, 4, 5, 4, 6, 4] },
      { name: 'Db', frets: [4, 6, 6, 6, 4, 'x'] },
    ],
  },
  Ab: {
    song: 'Silent Night',
    artist: 'Traditional',
    chords: [
      { name: 'Ab', frets: [4, 4, 5, 6, 6, 4] },
      { name: 'Db', frets: [4, 6, 6, 6, 4, 'x'] },
      { name: 'Ab', frets: [4, 4, 5, 6, 6, 4] },
      { name: 'Eb7', frets: [6, 8, 6, 8, 6, 'x'] },
      { name: 'Ab', frets: [4, 4, 5, 6, 6, 4] },
    ],
  },
  Eb: {
    song: 'Ode to Joy',
    artist: 'Beethoven',
    chords: [
      { name: 'Eb', frets: [6, 8, 8, 8, 6, 'x'] },
      { name: 'Ab', frets: [4, 4, 5, 6, 6, 4] },
      { name: 'Eb', frets: [6, 8, 8, 8, 6, 'x'] },
      { name: 'Bb7', frets: [1, 3, 1, 3, 1, 'x'] },
      { name: 'Eb', frets: [6, 8, 8, 8, 6, 'x'] },
    ],
  },
  Bb: {
    song: 'When the Saints Go Marching In',
    artist: 'Traditional',
    chords: [
      { name: 'Bb', frets: [1, 3, 3, 3, 1, 'x'] },
      { name: 'Eb', frets: [6, 8, 8, 8, 6, 'x'] },
      { name: 'Bb', frets: [1, 3, 3, 3, 1, 'x'] },
      { name: 'F7', frets: [1, 1, 2, 1, 3, 1] },
      { name: 'Bb', frets: [1, 3, 3, 3, 1, 'x'] },
    ],
  },
  F: {
    song: 'Home on the Range',
    artist: 'Traditional',
    chords: [
      { name: 'F', frets: [1, 1, 2, 3, 3, 1] },
      { name: 'Bb', frets: [1, 3, 3, 3, 1, 'x'] },
      { name: 'F', frets: [1, 1, 2, 3, 3, 1] },
      { name: 'C7', frets: [0, 1, 3, 2, 3, 'x'] },
      { name: 'F', frets: [1, 1, 2, 3, 3, 1] },
    ],
  },
}

export default KEY_TABS

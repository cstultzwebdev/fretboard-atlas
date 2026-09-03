// The 11 non-trivial intervals (unison and octave excluded — both would
// trivially match the reference note's own pitch class, which isn't a
// meaningful "find the interval" exercise).
//
// `mood` and `mnemonic` describe the interval's traditional expressive
// character in Western tonal music — well-established ear-training territory,
// not personal opinion. Where a reference song is mentioned it's one of the
// standard textbook mnemonics used to teach that exact interval; the two or
// three intervals without one (Major 7th, Minor 7th) are described by their
// character alone rather than a shaky guess at a specific song.
const INTERVALS = [
  {
    name: 'Minor 2nd',
    semitones: 1,
    mood: 'Tense, unsettling',
    description:
      "The tightest interval in Western music — barely a hair's breadth apart, and the most dissonant. Composers reach for it to convey unease or dread; the two-note shark-theme alternation in \"Jaws\" is built from exactly this interval.",
  },
  {
    name: 'Major 2nd',
    semitones: 2,
    mood: 'Gentle, in motion',
    description:
      'A mild, easy step — unresolved but not uneasy, more like forward motion than arrival. The first two different pitches of "Happy Birthday" ("Happy birth-") move by a Major 2nd.',
  },
  {
    name: 'Minor 3rd',
    semitones: 3,
    mood: 'Wistful, melancholic',
    description:
      "The interval most responsible for a \"sad\" sound in tonal music — it's what turns a major chord minor. The descending schoolyard taunt \"na-na na-na boo-boo\" is a textbook Minor 3rd.",
  },
  {
    name: 'Major 3rd',
    semitones: 4,
    mood: 'Bright, confident',
    description:
      "The interval that makes a chord sound \"major\" in the first place — warm, settled, and content rather than longing. It's the sound of resolution, not tension.",
  },
  {
    name: 'Perfect 4th',
    semitones: 5,
    mood: 'Open, sturdy',
    description:
      'Stable and almost architectural rather than emotional — one of the most consonant intervals there is. The opening two notes of Wagner\'s "Bridal Chorus" ("Here Comes the Bride") rise a Perfect 4th.',
  },
  {
    name: 'Tritone',
    semitones: 6,
    mood: 'Unstable, ominous',
    description:
      'Historically nicknamed "diabolus in musica" — the devil in music — for how restless and unresolved it sounds. The leap on "Ma-ri-a" in Bernstein\'s "West Side Story" is the standard example used to teach this exact interval.',
  },
  {
    name: 'Perfect 5th',
    semitones: 7,
    mood: 'Stable, powerful',
    description:
      "About as open and stable as an interval gets — it's why rock power chords use nothing but this. Confident and unadorned rather than emotionally complex. The rising leap in \"Twinkle, Twinkle, Little Star\" is a Perfect 5th.",
  },
  {
    name: 'Minor 6th',
    semitones: 8,
    mood: 'Aching, bittersweet',
    description:
      'A more poignant cousin of the Minor 3rd, often reached for to express yearning or tender sadness in film scores. The famous theme from "Love Story" opens with this exact leap.',
  },
  {
    name: 'Major 6th',
    semitones: 9,
    mood: 'Warm, nostalgic',
    description:
      'Sweeter and more spacious than a Major 3rd, with a slightly wistful, nostalgic warmth. The opening leap of "My Bonnie Lies Over the Ocean" is a Major 6th.',
  },
  {
    name: 'Minor 7th',
    semitones: 10,
    mood: 'Bluesy, unresolved',
    description:
      "Leaning and unresolved — it wants to fall one more step to the octave. This is the interval that gives dominant 7th chords their restless, bluesy pull in jazz and blues.",
  },
  {
    name: 'Major 7th',
    semitones: 11,
    mood: 'Shimmering, suspended',
    description:
      "Tense like the Minor 2nd, but sophisticated rather than harsh — a single half-step short of the octave. It's the lush, hanging-in-the-air quality behind a jazz major-7th chord.",
  },
]

export function randomInterval() {
  return INTERVALS[Math.floor(Math.random() * INTERVALS.length)]
}

export default INTERVALS

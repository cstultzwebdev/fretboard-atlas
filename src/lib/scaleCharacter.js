// Character tags and a short "what it's actually for" blurb per scale, in the
// same spirit as KEY_AFFECT / KEY_VIBES. These stick to how each scale is
// broadly understood and used rather than to any one song's analysis.
const SCALE_CHARACTER = {
  major: {
    tags: ['Bright', 'Resolved', 'Familiar', 'Singable'],
    use: "The do-re-mi scale, and the yardstick every other scale gets measured against. Its 7th sits a half-step under the root and pulls hard back to it, which is what makes a melody sound finished — that's why it carries so much pop, country, folk, and hymn writing. If a tune sounds settled and unclouded, this is usually why.",
  },

  minor: {
    tags: ['Dark', 'Brooding', 'Wistful', 'Serious'],
    use: 'The same seven notes as its relative major started from a different root, and that alone flips the mood from sunny to grave. The flat 7th leans away from the root instead of pulling toward it, so it broods rather than resolving — which is why it underpins most minor-key rock and metal riffing, a great deal of film scoring, and the folk lament tradition.',
  },

  majorPentatonic: {
    tags: ['Sweet', 'Open', 'Forgiving', 'Melodic'],
    use: "Major with its two half-steps — the 4th and 7th — removed, which strips out every note that can clash against a major chord. That's what makes it so forgiving: over the right chord, almost anything you play lands. It's the sound of country and southern-rock lead playing, bright melodic solos, and folk melody the world over.",
  },

  minorPentatonic: {
    tags: ['Bluesy', 'Gritty', 'Vocal', 'Essential'],
    use: 'The first scale most guitarists learn and the one they never stop using — box 1 alone is the foundation of an enormous amount of blues and rock lead playing. Five notes with no half-steps, so it sits comfortably over minor and dominant chords alike, and it bends well, which is why it reads as vocal. Add the ♭5 between the 4th and 5th and it becomes the blues scale.',
  },
}

export default SCALE_CHARACTER

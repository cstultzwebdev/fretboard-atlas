// Short "affective" descriptors per key — the adjectives traditionally
// associated with each key's character in 18th/19th-century music theory
// (the "doctrine of the affections"), most famously catalogued by the
// composer/theorist Christian Schubart in 1806. That tradition is subjective
// and pre-dates equal temperament, so treat these as historical color, not
// scientific fact — but the broad reputations here (D as triumphant, C as
// pure and unadorned, Ab as solemn) are consistently repeated across sources
// closely enough that they're safe to summarize as adjectives rather than
// quote verbatim.
const KEY_AFFECT = {
  C: ['Pure', 'Innocent', 'Direct', 'Unadorned'],
  G: ['Pastoral', 'Gentle', 'Content', 'Sincere'],
  D: ['Triumphant', 'Martial', 'Jubilant', 'Bold'],
  A: ['Youthful', 'Hopeful', 'Affectionate', 'Buoyant'],
  E: ['Radiant', 'Exuberant', 'Noisy', 'Elated'],
  B: ['Fierce', 'Wild', 'Vengeful', 'Turbulent'],
  'F#': ['Resolute', 'Struggling', 'Victorious', 'Intense'],
  Db: ['Grave', 'Wistful', 'Veiled', 'Enigmatic'],
  Ab: ['Solemn', 'Devotional', 'Weighty', 'Reverent'],
  Eb: ['Heroic', 'Noble', 'Devoted', 'Stately'],
  Bb: ['Genial', 'Hopeful', 'Clear-hearted', 'Warm'],
  F: ['Calm', 'Restful', 'Complaisant', 'Mild'],
}

export default KEY_AFFECT

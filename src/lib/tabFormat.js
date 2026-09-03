const COLUMN_WIDTH = 7
const STRING_ORDER = ['e', 'B', 'G', 'D', 'A', 'E']

function centerPad(str, width, fillChar) {
  const total = width - str.length
  if (total <= 0) return str
  const left = Math.floor(total / 2)
  const right = total - left
  return fillChar.repeat(left) + str + fillChar.repeat(right)
}

// turns a chord/fret list into plain-text guitar tab lines, e.g.
//   "e|---0------0------1------0---|"
export function buildTabLines(chords) {
  const header = '  ' + chords.map((c) => centerPad(c.name, COLUMN_WIDTH, ' ')).join('')

  const stringLines = STRING_ORDER.map((label, stringIndex) => {
    const body = chords
      .map((c) => centerPad(String(c.frets[stringIndex]), COLUMN_WIDTH, '-'))
      .join('')
    return `${label}|${body}|`
  })

  return [header, ...stringLines].join('\n')
}

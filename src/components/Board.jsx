import { Fragment } from 'react'
import { STRINGS, FRET_COUNT, MARKERS, fretGrow, neckSpan } from '../lib/notes.js'

// Shared fretboard geometry (real fret spacing, string rows, inlay markers)
// for both the reference chart and the quiz — only what goes in each cell
// differs, via renderCell. A board asked for more frets than the usual 12
// widens to match, so the frets stay the size they are everywhere else
// instead of being squeezed together.
export default function Board({ renderCell, fretCount = FRET_COUNT }) {
  const frets = Array.from({ length: fretCount }, (_, i) => i + 1)
  const lastStringIndex = STRINGS.length - 1
  const fretScale = neckSpan(fretCount) / neckSpan(FRET_COUNT)

  return (
    <div className="board-scroll">
      <div className="board" style={{ '--board-fret-scale': fretScale }}>
        <div className="row fretnums">
          <div className="open-cell cell">0</div>
          {frets.map((f) => (
            <div key={f} className="cell" style={{ flexGrow: fretGrow(f), flexBasis: 0 }}>
              {f}
            </div>
          ))}
        </div>

        {STRINGS.map((s, rowIndex) => (
          <Fragment key={`${s.name}-${s.num}`}>
            <div className={`row string ${s.type}`}>
              <div className="open-cell">{renderCell(s, 0)}</div>
              {frets.map((f) => (
                <div key={f} className="fret-cell" style={{ flexGrow: fretGrow(f), flexBasis: 0 }}>
                  {renderCell(s, f)}
                </div>
              ))}
            </div>

            {rowIndex === lastStringIndex && (
              <div className="row inlays">
                <div className="open-cell cell" />
                {frets.map((f) => (
                  <div key={f} className="cell" style={{ flexGrow: fretGrow(f), flexBasis: 0 }}>
                    {Array.from({ length: MARKERS[f] || 0 }, (_, i) => (
                      <span key={i} className="dot" />
                    ))}
                  </div>
                ))}
              </div>
            )}
          </Fragment>
        ))}
      </div>
    </div>
  )
}

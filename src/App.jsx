import { useEffect, useRef, useState } from 'react'
import Board from './components/Board.jsx'
import NoteChip from './components/NoteChip.jsx'
import QuizCell from './components/QuizCell.jsx'
import {
  noteAt,
  frequencyAt,
  frequencyForMidi,
  CIRCLE_OF_FIFTHS,
  MAJOR_SCALE_STEPS,
  majorScaleIndices,
  spellMajorScale,
  NOTE_TO_INDEX,
  STRINGS,
  FRET_COUNT,
  CHROMATIC,
} from './lib/notes.js'
import { pluck } from './lib/audio.js'
import KEY_VIBES from './lib/keyVibes.js'
import KEY_AFFECT from './lib/keyAffect.js'
import KEY_TABS from './lib/keyTabs.js'
import { keyRiff } from './lib/keyRiffs.js'
import TabChart from './components/TabChart.jsx'
import { diatonicChords } from './lib/chordShapes.js'
import ChordDiagram from './components/ChordDiagram.jsx'
import ALL_INTERVALS, { randomInterval } from './lib/intervals.js'
import './App.css'

export default function App() {
  const [tab, setTab] = useState('reference')

  return (
    <div className="wrap">
      <header>
        <p className="kicker">Reference Chart — Six-String, Standard Tuning</p>
        <h1>Fretboard Atlas</h1>

        <div className="tabs" role="tablist" aria-label="Fretboard mode">
          <button
            role="tab"
            aria-selected={tab === 'reference'}
            className={tab === 'reference' ? 'active' : ''}
            onClick={() => setTab('reference')}
          >
            Reference
          </button>
          <button
            role="tab"
            aria-selected={tab === 'quiz'}
            className={tab === 'quiz' ? 'active' : ''}
            onClick={() => setTab('quiz')}
          >
            Quiz
          </button>
          <button
            role="tab"
            aria-selected={tab === 'keys'}
            className={tab === 'keys' ? 'active' : ''}
            onClick={() => setTab('keys')}
          >
            Keys
          </button>
          <button
            role="tab"
            aria-selected={tab === 'intervals'}
            className={tab === 'intervals' ? 'active' : ''}
            onClick={() => setTab('intervals')}
          >
            Intervals
          </button>
        </div>

        {tab === 'quiz' && (
          <p className="sub">
            Type the note at each position — naturals as a single letter (<span className="tuning">G</span>),
            accidentals as letter plus <span className="tuning">#</span> or <span className="tuning">b</span> (
            <span className="tuning">F#</span> or <span className="tuning">Gb</span>, either spelling is
            accepted). Each square checks itself about four seconds after you stop typing in it.
          </p>
        )}
        {tab === 'keys' && (
          <p className="sub">
            Every key of the circle of fifths, in order. Pick one to see its notes light up across
            the neck — everything outside that key fades out.
          </p>
        )}
        {tab === 'intervals' && (
          <p className="sub">
            One note lights up as your reference point. Find the named interval from it anywhere
            on the neck — any occurrence of that note counts, not just the nearest one.
          </p>
        )}
      </header>

      {tab === 'reference' && <ReferenceTab />}
      {tab === 'quiz' && <QuizTab />}
      {tab === 'keys' && <KeysTab />}
      {tab === 'intervals' && <IntervalsTab />}
    </div>
  )
}

function ReferenceTab() {
  const [hoveredNote, setHoveredNote] = useState(null)

  return (
    <>
      <Board
        renderCell={(s, f) => (
          <NoteChip
            note={noteAt(s.name, f)}
            freq={frequencyAt(s.midi, f)}
            bright={s.type === 'plain'}
            label={f === 0 ? `string ${s.num} open` : `string ${s.num} fret ${f}`}
            hoveredNote={hoveredNote}
            onHover={setHoveredNote}
            onLeave={() => setHoveredNote(null)}
          />
        )}
      />

      <div className="legend">
        <div className="item">
          <span className="swatch natural" /> Natural note
        </div>
        <div className="item">
          <span className="swatch accidental" /> Sharp / flat
        </div>
        <div className="item">
          <span className="swatch dot" /> Position marker (3, 5, 7, 9, 12)
        </div>
      </div>

    </>
  )
}

function QuizTab() {
  const [round, setRound] = useState(0)

  return (
    <>
      <div className="quiz-toolbar">
        <button className="reset-btn" onClick={() => setRound((r) => r + 1)}>
          Clear board
        </button>
      </div>

      <Board
        key={round}
        renderCell={(s, f) => (
          <QuizCell
            correctNote={noteAt(s.name, f)}
            label={f === 0 ? `string ${s.num} open` : `string ${s.num} fret ${f}`}
          />
        )}
      />

      <div className="legend">
        <div className="item">
          <span className="swatch quiz-empty" /> Unanswered
        </div>
        <div className="item">
          <span className="swatch quiz-correct" /> Correct
        </div>
        <div className="item">
          <span className="swatch quiz-incorrect" /> Incorrect — correct note revealed
        </div>
      </div>
    </>
  )
}

const NOTE_GAP_MS = 420

function KeysTab() {
  const [activeKey, setActiveKey] = useState(CIRCLE_OF_FIFTHS[0])
  const [isPlaying, setIsPlaying] = useState(false)
  const [playingScaleStep, setPlayingScaleStep] = useState(null)
  const [playingChordIndex, setPlayingChordIndex] = useState(null)
  const [selectedChordRoman, setSelectedChordRoman] = useState(null)
  const timeoutsRef = useRef([])
  const activeNotesRef = useRef([])

  useEffect(() => () => stopSequence(), [])

  function stopSequence() {
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []
    activeNotesRef.current.forEach((n) => n.stop())
    activeNotesRef.current = []
    setIsPlaying(false)
    setPlayingScaleStep(null)
  }

  function playSequence(key) {
    setIsPlaying(true)
    const baseMidi = 60 + key.root
    MAJOR_SCALE_STEPS.forEach((step, i) => {
      const t = setTimeout(() => {
        setPlayingScaleStep(i)
        activeNotesRef.current.push(pluck(frequencyForMidi(baseMidi + step)))
      }, i * NOTE_GAP_MS)
      timeoutsRef.current.push(t)
    })
    const endT = setTimeout(() => {
      activeNotesRef.current = []
      timeoutsRef.current = []
      setIsPlaying(false)
      setPlayingScaleStep(null)
    }, MAJOR_SCALE_STEPS.length * NOTE_GAP_MS)
    timeoutsRef.current.push(endT)
  }

  function selectKey(k) {
    stopSequence()
    setSelectedChordRoman(null)
    setActiveKey(k)
  }

  function togglePlay() {
    if (isPlaying) {
      stopSequence()
    } else {
      setSelectedChordRoman(null)
      playSequence(activeKey)
    }
  }

  function selectDiatonicChord(roman) {
    setSelectedChordRoman((prev) => (prev === roman ? null : roman))
  }

  const inKeySet = activeKey ? majorScaleIndices(activeKey.root) : null
  const spelled = activeKey ? spellMajorScale(activeKey.name) : null
  const diatonic = activeKey ? diatonicChords(activeKey.name) : []

  const playingChordFrets =
    activeKey && playingChordIndex !== null
      ? KEY_TABS[activeKey.name].chords[playingChordIndex].frets
      : null
  const selectedDiatonicFrets = diatonic.find((c) => c.roman === selectedChordRoman)?.frets ?? null

  // the song player (when active) takes priority over a clicked chord diagram
  const activeChordFrets = playingChordFrets || selectedDiatonicFrets

  // the root of a chord voicing is always its lowest-pitched string that
  // isn't muted — true for every open and barre shape in this app, since
  // they're all built as standard root-position voicings
  const chordRootStringIndex = activeChordFrets
    ? activeChordFrets.reduce((root, fret, i) => (fret !== 'x' ? i : root), -1)
    : -1

  // the "root note" highlighted across the whole neck follows whichever
  // chord is currently shown/playing; with nothing selected it falls back
  // to the key's own tonic
  const displayedRootPitch = activeChordFrets
    ? NOTE_TO_INDEX[noteAt(STRINGS[chordRootStringIndex].name, activeChordFrets[chordRootStringIndex])]
    : activeKey
      ? activeKey.root
      : null

  // while the scale is playing, whichever degree is currently sounding gets
  // highlighted everywhere it occurs on the neck, same as a chord would
  const playingScalePitch =
    activeKey && playingScaleStep !== null
      ? (activeKey.root + MAJOR_SCALE_STEPS[playingScaleStep]) % 12
      : null

  return (
    <>
      <div className="key-row" role="tablist" aria-label="Circle of fifths key selector">
        {CIRCLE_OF_FIFTHS.map((k) => (
          <button
            key={k.name}
            role="tab"
            aria-pressed={activeKey?.name === k.name}
            className={activeKey?.name === k.name ? 'active' : ''}
            onClick={() => selectKey(k)}
          >
            {k.name}
          </button>
        ))}
      </div>

      <div className="key-summary-row">
        <p className="sub key-summary">{activeKey.name} major — {spelled.join(' ')}</p>
        {activeKey && (
          <button className="play-scale-btn" onClick={togglePlay} aria-pressed={isPlaying}>
            {isPlaying ? '■ Stop' : '▶ Play scale'}
          </button>
        )}
      </div>

      {activeKey && (
        <div className="key-affect">
          <span className="key-affect-label">Traditionally described as</span>
          {KEY_AFFECT[activeKey.name].map((word) => (
            <span key={word} className="key-affect-tag">
              {word}
            </span>
          ))}
        </div>
      )}

      {activeKey && <p className="sub key-vibe">{KEY_VIBES[activeKey.name]}</p>}

      <Board
        renderCell={(s, f) => {
          const noteName = noteAt(s.name, f)
          const idx = NOTE_TO_INDEX[noteName]
          const stringIndex = s.num - 1
          const chordActive = activeChordFrets ? activeChordFrets[stringIndex] === f : false
          const scaleNoteActive = !activeChordFrets && playingScalePitch !== null && idx === playingScalePitch
          const highlightActive = chordActive || scaleNoteActive
          // once a chord is selected (diagram clicked, or the song/riff
          // player is running) — or the scale is playing — fade
          // *everything* that isn't part of that highlight, including
          // notes that are otherwise in-key, so only the relevant note(s)
          // stay at full strength
          const outOfKey = activeChordFrets
            ? !chordActive
            : playingScalePitch !== null
              ? !scaleNoteActive
              : inKeySet
                ? !inKeySet.has(idx)
                : false
          return (
            <NoteChip
              note={noteName}
              freq={frequencyAt(s.midi, f)}
              bright={s.type === 'plain'}
              label={f === 0 ? `string ${s.num} open` : `string ${s.num} fret ${f}`}
              outOfKey={outOfKey}
              isRoot={displayedRootPitch !== null && idx === displayedRootPitch}
              chordActive={highlightActive}
              isChordRoot={activeChordFrets ? stringIndex === chordRootStringIndex && chordActive : false}
            />
          )
        }}
      />

      {activeKey && (
        <div className="chord-row-header">
          <span className="tab-heading">Chords in this key</span>
          <button
            className="reset-btn"
            onClick={() => setSelectedChordRoman(null)}
            disabled={selectedChordRoman === null}
          >
            Clear selection
          </button>
        </div>
      )}

      {activeKey && (
        <div className="chord-row">
          {diatonic.map((c) => (
            <ChordDiagram
              key={c.roman}
              roman={c.roman}
              name={c.name}
              root={c.root}
              frets={c.frets}
              selected={selectedChordRoman === c.roman}
              onSelect={() => selectDiatonicChord(c.roman)}
            />
          ))}
        </div>
      )}

      {activeKey && (
        <TabChart
          heading="Chord progression"
          song={KEY_TABS[activeKey.name].song}
          artist={KEY_TABS[activeKey.name].artist}
          chords={KEY_TABS[activeKey.name].chords}
          playLabel="Play chords"
          onStep={setPlayingChordIndex}
        />
      )}

      {activeKey && (
        <TabChart
          heading="Guitar riff"
          song={keyRiff(activeKey.name).song}
          artist={keyRiff(activeKey.name).artist}
          chords={keyRiff(activeKey.name).chords}
          playLabel="Play riff"
          noteGapMs={220}
        />
      )}
    </>
  )
}

function randomReference() {
  const stringIndex = Math.floor(Math.random() * STRINGS.length)
  const fret = Math.floor(Math.random() * (FRET_COUNT + 1))
  const string = STRINGS[stringIndex]
  const pitch = NOTE_TO_INDEX[noteAt(string.name, fret)]
  return { stringIndex, fret, pitch }
}

function IntervalsTab() {
  const [mode, setMode] = useState('fretboard')

  return (
    <>
      <div className="tabs interval-mode-tabs" role="tablist" aria-label="Interval practice mode">
        <button
          role="tab"
          aria-selected={mode === 'fretboard'}
          className={mode === 'fretboard' ? 'active' : ''}
          onClick={() => setMode('fretboard')}
        >
          Fretboard
        </button>
        <button
          role="tab"
          aria-selected={mode === 'listen'}
          className={mode === 'listen' ? 'active' : ''}
          onClick={() => setMode('listen')}
        >
          Listen
        </button>
        <button
          role="tab"
          aria-selected={mode === 'lookup'}
          className={mode === 'lookup' ? 'active' : ''}
          onClick={() => setMode('lookup')}
        >
          Reference
        </button>
      </div>

      {mode === 'fretboard' && <IntervalFretboardMode />}
      {mode === 'listen' && <IntervalListenMode />}
      {mode === 'lookup' && <IntervalReferenceMode />}
    </>
  )
}

function IntervalFretboardMode() {
  const [reference, setReference] = useState(randomReference)
  const [intervalPrompt, setIntervalPrompt] = useState(randomInterval)
  const [guess, setGuess] = useState(null)
  const [score, setScore] = useState({ correct: 0, total: 0 })

  const targetPitch = (reference.pitch + intervalPrompt.semitones) % 12
  const referenceNote = noteAt(STRINGS[reference.stringIndex].name, reference.fret)

  function nextRound() {
    setReference(randomReference())
    setIntervalPrompt(randomInterval())
    setGuess(null)
  }

  function handleGuess(stringIndex, fret, pitch) {
    if (guess) return
    const correct = pitch === targetPitch
    setGuess({ stringIndex, fret, correct })
    setScore((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))
  }

  // audio only, deliberately — lighting up the target here would just hand
  // the answer to the quiz below it
  function playPrompt() {
    pluck(frequencyForMidi(LISTEN_BASE_MIDI + reference.pitch))
    setTimeout(() => pluck(frequencyForMidi(LISTEN_BASE_MIDI + targetPitch)), LISTEN_GAP_MS)
  }

  return (
    <>
      <div className="key-summary-row">
        <button
          className="sub key-summary interval-prompt-btn"
          onClick={playPrompt}
          aria-label={`Play the ${intervalPrompt.name} from ${referenceNote} — this does not reveal the answer`}
        >
          Find the <span className="tuning">{intervalPrompt.name}</span> from{' '}
          <span className="tuning">{referenceNote}</span>
          <span className="interval-prompt-icon">♪</span>
        </button>
        <button className="play-scale-btn" onClick={nextRound}>
          ▶ New round
        </button>
      </div>

      <p className="sub interval-feedback">
        <span className="interval-feedback-message">
          {guess === null ? (
            'Click anywhere on the neck.'
          ) : guess.correct ? (
            <>
              <span className="badge badge-correct">✓ Correct</span>
              every other occurrence of that note is lit up too.
            </>
          ) : (
            <>
              <span className="badge badge-incorrect">✗ Incorrect</span>
              the real answer is highlighted in green.
            </>
          )}
        </span>
        <span className="interval-score">
          {score.correct} / {score.total}
        </span>
      </p>

      <Board
        renderCell={(s, f) => {
          const stringIndex = s.num - 1
          const noteName = noteAt(s.name, f)
          const pitch = NOTE_TO_INDEX[noteName]
          const isReference = stringIndex === reference.stringIndex && f === reference.fret
          const isAnswerReveal = guess !== null && pitch === targetPitch
          const isWrongGuess =
            guess !== null && !guess.correct && stringIndex === guess.stringIndex && f === guess.fret
          const highlighted = isReference || isAnswerReveal || isWrongGuess
          return (
            <NoteChip
              note={noteName}
              freq={frequencyAt(s.midi, f)}
              bright={s.type === 'plain'}
              label={f === 0 ? `string ${s.num} open` : `string ${s.num} fret ${f}`}
              outOfKey={!highlighted}
              isRoot={isReference}
              chordActive={isAnswerReveal}
              isWrongGuess={isWrongGuess}
              onNoteClick={() => handleGuess(stringIndex, f, pitch)}
            />
          )
        }}
      />
    </>
  )
}

const LISTEN_BASE_MIDI = 60 // middle-C-ish anchor octave; only the interval math matters
const LISTEN_GAP_MS = 550

function IntervalListenMode() {
  const [root, setRoot] = useState(0) // pitch class, defaults to C
  const [playingName, setPlayingName] = useState(null)
  const [expandedName, setExpandedName] = useState(null)
  const timeoutsRef = useRef([])

  useEffect(() => () => timeoutsRef.current.forEach(clearTimeout), [])

  function playNote(pitchClass) {
    pluck(frequencyForMidi(LISTEN_BASE_MIDI + pitchClass))
  }

  function selectRoot(pitchClass) {
    setRoot(pitchClass)
    playNote(pitchClass)
  }

  function playPair(interval) {
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []
    setPlayingName(interval.name)
    playNote(root)
    const t1 = setTimeout(() => playNote(root + interval.semitones), LISTEN_GAP_MS)
    const t2 = setTimeout(() => setPlayingName(null), LISTEN_GAP_MS + 900)
    timeoutsRef.current.push(t1, t2)
    setExpandedName((prev) => (prev === interval.name ? null : interval.name))
  }

  return (
    <>
      <p className="sub">
        Pick a reference note, then click an interval below to hear it played right after that
        note — the reference, then the interval above it.
      </p>

      <div className="key-row" role="tablist" aria-label="Reference note">
        {CHROMATIC.map((name, i) => (
          <button
            key={name}
            role="tab"
            aria-pressed={root === i}
            className={root === i ? 'active' : ''}
            onClick={() => selectRoot(i)}
          >
            {name}
          </button>
        ))}
      </div>

      <p className="sub key-summary">
        Reference note: <span className="tuning">{CHROMATIC[root]}</span>
      </p>

      <ul className="interval-list">
        {ALL_INTERVALS.map((interval) => {
          const expanded = expandedName === interval.name
          return (
            <li key={interval.name} className={expanded ? 'expanded' : ''}>
              <button
                className={playingName === interval.name ? 'interval-list-row playing' : 'interval-list-row'}
                aria-expanded={expanded}
                onClick={() => playPair(interval)}
              >
                <span className="interval-list-name">{interval.name}</span>
                <span className="interval-list-semitones">
                  {interval.semitones} semitone{interval.semitones === 1 ? '' : 's'}
                </span>
                <span className="interval-list-play">
                  {playingName === interval.name ? '♪ Playing' : '▶ Play'}
                </span>
              </button>
              {expanded && (
                <div className="interval-detail">
                  <span className="interval-detail-mood">{interval.mood}</span>
                  <p className="interval-detail-text">{interval.description}</p>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </>
  )
}

function IntervalReferenceMode() {
  const [root, setRoot] = useState(0) // pitch class, defaults to C
  const [selected, setSelected] = useState(null) // interval object or null

  function selectRoot(pitchClass) {
    setRoot(pitchClass)
    pluck(frequencyForMidi(LISTEN_BASE_MIDI + pitchClass))
  }

  function selectInterval(interval) {
    setSelected((prev) => (prev && prev.name === interval.name ? null : interval))
    pluck(frequencyForMidi(LISTEN_BASE_MIDI + root))
    setTimeout(() => pluck(frequencyForMidi(LISTEN_BASE_MIDI + root + interval.semitones)), LISTEN_GAP_MS)
  }

  const targetPitch = selected ? (root + selected.semitones) % 12 : null

  return (
    <>
      <p className="sub">
        Pick a reference note, then click an interval to light up every occurrence of that
        interval's note across the whole neck.
      </p>

      <div className="key-row" role="tablist" aria-label="Reference note">
        {CHROMATIC.map((name, i) => (
          <button
            key={name}
            role="tab"
            aria-pressed={root === i}
            className={root === i ? 'active' : ''}
            onClick={() => selectRoot(i)}
          >
            {name}
          </button>
        ))}
      </div>

      <p className="sub key-summary">
        Reference note: <span className="tuning">{CHROMATIC[root]}</span>
        {selected && (
          <>
            {' '}
            — <span className="tuning">{selected.name}</span> lands on{' '}
            <span className="tuning">{CHROMATIC[targetPitch]}</span>
          </>
        )}
      </p>

      <p className="tab-heading">Interval</p>
      <div className="key-row" role="tablist" aria-label="Interval">
        {ALL_INTERVALS.map((interval) => (
          <button
            key={interval.name}
            role="tab"
            aria-pressed={selected?.name === interval.name}
            className={selected?.name === interval.name ? 'active' : ''}
            onClick={() => selectInterval(interval)}
          >
            {interval.name}
          </button>
        ))}
      </div>

      <Board
        renderCell={(s, f) => {
          const noteName = noteAt(s.name, f)
          const pitch = NOTE_TO_INDEX[noteName]
          const isReference = pitch === root
          const isTarget = targetPitch !== null && pitch === targetPitch
          const highlighted = isReference || isTarget
          return (
            <NoteChip
              note={noteName}
              freq={frequencyAt(s.midi, f)}
              bright={s.type === 'plain'}
              label={f === 0 ? `string ${s.num} open` : `string ${s.num} fret ${f}`}
              outOfKey={!highlighted}
              isRoot={isReference}
              chordActive={isTarget}
            />
          )
        }}
      />
    </>
  )
}

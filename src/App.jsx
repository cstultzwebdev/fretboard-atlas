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
import { pluck, isMuted, setMuted } from './lib/audio.js'
import KEY_VIBES from './lib/keyVibes.js'
import KEY_AFFECT from './lib/keyAffect.js'
import KEY_TABS from './lib/keyTabs.js'
import { keyRiff } from './lib/keyRiffs.js'
import TabChart from './components/TabChart.jsx'
import { diatonicChords } from './lib/chordShapes.js'
import ChordDiagram from './components/ChordDiagram.jsx'
import ALL_INTERVALS, { randomInterval } from './lib/intervals.js'
import { SCALES, scaleIndices, scalePositions, stepPattern } from './lib/scales.js'
import SCALE_CHARACTER from './lib/scaleCharacter.js'
import MODES, { spellMode } from './lib/modes.js'
import ScaleDiagram from './components/ScaleDiagram.jsx'
import ShapeGrid, { ascendingNotes, cellKey, SHAPE_NOTE_GAP_MS } from './components/ShapeGrid.jsx'
import {
  CHORD_QUALITIES,
  chordPositions,
  spellTriad,
  voicingCells,
  voicingRootString,
} from './lib/chordPositions.js'
import './App.css'

function MuteToggle() {
  const [muted, setMutedState] = useState(isMuted)

  function toggle() {
    const next = !muted
    setMuted(next)
    setMutedState(next)
  }

  return (
    <button
      className={muted ? 'mute-toggle muted' : 'mute-toggle'}
      onClick={toggle}
      aria-pressed={muted}
      aria-label={muted ? 'Unmute all sound' : 'Mute all sound'}
    >
      <span className="mute-toggle-icon" aria-hidden="true">
        ♪
      </span>
      {muted ? 'Muted' : 'Sound'}
    </button>
  )
}

export default function App() {
  const [tab, setTab] = useState('reference')

  return (
    <>
      <MuteToggle />
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
          <button
            role="tab"
            aria-selected={tab === 'scales'}
            className={tab === 'scales' ? 'active' : ''}
            onClick={() => setTab('scales')}
          >
            Scales
          </button>
          <button
            role="tab"
            aria-selected={tab === 'modes'}
            className={tab === 'modes' ? 'active' : ''}
            onClick={() => setTab('modes')}
          >
            Modes
          </button>
          <button
            role="tab"
            aria-selected={tab === 'positions'}
            className={tab === 'positions' ? 'active' : ''}
            onClick={() => setTab('positions')}
          >
            Positions
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
        {tab === 'scales' && (
          <p className="sub">
            Pick a root and a scale to see every note of it light up across the neck, then work
            through the position shapes that scale falls into in that key.
          </p>
        )}
        {tab === 'modes' && (
          <p className="sub">
            The seven modes of the major scale — the same seven notes each time, started from a
            different degree, which changes which note feels like home. Play them all from one
            root to hear what separates them.
          </p>
        )}
        {tab === 'positions' && (
          <p className="sub">
            Pick a root to see every note of its chord across the neck, then work through the five
            places you can play that same chord, from the nut up.
          </p>
        )}
      </header>

      {tab === 'reference' && <ReferenceTab />}
      {tab === 'quiz' && <QuizTab />}
      {tab === 'keys' && <KeysTab />}
      {tab === 'intervals' && <IntervalsTab />}
      {tab === 'scales' && <ScalesTab />}
      {tab === 'modes' && <ModesTab />}
      {tab === 'positions' && <PositionsTab />}
      </div>
    </>
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

const SCALE_NOTE_GAP_MS = 380

function ScalesTab() {
  const [root, setRoot] = useState(0) // pitch class, defaults to C
  const [scaleType, setScaleType] = useState('major')
  const [isPlaying, setIsPlaying] = useState(false)
  const [playingStep, setPlayingStep] = useState(null)
  const [selectedPosition, setSelectedPosition] = useState(null)
  const [boxStep, setBoxStep] = useState(null) // the note a shape is sounding right now
  const [playingPosition, setPlayingPosition] = useState(null) // the one shape allowed to sound
  const timeoutsRef = useRef([])
  const activeNotesRef = useRef([])

  useEffect(() => () => stopSequence(), [])

  const scale = SCALES[scaleType]
  const character = SCALE_CHARACTER[scaleType]
  const rootName = CHROMATIC[root]
  const spelled = scale.spell(rootName)
  // how the tonic is actually written in this scale — A# major is read as Bb
  const spelledRoot = spelled[0]
  const pattern = stepPattern(scale.steps)
  // the notes as you'd play them up, landing back on the root an octave up,
  // so every step of the pattern has a note on each side of it
  const climb = [...spelled, spelledRoot]
  const scaleSet = scaleIndices(root, scale.steps)
  const positions = scalePositions(root, scale)
  // the neck here runs as far as the highest shape reaches, so no position
  // box ends up pointing at frets the board doesn't show
  const boardFrets = Math.max(FRET_COUNT, ...positions.map((p) => p.endFret))
  const playingPitch = playingStep !== null ? (root + scale.steps[playingStep]) % 12 : null

  // a selected position box takes over the neck, the same way a selected
  // chord does in the Keys tab — everything outside the box fades out
  const boxNotes = selectedPosition !== null ? positions[selectedPosition - 1].notes : null
  const boxCells = boxNotes ? new Set(boxNotes.map((n) => `${n.stringIndex}:${n.fret}`)) : null
  const stepCell = boxStep ? `${boxStep.stringIndex}:${boxStep.fret}` : null

  function stopSequence() {
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []
    activeNotesRef.current.forEach((n) => n.stop())
    activeNotesRef.current = []
    setIsPlaying(false)
    setPlayingStep(null)
  }

  function playSequence() {
    setIsPlaying(true)
    const baseMidi = 60 + root
    scale.steps.forEach((step, i) => {
      const t = setTimeout(() => {
        setPlayingStep(i)
        activeNotesRef.current.push(pluck(frequencyForMidi(baseMidi + step)))
      }, i * SCALE_NOTE_GAP_MS)
      timeoutsRef.current.push(t)
    })
    const endT = setTimeout(() => {
      activeNotesRef.current = []
      timeoutsRef.current = []
      setIsPlaying(false)
      setPlayingStep(null)
    }, scale.steps.length * SCALE_NOTE_GAP_MS)
    timeoutsRef.current.push(endT)
  }

  // dropping the position also silences whichever shape was still running,
  // so nothing keeps sounding against a new root, scale, or the scale player
  function clearPosition() {
    setSelectedPosition(null)
    setBoxStep(null)
    setPlayingPosition(null)
  }

  function togglePlay() {
    if (isPlaying) {
      stopSequence()
    } else {
      clearPosition()
      playSequence()
    }
  }

  function selectRoot(pitchClass) {
    stopSequence()
    clearPosition()
    setRoot(pitchClass)
  }

  function selectScaleType(type) {
    stopSequence()
    clearPosition()
    setScaleType(type)
  }

  // no toggle-off here: clicking a shape always plays it, and the neck has to
  // stay on that shape to follow along — "Clear selection" is the way out
  function selectPosition(position) {
    setSelectedPosition(position)
  }

  return (
    <>
      <div className="tabs interval-mode-tabs" role="tablist" aria-label="Scale formula">
        {Object.values(SCALES).map((s) => (
          <button
            key={s.key}
            role="tab"
            aria-selected={scaleType === s.key}
            className={scaleType === s.key ? 'active' : ''}
            onClick={() => selectScaleType(s.key)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="key-row" role="tablist" aria-label="Scale root note">
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

      <div className="key-summary-row">
        <p className="sub key-summary">
          {spelledRoot} {scale.label}
        </p>
        <button className="play-scale-btn" onClick={togglePlay} aria-pressed={isPlaying}>
          {isPlaying ? '■ Stop' : '▶ Play scale'}
        </button>
      </div>

      {/* Each note sits on a pair of half-columns and each step on the pair
          straddling the boundary between two notes, so a step reads as the
          distance from the note on its left to the note on its right. */}
      <div
        className="scale-steps"
        style={{ gridTemplateColumns: `repeat(${climb.length * 2}, 1.5rem)` }}
        aria-label={`${spelledRoot} ${scale.label}: ${spelled.join(' ')}, stepping ${pattern.join(' ')}`}
      >
        {pattern.map((step, i) => (
          <span
            key={`step-${i}`}
            className="scale-step-gap"
            style={{ gridRow: 1, gridColumn: `${i * 2 + 2} / span 2` }}
          >
            {step}
            <span className="scale-step-line" />
          </span>
        ))}

        {climb.map((note, i) => (
          <span
            key={`note-${i}`}
            className={i === climb.length - 1 ? 'scale-step-note octave' : 'scale-step-note'}
            style={{ gridRow: 2, gridColumn: `${i * 2 + 1} / span 2` }}
          >
            {note}
          </span>
        ))}
      </div>

      <div className="key-affect">
        <span className="key-affect-label">Generally described as</span>
        {character.tags.map((word) => (
          <span key={word} className="key-affect-tag">
            {word}
          </span>
        ))}
      </div>

      <p className="sub key-vibe">{character.use}</p>

      <Board
        fretCount={boardFrets}
        renderCell={(s, f) => {
          const noteName = noteAt(s.name, f)
          const idx = NOTE_TO_INDEX[noteName]
          const cell = `${s.num - 1}:${f}`
          const inBox = boxCells ? boxCells.has(cell) : false
          const isPlayingNote = playingPitch !== null && idx === playingPitch
          // while a shape is being played back, only the note sounding right
          // now lights up — the rest of the box stays visible underneath it
          const highlighted = boxCells
            ? stepCell
              ? cell === stepCell
              : inBox
            : isPlayingNote
          return (
            <NoteChip
              note={noteName}
              freq={frequencyAt(s.midi, f)}
              bright={s.type === 'plain'}
              label={f === 0 ? `string ${s.num} open` : `string ${s.num} fret ${f}`}
              outOfKey={boxCells ? !inBox : !scaleSet.has(idx)}
              isRoot={idx === root}
              chordActive={highlighted}
            />
          )
        }}
      />

      <div className="chord-row-header">
        <span className="tab-heading">
          {spelledRoot} {scale.label} shapes
        </span>
      </div>

      <div className="chord-row scale-shape-row">
        {positions.map((p) => (
          <ScaleDiagram
            key={p.position}
            position={p.position}
            startFret={p.startFret}
            endFret={p.endFret}
            notes={p.notes}
            selected={selectedPosition === p.position}
            playingPosition={playingPosition}
            onSelect={() => selectPosition(p.position)}
            onStep={setBoxStep}
            onPlayStart={setPlayingPosition}
          />
        ))}
      </div>

      <p className="sub scale-position-note">
        A position is a few frets' worth of neck where your hand stays put — every note of the
        scale you can reach without shifting out of that spot. Position 1 sits on the root on your
        low E string and each one after it starts on the next scale degree up that same string, so
        neighbouring boxes overlap and chain together along the neck. The shapes themselves don't
        change with the key: learn these {positions.length} and you can slide them to any root.
      </p>

      <div className="scale-shape-actions">
        <button className="reset-btn" onClick={clearPosition} disabled={selectedPosition === null}>
          Clear selection
        </button>
        {selectedPosition !== null && (
          <span className="scale-shape-selected">Position {selectedPosition} is on the neck</span>
        )}
      </div>
    </>
  )
}

function ModesTab() {
  const [section, setSection] = useState('listen')

  return (
    <>
      <div className="tabs interval-mode-tabs" role="tablist" aria-label="Modes section">
        <button
          role="tab"
          aria-selected={section === 'listen'}
          className={section === 'listen' ? 'active' : ''}
          onClick={() => setSection('listen')}
        >
          Listen
        </button>
      </div>

      {section === 'listen' && <ModeListenSection />}
    </>
  )
}

function ModeListenSection() {
  const [root, setRoot] = useState(0) // pitch class, defaults to C
  const [activeMode, setActiveMode] = useState(MODES[0])
  const [expandedName, setExpandedName] = useState(null)
  const [playingName, setPlayingName] = useState(null)
  const [soundingCell, setSoundingCell] = useState(null) // the one string/fret sounding
  const timeoutsRef = useRef([])
  const activeNotesRef = useRef([])

  useEffect(() => () => stopPlayback(), [])

  // every mode gets its root-position box, the shape you'd actually play it in
  const boxes = new Map(MODES.map((m) => [m.name, scalePositions(root, m)[0]]))
  const activeBox = boxes.get(activeMode.name)
  const activeCells = new Set(activeBox.notes.map(cellKey))

  const { notes, parentKey } = spellMode(root, activeMode)
  // the tonic as this mode actually writes it — A# Lydian reads as Bb Lydian
  const rootName = notes[0]

  function stopPlayback() {
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []
    activeNotesRef.current.forEach((n) => n.stop())
    activeNotesRef.current = []
    setPlayingName(null)
    setSoundingCell(null)
  }

  // plays the shape itself, note for note up the box, rather than an abstract
  // run of the mode — so what you hear is exactly what's lit on the neck
  function playMode(mode) {
    stopPlayback() // one mode at a time, so a new pick cuts off the last
    setPlayingName(mode.name)
    const sequence = ascendingNotes(boxes.get(mode.name).notes)
    sequence.forEach((note, i) => {
      const t = setTimeout(() => {
        setSoundingCell(cellKey(note))
        activeNotesRef.current.push(
          pluck(frequencyForMidi(note.midi), {
            bright: STRINGS[note.stringIndex].type === 'plain',
          }),
        )
      }, i * SHAPE_NOTE_GAP_MS)
      timeoutsRef.current.push(t)
    })
    const endT = setTimeout(() => {
      activeNotesRef.current = []
      timeoutsRef.current = []
      setPlayingName(null)
      setSoundingCell(null)
    }, sequence.length * SHAPE_NOTE_GAP_MS)
    timeoutsRef.current.push(endT)
  }

  function selectMode(mode) {
    setActiveMode(mode)
    setExpandedName((prev) => (prev === mode.name ? null : mode.name))
    playMode(mode)
  }

  function selectRoot(pitchClass) {
    stopPlayback()
    setRoot(pitchClass)
  }

  return (
    <>
      <div className="key-row" role="tablist" aria-label="Mode root note">
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

      <div className="key-summary-row">
        <p className="sub key-summary">
          {rootName} {activeMode.name} — {notes.join(' ')} — the{' '}
          <span className="tuning">{activeMode.ordinal}</span> mode of{' '}
          <span className="tuning">{parentKey} major</span>
        </p>
      </div>

      <Board
        fretCount={Math.max(FRET_COUNT, activeBox.endFret)}
        renderCell={(s, f) => {
          const noteName = noteAt(s.name, f)
          const idx = NOTE_TO_INDEX[noteName]
          const cell = `${s.num - 1}:${f}`
          const inBox = activeCells.has(cell)
          return (
            <NoteChip
              note={noteName}
              freq={frequencyAt(s.midi, f)}
              bright={s.type === 'plain'}
              label={f === 0 ? `string ${s.num} open` : `string ${s.num} fret ${f}`}
              outOfKey={!inBox}
              isRoot={idx === root}
              chordActive={soundingCell === cell}
            />
          )
        }}
      />

      <ul className="interval-list mode-list">
        {MODES.map((mode) => {
          const expanded = expandedName === mode.name
          const spelling = spellMode(root, mode)
          const box = boxes.get(mode.name)
          return (
            <li key={mode.name} className={expanded ? 'expanded' : ''}>
              <button
                className={
                  playingName === mode.name
                    ? 'interval-list-row mode-row playing'
                    : 'interval-list-row mode-row'
                }
                aria-expanded={expanded}
                onClick={() => selectMode(mode)}
              >
                <ShapeGrid
                  startFret={box.startFret}
                  endFret={box.endFret}
                  notes={box.notes}
                  soundingKey={playingName === mode.name ? soundingCell : null}
                />
                <span className="mode-row-text">
                  <span className="interval-list-name">{mode.name}</span>
                  <span className="interval-list-semitones">
                    {mode.ordinal} mode · {mode.signature} ·{' '}
                    {box.startFret === 0 ? 'open' : `${box.startFret}fr`}
                  </span>
                </span>
                <span className="interval-list-play">
                  {playingName === mode.name ? '♪ Playing' : '▶ Play'}
                </span>
              </button>
              {expanded && (
                <div className="interval-detail">
                  <span className="interval-detail-mood">{mode.mood}</span>
                  <p className="interval-detail-text">{mode.description}</p>
                  <p className="interval-detail-text mode-detail-notes">
                    {spelling.notes[0]} {mode.name}:{' '}
                    <span className="tuning">{spelling.notes.join(' ')}</span> — the {mode.ordinal}{' '}
                    mode of {spelling.parentKey} major
                  </p>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </>
  )
}

const STRUM_GAP_MS = 35

function PositionsTab() {
  const [root, setRoot] = useState(0) // pitch class, defaults to C
  const [quality, setQuality] = useState('major')
  const [selectedPosition, setSelectedPosition] = useState(null)

  const chord = CHORD_QUALITIES[quality]
  const triad = spellTriad(CHROMATIC[root], quality)
  // how the root is actually written for this chord — A# major reads as Bb
  const chordName = triad[0] + chord.suffix
  const chordPitches = new Set(triad.map((note) => NOTE_TO_INDEX[note]))
  const positions = chordPositions(root, quality)
  const boardFrets = Math.max(FRET_COUNT, ...positions.map((p) => p.endFret))

  // a selected position takes over the neck, the same way a selected chord
  // does in the Keys tab — everything outside that voicing fades out
  const voicing = selectedPosition !== null ? positions[selectedPosition - 1] : null
  const cells = voicing ? voicingCells(voicing.frets) : null
  const rootString = voicing ? voicingRootString(voicing.frets) : -1

  // low string to high, a quick downstroke
  function strum(frets) {
    ;[5, 4, 3, 2, 1, 0]
      .filter((i) => frets[i] !== 'x')
      .forEach((i, seq) => {
        const string = STRINGS[i]
        setTimeout(
          () => pluck(frequencyForMidi(string.midi + frets[i]), { bright: string.type === 'plain' }),
          seq * STRUM_GAP_MS,
        )
      })
  }

  function selectRoot(pitchClass) {
    setRoot(pitchClass)
    setSelectedPosition(null)
    strum(chordPositions(pitchClass, quality)[0].frets)
  }

  function selectQuality(key) {
    setQuality(key)
    setSelectedPosition(null)
    strum(chordPositions(root, key)[0].frets)
  }

  // the diagram strums itself on click, so this only has to move the neck
  function selectPosition(position) {
    setSelectedPosition((prev) => (prev === position ? null : position))
  }

  return (
    <>
      <div className="tabs interval-mode-tabs" role="tablist" aria-label="Chord quality">
        {Object.values(CHORD_QUALITIES).map((q) => (
          <button
            key={q.key}
            role="tab"
            aria-selected={quality === q.key}
            className={quality === q.key ? 'active' : ''}
            onClick={() => selectQuality(q.key)}
          >
            {q.label}
          </button>
        ))}
      </div>

      <div className="key-row" role="tablist" aria-label="Chord root note">
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

      <div className="key-summary-row">
        <p className="sub key-summary">
          {triad[0]} {chord.label} — {triad.join(' ')} — <span className="tuning">{chord.degrees.join(' ')}</span>
        </p>
      </div>

      <Board
        fretCount={boardFrets}
        renderCell={(s, f) => {
          const noteName = noteAt(s.name, f)
          const idx = NOTE_TO_INDEX[noteName]
          const stringIndex = s.num - 1
          const inVoicing = cells ? cells.has(`${stringIndex}:${f}`) : false
          return (
            <NoteChip
              note={noteName}
              freq={frequencyAt(s.midi, f)}
              bright={s.type === 'plain'}
              label={f === 0 ? `string ${s.num} open` : `string ${s.num} fret ${f}`}
              outOfKey={cells ? !inVoicing : !chordPitches.has(idx)}
              isRoot={idx === root}
              chordActive={inVoicing}
              isChordRoot={inVoicing && stringIndex === rootString}
            />
          )
        }}
      />

      <div className="chord-row-header">
        <span className="tab-heading">{chordName} positions</span>
        <button
          className="reset-btn"
          onClick={() => setSelectedPosition(null)}
          disabled={selectedPosition === null}
        >
          Clear selection
        </button>
      </div>

      <div className="chord-row">
        {positions.map((p) => (
          <ChordDiagram
            key={`${quality}-${root}-${p.shape}`}
            roman={`Position ${p.position}`}
            name={chordName}
            root={triad[0]}
            frets={p.frets}
            caption={`${p.shape} shape · ${p.startFret === 0 ? 'open' : `${p.startFret}fr`}`}
            selected={selectedPosition === p.position}
            onSelect={() => selectPosition(p.position)}
          />
        ))}
      </div>

      <p className="sub scale-position-note">
        These five are the CAGED shapes — the open C, A, G, E and D chords, each slid up the neck
        until it lands on {chordName}. Every one is the same three notes, just voiced in a different
        spot, and each shape's top end overlaps the next one's bottom, so together they chain
        {' '}from the nut to around the 12th fret and beyond. Press and hold a diagram to hear it
        arpeggiated.
      </p>
    </>
  )
}

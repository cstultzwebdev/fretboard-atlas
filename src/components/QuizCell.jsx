import { useEffect, useRef, useState } from 'react'
import { NOTE_TO_INDEX, parseNoteInput } from '../lib/notes.js'

const EVAL_DELAY_MS = 4000

export default function QuizCell({ correctNote, label }) {
  const [value, setValue] = useState('')
  const [status, setStatus] = useState('empty') // empty | pending | correct | incorrect
  const timerRef = useRef(null)

  useEffect(() => () => clearTimeout(timerRef.current), [])

  function evaluate(raw) {
    const parsed = parseNoteInput(raw)
    const correctIdx = NOTE_TO_INDEX[correctNote]
    setStatus(parsed !== null && parsed === correctIdx ? 'correct' : 'incorrect')
  }

  function handleChange(e) {
    const v = e.target.value
    setValue(v)
    clearTimeout(timerRef.current)

    if (!v.trim()) {
      setStatus('empty')
      return
    }
    setStatus('pending')
    timerRef.current = setTimeout(() => evaluate(v), EVAL_DELAY_MS)
  }

  return (
    <span className={`chip quiz ${status}`}>
      {status === 'pending' && <span key={value} className="countdown" aria-hidden="true" />}
      <input
        type="text"
        value={value}
        onChange={handleChange}
        maxLength={2}
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        aria-label={`${label}, enter the note. Checked 4 seconds after you stop typing.`}
      />
      {status === 'incorrect' && <span className="reveal">{correctNote}</span>}
    </span>
  )
}

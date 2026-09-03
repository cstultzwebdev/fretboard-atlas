// Plucked-string synthesis via Karplus-Strong: a noise burst is fed through a
// short feedback delay line whose length sets the pitch, with each pass
// averaging (and slightly damping) neighboring samples to mimic a real
// string's decay. This is why a low E sounds noticeably different from a
// high E beyond just pitch: the shorter delay line for high notes gets
// filtered more times per second, so it brightens and decays faster —
// the same way a physical string actually behaves.
//
// A few things are layered on top of the bare algorithm specifically to move
// it from "plucked string" toward "acoustic guitar":
//  - two slightly detuned copies of the same string, summed. A real string
//    actually vibrates in two polarizations that couple slightly differently
//    to the bridge, which is what gives a guitar note its natural complexity
//    and faint beating instead of a flat, synthetic tone.
//  - a brief burst of noise at the very onset, standing in for the pick (or
//    fingernail) scraping the string before its own resonance takes over.
//  - a body-resonance peak and a top-end roll-off, since a raw noise-excited
//    delay line is brighter and more metallic than an actual wooden top.

let ctx = null
let master = null

const MASTER_GAIN = 0.35
let muted = false

// what a muted pluck hands back, so callers can still stop() it blindly
const SILENT_NOTE = { stop() {} }

function getContext() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)()
    master = ctx.createGain()
    master.gain.value = muted ? 0 : MASTER_GAIN
    master.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

export function isMuted() {
  return muted
}

// Muting closes the master gain rather than only skipping new notes, so
// anything still ringing when it's hit fades out instead of playing on.
export function setMuted(value) {
  muted = value
  if (!ctx || !master) return
  const now = ctx.currentTime
  master.gain.cancelScheduledValues(now)
  master.gain.setValueAtTime(master.gain.value, now)
  master.gain.linearRampToValueAtTime(muted ? 0 : MASTER_GAIN, now + 0.05)
}

function karplusVoice(freq, sampleRate, totalSamples, damping) {
  const delayLength = Math.max(2, Math.round(sampleRate / freq))
  const ring = new Float32Array(delayLength)
  for (let i = 0; i < delayLength; i++) ring[i] = Math.random() * 2 - 1

  const out = new Float32Array(totalSamples)
  let idx = 0
  for (let i = 0; i < totalSamples; i++) {
    out[i] = ring[idx]
    const next = (idx + 1) % delayLength
    ring[idx] = damping * 0.5 * (ring[idx] + ring[next])
    idx = next
  }
  return out
}

export function pluck(freq, { duration = 1.4, damping = 0.996, bright = true } = {}) {
  // synthesising a note nobody can hear is pure work, so don't
  if (muted) return SILENT_NOTE

  const audioCtx = getContext()
  const sampleRate = audioCtx.sampleRate
  const totalSamples = Math.floor(duration * sampleRate)

  const voiceA = karplusVoice(freq, sampleRate, totalSamples, damping)
  const voiceB = karplusVoice(freq * 1.0011, sampleRate, totalSamples, damping)

  const data = new Float32Array(totalSamples)
  for (let i = 0; i < totalSamples; i++) data[i] = (voiceA[i] + voiceB[i]) * 0.5

  const attackSamples = Math.min(totalSamples, Math.floor(sampleRate * 0.006))
  for (let i = 0; i < attackSamples; i++) {
    const env = 1 - i / attackSamples
    data[i] += (Math.random() * 2 - 1) * 0.22 * env
  }

  // fade in/out so the buffer edges never click
  const fadeSamples = Math.min(300, Math.floor(totalSamples / 2))
  for (let i = 0; i < fadeSamples; i++) {
    data[i] *= i / fadeSamples
    data[totalSamples - 1 - i] *= i / fadeSamples
  }

  // the extra voice and pick noise can occasionally sum louder than a single
  // clean Karplus-Strong voice — keep it under control regardless
  let peak = 0
  for (let i = 0; i < totalSamples; i++) peak = Math.max(peak, Math.abs(data[i]))
  if (peak > 0.9) {
    const scale = 0.9 / peak
    for (let i = 0; i < totalSamples; i++) data[i] *= scale
  }

  const buffer = audioCtx.createBuffer(1, totalSamples, sampleRate)
  buffer.getChannelData(0).set(data)

  const source = audioCtx.createBufferSource()
  source.buffer = buffer

  const body = audioCtx.createBiquadFilter()
  body.type = 'peaking'
  body.frequency.value = 110
  body.Q.value = 1.1
  body.gain.value = 5

  const tone = audioCtx.createBiquadFilter()
  tone.type = 'lowpass'
  tone.frequency.value = bright ? 6000 : 3800
  tone.Q.value = 0.7

  // routed through its own gain node so a caller can fade this one note out
  // early (e.g. stopping a scale mid-sequence) without clicking or touching
  // any other note currently ringing
  const noteGain = audioCtx.createGain()

  source.connect(body)
  body.connect(tone)
  tone.connect(noteGain)
  noteGain.connect(master)
  source.start()

  return {
    stop() {
      const now = audioCtx.currentTime
      noteGain.gain.cancelScheduledValues(now)
      noteGain.gain.setValueAtTime(noteGain.gain.value, now)
      noteGain.gain.linearRampToValueAtTime(0, now + 0.03)
      source.stop(now + 0.04)
    },
  }
}

// ─────────────────────────────────────────────
// 30s Preview Audio Player
// Web Audio API waveform visualization
// ─────────────────────────────────────────────

const Player = (() => {
  let audioEl    = null
  let audioCtx   = null
  let analyser   = null
  let source     = null
  let rafId      = null
  let activeRow  = null

  function init() {
    audioEl = new Audio()
    audioEl.crossOrigin = 'anonymous'
    audioEl.preload = 'none'

    audioEl.addEventListener('ended', () => resetActiveRow())
    audioEl.addEventListener('error', () => {
      console.warn('Preview failed to load')
      resetActiveRow()
    })
  }

  function setupAudioContext() {
    if (audioCtx) return
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    analyser = audioCtx.createAnalyser()
    analyser.fftSize = 64
    source   = audioCtx.createMediaElementSource(audioEl)
    source.connect(analyser)
    analyser.connect(audioCtx.destination)
  }

  function play(previewUrl, row) {
    if (!audioEl) init()

    // Stop current if same row clicked again
    if (activeRow === row && !audioEl.paused) {
      pause()
      return
    }

    // Reset previous row
    resetActiveRow()

    // Chrome requires AudioContext after user gesture
    setupAudioContext()
    if (audioCtx.state === 'suspended') audioCtx.resume()

    audioEl.src = previewUrl
    audioEl.play().catch(err => console.warn('Playback error:', err))

    activeRow = row
    row.classList.add('playing')

    // Dim all other rows
    document.querySelectorAll('.track-row').forEach(r => {
      if (r !== row) r.classList.add('dimmed')
    })

    // Start waveform
    const canvas = row.querySelector('.waveform-canvas')
    if (canvas) drawWaveform(canvas)
  }

  function pause() {
    if (audioEl) audioEl.pause()
    cancelAnimationFrame(rafId)
    resetActiveRow()
  }

  function resetActiveRow() {
    if (activeRow) {
      activeRow.classList.remove('playing')
      activeRow = null
    }
    document.querySelectorAll('.track-row').forEach(r => r.classList.remove('dimmed'))
    cancelAnimationFrame(rafId)
  }

  function drawWaveform(canvas) {
    const ctx    = canvas.getContext('2d')
    const buffer = new Uint8Array(analyser.frequencyBinCount)

    canvas.width  = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    function draw() {
      rafId = requestAnimationFrame(draw)
      analyser.getByteFrequencyData(buffer)

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const barW = canvas.width / buffer.length
      buffer.forEach((val, i) => {
        const barH = (val / 255) * canvas.height
        ctx.fillStyle = `rgba(139, 0, 0, ${0.4 + (val / 255) * 0.6})`
        ctx.fillRect(i * barW, canvas.height - barH, barW - 1, barH)
      })
    }

    draw()
  }

  return { play, pause, init }
})()

// ── Wire up play buttons ──
function initPlayer() {
  Player.init()

  document.querySelectorAll('.track-row').forEach(row => {
    const playBtn    = row.querySelector('.track__play')
    const previewUrl = row.dataset.preview

    if (!playBtn) return

    if (!previewUrl) {
      // No preview — swap to external link button
      playBtn.outerHTML = `<a
        href="${row.dataset.spotifyUrl || '#'}"
        target="_blank"
        rel="noopener"
        class="track__external"
        title="Open in Spotify"
      >↗</a>`
      return
    }

    playBtn.addEventListener('click', () => {
      Player.play(previewUrl, row)
    })
  })
}

document.addEventListener('DOMContentLoaded', initPlayer)

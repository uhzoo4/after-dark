// ─────────────────────────────────────────────
// 30s Preview Audio Player
// Fake waveform animation (Option A)
// Web Audio API removed — CORS blocks analyser
// from reading cross-domain audio data from
// p.scdn.co. Fake waveform looks identical.
// ─────────────────────────────────────────────

const Player = (() => {
  let audioEl   = null  // Single audio element reused for all tracks
  let rafId     = null  // requestAnimationFrame ID for waveform
  let activeRow = null  // Currently playing track row element

  function init() {
    // Create one audio element shared across all tracks
    // Swapping src is faster than creating new elements
    audioEl = new Audio()
    audioEl.crossOrigin = 'anonymous'
    audioEl.preload = 'none' // Don't load audio until user clicks play

    // Clean up UI when track finishes naturally
    audioEl.addEventListener('ended', () => resetActiveRow())

    // Clean up UI if preview URL fails to load
    audioEl.addEventListener('error', () => resetActiveRow())
  }

  function play(previewUrl, row) {
    if (!audioEl) init()

    // If user clicks the same track that's already playing — pause it
    if (activeRow === row && !audioEl.paused) {
      pause()
      return
    }

    // Stop whatever was playing before starting new track
    resetActiveRow()

    // Swap audio source and play
    // .catch handles browsers that block autoplay
    audioEl.src = previewUrl
    audioEl.play().catch(err => console.warn('Playback error:', err))

    // Mark this row as active
    activeRow = row
    row.classList.add('playing') // triggers crimson glow in CSS

    // Dim all other rows so active track stands out
    document.querySelectorAll('.track-row').forEach(r => {
      if (r !== row) r.classList.add('dimmed')
    })

    // Start waveform animation on the canvas inside this row
    const canvas = row.querySelector('.waveform-canvas')
    if (canvas) drawWaveform(canvas)
  }

  function pause() {
    if (audioEl) audioEl.pause()
    cancelAnimationFrame(rafId) // Stop waveform animation
    resetActiveRow()
  }

  function resetActiveRow() {
    // Remove active styling from current row
    if (activeRow) activeRow.classList.remove('playing')
    activeRow = null

    // Remove dimming from all rows
    document.querySelectorAll('.track-row').forEach(r => {
      r.classList.remove('dimmed')
    })

    // Stop waveform animation loop
    cancelAnimationFrame(rafId)
  }

  function drawWaveform(canvas) {
    // Option A — fake waveform using random bar heights
    // Looks identical to real frequency data visually
    // Avoids Web Audio API CORS issue with p.scdn.co
    const ctx = canvas.getContext('2d')

    // Set canvas size to match its CSS dimensions
    canvas.width  = canvas.offsetWidth
    canvas.height = 3

    function draw() {
      // Loop — runs every animation frame (~60fps)
      rafId = requestAnimationFrame(draw)

      // Clear previous frame
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw random bars to simulate waveform
      const bars = Math.floor(canvas.width / 4)
      for (let i = 0; i < bars; i++) {
        const h = Math.random() * canvas.height
        // Crimson color with varying opacity based on bar height
        ctx.fillStyle = `rgba(139, 0, 0, ${0.4 + Math.random() * 0.6})`
        ctx.fillRect(i * 4, canvas.height - h, 3, h)
      }
    }

    draw() // Kick off the animation loop
  }

  // Expose only what's needed outside this module
  return { play, pause, init }
})()

// ── Wire up play buttons to track rows ──
function initPlayer() {
  Player.init()

  document.querySelectorAll('.track-row').forEach(row => {
    const playBtn    = row.querySelector('.track__play')
    const previewUrl = row.dataset.preview // Set in HTML as data-preview=""

    if (!playBtn) return

    // If no preview URL exists — replace play button with
    // external Spotify link so the row still has an action
    if (!previewUrl) {
      playBtn.outerHTML = `
        href="${row.dataset.spotifyUrl || '#'}"
        target="_blank"
        rel="noopener"
        class="track__external"
        title="Open in Spotify">↗</a>`
      return
    }

    // Wire click to player
    playBtn.addEventListener('click', () => {
      Player.play(previewUrl, row)
    })
  })
}

// Wait for DOM to be ready before wiring up buttons
document.addEventListener('DOMContentLoaded', initPlayer)
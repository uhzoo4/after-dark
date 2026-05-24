// ─────────────────────────────────────────────
// User Taste Page Generator
// Populates taste.html with profile data
// ─────────────────────────────────────────────

function renderTastePage(profile) {
  // Name
  const nameEl = document.getElementById('taste-name')
  if (nameEl) nameEl.textContent = profile.displayName

  // Vibe description
  const vibeEl = document.getElementById('taste-vibe')
  if (vibeEl) vibeEl.textContent = profile.vibeDescription

  // Tracks
  const trackList = document.getElementById('taste-tracks')
  if (trackList && profile.topTracks) {
    trackList.innerHTML = profile.topTracks.map((t, i) => `
      <div class="track-row"
           data-preview="${t.previewUrl || ''}"
           data-spotify-url="${t.spotifyUrl || ''}">
        <span class="track__num">${String(i + 1).padStart(2, '0')}</span>
        <span class="track__name">${t.name}</span>
        <span class="track__artist">${t.artist}</span>
        <span class="track__mood">${t.albumName}</span>
        ${t.previewUrl
          ? `<button class="track__play" aria-label="Play preview">▶</button>`
          : `<a href="${t.spotifyUrl}" target="_blank" rel="noopener" class="track__external" title="Open in Spotify">↗</a>`
        }
        <canvas class="waveform-canvas"></canvas>
      </div>
    `).join('')

    // Re-init player for dynamically rendered rows
    if (typeof initPlayer === 'function') initPlayer()
  }

  // Artists
  const artistList = document.getElementById('taste-artists')
  if (artistList && profile.topArtists) {
    artistList.innerHTML = profile.topArtists.map(a =>
      `<div class="capsule__artist">${a.name}</div>`
    ).join('')
  }
}

function showExpiredState() {
  const container = document.getElementById('taste-content')
  if (!container) return
  container.innerHTML = `
    <div style="text-align:center; padding: 80px 0;">
      <p style="font-family: var(--font-display); font-size: 1.5rem; font-style: italic; color: var(--silver); margin-bottom: 24px;">
        This taste profile has faded away.
      </p>
      <a href="/" class="btn btn--primary">Generate yours</a>
    </div>
  `
}

function showLoadingState() {
  const container = document.getElementById('taste-content')
  if (container) container.style.opacity = '0.4'
}

function hideLoadingState() {
  const container = document.getElementById('taste-content')
  if (container) {
    container.style.transition = 'opacity 600ms ease'
    container.style.opacity = '1'
  }
}

// ── Entry point for taste.html ──
async function initTastePage() {
  const params   = new URLSearchParams(window.location.search)
  const code     = params.get('code')
  const username = params.get('u')

  // Case 1: Returning from Spotify OAuth
  if (code) {
    showLoadingState()
    try {
      await SpotifyAuth.exchangeToken(code)
      const userData = await SpotifyAPI.getAllUserData()
      const savedUsername = await saveProfile(userData)
      renderTastePage({
        displayName:     userData.me.display_name,
        vibeDescription: generateVibeDescription(userData.artists),
        topTracks:       userData.tracks.map(t => ({
          name:       t.name,
          artist:     t.artists[0]?.name || '',
          previewUrl: t.preview_url || null,
          spotifyUrl: t.external_urls?.spotify || '',
          albumName:  t.album?.name || ''
        })),
        topArtists: userData.artists.map(a => ({ name: a.name, genres: a.genres }))
      })
      // Update URL to shareable form without OAuth code
      window.history.replaceState({}, '', `/taste?u=${savedUsername}`)
    } catch (err) {
      console.error('Failed to generate taste page:', err)
    } finally {
      hideLoadingState()
    }
    return
  }

  // Case 2: Viewing a shared profile
  if (username) {
    showLoadingState()
    const result = await fetchProfile(username)
    hideLoadingState()

    if (result.status === 'ok') {
      renderTastePage(result.profile)
    } else {
      showExpiredState()
    }
    return
  }

  // Case 3: No code or username — redirect home
  window.location.href = '/'
}

document.addEventListener('DOMContentLoaded', initTastePage)

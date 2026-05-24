// ─────────────────────────────────────────────
// Spotify Web API — all fetch calls
// ─────────────────────────────────────────────

const SpotifyAPI = (() => {
  const BASE = 'https://api.spotify.com/v1'

  async function request(endpoint) {
    const token = SpotifyAuth.getToken()
    if (!token) throw new Error('Not authenticated')

    const res = await fetch(`${BASE}${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    if (res.status === 429) {
      const retry = res.headers.get('Retry-After') || 1
      await new Promise(r => setTimeout(r, retry * 1000))
      return request(endpoint)
    }

    if (!res.ok) throw new Error(`Spotify API error: ${res.status}`)
    return res.json()
  }

  async function getMe() {
    return request('/me')
  }

  async function getTopTracks(limit = 10, timeRange = 'medium_term') {
    return request(`/me/top/tracks?limit=${limit}&time_range=${timeRange}`)
  }

  async function getTopArtists(limit = 5, timeRange = 'medium_term') {
    return request(`/me/top/artists?limit=${limit}&time_range=${timeRange}`)
  }

  async function getRecentlyPlayed(limit = 10) {
    return request(`/me/player/recently-played?limit=${limit}`)
  }

  async function getPlaylist(playlistId) {
    return request(`/playlists/${playlistId}`)
  }

  // Fetch all data needed for a user taste page in parallel
  async function getAllUserData() {
    const [me, tracks, artists, recent] = await Promise.all([
      getMe(),
      getTopTracks(10),
      getTopArtists(5),
      getRecentlyPlayed(10)
    ])
    return { me, tracks: tracks.items, artists: artists.items, recent: recent.items }
  }

  return { getMe, getTopTracks, getTopArtists, getRecentlyPlayed, getPlaylist, getAllUserData }
})()

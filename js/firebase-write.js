// ─────────────────────────────────────────────
// Firebase Write — save generated taste profile
// TTL: 24 hours. Profile auto-expires on read.
// ─────────────────────────────────────────────

async function saveProfile(userData) {
  const { me, tracks, artists } = userData
  const username = me.id.toLowerCase().replace(/[^a-z0-9]/g, '')

  const profile = {
    displayName:      me.display_name,
    createdAt:        Date.now(),
    vibeDescription:  generateVibeDescription(artists),
    topTracks: tracks.map(t => ({
      name:       t.name,
      artist:     t.artists[0]?.name || '',
      previewUrl: t.preview_url || null,
      spotifyUrl: t.external_urls?.spotify || '',
      albumName:  t.album?.name || ''
    })),
    topArtists: artists.map(a => ({
      name:   a.name,
      genres: a.genres || []
    }))
  }

  try {
    await db.ref(`profiles/${username}`).set(profile)
    return username
  } catch (err) {
    console.error('Firebase write failed:', err)
    throw err
  }
}

function generateVibeDescription(artists) {
  const genres = artists.flatMap  (a => a.genres || [])

  const map = {
    'r-n-b':       'smooth and late-night',
    'pop':         'melodic and layered',
    'indie':       'textured and introspective',
    'hip-hop':     'bold and rhythmic',
    'electronic':  'atmospheric and produced',
    'dark':        'brooding and intentional',
    'sad':         'melancholic and cinematic',
    'soul':        'deep and warm',
    'alternative': 'raw and restless',
    'ambient':     'drifting and spacious'
  }

  const matched = []
  for (const [key, desc] of Object.entries(map)) {
    if (genres.some(g => g && g.includes(key)) && matched.length < 3) {
      matched.push(desc)
    }
  }

  if (matched.length === 0) return 'unique and undefined — like all the best things.'
  if (matched.length === 1) return `${matched[0]}.`
  const last  = matched.pop()
  return `${matched.join(', ')} with a ${last} edge.`
}

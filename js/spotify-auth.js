// ─────────────────────────────────────────────
// Spotify OAuth 2.0 PKCE Flow
// No backend required — runs fully client-side
// ─────────────────────────────────────────────

const SpotifyAuth = (() => {

  // Generate cryptographically random verifier
  function generateVerifier(length = 64) {
    const chars  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
    const array  = new Uint8Array(length)
    crypto.getRandomValues(array)
    return Array.from(array, byte => chars[byte % chars.length]).join('')
  }

  // SHA-256 hash → base64url encode
  async function generateChallenge(verifier) {
    const encoded = new TextEncoder().encode(verifier)
    const hash    = await crypto.subtle.digest('SHA-256', encoded)
    return btoa(String.fromCharCode(...new Uint8Array(hash)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
  }

  // Step 1 — redirect user to Spotify
  async function login() {
    const verifier   = generateVerifier()
    const challenge  = await generateChallenge(verifier)

    sessionStorage.setItem('pkce_verifier', verifier)

    const params = new URLSearchParams({
      client_id:             SPOTIFY_CONFIG.clientId,
      response_type:         'code',
      redirect_uri:          SPOTIFY_CONFIG.redirectUri,
      code_challenge_method: 'S256',
      code_challenge:        challenge,
      scope:                 SPOTIFY_CONFIG.scopes,
    })

    window.location.href = `https://accounts.spotify.com/authorize?${params}`
  }

  // Step 2 — exchange code for token (called on taste.html load)
  async function exchangeToken(code) {
    const verifier = sessionStorage.getItem('pkce_verifier')
    if (!verifier) throw new Error('No PKCE verifier found')

    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id:     SPOTIFY_CONFIG.clientId,
        grant_type:    'authorization_code',
        code,
        redirect_uri:  SPOTIFY_CONFIG.redirectUri,
        code_verifier: verifier,
      })
    })

    if (!res.ok) throw new Error('Token exchange failed')

    const data = await res.json()

    // Store token — sessionStorage only, never localStorage
    sessionStorage.setItem('spotify_token',  data.access_token)
    sessionStorage.setItem('spotify_expiry', Date.now() + data.expires_in * 1000)

    // Clean up verifier immediately after use
    sessionStorage.removeItem('pkce_verifier')

    return data.access_token
  }

  function getToken() {
    const token  = sessionStorage.getItem('spotify_token')
    const expiry = sessionStorage.getItem('spotify_expiry')
    if (!token || !expiry) return null
    if (Date.now() > parseInt(expiry)) {
      sessionStorage.removeItem('spotify_token')
      sessionStorage.removeItem('spotify_expiry')
      return null
    }
    return token
  }

  function isAuthenticated() {
    return !!getToken()
  }

  function logout() {
    sessionStorage.removeItem('spotify_token')
    sessionStorage.removeItem('spotify_expiry')
  }

  return { login, exchangeToken, getToken, isAuthenticated, logout }
})()

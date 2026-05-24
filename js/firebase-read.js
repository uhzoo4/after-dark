// ─────────────────────────────────────────────
// Firebase Read — fetch shared taste profile
// Checks TTL: profiles older than 24hrs = expired
// ─────────────────────────────────────────────

const TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

async function fetchProfile(username) {
  try {
    const snapshot = await db.ref(`profiles/${username}`).get()

    if (!snapshot.exists()) return { status: 'not_found' }

    const profile = snapshot.val()

    // TTL check
    if (Date.now() - profile.createdAt > TTL_MS) {
      // Delete expired profile
      await db.ref(`profiles/${username}`).remove()
      return { status: 'expired' }
    }

    return { status: 'ok', profile }
  } catch (err) {
    console.error('Firebase read failed:', err)
    return { status: 'error' }
  }
}

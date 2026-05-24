// ─────────────────────────────────────────────
// Three.js Hero Scene
// Initializes after DOMContentLoaded
// ─────────────────────────────────────────────

function initHeroScene() {
  const canvas = document.getElementById('hero-canvas')
  if (!canvas || typeof THREE === 'undefined') return

  // Scene setup
  const scene    = new THREE.Scene()
  const camera   = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })

  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  camera.position.z = 4

  // ── Central geometry ──
  const geo = new THREE.IcosahedronGeometry(1.2, 1)
  const mat = new THREE.MeshBasicMaterial({
    color: 0x8b0000,
    wireframe: true,
    transparent: true,
    opacity: 0.25
  })
  const mesh = new THREE.Mesh(geo, mat)
  scene.add(mesh)

  // ── Particle field ──
  const COUNT = 800
  const positions = new Float32Array(COUNT * 3)

  for (let i = 0; i < COUNT * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 14
  }

  const particleGeo = new THREE.BufferGeometry()
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))

  const particleMat = new THREE.PointsMaterial({
    color: 0x8b0000,
    size: 0.015,
    transparent: true,
    opacity: 0.5
  })

  const particles = new THREE.Points(particleGeo, particleMat)
  scene.add(particles)

  // ── Mouse parallax ──
  let mouseX = 0
  let mouseY = 0
  let targetX = 0
  let targetY = 0

  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth  - 0.5) * 2
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2
  })

  // ── Resize handler ──
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  })

  // ── Animation loop ──
  let lastTime = 0

  function animate(time) {
    requestAnimationFrame(animate)

    // Delta time cap — prevents fast-forward on tab switch
    const delta = Math.min((time - lastTime) / 1000, 0.05)
    lastTime = time

    // Smooth mouse follow at 20% speed
    targetX += (mouseX - targetX) * 0.02
    targetY += (mouseY - targetY) * 0.02

    mesh.rotation.y += 0.002 * (delta * 60)
    mesh.rotation.x += 0.001 * (delta * 60)

    particles.rotation.y += 0.0005 * (delta * 60)
    particles.rotation.x = targetY * 0.1
    particles.rotation.y += targetX * 0.0003

    camera.position.x += (targetX * 0.3 - camera.position.x) * 0.02
    camera.position.y += (-targetY * 0.3 - camera.position.y) * 0.02

    renderer.render(scene, camera)
  }

  animate(0)
}

document.addEventListener('DOMContentLoaded', initHeroScene)

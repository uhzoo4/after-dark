// ─────────────────────────────────────────────
// GSAP Scroll Animations
// Registered after DOMContentLoaded
// ─────────────────────────────────────────────

function initAnimations() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return

  gsap.registerPlugin(ScrollTrigger)

  // ── Hero headline character reveal ──
  const headline = document.querySelector('.hero__headline')
  if (headline) {
    const text = headline.textContent
    headline.innerHTML = text.split('').map(char =>
      char === ' '
        ? ' '
        : `<span class="char">${char}</span>`
    ).join('')

    gsap.to('.hero__headline .char', {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.025,
      ease: 'power2.out',
      delay: 0.5
    })
  }

  // ── Story section — paragraph reveals + bg color scrub ──
  gsap.utils.toArray('.story__paragraph').forEach((p, i) => {
    gsap.fromTo(p,
      { opacity: 0, y: 40 },
      {
        opacity: 0.92, y: 0,
        duration: 0.9,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: p,
          start: 'top 80%',
          toggleActions: 'play none none none'
        }
      }
    )
  })

  // Background color transition over story section scroll
  const storySection = document.querySelector('.story')
  if (storySection) {
    gsap.to(storySection, {
      backgroundColor: '#1a0505',
      ease: 'none',
      scrollTrigger: {
        trigger: storySection,
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    })
  }

  // ── Artist cards — slide in from opposite sides ──
  const weekndCard = document.querySelector('.artist-card--weeknd')
  const lanaCard   = document.querySelector('.artist-card--lana')

  if (weekndCard) {
    gsap.fromTo(weekndCard,
      { opacity: 0, x: -80 },
      {
        opacity: 1, x: 0,
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: { trigger: weekndCard, start: 'top 75%' }
      }
    )
  }

  if (lanaCard) {
    gsap.fromTo(lanaCard,
      { opacity: 0, x: 80 },
      {
        opacity: 1, x: 0,
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: { trigger: lanaCard, start: 'top 75%' }
      }
    )
  }

  // ── Track rows — stagger cascade ──
  const trackRows = gsap.utils.toArray('.track-row')
  if (trackRows.length) {
    gsap.fromTo(trackRows,
      { opacity: 0, x: -30 },
      {
        opacity: 1, x: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.tracks__list',
          start: 'top 75%'
        }
      }
    )
  }

  // ── Vibe board — parallax per tile ──
  gsap.utils.toArray('.vibe-tile').forEach(tile => {
    const speed = parseFloat(tile.dataset.speed) || 0.5
    gsap.to(tile, {
      y: () => -80 * speed,
      ease: 'none',
      scrollTrigger: {
        trigger: '.vibe__grid',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    })
  })

  // ── Generic reveal for remaining sections ──
  gsap.utils.toArray('.reveal').forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 80%' }
      }
    )
  })

  // ── Make Yours section ──
  const makeYours = document.querySelector('.make-yours__heading')
  if (makeYours) {
    gsap.fromTo(makeYours,
      { opacity: 0, y: 50 },
      {
        opacity: 1, y: 0,
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: { trigger: makeYours, start: 'top 80%' }
      }
    )
  }
}

// ── Navbar scroll class ──
function initNavbar() {
  const nav = document.querySelector('.nav')
  if (!nav) return

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60)
  }, { passive: true })
}

document.addEventListener('DOMContentLoaded', () => {
  initNavbar()
  // Small delay so Three.js canvas doesn't block GSAP setup
  setTimeout(initAnimations, 100)
})

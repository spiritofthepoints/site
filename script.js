/* ═══════════════════════════════════════════════════════
   SPIRIT OF THE POINTS — Interactive Script
═══════════════════════════════════════════════════════ */

// ── Card Data ──
const cards = [
  {
    name: "Yin Mound",
    image: "assets/Oracle12.jpg",
    passage: "You were born with a divine blueprint, an inner architecture guided by the Tao itself. When you live in resonance with it, life doesn't need to be forced. It flows with greater vitality, clarity, and joy.\n\nThere's a difference between pushing yourself forward and being pulled by what resonates. One drains your essence. The other strengthens it.",
    practice: "Settle into stillness. Place one hand on your lower abdomen. Breathe slowly, feeling warmth gather beneath your palm. Notice what in your life feels like effort — and what feels like flow."
  },
  {
    name: "Abundant Splendor",
    image: "assets/Oracle25.jpg",
    passage: "There is a field beyond striving where life meets itself with open hands. You have been there before — in the moment a laugh surprised you, in the warmth of sun on skin, in the quiet after rain.\n\nAbundance is not something to acquire. It is something to remember.",
    practice: "Step outside. Feel the ground beneath your feet. Name three things your body can sense right now — not what you think, but what you feel. Let abundance be as simple as this."
  },
  {
    name: "Dark Gate",
    image: "assets/Oracle61.jpg",
    passage: "Every threshold has a guardian. The dark gate is not a wall — it is an invitation to descend into what you have not yet allowed yourself to know.\n\nWhat lies beneath the surface of your days is not something to fear. It is the source of your deepest wisdom, waiting to be met.",
    practice: "Find a quiet place. Close your eyes. Breathe into the places in your body that feel heavy or unknown. You do not need to fix anything — only to be present with what is."
  },
  {
    name: "Utmost Middle",
    image: "assets/Oracle2.jpg",
    passage: "The center is not a place you find once and keep forever. It is a place you return to, again and again, through the practice of coming home to yourself.\n\nWhen the winds of the world pull you outward, the middle holds. Not rigid — rooted.",
    practice: "Sit with your spine long and your hands resting open. Breathe into the center of your chest. With each exhale, let the edges of you soften. You are already here."
  },
  {
    name: "One Hundred Meetings",
    image: "assets/Oracle3.jpg",
    passage: "At the crown of the head, all the meridians converge. All the rivers of your life meet here — every experience, every loss, every moment of grace.\n\nYou are not the sum of your parts. You are the place where they all come together.",
    practice: "Gently place your fingertips at the crown of your head. Breathe slowly. Imagine all the threads of your life gathering here — not tangled, but woven. You are whole."
  },
  {
    name: "Grasping the Wind",
    image: "assets/Oracle20.jpg",
    passage: "The mind that grasps at everything holds nothing. The wind cannot be caught — only felt, only moved through.\n\nWhat are you holding so tightly that you cannot feel it anymore? What would it mean to open your hands?",
    practice: "Open your palms and hold them upward. Breathe in — and as you exhale, consciously release the grip in your hands, your jaw, your shoulders. Practice letting the wind move through you."
  },
  {
    name: "Body Pillar",
    image: "assets/Oracle21.jpg",
    passage: "The body is not a vessel for the spirit. The body is the spirit, made visible. Every sensation is a message. Every ache, a teacher. Every breath, a prayer.\n\nCome back to the body. It has been waiting for you.",
    practice: "Stand barefoot if you can. Feel the ground beneath you. Slowly scan from feet to crown — not judging, only noticing. The body is always speaking. Today, simply listen."
  }
];

let selectedCardIndex = null;

/* ═══════════════════════════════════════════════════════
   FANNED ARC CARD DRAW
═══════════════════════════════════════════════════════ */

/**
 * Build the fanned arc of cards.
 * 7 cards arranged in a gentle arc — natural hand-held spread.
 */
function buildCardFan() {
  const stage = document.querySelector('.card-fan-stage');
  if (!stage) return;
  stage.innerHTML = '';

  const count = cards.length; // 7
  const isMobile = window.innerWidth < 600;

  // Arc parameters
  const totalArcDeg = isMobile ? 50 : 70;   // total sweep of the fan
  const startAngle = -(totalArcDeg / 2);     // e.g. -35deg
  const angleStep = totalArcDeg / (count - 1);

  // Vertical drop: cards at the edges drop lower (arc effect)
  // We position cards from bottom-center of the stage
  const stageW = stage.offsetWidth || 800;
  const radius = isMobile ? 320 : 420;       // arc radius in px
  const centerX = stageW / 2;
  const originY = isMobile ? 480 : 580;      // virtual pivot point below stage bottom

  cards.forEach((card, i) => {
    const angleDeg = startAngle + i * angleStep;
    const angleRad = (angleDeg * Math.PI) / 180;

    // Position: arc from a point below the stage
    const x = centerX + radius * Math.sin(angleRad);
    const y = originY - radius * Math.cos(angleRad);

    // Card width
    const cardW = isMobile ? 90 : 130;
    const cardH = cardW * 1.56; // approximate card aspect ratio

    const el = document.createElement('div');
    el.className = 'fan-card';
    el.setAttribute('data-index', i);
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    el.setAttribute('aria-label', `Choose card ${i + 1}`);

    // Position: center the card on its arc point
    el.style.left = `${x - cardW / 2}px`;
    el.style.top = `${y - cardH}px`;
    el.style.width = `${cardW}px`;

    // Rotate card to follow the arc tangent
    el.style.transform = `rotate(${angleDeg}deg)`;

    // z-index: middle cards on top
    const distFromCenter = Math.abs(i - (count - 1) / 2);
    el.style.zIndex = Math.round(10 - distFromCenter * 2);

    el.innerHTML = `<img src="assets/card_back_moon.webp" alt="Oracle card face down" draggable="false" />`;

    // Hover: lift the card upward (in its local space) and brighten
    el.addEventListener('mouseenter', () => {
      el.style.transform = `rotate(${angleDeg}deg) translateY(-22px) scale(1.06)`;
      el.style.zIndex = '20';
      // Dim siblings (fallback for browsers without :has())
      document.querySelectorAll('.fan-card').forEach(c => {
        if (c !== el) c.classList.add('sibling-dim');
      });
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = `rotate(${angleDeg}deg)`;
      el.style.zIndex = Math.round(10 - distFromCenter * 2);
      document.querySelectorAll('.fan-card').forEach(c => c.classList.remove('sibling-dim'));
    });

    el.addEventListener('click', () => selectFanCard(i));
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectFanCard(i);
      }
    });

    stage.appendChild(el);
  });
}

/**
 * User selects a card from the fan.
 * Fan fades out, step 2 fades in with the chosen card (face-down).
 */
function selectFanCard(index) {
  selectedCardIndex = index;

  const step1 = document.getElementById('draw-step-1');
  const step2 = document.getElementById('draw-step-2');

  // Animate fan out
  step1.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  step1.style.opacity = '0';
  step1.style.transform = 'translateY(-10px)';

  setTimeout(() => {
    step1.style.display = 'none';

    // Show step 2 — card still face-down
    step2.style.display = 'block';
    step2.style.opacity = '0';
    requestAnimationFrame(() => {
      step2.style.opacity = '1';
    });

    step2.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 500);
}

/**
 * User submits email — flip the card and show confirmation.
 */
function handleDrawSubmit(event) {
  event.preventDefault();
  const email = document.getElementById('draw-email').value;
  if (!email || selectedCardIndex === null) return;

  const card = cards[selectedCardIndex];

  // Flip the card
  const flipEl = document.getElementById('chosen-card-flip');
  flipEl.classList.add('flipped');

  // After flip completes, transition to step 3
  setTimeout(() => {
    const step2 = document.getElementById('draw-step-2');
    const step3 = document.getElementById('draw-step-3');

    step2.style.transition = 'opacity 0.5s ease';
    step2.style.opacity = '0';

    setTimeout(() => {
      step2.style.display = 'none';

      // Populate step 3
      const confirmImg = document.getElementById('confirm-card-img');
      confirmImg.src = card.image;
      confirmImg.alt = card.name + ' oracle card';

      step3.style.display = 'block';
      step3.style.opacity = '0';
      requestAnimationFrame(() => {
        step3.style.opacity = '1';
        step3.style.transition = 'opacity 0.6s ease';
      });

      step3.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 400);
  }, 850); // wait for flip animation (0.75s)
}

/* ═══════════════════════════════════════════════════════
   SCROLL REVEAL
═══════════════════════════════════════════════════════ */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ═══════════════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  buildCardFan();

  // Rebuild fan on resize (debounced)
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(buildCardFan, 200);
  });
});

/* ═══════════════════════════════════════════════════════
   NAV SCROLL BEHAVIOR
═══════════════════════════════════════════════════════ */
const nav = document.querySelector('.nav');
window.addEventListener('scroll', () => {
  if (nav) {
    nav.style.borderBottomColor = window.scrollY > 60
      ? 'rgba(199,162,90,0.3)'
      : 'rgba(199,162,90,0.2)';
  }
});

/* ═══════════════════════════════════════════════════════
   SMOOTH ANCHOR SCROLLING
═══════════════════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* ═══════════════════════════════════════════════════════
   HERO PARALLAX
═══════════════════════════════════════════════════════ */
window.addEventListener('scroll', () => {
  const heroCards = document.querySelector('.hero-cards-stack');
  if (heroCards && window.scrollY < window.innerHeight) {
    heroCards.style.transform = `translateY(${window.scrollY * 0.08}px)`;
  }
});



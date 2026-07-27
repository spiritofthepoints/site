/* ═══════════════════════════════════════════════════════
   SPIRIT OF THE POINTS — Interactive Script
   Draw flow v2:
     1. Fan spread — all cards face-down
     2. User clicks → card flips immediately (free)
        Card name + subtitle appear below
        Email invite fades in below that
     3. User submits email →
        Content reveals immediately (optimistic)
        ConvertKit submission fires async in background
═══════════════════════════════════════════════════════ */

// ── Card Data ──
// For this proof-of-concept, all 7 fan positions map to Spirit Path.
// When the full deck is live, each entry will have its own data.
const SPIRIT_PATH = {
  name: "Spirit Path",
  subtitle: "Heart · 4 &nbsp;·&nbsp; Fire",
  image: "assets/card_spirit_path.jpg",
  cardLink: "https://spiritofthepoints.com/draw/spirit-path",
  audio: "assets/spirit_path_meditation.mp3",
  audioLabel: "Guided Meditation · Spirit Path, Heart 4",
  ritualTitle: "Reflect and Journal on Your Nature",
  passage: [
    { type: "verse", text: "Let your heart tug you toward what makes your nature sing.\nJust as the oak lives inside the acorn,\nyour path lives inside you." },
    { type: "prose", text: "It is not charted in maps or laid out by others. It pulses in the thrum of your chest, louder than fear, more vital than doubt." },
    { type: "prose", text: "Your heart knows the way. You only need to make space to hear it." },
    { type: "prose", text: "When you pause and turn inward, you are not searching for your path. You are remembering it." },
    { type: "prose", text: "In Taoism and Chinese medicine, the Heart is more than an organ. It is the home of Shen, your spirit. A vessel through which the Tao expresses itself." },
    { type: "prose", text: "When the Heart is clear and open, it becomes a compass, guiding you toward what resonates with your nature and aligning your action with the flow." },
    { type: "prose", text: "Clarity does not come from chasing or proving. It comes from returning. To stillness. To truth. To the quiet authority of your own knowing." },
    { type: "prose", text: "The artists, visionaries, and seekers we revere did not force their brilliance into being. They made space for it. They listened. They followed what felt true." },
    { type: "prose", text: "Your heart is the instrument through which the universe guides you, moment by moment. When you align with it, you become a tuning fork for the Tao." },
    { type: "prose", text: "The way this boundless energy moves through you is your destiny. Your spirit path." },
    { type: "verse", text: "Your heart is not lost.\nIt has never been lost.\nListen,\nand you will know the way." }
  ],
  ritual: [
    "In your journal, explore the deepest impulses of your nature. Ask yourself what truly matters to you beneath roles, achievements, and expectations. Imagine looking back at your life from its final chapter. What would you hope to be remembered for? What words would make you feel proud if they were spoken about you?",
    "Then bring this reflection into the present. Ask yourself what one simple, tangible action could express this deeper impulse in your life today.",
    "Carry these answers with you. Let them inform how you move, speak, and show up. Not as pressure, but as an inner compass pointing you toward what feels honest, resonant, and alive."
  ]
};

// All 7 fan positions use Spirit Path for this proof-of-concept
const cards = [
  SPIRIT_PATH,
  SPIRIT_PATH,
  SPIRIT_PATH,
  SPIRIT_PATH,
  SPIRIT_PATH,
  SPIRIT_PATH,
  SPIRIT_PATH
];

let selectedCardIndex = null;

/* ═══════════════════════════════════════════════════════
   FANNED ARC CARD DRAW
═══════════════════════════════════════════════════════ */

function buildCardFan() {
  const stage = document.querySelector('.card-fan-stage');
  if (!stage) return;
  stage.innerHTML = '';

  const count = cards.length;
  const isMobile = window.innerWidth < 600;

  const totalArcDeg = isMobile ? 50 : 70;
  const startAngle = -(totalArcDeg / 2);
  const angleStep = totalArcDeg / (count - 1);

  const stageW = stage.offsetWidth || 800;
  const radius = isMobile ? 320 : 420;
  const centerX = stageW / 2;
  const originY = isMobile ? 480 : 580;

  cards.forEach((card, i) => {
    const angleDeg = startAngle + i * angleStep;
    const angleRad = (angleDeg * Math.PI) / 180;

    const x = centerX + radius * Math.sin(angleRad);
    const y = originY - radius * Math.cos(angleRad);

    const cardW = isMobile ? 90 : 130;
    const cardH = cardW * 1.56;

    const el = document.createElement('div');
    el.className = 'fan-card';
    el.setAttribute('data-index', i);
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    el.setAttribute('aria-label', `Choose card ${i + 1}`);

    el.style.left = `${x - cardW / 2}px`;
    el.style.top = `${y - cardH}px`;
    el.style.width = `${cardW}px`;
    el.style.transform = `rotate(${angleDeg}deg)`;

    const distFromCenter = Math.abs(i - (count - 1) / 2);
    el.style.zIndex = Math.round(10 - distFromCenter * 2);

    el.innerHTML = `<img src="assets/card_back_moon.webp" alt="Oracle card face down" draggable="false" />`;

    el.addEventListener('mouseenter', () => {
      el.style.transform = `rotate(${angleDeg}deg) translateY(-22px) scale(1.06)`;
      el.style.zIndex = '20';
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
 * Fan fades out → step 2 appears → card flips immediately.
 */
function selectFanCard(index) {
  selectedCardIndex = index;
  const card = cards[index];

  const step1 = document.getElementById('draw-step-1');
  const step2 = document.getElementById('draw-step-2');

  // Preload the card front image
  const frontImg = document.getElementById('chosen-front-img');
  frontImg.src = card.image;
  frontImg.alt = card.name + ' oracle card';

  // Set card name and subtitle (visible after flip)
  document.getElementById('chosen-card-name').textContent = card.name;
  document.getElementById('chosen-card-subtitle').innerHTML = card.subtitle;

  // Animate fan out
  step1.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  step1.style.opacity = '0';
  step1.style.transform = 'translateY(-10px)';

  setTimeout(() => {
    step1.style.display = 'none';

    // Show step 2
    step2.style.display = 'block';
    step2.style.opacity = '0';
    requestAnimationFrame(() => {
      step2.style.transition = 'opacity 0.5s ease';
      step2.style.opacity = '1';
    });

    step2.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Flip the card after a short pause (let user see the back first)
    setTimeout(() => {
      const flipEl = document.getElementById('chosen-card-flip');
      flipEl.classList.add('flipped');

      // After flip completes, fade in the email invite
      setTimeout(() => {
        const invite = document.getElementById('draw-email-invite');
        invite.style.display = 'block';
        invite.style.opacity = '0';
        requestAnimationFrame(() => {
          invite.style.transition = 'opacity 0.6s ease';
          invite.style.opacity = '1';
        });
      }, 800); // wait for flip animation

    }, 600); // brief pause before flip

  }, 500);
}

/**
 * User submits email.
 * 1. Reveal content immediately (optimistic — never blocked by API).
 * 2. Fire ConvertKit submission async in background.
 */
function handleDrawSubmit(event) {
  event.preventDefault();
  const emailInput = document.getElementById('draw-email');
  const email = emailInput.value.trim();
  if (!email || selectedCardIndex === null) return;

  const card = cards[selectedCardIndex];

  // ── 1. Reveal content immediately ──
  revealCardContent(card);

  // ── 2. Fire ConvertKit async (non-blocking) ──
  submitToConvertKit(email, card.name, card.cardLink);
}

function revealCardContent(card) {
  // Hide the email form
  const invite = document.getElementById('draw-email-invite');
  invite.style.transition = 'opacity 0.3s ease';
  invite.style.opacity = '0';
  setTimeout(() => { invite.style.display = 'none'; }, 300);

  // Populate passage
  const passageEl = document.getElementById('draw-passage-text');
  passageEl.innerHTML = '';
  card.passage.forEach(block => {
    const p = document.createElement('p');
    if (block.type === 'verse') {
      p.className = 'passage-verse';
      p.innerHTML = block.text.replace(/\n/g, '<br>');
    } else {
      p.textContent = block.text;
    }
    passageEl.appendChild(p);
  });

  // Populate audio
  document.getElementById('draw-audio-label').textContent = card.audioLabel;
  const audioSource = document.getElementById('draw-audio-source');
  const audioPlayer = document.getElementById('draw-audio-player');
  audioSource.src = card.audio;
  audioPlayer.load();

  // Populate ritual
  document.getElementById('draw-ritual-title').textContent = card.ritualTitle;
  const ritualEl = document.getElementById('draw-ritual-text');
  ritualEl.innerHTML = '';
  card.ritual.forEach(para => {
    const p = document.createElement('p');
    p.textContent = para;
    ritualEl.appendChild(p);
  });

  // Show content
  const contentEl = document.getElementById('draw-content-reveal');
  contentEl.style.display = 'block';
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      contentEl.style.opacity = '1';
    });
  });

  // Scroll to content
  setTimeout(() => {
    contentEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

/**
 * Submit to ConvertKit via Netlify Function.
 * Fires silently — never blocks or errors to the user.
 */
function submitToConvertKit(email, cardName, cardLink) {
  fetch('/.netlify/functions/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, card_name: cardName, card_link: cardLink })
  })
  .then(res => {
    if (!res.ok) {
      console.warn('[ConvertKit] Subscription response not OK:', res.status);
    } else {
      console.log('[ConvertKit] Subscription submitted successfully.');
    }
  })
  .catch(err => {
    console.warn('[ConvertKit] Subscription failed silently:', err);
  });
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

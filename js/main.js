/* ═══════════════════════════════════════════════
   SFI — interactions & scroll choreography
   ═══════════════════════════════════════════════ */

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ── Nav: frosted glass on scroll ─────────────── */
const nav = document.getElementById("nav");
const onScrollNav = () => nav.classList.toggle("scrolled", window.scrollY > 24);
window.addEventListener("scroll", onScrollNav, { passive: true });
onScrollNav();

/* ── Mobile menu ──────────────────────────────── */
const burger = document.getElementById("burger");
const mobileMenu = document.getElementById("mobileMenu");
const toggleMenu = (open) => {
  burger.classList.toggle("open", open);
  mobileMenu.classList.toggle("open", open);
  document.body.style.overflow = open ? "hidden" : "";
};
burger.addEventListener("click", () => toggleMenu(!mobileMenu.classList.contains("open")));
mobileMenu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => toggleMenu(false)));

/* ── Reveal on scroll ─────────────────────────── */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        revealObserver.unobserve(e.target);
      }
    });
  },
  { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
);
document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

/* ── Statement: word-by-word illumination ─────── */
const statement = document.querySelector(".reveal-words");
if (statement) {
  // Wrap each word in a span, preserving <em> highlights.
  const wrapWords = (node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach((piece) => {
          if (/^\s+$/.test(piece) || piece === "") {
            frag.appendChild(document.createTextNode(piece));
          } else {
            const span = document.createElement("span");
            span.className = "w";
            span.textContent = piece;
            frag.appendChild(span);
          }
        });
        child.replaceWith(frag);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        wrapWords(child);
      }
    });
  };
  wrapWords(statement);

  const words = statement.querySelectorAll(".w");
  const lightWords = () => {
    const rect = statement.getBoundingClientRect();
    const progress = Math.min(1, Math.max(0,
      (window.innerHeight * 0.85 - rect.top) / (window.innerHeight * 0.7)
    ));
    const lit = Math.floor(progress * words.length);
    words.forEach((w, i) => w.classList.toggle("lit", i < lit));
  };
  window.addEventListener("scroll", lightWords, { passive: true });
  lightWords();
}

/* ── Scrollytelling: foam fills the wall ──────── */
const scrolly = document.querySelector(".scrolly");
const foamFill = document.getElementById("foamFill");
const sprayGun = document.getElementById("sprayGun");
const scrollyTitle = document.getElementById("scrollyTitle");
const scrollyDesc = document.getElementById("scrollyDesc");
const dots = document.querySelectorAll(".scrolly-progress .dot");

const steps = [
  {
    title: "Spray.",
    desc: "Applied as a fine liquid mist, it reaches places no batt or blanket ever could.",
  },
  {
    title: "Expand.",
    desc: "Within seconds it expands up to 100 times its volume, pressing into every crack, seam, and void.",
  },
  {
    title: "Seal.",
    desc: "It cures into a rigid, airtight, water-resistant barrier — bonded to your home for life.",
  },
];

let currentStep = -1;
const setStep = (i) => {
  if (i === currentStep) return;
  currentStep = i;
  scrollyTitle.textContent = steps[i].title;
  scrollyDesc.textContent = steps[i].desc;
  dots.forEach((d, di) => d.classList.toggle("active", di === i));
};

const onScrolly = () => {
  if (!scrolly) return;
  const rect = scrolly.getBoundingClientRect();
  const total = rect.height - window.innerHeight;
  const progress = Math.min(1, Math.max(0, -rect.top / total));

  // Foam rises with scroll; gun tracks the foam line and sprays while filling.
  foamFill.style.height = `${progress * 100}%`;
  const gunTop = 86 - progress * 78; // percent from top
  sprayGun.style.top = `${gunTop}%`;
  sprayGun.classList.toggle("spraying", progress > 0.02 && progress < 0.98);

  setStep(progress < 0.34 ? 0 : progress < 0.72 ? 1 : 2);
};
window.addEventListener("scroll", onScrolly, { passive: true });
onScrolly();

/* ── Stat counters ────────────────────────────── */
const animateCount = (el) => {
  const target = parseInt(el.dataset.count, 10);
  const prefix = el.dataset.prefix || "";
  const suffix = el.dataset.suffix || "";
  const duration = 1600;
  const start = performance.now();
  const tick = (now) => {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 4);
    el.textContent = `${prefix}${Math.round(eased * target)}${suffix}`;
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};
const statObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        animateCount(e.target);
        statObserver.unobserve(e.target);
      }
    });
  },
  { threshold: 0.6 }
);
document.querySelectorAll(".stat-number").forEach((el) => {
  if (reducedMotion) {
    el.textContent = `${el.dataset.prefix || ""}${el.dataset.count}${el.dataset.suffix || ""}`;
  } else {
    statObserver.observe(el);
  }
});

/* ── Hero canvas: drifting foam particles ─────── */
const canvas = document.getElementById("heroCanvas");
if (canvas && !reducedMotion) {
  const ctx = canvas.getContext("2d");
  let particles = [];
  let w, h;

  const resize = () => {
    w = canvas.width = canvas.offsetWidth * devicePixelRatio;
    h = canvas.height = canvas.offsetHeight * devicePixelRatio;
  };
  resize();
  window.addEventListener("resize", resize);

  const spawn = () => {
    const count = Math.min(70, Math.floor(w / 28));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: (Math.random() * 40 + 8) * devicePixelRatio,
      vx: (Math.random() - 0.5) * 0.18 * devicePixelRatio,
      vy: (-Math.random() * 0.25 - 0.05) * devicePixelRatio,
      alpha: Math.random() * 0.05 + 0.015,
      hue: Math.random() < 0.7 ? 36 : 22, // amber / orange
    }));
  };
  spawn();

  const frame = () => {
    ctx.clearRect(0, 0, w, h);
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.y + p.r < 0) { p.y = h + p.r; p.x = Math.random() * w; }
      if (p.x - p.r > w) p.x = -p.r;
      if (p.x + p.r < 0) p.x = w + p.r;
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
      g.addColorStop(0, `hsla(${p.hue}, 100%, 62%, ${p.alpha})`);
      g.addColorStop(1, `hsla(${p.hue}, 100%, 62%, 0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(frame);
  };
  frame();
}

/* ── Quote form (front-end confirmation) ──────── */
const form = document.getElementById("quoteForm");
if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = form.elements.name.value.trim().split(" ")[0] || "there";
    form.classList.add("sent");
    form.innerHTML = `
      <div style="text-align:center; padding: 40px 8px;">
        <div style="font-size:3rem;">✅</div>
        <h3 style="font-size:1.6rem; margin:16px 0 8px;">Thanks, ${name}!</h3>
        <p style="color: rgba(245,245,247,0.7);">
          Your request is in. We'll reach out within one business day to
          schedule your free assessment.
        </p>
      </div>`;
  });
}

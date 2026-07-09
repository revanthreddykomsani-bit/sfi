/* ═══════════════════════════════════════════════
   SFI — cinematic scroll choreography
   Scene 01 backdrop: generative dusk house painting
   ═══════════════════════════════════════════════ */

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ── Top bar ──────────────────────────────────── */
const bar = document.getElementById("bar");
const onScrollBar = () => bar.classList.toggle("scrolled", window.scrollY > 40);
window.addEventListener("scroll", onScrollBar, { passive: true });
onScrollBar();

/* ── Fade-up reveals ──────────────────────────── */
const fadeObserver = new IntersectionObserver(
  (entries) => entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add("visible");
      fadeObserver.unobserve(e.target);
    }
  }),
  { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
);
document.querySelectorAll(".fade-up").forEach((el) => fadeObserver.observe(el));

/* ═══ Dusk house painting ══════════════════════ */
(() => {
  const canvas = document.getElementById("duskCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const dpr = Math.min(devicePixelRatio || 1, 2);
  let W, H, still;

  /* Deterministic pseudo-random, so the scene is stable across redraws */
  const rand = (() => {
    let s = 42;
    return () => (s = (s * 16807) % 2147483647) / 2147483647;
  })();

  const ridge = (c, baseY, amp, seed, color) => {
    c.beginPath();
    c.moveTo(0, H);
    for (let x = 0; x <= W; x += 6) {
      const y = baseY
        + Math.sin(x * 0.0016 + seed) * amp
        + Math.sin(x * 0.0043 + seed * 2.7) * amp * 0.45
        + Math.sin(x * 0.011 + seed * 5.1) * amp * 0.16;
      c.lineTo(x, y);
    }
    c.lineTo(W, H);
    c.closePath();
    c.fillStyle = color;
    c.fill();
  };

  /* window grid inside a rect; some panes lit, some dark */
  const glazing = (c, x, y, w, h, cols, rows, litChance) => {
    const gap = Math.max(2, w * 0.012);
    const pw = (w - gap * (cols + 1)) / cols;
    const ph = (h - gap * (rows + 1)) / rows;
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const px = x + gap + i * (pw + gap);
        const py = y + gap + j * (ph + gap);
        if (rand() < litChance) {
          const g = c.createLinearGradient(px, py, px, py + ph);
          g.addColorStop(0, "#f3c67c");
          g.addColorStop(0.6, "#e09a3e");
          g.addColorStop(1, "#b4622a");
          c.fillStyle = g;
        } else {
          c.fillStyle = "rgba(38, 30, 24, 0.9)";
        }
        c.fillRect(px, py, pw, ph);
      }
    }
  };

  const paintStill = () => {
    still = document.createElement("canvas");
    still.width = W;
    still.height = H;
    const c = still.getContext("2d");

    /* sky: night blue fading into ember horizon */
    const sky = c.createLinearGradient(0, 0, 0, H * 0.72);
    sky.addColorStop(0, "#0b0d16");
    sky.addColorStop(0.5, "#1a1410");
    sky.addColorStop(0.88, "#3d2413");
    sky.addColorStop(1, "#5c341a");
    c.fillStyle = sky;
    c.fillRect(0, 0, W, H * 0.72);

    /* stars */
    for (let i = 0; i < 110; i++) {
      const x = rand() * W;
      const y = rand() * H * 0.38;
      c.fillStyle = `rgba(240, 232, 219, ${0.14 + rand() * 0.5})`;
      c.fillRect(x, y, dpr * (rand() < 0.12 ? 1.6 : 1), dpr);
    }

    /* mountain ridges, far to near */
    ridge(c, H * 0.50, H * 0.05, 1.3, "#181310");
    ridge(c, H * 0.58, H * 0.045, 4.6, "#120e0b");

    /* ground */
    const ground = c.createLinearGradient(0, H * 0.66, 0, H);
    ground.addColorStop(0, "#0f0b08");
    ground.addColorStop(1, "#0a0705");
    c.fillStyle = ground;
    c.fillRect(0, H * 0.64, W, H * 0.36);

    /* House metrics: heights follow S (not raw H) and widths stretch on
       portrait screens so the house keeps its proportions on phones. */
    const groundY = H * 0.685;
    const S = Math.min(H, W * 1.15);
    const ws = W < H ? Math.min(1.9, (H / W) * 0.75) : 1;
    const cx = W * 0.56;
    const hx = (off) => cx + off * W * ws;   /* x from house center */
    const hw = (frac) => frac * W * ws;      /* width */

    /* warm halo behind the house */
    const halo = c.createRadialGradient(cx, groundY - S * 0.12, 0, cx, groundY - S * 0.12, S * 0.42);
    halo.addColorStop(0, "rgba(224, 154, 62, 0.22)");
    halo.addColorStop(1, "rgba(224, 154, 62, 0)");
    c.fillStyle = halo;
    c.fillRect(0, 0, W, H);

    /* ── the house ── */
    const wall = "#141009";
    const slab = "#050403";

    /* left wing */
    const lwX = hx(-0.225), lwW = hw(0.135), lwTop = groundY - S * 0.155;
    c.fillStyle = wall;
    c.fillRect(lwX, lwTop, lwW, groundY - lwTop);
    glazing(c, lwX + lwW * 0.14, lwTop + S * 0.045, lwW * 0.72, S * 0.075, 3, 1, 0.85);
    c.fillStyle = slab;
    c.fillRect(lwX - hw(0.012), lwTop - S * 0.012, lwW + hw(0.024), S * 0.012);

    /* right wing */
    const rwX = hx(0.105), rwW = hw(0.115), rwTop = groundY - S * 0.125;
    c.fillStyle = wall;
    c.fillRect(rwX, rwTop, rwW, groundY - rwTop);
    glazing(c, rwX + rwW * 0.16, rwTop + S * 0.04, rwW * 0.68, S * 0.06, 2, 1, 0.9);
    c.fillStyle = slab;
    c.fillRect(rwX - hw(0.012), rwTop - S * 0.012, rwW + hw(0.024), S * 0.012);

    /* central glass atrium */
    const gaX = hx(-0.105), gaW = hw(0.215), gaTop = groundY - S * 0.28;
    c.save();
    c.shadowColor = "rgba(232, 163, 61, 0.55)";
    c.shadowBlur = 60 * dpr;
    c.fillStyle = "#20160c";
    c.fillRect(gaX, gaTop, gaW, groundY - gaTop);
    c.restore();
    glazing(c, gaX, gaTop, gaW, groundY - gaTop, 6, 5, 0.86);
    c.fillStyle = slab;
    c.fillRect(gaX - hw(0.016), gaTop - S * 0.014, gaW + hw(0.032), S * 0.014);

    /* chimney */
    c.fillStyle = wall;
    c.fillRect(hx(0.06), gaTop - S * 0.05, hw(0.018), S * 0.05);

    /* light spilling onto the ground */
    const spill = c.createLinearGradient(0, groundY, 0, groundY + H * 0.16);
    spill.addColorStop(0, "rgba(224, 154, 62, 0.28)");
    spill.addColorStop(1, "rgba(224, 154, 62, 0)");
    c.fillStyle = spill;
    c.fillRect(gaX - W * 0.05, groundY, gaW + W * 0.1, H * 0.16);

    /* horizon haze band */
    const haze = c.createLinearGradient(0, H * 0.56, 0, H * 0.7);
    haze.addColorStop(0, "rgba(150, 110, 70, 0)");
    haze.addColorStop(0.55, "rgba(150, 110, 70, 0.1)");
    haze.addColorStop(1, "rgba(150, 110, 70, 0)");
    c.fillStyle = haze;
    c.fillRect(0, H * 0.56, W, H * 0.14);
  };

  /* drifting fog blobs (animated layer) */
  let fogs = [];
  const spawnFog = () => {
    fogs = Array.from({ length: 7 }, () => ({
      x: rand() * W,
      y: H * (0.5 + rand() * 0.28),
      rx: W * (0.14 + rand() * 0.18),
      ry: H * (0.03 + rand() * 0.035),
      v: (0.08 + rand() * 0.12) * dpr,
      a: 0.035 + rand() * 0.05,
    }));
  };

  let mouseX = 0, mouseY = 0;
  window.addEventListener("pointermove", (e) => {
    mouseX = (e.clientX / innerWidth - 0.5) * 2;
    mouseY = (e.clientY / innerHeight - 0.5) * 2;
  }, { passive: true });

  const resize = () => {
    W = canvas.width = canvas.offsetWidth * dpr;
    H = canvas.height = canvas.offsetHeight * dpr;
    paintStill();
    spawnFog();
  };
  resize();
  window.addEventListener("resize", resize);

  let t = 0;
  const frame = () => {
    t += 1;
    /* slow breathing zoom + gentle pointer parallax */
    const zoom = 1.045 + Math.sin(t * 0.0016) * 0.02;
    const ox = mouseX * 9 * dpr;
    const oy = mouseY * 5 * dpr;

    ctx.clearRect(0, 0, W, H);
    ctx.save();
    ctx.translate(W / 2 - ox, H / 2 - oy);
    ctx.scale(zoom, zoom);
    ctx.translate(-W / 2, -H / 2);
    ctx.drawImage(still, 0, 0);

    /* fog */
    fogs.forEach((f) => {
      f.x += f.v;
      if (f.x - f.rx > W) f.x = -f.rx;
      const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.rx);
      g.addColorStop(0, `rgba(168, 132, 96, ${f.a})`);
      g.addColorStop(1, "rgba(168, 132, 96, 0)");
      ctx.fillStyle = g;
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.scale(1, f.ry / f.rx);
      ctx.translate(-f.x, -f.y);
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.rx, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    ctx.restore();

    if (!reducedMotion) requestAnimationFrame(frame);
  };

  if (reducedMotion) {
    ctx.drawImage(still, 0, 0);
  } else {
    requestAnimationFrame(frame);
  }
})();

/* ── Statement: word-by-word illumination ─────── */
const statement = document.querySelector(".reveal-words");
if (statement) {
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
      (innerHeight * 0.85 - rect.top) / (innerHeight * 0.7)
    ));
    const lit = Math.floor(progress * words.length);
    words.forEach((w, i) => w.classList.toggle("lit", i < lit));
  };
  window.addEventListener("scroll", lightWords, { passive: true });
  lightWords();
}

/* ── Scene 03: foam fills the wall ────────────── */
const scrolly = document.querySelector(".scrolly");
const foamFill = document.getElementById("foamFill");
const sprayGun = document.getElementById("sprayGun");
const scrollyTitle = document.getElementById("scrollyTitle");
const scrollyDesc = document.getElementById("scrollyDesc");
const ticks = document.querySelectorAll(".scrolly-progress .tick");

const steps = [
  { title: "Spray.", desc: "Applied as a fine mist, it reaches the places no batt or blanket ever could." },
  { title: "Expand.", desc: "Within seconds it swells to a hundred times its volume, pressing into every crack, seam and void." },
  { title: "Seal.", desc: "It cures into a rigid, airtight, water-shedding barrier — bonded to your home for life." },
];

let currentStep = -1;
const setStep = (i) => {
  if (i === currentStep) return;
  currentStep = i;
  scrollyTitle.textContent = steps[i].title;
  scrollyDesc.textContent = steps[i].desc;
  ticks.forEach((d, di) => d.classList.toggle("active", di <= i));
};

const onScrolly = () => {
  if (!scrolly) return;
  const rect = scrolly.getBoundingClientRect();
  const total = rect.height - innerHeight;
  const progress = Math.min(1, Math.max(0, -rect.top / total));
  foamFill.style.height = `${progress * 100}%`;
  sprayGun.style.top = `${86 - progress * 78}%`;
  sprayGun.classList.toggle("spraying", progress > 0.02 && progress < 0.98);
  setStep(progress < 0.34 ? 0 : progress < 0.72 ? 1 : 2);
};
window.addEventListener("scroll", onScrolly, { passive: true });
onScrolly();

/* ── Scene 04: counters ───────────────────────── */
const animateCount = (el) => {
  const target = parseInt(el.dataset.count, 10);
  const prefix = el.dataset.prefix || "";
  const suffix = el.dataset.suffix || "";
  const duration = 1800;
  const start = performance.now();
  const tickFn = (now) => {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 4);
    el.textContent = `${prefix}${Math.round(eased * target)}${suffix}`;
    if (t < 1) requestAnimationFrame(tickFn);
  };
  requestAnimationFrame(tickFn);
};
const numObserver = new IntersectionObserver(
  (entries) => entries.forEach((e) => {
    if (e.isIntersecting) {
      animateCount(e.target);
      numObserver.unobserve(e.target);
    }
  }),
  { threshold: 0.6 }
);
document.querySelectorAll(".num").forEach((el) => {
  if (reducedMotion) {
    el.textContent = `${el.dataset.prefix || ""}${el.dataset.count}${el.dataset.suffix || ""}`;
  } else {
    numObserver.observe(el);
  }
});

/* ── Quote form ───────────────────────────────── */
const form = document.getElementById("quoteForm");
if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = form.elements.name.value.trim().split(" ")[0] || "there";
    form.innerHTML = `
      <div class="form-sent">
        <h3 style="font-family: var(--serif); font-weight: 400; font-size: 2rem;">
          Thank you, ${name}.
        </h3>
        <p style="margin-top: 14px; color: var(--ivory-dim); font-size: 0.9rem; line-height: 1.8;">
          Your request is in. We'll reach out within one business day to
          schedule your free assessment.
        </p>
      </div>`;
  });
}

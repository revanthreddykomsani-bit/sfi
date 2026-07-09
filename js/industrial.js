/* ═══════════════════════════════════════════════
   SFI Industrial — Telangana edition
   Scene 01: robotic rig foam-coating a warehouse
   roof from the inside, painted live in canvas
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

/* ═══ SCENE 01 · warehouse night shift ═════════ */
(() => {
  const canvas = document.getElementById("warehouseCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const dpr = Math.min(devicePixelRatio || 1, 2);
  let W, H, still;

  const rand = (() => {
    let s = 7;
    return () => (s = (s * 16807) % 2147483647) / 2147483647;
  })();

  /* roof underside y at a given x (gable: apex centre, eaves at sides) */
  const EAVE_Y = 0.27, APEX_Y = 0.13, FLOOR_Y = 0.87;
  const roofY = (x) => {
    const t = Math.abs(x / W - 0.5) / 0.48;
    return H * (APEX_Y + Math.min(1, t) * (EAVE_Y - APEX_Y));
  };

  const paintStill = () => {
    still = document.createElement("canvas");
    still.width = W;
    still.height = H;
    const c = still.getContext("2d");
    const floorY = H * FLOOR_Y;

    /* air */
    const air = c.createLinearGradient(0, 0, 0, H);
    air.addColorStop(0, "#0a0d13");
    air.addColorStop(0.55, "#10151e");
    air.addColorStop(1, "#0b0e13");
    c.fillStyle = air;
    c.fillRect(0, 0, W, H);

    /* back wall with vertical sheet ribs */
    c.fillStyle = "#0e1219";
    c.fillRect(0, H * EAVE_Y, W, floorY - H * EAVE_Y);
    c.strokeStyle = "rgba(190, 210, 240, 0.022)";
    c.lineWidth = dpr;
    for (let x = 0; x < W; x += W * 0.018) {
      c.beginPath();
      c.moveTo(x, roofY(x));
      c.lineTo(x, floorY);
      c.stroke();
    }

    /* floor */
    const fl = c.createLinearGradient(0, floorY, 0, H);
    fl.addColorStop(0, "#11151c");
    fl.addColorStop(1, "#07090d");
    c.fillStyle = fl;
    c.fillRect(0, floorY, W, H - floorY);

    /* roof sheet: two slopes */
    c.strokeStyle = "#05070b";
    c.lineWidth = H * 0.016;
    c.beginPath();
    c.moveTo(W * 0.01, roofY(W * 0.01));
    c.lineTo(W * 0.5, H * APEX_Y);
    c.lineTo(W * 0.99, roofY(W * 0.99));
    c.stroke();

    /* purlins along the slopes */
    c.strokeStyle = "rgba(160, 180, 210, 0.06)";
    c.lineWidth = dpr * 1.4;
    for (let i = 1; i <= 6; i++) {
      const x1 = W * (0.5 - i * 0.078);
      const x2 = W * (0.5 + i * 0.078);
      [x1, x2].forEach((x) => {
        c.beginPath();
        c.moveTo(x, roofY(x) + H * 0.004);
        c.lineTo(x, roofY(x) + H * 0.018);
        c.stroke();
      });
    }

    /* trusses */
    c.strokeStyle = "rgba(170, 195, 230, 0.05)";
    c.lineWidth = dpr * 1.2;
    [0.14, 0.32, 0.5, 0.68, 0.86].forEach((fx) => {
      const x = W * fx;
      const chordY = H * (EAVE_Y + 0.015);
      c.beginPath();
      c.moveTo(x - W * 0.1, chordY);
      c.lineTo(x + W * 0.1, chordY);
      c.moveTo(x, chordY);
      c.lineTo(x, roofY(x));
      c.moveTo(x - W * 0.07, chordY);
      c.lineTo(x, roofY(x) + H * 0.01);
      c.moveTo(x + W * 0.07, chordY);
      c.lineTo(x, roofY(x) + H * 0.01);
      c.stroke();
    });

    /* racking with pallets, both ends */
    const rack = (x0, x1) => {
      const top = floorY - H * 0.3;
      c.fillStyle = "#0a0e15";
      for (let x = x0; x <= x1; x += (x1 - x0) / 3) {
        c.fillRect(x, top, dpr * 3, floorY - top);
      }
      for (let lvl = 0; lvl < 3; lvl++) {
        const y = floorY - (lvl + 1) * H * 0.095;
        c.fillRect(x0, y, x1 - x0, dpr * 2.4);
        /* boxes on this level */
        let bx = x0 + W * 0.008;
        while (bx < x1 - W * 0.02) {
          const bw = W * (0.02 + rand() * 0.022);
          const bh = H * (0.045 + rand() * 0.035);
          c.fillStyle = `rgba(${30 + rand() * 14 | 0}, ${36 + rand() * 12 | 0}, ${48 + rand() * 12 | 0}, 1)`;
          c.fillRect(bx, y - bh, bw, bh);
          c.fillStyle = "rgba(140, 165, 200, 0.05)";
          c.fillRect(bx, y - bh, bw, dpr * 2);
          c.fillStyle = "#0a0e15";
          bx += bw + W * 0.006;
        }
      }
    };
    rack(W * 0.05, W * 0.26);
    rack(W * 0.74, W * 0.95);

    /* high-bay lamp fixtures */
    [0.25, 0.5, 0.75].forEach((fx) => {
      const x = W * fx;
      const y = roofY(x) + H * 0.045;
      c.strokeStyle = "rgba(170, 195, 230, 0.14)";
      c.lineWidth = dpr;
      c.beginPath();
      c.moveTo(x, roofY(x));
      c.lineTo(x, y);
      c.stroke();
      c.fillStyle = "#1c232f";
      c.beginPath();
      c.moveTo(x - W * 0.011, y);
      c.lineTo(x + W * 0.011, y);
      c.lineTo(x + W * 0.007, y + H * 0.012);
      c.lineTo(x - W * 0.007, y + H * 0.012);
      c.closePath();
      c.fill();
    });
  };

  /* scallop offsets for the foam's lower edge, stable per index */
  const scallops = Array.from({ length: 80 }, () => 0.5 + Math.sin(Math.random() * 7) * 0.5);

  const drawFoam = (c, p) => {
    if (p <= 0) return;
    const xL = W * 0.02;
    const xR = W * 0.98;
    const front = xL + (xR - xL) * p;
    const th = H * 0.042;
    const step = W * 0.02;

    c.beginPath();
    c.moveTo(xL, roofY(xL) + H * 0.006);
    for (let x = xL; x <= front; x += step) {
      c.lineTo(x, roofY(x) + H * 0.006);
    }
    c.lineTo(front, roofY(front) + H * 0.006);
    /* lower scalloped edge, walking back */
    let i = Math.floor((front - xL) / step);
    for (let x = front; x >= xL; x -= step, i--) {
      const bump = scallops[Math.abs(i) % scallops.length] * H * 0.012;
      c.quadraticCurveTo(
        x + step / 2, roofY(x + step / 2) + th + bump * 1.6,
        x, roofY(x) + th + bump
      );
    }
    c.closePath();
    const g = c.createLinearGradient(0, H * APEX_Y, 0, H * (EAVE_Y + 0.09));
    g.addColorStop(0, "#f0d29e");
    g.addColorStop(0.6, "#dfae66");
    g.addColorStop(1, "#c08c46");
    c.fillStyle = g;
    c.save();
    c.shadowColor = "rgba(224, 154, 62, 0.35)";
    c.shadowBlur = 26 * dpr;
    c.fill();
    c.restore();

    /* fresh, bright leading edge */
    const fg = c.createRadialGradient(front, roofY(front) + th * 0.5, 0, front, roofY(front) + th * 0.5, th);
    fg.addColorStop(0, "rgba(255, 236, 190, 0.6)");
    fg.addColorStop(1, "rgba(255, 236, 190, 0)");
    c.fillStyle = fg;
    c.beginPath();
    c.arc(front, roofY(front) + th * 0.5, th, 0, Math.PI * 2);
    c.fill();
  };

  const drawRobot = (c, p, t) => {
    const xL = W * 0.02, xR = W * 0.98;
    const front = xL + (xR - xL) * Math.min(1, p);
    const rx = Math.min(Math.max(front, W * 0.09), W * 0.91);
    const floorY = H * FLOOR_Y;
    const targetY = roofY(front) + H * 0.05;
    const platY = targetY + H * 0.09;

    /* base */
    const bw = W * 0.062, bh = H * 0.03;
    c.fillStyle = "#1b2330";
    c.fillRect(rx - bw / 2, floorY - bh, bw, bh);
    c.fillStyle = "#e09a3e";
    c.fillRect(rx - bw / 2, floorY - bh, bw, dpr * 2.4);
    c.fillStyle = "#0c0f15";
    [rx - bw * 0.32, rx, rx + bw * 0.32].forEach((wx) => {
      c.beginPath();
      c.arc(wx, floorY, H * 0.011, 0, Math.PI * 2);
      c.fill();
    });

    /* scissor mast */
    c.strokeStyle = "#2a3444";
    c.lineWidth = dpr * 2.2;
    const segs = 4;
    const mastW = bw * 0.42;
    for (let s = 0; s < segs; s++) {
      const y1 = floorY - bh - ((floorY - bh - platY) / segs) * s;
      const y2 = floorY - bh - ((floorY - bh - platY) / segs) * (s + 1);
      c.beginPath();
      c.moveTo(rx - mastW / 2, y1); c.lineTo(rx + mastW / 2, y2);
      c.moveTo(rx + mastW / 2, y1); c.lineTo(rx - mastW / 2, y2);
      c.stroke();
    }

    /* platform + arm to nozzle */
    c.fillStyle = "#232d3c";
    c.fillRect(rx - bw * 0.36, platY - H * 0.012, bw * 0.72, H * 0.012);
    const elbowX = rx + (front - rx) * 0.4;
    const elbowY = platY - H * 0.045;
    const nozX = front - W * 0.004;
    const nozY = targetY;
    c.strokeStyle = "#39465c";
    c.lineWidth = dpr * 3;
    c.beginPath();
    c.moveTo(rx, platY - H * 0.012);
    c.lineTo(elbowX, elbowY);
    c.lineTo(nozX, nozY);
    c.stroke();
    c.fillStyle = "#4a5a74";
    [[rx, platY - H * 0.012], [elbowX, elbowY]].forEach(([jx, jy]) => {
      c.beginPath();
      c.arc(jx, jy, dpr * 3.4, 0, Math.PI * 2);
      c.fill();
    });
    c.fillStyle = "#141a24";
    c.fillRect(nozX - dpr * 4, nozY - dpr * 4, dpr * 8, dpr * 8);

    /* blinking beacon */
    const blink = 0.4 + 0.6 * Math.abs(Math.sin(t * 0.004));
    const beacon = c.createRadialGradient(rx, platY - H * 0.02, 0, rx, platY - H * 0.02, H * 0.02);
    beacon.addColorStop(0, `rgba(255, 140, 40, ${0.55 * blink})`);
    beacon.addColorStop(1, "rgba(255, 140, 40, 0)");
    c.fillStyle = beacon;
    c.beginPath();
    c.arc(rx, platY - H * 0.02, H * 0.02, 0, Math.PI * 2);
    c.fill();

    return { nozX, nozY, spraying: p > 0.005 && p < 1 };
  };

  /* spray particles */
  let sprayDots = [];
  const spray = (c, nx, ny, active) => {
    if (active) {
      for (let i = 0; i < 3; i++) {
        const roofTx = nx + (Math.random() - 0.35) * W * 0.02;
        sprayDots.push({
          x: nx, y: ny,
          tx: roofTx, ty: roofY(roofTx) + H * 0.012,
          life: 1,
        });
      }
      /* cone */
      const cone = c.createLinearGradient(nx, ny, nx, ny - H * 0.05);
      cone.addColorStop(0, "rgba(255, 232, 180, 0.5)");
      cone.addColorStop(1, "rgba(255, 232, 180, 0)");
      c.fillStyle = cone;
      c.beginPath();
      c.moveTo(nx - dpr * 2, ny);
      c.lineTo(nx + dpr * 2, ny);
      c.lineTo(nx + W * 0.014, ny - H * 0.05);
      c.lineTo(nx - W * 0.017, ny - H * 0.05);
      c.closePath();
      c.fill();
    }
    sprayDots = sprayDots.filter((d) => d.life > 0);
    sprayDots.forEach((d) => {
      d.x += (d.tx - d.x) * 0.22;
      d.y += (d.ty - d.y) * 0.22;
      d.life -= 0.06;
      c.fillStyle = `rgba(255, 230, 175, ${d.life * 0.7})`;
      c.fillRect(d.x, d.y, dpr * 1.6, dpr * 1.6);
    });
  };

  /* dust motes in the lamp cones */
  let motes = [];
  const spawnMotes = () => {
    motes = Array.from({ length: 36 }, () => {
      const lamp = [0.25, 0.5, 0.75][Math.floor(rand() * 3)];
      return {
        x: W * (lamp + (rand() - 0.5) * 0.07),
        y: H * (0.3 + rand() * 0.5),
        v: (0.05 + rand() * 0.1) * dpr,
        a: 0.03 + rand() * 0.08,
        lamp,
      };
    });
  };

  const lampCones = (c, t) => {
    [0.25, 0.5, 0.75].forEach((fx, li) => {
      const x = W * fx;
      const y = roofY(x) + H * 0.057;
      const flicker = 0.92 + 0.08 * Math.sin(t * 0.0021 + li * 4);
      const g = c.createLinearGradient(0, y, 0, H * FLOOR_Y);
      g.addColorStop(0, `rgba(196, 218, 255, ${0.075 * flicker})`);
      g.addColorStop(1, "rgba(196, 218, 255, 0)");
      c.fillStyle = g;
      c.beginPath();
      c.moveTo(x - W * 0.012, y);
      c.lineTo(x + W * 0.012, y);
      c.lineTo(x + W * 0.075, H * FLOOR_Y);
      c.lineTo(x - W * 0.075, H * FLOOR_Y);
      c.closePath();
      c.fill();
      /* pool on the floor */
      const pool = c.createRadialGradient(x, H * FLOOR_Y, 0, x, H * FLOOR_Y, W * 0.08);
      pool.addColorStop(0, `rgba(196, 218, 255, ${0.05 * flicker})`);
      pool.addColorStop(1, "rgba(196, 218, 255, 0)");
      c.fillStyle = pool;
      c.beginPath();
      c.ellipse(x, H * FLOOR_Y, W * 0.08, H * 0.02, 0, 0, Math.PI * 2);
      c.fill();
    });
    motes.forEach((m) => {
      m.y += m.v;
      if (m.y > H * FLOOR_Y) m.y = H * 0.3;
      c.fillStyle = `rgba(210, 226, 255, ${m.a})`;
      c.fillRect(m.x, m.y, dpr, dpr);
    });
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
    spawnMotes();
    sprayDots = [];
  };
  resize();
  window.addEventListener("resize", resize);

  const CYCLE = 34000, HOLD = 4000;
  const start = performance.now();

  const frame = (now) => {
    const t = now - start;
    const phase = t % (CYCLE + HOLD);
    const p = Math.min(1, phase / CYCLE);

    ctx.clearRect(0, 0, W, H);
    ctx.save();
    ctx.translate(-mouseX * 7 * dpr, -mouseY * 4 * dpr);
    ctx.drawImage(still, 0, 0);
    lampCones(ctx, t);
    drawFoam(ctx, p);
    const rig = drawRobot(ctx, p, t);
    spray(ctx, rig.nozX, rig.nozY, rig.spraying);
    ctx.restore();

    requestAnimationFrame(frame);
  };

  if (reducedMotion) {
    ctx.drawImage(still, 0, 0);
    lampCones(ctx, 0);
    drawFoam(ctx, 1);
    drawRobot(ctx, 0.72, 0);
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

/* ═══ SCENE 03 · robot strip: scan → spray → cure ═══ */
(() => {
  const section = document.querySelector(".rscrolly");
  const canvas = document.getElementById("robotStrip");
  if (!section || !canvas) return;
  const ctx = canvas.getContext("2d");
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const title = document.getElementById("robotTitle");
  const desc = document.getElementById("robotDesc");
  const ticks = section.querySelectorAll(".tick");
  let W, H;

  const steps = [
    { title: "Scan.", desc: "The rig laser-maps every purlin, seam and fastener on the underside of your roof before a single drop is sprayed." },
    { title: "Spray.", desc: "A metered 50 mm closed-cell coat, laid in overlapping robotic passes — the same thickness at the eave as at the ridge." },
    { title: "Cure.", desc: "Minutes later it is a rigid, seamless thermal shell bonded to the sheet. The 70°C radiator over your goods is gone." },
  ];
  let currentStep = -1;
  const setStep = (i) => {
    if (i === currentStep) return;
    currentStep = i;
    title.textContent = steps[i].title;
    desc.textContent = steps[i].desc;
    ticks.forEach((d, di) => d.classList.toggle("active", di <= i));
  };

  const scallops = Array.from({ length: 60 }, () => Math.random());

  const resize = () => {
    W = canvas.width = canvas.offsetWidth * dpr;
    H = canvas.height = canvas.offsetHeight * dpr;
  };
  resize();
  window.addEventListener("resize", resize);

  const SHEET_Y = 0.14, RAIL_Y = 0.4;

  const draw = (P) => {
    ctx.clearRect(0, 0, W, H);

    /* air */
    const air = ctx.createLinearGradient(0, 0, 0, H);
    air.addColorStop(0, "#0d1118");
    air.addColorStop(1, "#0a0d13");
    ctx.fillStyle = air;
    ctx.fillRect(0, 0, W, H);

    /* corrugated sheet */
    ctx.fillStyle = "#1d2531";
    ctx.fillRect(0, 0, W, H * SHEET_Y);
    ctx.strokeStyle = "#2c3648";
    ctx.lineWidth = dpr * 1.4;
    ctx.beginPath();
    const amp = H * 0.022, per = W * 0.024;
    ctx.moveTo(0, H * SHEET_Y);
    for (let x = 0; x <= W; x += per) {
      ctx.quadraticCurveTo(x + per / 4, H * SHEET_Y + amp, x + per / 2, H * SHEET_Y);
      ctx.quadraticCurveTo(x + (3 * per) / 4, H * SHEET_Y - amp * 0.4, x + per, H * SHEET_Y);
    }
    ctx.stroke();

    /* phases */
    const scanP = Math.min(1, P / 0.3);
    const sprayP = Math.min(1, Math.max(0, (P - 0.3) / 0.45));
    const cureP = Math.min(1, Math.max(0, (P - 0.75) / 0.25));

    /* trolley x for each phase */
    let tx;
    if (P < 0.3) tx = W * 0.04 + scanP * W * 0.92;
    else if (P < 0.75) tx = W * 0.04 + sprayP * W * 0.92;
    else tx = W * 0.96;

    /* foam */
    if (sprayP > 0) {
      const front = W * 0.04 + sprayP * W * 0.92;
      const thBase = H * 0.2;
      ctx.beginPath();
      ctx.moveTo(0, H * SHEET_Y + amp);
      ctx.lineTo(front, H * SHEET_Y + amp);
      const step = W * 0.018;
      let i = Math.floor(front / step);
      for (let x = front; x >= 0; x -= step, i--) {
        const bump = scallops[Math.abs(i) % scallops.length] * H * 0.024;
        ctx.quadraticCurveTo(
          x + step / 2, H * SHEET_Y + thBase + bump * 1.4,
          x, H * SHEET_Y + thBase + bump
        );
      }
      ctx.closePath();
      /* cure phase shifts the foam from hot fresh amber to matte cream */
      const hot = 1 - cureP * 0.55;
      const g = ctx.createLinearGradient(0, H * SHEET_Y, 0, H * 0.5);
      g.addColorStop(0, `rgba(${240}, ${205 + cureP * 20 | 0}, ${150 + cureP * 40 | 0}, 1)`);
      g.addColorStop(1, `rgba(${205 - cureP * 15 | 0}, ${150 + cureP * 15 | 0}, ${85 + cureP * 40 | 0}, 1)`);
      ctx.fillStyle = g;
      ctx.save();
      ctx.shadowColor = `rgba(224, 154, 62, ${0.4 * hot})`;
      ctx.shadowBlur = 22 * dpr;
      ctx.fill();
      ctx.restore();

      if (sprayP < 1 && cureP === 0) {
        const fg = ctx.createRadialGradient(front, H * SHEET_Y + thBase * 0.5, 0, front, H * SHEET_Y + thBase * 0.5, thBase * 0.7);
        fg.addColorStop(0, "rgba(255, 238, 195, 0.7)");
        fg.addColorStop(1, "rgba(255, 238, 195, 0)");
        ctx.fillStyle = fg;
        ctx.beginPath();
        ctx.arc(front, H * SHEET_Y + thBase * 0.5, thBase * 0.7, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    /* scan beam + mapped markers */
    if (P < 0.3) {
      const g = ctx.createLinearGradient(tx, H * RAIL_Y, tx, H * SHEET_Y);
      g.addColorStop(0, "rgba(130, 190, 255, 0.02)");
      g.addColorStop(1, "rgba(130, 190, 255, 0.3)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(tx, H * RAIL_Y);
      ctx.lineTo(tx - W * 0.07, H * SHEET_Y + amp);
      ctx.lineTo(tx + W * 0.07, H * SHEET_Y + amp);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "rgba(130, 190, 255, 0.55)";
      for (let x = W * 0.04; x < tx; x += W * 0.045) {
        ctx.fillRect(x, H * SHEET_Y + amp + dpr * 3, dpr * 2, dpr * 2);
      }
    }

    /* rail */
    ctx.fillStyle = "#242e3e";
    ctx.fillRect(0, H * RAIL_Y, W, dpr * 3);

    /* trolley */
    const ty = H * RAIL_Y;
    ctx.fillStyle = "#1b2330";
    ctx.fillRect(tx - W * 0.028, ty + dpr * 3, W * 0.056, H * 0.09);
    ctx.fillStyle = "#e09a3e";
    ctx.fillRect(tx - W * 0.028, ty + dpr * 3, W * 0.056, dpr * 2.4);
    ctx.fillStyle = "#0c0f15";
    [tx - W * 0.018, tx + W * 0.018].forEach((wx) => {
      ctx.beginPath();
      ctx.arc(wx, ty + dpr * 2, dpr * 4, 0, Math.PI * 2);
      ctx.fill();
    });
    /* arm up to the sheet */
    ctx.strokeStyle = "#39465c";
    ctx.lineWidth = dpr * 3;
    ctx.beginPath();
    ctx.moveTo(tx, ty + H * 0.05);
    ctx.lineTo(tx, H * SHEET_Y + H * 0.1);
    ctx.stroke();
    ctx.fillStyle = "#141a24";
    ctx.fillRect(tx - dpr * 4, H * SHEET_Y + H * 0.085, dpr * 8, dpr * 8);

    /* spray cone while spraying */
    if (P >= 0.3 && P < 0.75 && sprayP < 1) {
      const ny = H * SHEET_Y + H * 0.085;
      const cone = ctx.createLinearGradient(tx, ny, tx, H * SHEET_Y);
      cone.addColorStop(0, "rgba(255, 232, 180, 0.55)");
      cone.addColorStop(1, "rgba(255, 232, 180, 0)");
      ctx.fillStyle = cone;
      ctx.beginPath();
      ctx.moveTo(tx - dpr * 2, ny);
      ctx.lineTo(tx + dpr * 2, ny);
      ctx.lineTo(tx + W * 0.03, H * SHEET_Y + amp);
      ctx.lineTo(tx - W * 0.03, H * SHEET_Y + amp);
      ctx.closePath();
      ctx.fill();
    }

    /* cure wisps */
    if (cureP > 0 && cureP < 1) {
      ctx.fillStyle = `rgba(220, 225, 235, ${0.08 * (1 - cureP)})`;
      for (let x = W * 0.1; x < W; x += W * 0.16) {
        ctx.beginPath();
        ctx.ellipse(x, H * (SHEET_Y + 0.24) - cureP * H * 0.05, W * 0.02, H * 0.03, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    setStep(P < 0.3 ? 0 : P < 0.75 ? 1 : 2);
  };

  const onScroll = () => {
    const rect = section.getBoundingClientRect();
    const total = rect.height - innerHeight;
    const P = Math.min(1, Math.max(0, -rect.top / total));
    draw(P);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();

/* ── Counters ─────────────────────────────────── */
const animateCount = (el) => {
  const target = parseInt(el.dataset.count, 10);
  const prefix = el.dataset.prefix || "";
  const suffix = el.dataset.suffix || "";
  const duration = 1800;
  const startT = performance.now();
  const fmt = (n) => n >= 1000 ? n.toLocaleString("en-IN") : n;
  const tickFn = (now) => {
    const t = Math.min(1, (now - startT) / duration);
    const eased = 1 - Math.pow(1 - t, 4);
    el.textContent = `${prefix}${fmt(Math.round(eased * target))}${suffix}`;
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
    const n = parseInt(el.dataset.count, 10);
    el.textContent = `${el.dataset.prefix || ""}${n >= 1000 ? n.toLocaleString("en-IN") : n}${el.dataset.suffix || ""}`;
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
          Your survey request is in. Our Hyderabad team will call within one
          business day to schedule a visit.
        </p>
      </div>`;
  });
}

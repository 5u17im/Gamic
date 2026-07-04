(function () {
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const BRIDGE_ORIGIN = window.location.origin;

  function send(msg) {
    window.parent.postMessage({ ...msg, timestamp: Date.now() }, BRIDGE_ORIGIN);
  }

  const COLS = 4;
  const ROWS = 4;
  const TOTAL = COLS * ROWS;
  const CARD_COLORS = ["#6C5CE7", "#00CEC9", "#FDCB6E", "#E17055", "#FD79A8", "#00B894", "#0984E3", "#F39C12"];

  const SPECIALS = [
    { name: "Extra Time", icon: "⏱", effect: () => { timeLeft += 15; showMessage("+15s Extra!"); } },
    { name: "Double Score", icon: "×2", effect: () => { multiplier = 3; showMessage("×3 Puntos!"); } },
    { name: "Free Peek", icon: "👁", effect: () => { peeksLeft += 2; showMessage("👁 2 Peeks!"); } },
    { name: "Shuffle", icon: "🔀", effect: () => {
      const activeCards = cards.filter((c) => !c.matched);
      const indices = activeCards.map((c) => c.pairIdx);
      shuffle(indices);
      activeCards.forEach((c, i) => { c.pairIdx = indices[i]; c.flipped = false; });
      showMessage("🔀 Shuffled!");
    }},
  ];

  let cards = [];
  let flipped = [];
  let matched = 0;
  let score = 0;
  let timeLeft = 90;
  let running = false;
  let gameOver = false;
  let canFlip = true;
  let multiplier = 1;
  let peeksLeft = 0;
  let message = "";
  let messageTimer = 0;
  let particles = [];
  let matchFlash = null;
  let cardAnimations = {};

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.scale(dpr, dpr);
  }
  window.addEventListener("resize", resize);

  function init() {
    const pairs = [];
    for (let i = 0; i < TOTAL / 2; i++) pairs.push(i, i);
    shuffle(pairs);
    cards = pairs.map((pairIdx, i) => ({
      id: i, pairIdx,
      color: CARD_COLORS[pairIdx % CARD_COLORS.length],
      special: i < 4 ? SPECIALS[i % SPECIALS.length] : null,
      flipped: false, matched: false,
      flipProgress: 0, isFlipping: false,
    }));
    flipped = []; matched = 0; score = 0; timeLeft = 90;
    gameOver = false; canFlip = true; multiplier = 1; peeksLeft = 0;
    message = ""; messageTimer = 0; particles = []; matchFlash = null;
    cardAnimations = {};
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  function showMessage(text) { message = text; messageTimer = 60; }

  function spawnParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 20 + Math.random() * 50;
      particles.push({
        x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        life: 0.3 + Math.random() * 0.4, maxLife: 0.3 + Math.random() * 0.4,
        color, r: 2 + Math.random() * 3,
      });
    }
  }

  function handleClick(clientX, clientY) {
    if (!running || gameOver || !canFlip) return;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const padding = 20;
    const gap = 8;
    const totalGapX = (COLS - 1) * gap;
    const totalGapY = (ROWS - 1) * gap;
    const cardW = (w - padding * 2 - totalGapX) / COLS;
    const cardH = (h - padding * 2 - totalGapY - 60) / ROWS;
    const startX = padding;
    const startY = padding + 40;

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const idx = r * COLS + c;
        const card = cards[idx];
        if (card.matched || card.flipped) continue;
        const x = startX + c * (cardW + gap);
        const y = startY + r * (cardH + gap);
        if (clientX >= x && clientX <= x + cardW && clientY >= y && clientY <= y + cardH) {
          flipCard(idx);
          return;
        }
      }
    }
  }

  function flipCard(idx) {
    if (flipped.length >= 2) return;
    const card = cards[idx];
    if (card.flipped || card.matched) return;
    card.isFlipping = true;
    card.flipProgress = 0;
    card.flipped = true;
    flipped.push(idx);

    if (flipped.length === 2) {
      canFlip = false;
      setTimeout(() => {
        const c1 = cards[flipped[0]];
        const c2 = cards[flipped[1]];

        if (c1.pairIdx === c2.pairIdx) {
          matched++;
          c1.matched = true; c2.matched = true;
          const pos1 = getCardPos(flipped[0]);
          const pos2 = getCardPos(flipped[1]);
          spawnParticles(pos1.x + pos1.w / 2, pos1.y + pos1.h / 2, "#FDCB6E", 12);
          spawnParticles(pos2.x + pos2.w / 2, pos2.y + pos2.h / 2, "#FDCB6E", 12);
          matchFlash = { life: 0.5, maxLife: 0.5 };

          const baseScore = 50 + (c1.special ? 100 : 0) + (c2.special ? 100 : 0);
          score += baseScore * multiplier;
          multiplier = 1;
          send({ type: "score", payload: { score } });
          flipped = [];
          canFlip = true;

          if (c1.special) c1.special.effect();
          if (c2.special) c2.special.effect();

          if (matched === TOTAL / 2) {
            gameOver = true; running = false;
            send({ type: "gameover", payload: { score } });
          }
        } else {
          setTimeout(() => {
            c1.flipped = false; c2.flipped = false;
            c1.isFlipping = true; c2.isFlipping = true;
            c1.flipProgress = 0; c2.flipProgress = 0;
            flipped = []; canFlip = true;
          }, 600);
        }
      }, 300);
    }

    if (peeksLeft > 0 && flipped.length === 1) peeksLeft--;
  }

  function getCardPos(idx) {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const padding = 20;
    const gap = 8;
    const totalGapX = (COLS - 1) * gap;
    const totalGapY = (ROWS - 1) * gap;
    const cardW = (w - padding * 2 - totalGapX) / COLS;
    const cardH = (h - padding * 2 - totalGapY - 60) / ROWS;
    const r = Math.floor(idx / COLS);
    const c = idx % COLS;
    const startX = padding;
    const startY = padding + 40;
    return { x: startX + c * (cardW + gap), y: startY + r * (cardH + gap), w: cardW, h: cardH };
  }

  function update(dt) {
    if (!running || gameOver) return;
    timeLeft -= dt;
    if (timeLeft <= 0) { timeLeft = 0; gameOver = true; running = false; send({ type: "gameover", payload: { score } }); }
    if (messageTimer > 0) messageTimer--;

    cards.forEach((c) => {
      if (c.isFlipping) {
        c.flipProgress += dt * 3;
        if (c.flipProgress >= 1) { c.flipProgress = 1; c.isFlipping = false; }
      }
    });

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.life -= dt; p.vx *= 0.95; p.vy *= 0.95;
      if (p.life <= 0) particles.splice(i, 1);
    }

    if (matchFlash) {
      matchFlash.life -= dt;
      if (matchFlash.life <= 0) matchFlash = null;
    }
  }

  function drawCard(x, y, w, h, card) {
    // Flip animation
    const scaleX = card.isFlipping ? Math.abs(Math.cos(card.flipProgress * Math.PI / 2)) : (card.flipped || card.matched ? 1 : 1);
    const isFlipped = card.flipped || card.matched;

    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    ctx.scale(isFlipped ? 1 : scaleX, 1);

    ctx.beginPath();
    ctx.roundRect(-w / 2, -h / 2, w, h, 8);

    if (card.matched) {
      ctx.fillStyle = `${card.color}30`;
      ctx.fill();
      ctx.strokeStyle = `${card.color}60`;
      ctx.lineWidth = 1;
      ctx.stroke();
    } else if (isFlipped) {
      ctx.fillStyle = card.color;
      ctx.fill();
      ctx.shadowColor = card.color;
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#fff";
      ctx.font = `${Math.min(w, h) * 0.17}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      if (card.special) {
        ctx.fillStyle = "#ffd700";
        ctx.font = `${Math.min(w, h) * 0.3}px sans-serif`;
        ctx.fillText(card.special.icon, 0, -8);
        ctx.fillStyle = "#fff";
        ctx.font = `${Math.min(w, h) * 0.12}px sans-serif`;
        ctx.fillText(card.special.name, 0, 14);
      }
    } else {
      ctx.fillStyle = "#1e1e32";
      ctx.fill();
      ctx.strokeStyle = "#2a2a4a";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = "#4a4a6a";
      ctx.font = `${Math.min(w, h) * 0.35}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("?", 0, 0);
    }

    ctx.restore();

    // Peek indicator
    if (!card.flipped && !card.matched && peeksLeft > 0 && flipped.length === 1) {
      ctx.fillStyle = "#ffd70040";
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 8);
      ctx.fill();
    }
  }

  function draw() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);

    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "#0a0a1a");
    grad.addColorStop(1, "#0f0520");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    const padding = 20;
    const gap = 8;
    const totalGapX = (COLS - 1) * gap;
    const totalGapY = (ROWS - 1) * gap;
    const cardW = (w - padding * 2 - totalGapX) / COLS;
    const cardH = (h - padding * 2 - totalGapY - 60) / ROWS;
    const startX = padding;
    const startY = padding + 40;

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const idx = r * COLS + c;
        const card = cards[idx];
        const x = startX + c * (cardW + gap);
        const y = startY + r * (cardH + gap);
        drawCard(x, y, cardW, cardH, card);
      }
    }

    // Particles
    particles.forEach((p) => {
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Match flash
    if (matchFlash) {
      ctx.fillStyle = `rgba(253,203,110,${matchFlash.life / matchFlash.maxLife * 0.3})`;
      ctx.fillRect(0, 0, w, h);
    }

    // HUD
    ctx.fillStyle = "#fff";
    ctx.font = "14px monospace";
    ctx.textAlign = "left";
    ctx.fillText("Puntos: " + score, 16, 24);
    ctx.textAlign = "right";
    ctx.fillText("Tiempo: " + Math.ceil(timeLeft) + "s  Pares: " + matched + "/8", w - 16, 24);

    if (messageTimer > 0) {
      ctx.fillStyle = "#FDCB6E";
      ctx.font = "bold 16px monospace";
      ctx.textAlign = "center";
      ctx.globalAlpha = Math.min(1, messageTimer / 30);
      ctx.fillText(message, w / 2, h - 16);
      ctx.globalAlpha = 1;
    }

    if (!running && gameOver) {
      ctx.fillStyle = "rgba(0,0,0,0.7)";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 26px monospace";
      ctx.textAlign = "center";
      ctx.shadowColor = "#6C5CE7";
      ctx.shadowBlur = 20;
      const label = matched === TOTAL / 2 ? "¡Ganaste!" : "Juego terminado";
      ctx.fillText(label, w / 2, h / 2 - 20);
      ctx.shadowBlur = 0;
      ctx.font = "16px monospace";
      ctx.fillText("Puntuación: " + score, w / 2, h / 2 + 20);
    }
  }

  function loop() {
    update(1 / 60);
    draw();
    requestAnimationFrame(loop);
  }

  canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    handleClick(e.clientX - rect.left, e.clientY - rect.top);
  });

  canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    handleClick(touch.clientX - rect.left, touch.clientY - rect.top);
  }, { passive: false });

  window.addEventListener("message", (e) => {
    if (e.data?.type === "start" && !running) {
      running = true; init();
      send({ type: "ready" });
    }
    if (e.data?.type === "restart") {
      running = true; init();
      send({ type: "ready" });
    }
    if (e.data?.type === "pause") running = false;
    if (e.data?.type === "resume") running = true;
  });

  resize();
  init();
  send({ type: "ready" });
  loop();
})();

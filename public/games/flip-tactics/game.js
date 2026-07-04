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
    { name: "Extra Time", icon: "⏱", effect: () => { addTime(); } },
    { name: "Double Score", icon: "×2", effect: () => { doubleScore(); } },
    { name: "Free Peek", icon: "👁", effect: () => { freePeek(); } },
    { name: "Shuffle", icon: "🔀", effect: () => { shuffleBoard(); } },
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
  let currentSpecials = [];

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.scale(dpr, dpr);
  }
  window.addEventListener("resize", resize);

  function init() {
    const pairs = [];
    for (let i = 0; i < TOTAL / 2; i++) {
      pairs.push(i, i);
    }
    shuffle(pairs);
    cards = pairs.map((pairIdx, i) => ({
      id: i,
      pairIdx,
      color: CARD_COLORS[pairIdx % CARD_COLORS.length],
      special: i < 4 ? SPECIALS[i % SPECIALS.length] : null,
      flipped: false,
      matched: false,
    }));
    flipped = [];
    matched = 0;
    score = 0;
    timeLeft = 90;
    gameOver = false;
    canFlip = true;
    multiplier = 1;
    peeksLeft = 0;
    message = "";
    messageTimer = 0;
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  function addTime() { timeLeft += 15; showMessage("+15s Extra!"); }

  function doubleScore() { multiplier = 3; showMessage("×3 Puntos!"); }

  function freePeek() { peeksLeft += 2; showMessage("👁 2 Peeks!"); }

  function shuffleBoard() {
    const activeCards = cards.filter((c) => !c.matched);
    const indices = activeCards.map((c) => c.pairIdx);
    shuffle(indices);
    activeCards.forEach((c, i) => { c.pairIdx = indices[i]; c.flipped = false; });
    showMessage("🔀 Shuffled!");
  }

  function showMessage(text) {
    message = text;
    messageTimer = 60;
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
        if (card.matched) continue;
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
    const card = cards[idx];
    if (card.flipped) return;
    if (flipped.length >= 2) return;

    card.flipped = true;
    flipped.push(idx);

    if (flipped.length === 2) {
      canFlip = false;
      const c1 = cards[flipped[0]];
      const c2 = cards[flipped[1]];

      if (c1.pairIdx === c2.pairIdx) {
        matched++;
        c1.matched = true;
        c2.matched = true;
        const baseScore = 50 + (c1.special ? 100 : 0) + (c2.special ? 100 : 0);
        score += baseScore * multiplier;
        multiplier = 1;
        send({ type: "score", payload: { score } });
        flipped = [];
        canFlip = true;

        if (c1.special) c1.special.effect();
        if (c2.special) c2.special.effect();

        if (matched === TOTAL / 2) {
          gameOver = true;
          running = false;
          send({ type: "gameover", payload: { score } });
        }
      } else {
        setTimeout(() => {
          c1.flipped = false;
          c2.flipped = false;
          flipped = [];
          canFlip = true;
        }, 800);
      }
    }

    if (peeksLeft > 0 && flipped.length === 1) {
      peeksLeft--;
    }
  }

  function update(dt) {
    if (!running || gameOver) return;
    timeLeft -= dt;
    if (timeLeft <= 0) {
      timeLeft = 0;
      gameOver = true;
      running = false;
      send({ type: "gameover", payload: { score } });
    }
    if (messageTimer > 0) messageTimer--;
  }

  function draw() {
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

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#0a0a1a";
    ctx.fillRect(0, 0, w, h);

    // Cards
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const idx = r * COLS + c;
        const card = cards[idx];
        const x = startX + c * (cardW + gap);
        const y = startY + r * (cardH + gap);

        ctx.beginPath();
        ctx.roundRect(x, y, cardW, cardH, 8);
        if (card.matched) {
          ctx.fillStyle = `${card.color}40`;
          ctx.fill();
          ctx.fillStyle = "#4a4a6a";
        } else if (card.flipped || (peeksLeft > 0 && flipped.length === 1 && idx === flipped[0])) {
          ctx.fillStyle = card.color;
          ctx.fill();
          ctx.fillStyle = "#fff";
          ctx.font = `${Math.min(cardW, cardH) * 0.3}px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          if (card.special) {
            ctx.fillStyle = "#ffd700";
            ctx.fillText(card.special.icon, x + cardW / 2, y + cardH / 2 - 12);
            ctx.fillStyle = "#fff";
            ctx.font = "10px sans-serif";
            ctx.fillText(card.special.name, x + cardW / 2, y + cardH / 2 + 14);
          }
        } else {
          ctx.fillStyle = "#1e1e32";
          ctx.fill();
          ctx.fillStyle = "#4a4a6a";
          ctx.font = "20px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("?", x + cardW / 2, y + cardH / 2);
        }
        ctx.strokeStyle = card.flipped || card.matched ? "transparent" : "#2a2a4a";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
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
      ctx.font = "18px monospace";
      ctx.textAlign = "center";
      ctx.globalAlpha = Math.min(1, messageTimer / 30);
      ctx.fillText(message, w / 2, h - 16);
      ctx.globalAlpha = 1;
    }

    if (!running && gameOver) {
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#fff";
      ctx.font = "24px monospace";
      ctx.textAlign = "center";
      ctx.fillText("Juego terminado", w / 2, h / 2 - 20);
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
      running = true;
      init();
      send({ type: "ready" });
    }
    if (e.data?.type === "restart") {
      running = true;
      init();
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

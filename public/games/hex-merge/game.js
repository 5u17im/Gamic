(function () {
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const BRIDGE_ORIGIN = window.location.origin;

  function send(msg) {
    window.parent.postMessage({ ...msg, timestamp: Date.now() }, BRIDGE_ORIGIN);
  }

  const COLS = 6;
  const ROWS = 7;
  const HEX_SIZE = 32;
  const COLORS = ["#6C5CE7", "#00CEC9", "#FD79A8", "#FDCB6E", "#E17055", "#00B894"];

  let score = 0;
  let running = false;
  let grid = [];
  let nextHex = null;
  let particles = [];
  let mergeAnim = null;
  let placedAnim = null;

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.scale(dpr, dpr);
  }
  window.addEventListener("resize", resize);

  function hexPoint(cx, cy, size, i) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    return { x: cx + size * Math.cos(angle), y: cy + size * Math.sin(angle) };
  }

  function drawHex(cx, cy, size, color, highlight, glow) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const p = hexPoint(cx, cy, size, i);
      i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();
    if (glow) {
      ctx.shadowColor = color;
      ctx.shadowBlur = 20;
    }
    ctx.fillStyle = color;
    ctx.fill();
    ctx.shadowBlur = 0;
    if (highlight) {
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  function gridPos(col, row) {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const x = w / 2 + (col - COLS / 2) * HEX_SIZE * 1.6 + (row % 2) * HEX_SIZE * 0.8;
    const y = 80 + row * HEX_SIZE * 1.5;
    return { x, y };
  }

  function initGrid() {
    grid = [];
    for (let r = 0; r < ROWS; r++) {
      grid[r] = [];
      for (let c = 0; c < COLS; c++) grid[r][c] = null;
    }
    score = 0;
    particles = [];
    mergeAnim = null;
    placedAnim = null;
    spawnNext();
  }

  function spawnNext() {
    nextHex = Math.floor(Math.random() * COLORS.length);
  }

  function spawnParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 30 + Math.random() * 80;
      particles.push({
        x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        life: 0.4 + Math.random() * 0.4, maxLife: 0.4 + Math.random() * 0.4,
        color, r: 2 + Math.random() * 4,
      });
    }
  }

  function addRandomTile() {
    const empty = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (grid[r][c] === null) empty.push({ r, c });
      }
    }
    if (empty.length === 0) return false;
    const { r, c } = empty[Math.floor(Math.random() * empty.length)];
    grid[r][c] = nextHex;
    const pos = gridPos(c, r);
    placedAnim = { x: pos.x, y: pos.y, color: COLORS[nextHex], life: 0.5, maxLife: 0.5 };
    spawnNext();
    checkMerge(r, c);
    return true;
  }

  function checkMerge(row, col) {
    const color = grid[row][col];
    if (color === null) return;
    const neighbors = getNeighbors(row, col);
    const same = neighbors.filter((n) => grid[n.r][n.c] === color);
    if (same.length >= 2) {
      const pos = gridPos(col, row);
      mergeAnim = { x: pos.x, y: pos.y, life: 0.6, maxLife: 0.6 };
      spawnParticles(pos.x, pos.y, COLORS[color], 15);
      grid[row][col] = null;
      same.forEach((n) => {
        const p = gridPos(n.c, n.r);
        spawnParticles(p.x, p.y, COLORS[color], 10);
        grid[n.r][n.c] = null;
      });
      score += (same.length + 1) * 10;
      send({ type: "score", payload: { score } });
    }
  }

  function getNeighbors(r, c) {
    const dirs = r % 2 === 0
      ? [[-1, -1], [-1, 0], [0, -1], [0, 1], [1, -1], [1, 0]]
      : [[-1, 0], [-1, 1], [0, -1], [0, 1], [1, 0], [1, 1]];
    return dirs
      .map(([dr, dc]) => ({ r: r + dr, c: c + dc }))
      .filter((n) => n.r >= 0 && n.r < ROWS && n.c >= 0 && n.c < COLS);
  }

  function hasMoves() {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (grid[r][c] === null) return true;
      }
    }
    return false;
  }

  function handleClick(clientX, clientY) {
    if (!running) return;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const pos = gridPos(c, r);
        const dx = clientX - pos.x;
        const dy = clientY - pos.y;
        if (dx * dx + dy * dy < HEX_SIZE * HEX_SIZE) {
          if (grid[r][c] === null) {
            grid[r][c] = nextHex;
            spawnNext();
            checkMerge(r, c);
            if (!hasMoves()) {
              running = false;
              send({ type: "gameover", payload: { score } });
            }
          }
          return;
        }
      }
    }
  }

  function draw() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);

    const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.7);
    grad.addColorStop(0, "#0f0f1a");
    grad.addColorStop(1, "#08081a");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const pos = gridPos(c, r);
        const color = grid[r][c];
        if (color !== null) {
          drawHex(pos.x, pos.y, HEX_SIZE - 1, COLORS[color], false, true);
        } else {
          ctx.fillStyle = "#1a1a2e";
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const p = hexPoint(pos.x, pos.y, HEX_SIZE - 1, i);
            i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
          }
          ctx.closePath();
          ctx.fill();
        }
      }
    }

    // Particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx * (1 / 60);
      p.y += p.vy * (1 / 60);
      p.life -= 1 / 60;
      p.vx *= 0.95;
      p.vy *= 0.95;
      if (p.life <= 0) { particles.splice(i, 1); continue; }
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * alpha, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Next hex preview
    if (nextHex !== null && running) {
      ctx.fillStyle = "#fff";
      ctx.font = "13px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Siguiente:", w / 2, 30);
      drawHex(w / 2, 55, 14, COLORS[nextHex], false, true);
    }

    ctx.fillStyle = "#fff";
    ctx.font = "15px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Puntuación: " + score, 16, 30);

    if (!running && !hasMoves()) {
      ctx.fillStyle = "rgba(0,0,0,0.7)";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 26px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Juego terminado", w / 2, h / 2 - 20);
      ctx.font = "16px sans-serif";
      ctx.fillText("Puntuación: " + score, w / 2, h / 2 + 20);
    }
  }

  function loop() {
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
      running = true; initGrid(); addRandomTile();
      send({ type: "ready" });
    }
    if (e.data?.type === "restart") {
      running = true; initGrid(); addRandomTile();
      send({ type: "ready" });
    }
    if (e.data?.type === "pause") running = false;
    if (e.data?.type === "resume") running = true;
  });

  resize();
  send({ type: "ready" });
  loop();
})();

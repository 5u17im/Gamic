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
  let selected = null;

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
  }

  window.addEventListener("resize", resize);

  function hexPoint(cx, cy, size, i) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    return { x: cx + size * Math.cos(angle), y: cy + size * Math.sin(angle) };
  }

  function drawHex(cx, cy, size, color, highlight) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const p = hexPoint(cx, cy, size, i);
      i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
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
      for (let c = 0; c < COLS; c++) {
        grid[r][c] = null;
      }
    }
    score = 0;
    selected = null;
    spawnNext();
  }

  function spawnNext() {
    nextHex = Math.floor(Math.random() * COLORS.length);
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
      grid[row][col] = null;
      same.forEach((n) => { grid[n.r][n.c] = null; });
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

    ctx.fillStyle = "#0f0f1a";
    ctx.fillRect(0, 0, w, h);

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const pos = gridPos(c, r);
        const color = grid[r][c];
        drawHex(pos.x, pos.y, HEX_SIZE - 1, color !== null ? COLORS[color] : "#1a1a2e", selected?.r === r && selected?.c === c);
      }
    }

    if (nextHex !== null && running) {
      ctx.fillStyle = "#fff";
      ctx.font = "14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Siguiente:", w / 2, 30);
      drawHex(w / 2, 55, 14, COLORS[nextHex], false);
    }

    ctx.fillStyle = "#fff";
    ctx.font = "16px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Puntuaci\u00f3n: " + score, 16, 30);

    if (!running && !hasMoves()) {
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#fff";
      ctx.font = "24px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Juego terminado", w / 2, h / 2 - 20);
      ctx.font = "16px sans-serif";
      ctx.fillText("Puntuaci\u00f3n: " + score, w / 2, h / 2 + 20);
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
      running = true;
      initGrid();
      addRandomTile();
      send({ type: "ready" });
    }
    if (e.data?.type === "restart") {
      running = true;
      initGrid();
      addRandomTile();
      send({ type: "ready" });
    }
    if (e.data?.type === "pause") running = false;
    if (e.data?.type === "resume") running = true;
  });

  resize();
  send({ type: "ready" });
  loop();
})();

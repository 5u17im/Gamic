(function () {
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const BRIDGE_ORIGIN = window.location.origin;

  function send(msg) {
    window.parent.postMessage({ ...msg, timestamp: Date.now() }, BRIDGE_ORIGIN);
  }

  const OPERATORS = ["+", "-", "×"];
  let score = 0;
  let timeLeft = 60;
  let running = false;
  let current = { a: 0, b: 0, op: "+", answer: 0 };
  let streak = 0;
  let lastResult = null;
  let comboFlash = 0;
  let particles = [];

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.scale(dpr, dpr);
  }
  window.addEventListener("resize", resize);

  function spawnParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 30 + Math.random() * 60;
      particles.push({
        x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        life: 0.3 + Math.random() * 0.3, maxLife: 0.3 + Math.random() * 0.3,
        color, r: 2 + Math.random() * 3,
      });
    }
  }

  function generateProblem() {
    const op = OPERATORS[Math.floor(Math.random() * OPERATORS.length)];
    let a, b, answer;
    switch (op) {
      case "+":
        a = Math.floor(Math.random() * 50) + 1;
        b = Math.floor(Math.random() * 50) + 1;
        answer = a + b; break;
      case "-":
        a = Math.floor(Math.random() * 50) + 10;
        b = Math.floor(Math.random() * a) + 1;
        answer = a - b; break;
      case "×":
        a = Math.floor(Math.random() * 12) + 2;
        b = Math.floor(Math.random() * 10) + 1;
        answer = a * b; break;
    }
    current = { a, b, op, answer };
  }

  function generateOptions() {
    const options = new Set([current.answer]);
    while (options.size < 4) {
      const offset = Math.floor(Math.random() * 10) + 1;
      const variant = Math.random() > 0.5 ? current.answer + offset : current.answer - offset;
      if (variant > 0) options.add(variant);
    }
    return Array.from(options).sort(() => Math.random() - 0.5);
  }

  function draw() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);

    // Background
    const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.6);
    grad.addColorStop(0, "#0f0f1f");
    grad.addColorStop(1, "#080815");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Time bar
    if (running) {
      const barW = w - 32;
      const barH = 6;
      const frac = timeLeft / 60;
      ctx.fillStyle = "#1a1a2e";
      ctx.beginPath();
      ctx.roundRect(16, 12, barW, barH, 3);
      ctx.fill();
      ctx.fillStyle = frac > 0.3 ? "#6C5CE7" : "#FD79A8";
      ctx.beginPath();
      ctx.roundRect(16, 12, barW * frac, barH, 3);
      ctx.fill();
    }

    // HUD
    ctx.fillStyle = "#fff";
    ctx.font = "14px 'Courier New', monospace";
    ctx.textAlign = "left";
    ctx.fillText("Puntos: " + score, 16, 44);
    ctx.textAlign = "right";
    ctx.fillText("Tiempo: " + Math.ceil(timeLeft) + "s", w - 16, 44);
    if (streak > 0) {
      ctx.fillStyle = "#FDCB6E";
      ctx.fillText("Racha: " + streak + "×", w - 16, 64);
    }

    if (lastResult) {
      ctx.fillStyle = lastResult === "correct" ? "#00CEC9" : "#FD79A8";
      ctx.font = "bold 16px 'Courier New', monospace";
      ctx.textAlign = "center";
      const label = lastResult === "correct" ? "✓ Correcto!" : "✗ Incorrecto";
      ctx.fillText(label, w / 2, 88);
      if (lastResult === "correct") {
        ctx.fillStyle = "#fff";
        ctx.font = "12px 'Courier New', monospace";
        ctx.fillText("+" + (10 + (streak - 1) * 2), w / 2 + 80, 88);
      }
    }

    // Particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx * (1 / 60);
      p.y += p.vy * (1 / 60);
      p.life -= 1 / 60;
      p.vx *= 0.95; p.vy *= 0.95;
      if (p.life <= 0) { particles.splice(i, 1); continue; }
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    if (!running) {
      ctx.fillStyle = "rgba(0,0,0,0.7)";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 28px 'Courier New', monospace";
      ctx.textAlign = "center";
      ctx.fillText("Quick Math", w / 2, h / 2 - 50);
      if (score > 0) {
        ctx.font = "18px 'Courier New', monospace";
        ctx.fillText("Puntuación final: " + score, w / 2, h / 2);
      }
      ctx.font = "14px 'Courier New', monospace";
      ctx.fillText("Presiona Iniciar para jugar", w / 2, h / 2 + 40);
      return;
    }

    // Problem display with glow
    ctx.shadowColor = "#6C5CE7";
    ctx.shadowBlur = 20;
    ctx.fillStyle = "#6C5CE7";
    ctx.font = "bold 42px 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.fillText(current.a + " " + current.op + " " + current.b + " = ?", w / 2, h / 2 - 50);
    ctx.shadowBlur = 0;

    const options = generateOptions();
    const cols = 2;
    const btnW = 130;
    const btnH = 52;
    const gap = 14;
    const totalW = cols * btnW + (cols - 1) * gap;
    const startX = (w - totalW) / 2;
    const startY = h / 2 + 20;

    options.forEach((opt, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * (btnW + gap);
      const y = startY + row * (btnH + gap);

      ctx.fillStyle = "#1e1e32";
      ctx.beginPath();
      ctx.roundRect(x, y, btnW, btnH, 10);
      ctx.fill();
      ctx.strokeStyle = "#2a2a4a";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = "#fff";
      ctx.font = "bold 22px 'Courier New', monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(opt, x + btnW / 2, y + btnH / 2);
      ctx.textBaseline = "alphabetic";
    });
  }

  function handleClick(clientX, clientY) {
    if (!running) return;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const options = generateOptions();
    const cols = 2;
    const btnW = 130;
    const btnH = 52;
    const gap = 14;
    const totalW = cols * btnW + (cols - 1) * gap;
    const startX = (w - totalW) / 2;
    const startY = h / 2 + 20;

    for (let i = 0; i < options.length; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * (btnW + gap);
      const y = startY + row * (btnH + gap);
      if (clientX >= x && clientX <= x + btnW && clientY >= y && clientY <= y + btnH) {
        if (options[i] === current.answer) {
          score += 10 + streak * 2;
          streak++;
          lastResult = "correct";
          spawnParticles(x + btnW / 2, y + btnH / 2, "#00CEC9", 10);
          send({ type: "score", payload: { score } });
        } else {
          streak = 0;
          lastResult = "incorrect";
          spawnParticles(x + btnW / 2, y + btnH / 2, "#FD79A8", 8);
        }
        generateProblem();
        return;
      }
    }
  }

  function gameLoop() {
    if (running) {
      timeLeft -= 1 / 60;
      if (timeLeft <= 0) {
        timeLeft = 0; running = false;
        send({ type: "gameover", payload: { score } });
      }
    }
    draw();
    requestAnimationFrame(gameLoop);
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
    if ((e.data?.type === "start" || e.data?.type === "restart") && !running) {
      score = 0; streak = 0; timeLeft = 60; running = true; particles = [];
      generateProblem();
      send({ type: "ready" });
    }
    if (e.data?.type === "pause") running = false;
    if (e.data?.type === "resume") running = true;
  });

  resize();
  generateProblem();
  send({ type: "ready" });
  gameLoop();
})();

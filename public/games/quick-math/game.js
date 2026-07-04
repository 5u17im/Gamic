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

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
  }

  window.addEventListener("resize", resize);

  function generateProblem() {
    const op = OPERATORS[Math.floor(Math.random() * OPERATORS.length)];
    let a, b, answer;
    switch (op) {
      case "+":
        a = Math.floor(Math.random() * 50) + 1;
        b = Math.floor(Math.random() * 50) + 1;
        answer = a + b;
        break;
      case "-":
        a = Math.floor(Math.random() * 50) + 10;
        b = Math.floor(Math.random() * a) + 1;
        answer = a - b;
        break;
      case "×":
        a = Math.floor(Math.random() * 12) + 2;
        b = Math.floor(Math.random() * 10) + 1;
        answer = a * b;
        break;
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

    ctx.fillStyle = "#0f0f1a";
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = "#fff";
    ctx.font = "18px 'Courier New', monospace";
    ctx.textAlign = "left";
    ctx.fillText("Puntuaci\u00f3n: " + score, 16, 30);
    ctx.fillText("Tiempo: " + Math.ceil(timeLeft) + "s", w - 130, 30);
    ctx.fillText("Racha: " + streak, 16, 55);

    if (lastResult) {
      ctx.fillStyle = lastResult === "correct" ? "#00CEC9" : "#FD79A8";
      ctx.font = "14px 'Courier New', monospace";
      ctx.textAlign = "center";
      ctx.fillText(lastResult === "correct" ? "\u2713 Correcto!" : "\u2717 Incorrecto", w / 2, 80);
    }

    if (!running) {
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#fff";
      ctx.font = "28px 'Courier New', monospace";
      ctx.textAlign = "center";
      ctx.fillText("Quick Math", w / 2, h / 2 - 50);
      if (score > 0) {
        ctx.font = "18px 'Courier New', monospace";
        ctx.fillText("Puntuaci\u00f3n final: " + score, w / 2, h / 2);
      }
      ctx.font = "14px 'Courier New', monospace";
      ctx.fillText("Presiona Iniciar para jugar", w / 2, h / 2 + 40);
      return;
    }

    ctx.fillStyle = "#6C5CE7";
    ctx.font = "42px 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.fillText(current.a + " " + current.op + " " + current.b + " = ?", w / 2, h / 2 - 60);

    const options = generateOptions();
    const cols = 2;
    const btnW = 120;
    const btnH = 50;
    const gap = 16;
    const totalW = cols * btnW + (cols - 1) * gap;
    const startX = (w - totalW) / 2;
    const startY = h / 2 + 10;

    options.forEach((opt, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * (btnW + gap);
      const y = startY + row * (btnH + gap);

      ctx.fillStyle = "#1e1e32";
      ctx.beginPath();
      ctx.roundRect(x, y, btnW, btnH, 8);
      ctx.fill();

      ctx.fillStyle = "#fff";
      ctx.font = "20px 'Courier New', monospace";
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
    const btnW = 120;
    const btnH = 50;
    const gap = 16;
    const totalW = cols * btnW + (cols - 1) * gap;
    const startX = (w - totalW) / 2;
    const startY = h / 2 + 10;

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
          send({ type: "score", payload: { score } });
        } else {
          streak = 0;
          lastResult = "incorrect";
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
        timeLeft = 0;
        running = false;
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
    if (e.data?.type === "start" && !running) {
      score = 0;
      streak = 0;
      timeLeft = 60;
      running = true;
      generateProblem();
      send({ type: "ready" });
    }
    if (e.data?.type === "restart") {
      score = 0;
      streak = 0;
      timeLeft = 60;
      running = true;
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

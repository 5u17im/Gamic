(function () {
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const BRIDGE_ORIGIN = window.location.origin;

  function send(msg) {
    window.parent.postMessage({ ...msg, timestamp: Date.now() }, BRIDGE_ORIGIN);
  }

  const PLATFORM_W = 300;
  const PLATFORM_H = 14;
  const BALL_R = 8;
  const OBSTACLE_W = 30;
  const OBSTACLE_H = 12;

  let ball = { x: 0, y: 0, vx: 0, vy: 0 };
  let platform = { angle: 0 };
  let obstacles = [];
  let score = 0;
  let running = false;
  let gameOver = false;
  let scrollY = 0;

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.scale(dpr, dpr);
  }
  window.addEventListener("resize", resize);

  function init() {
    ball.x = canvas.clientWidth / 2;
    ball.y = 100;
    ball.vx = 0;
    ball.vy = 0;
    platform.angle = 0;
    obstacles = [];
    score = 0;
    gameOver = false;
    scrollY = 0;
  }

  function spawnObstacle() {
    const w = canvas.clientWidth;
    const gapSize = 80;
    const x = Math.random() * (w - OBSTACLE_W);
    const y = scrollY - 40;
    obstacles.push({ x, y, leftGap: false });
    // Second obstacle with gap
    const gapX = Math.random() * (w - gapSize);
    obstacles.push({ x: 0, y: scrollY - 80, leftGap: true, gapX, gapW: gapSize });
  }

  function update(dt) {
    if (!running || gameOver) return;

    // Gravity + platform angle
    const gravity = 400;
    const tiltForce = Math.sin(platform.angle) * 200;

    ball.vy += gravity * dt;
    ball.vx += tiltForce * dt;
    ball.vx *= 0.98;

    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;

    // Platform collision
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const platY = h - 60;

    if (ball.y + BALL_R > platY && ball.y - BALL_R < platY + PLATFORM_H &&
        ball.x > w / 2 - PLATFORM_W / 2 && ball.x < w / 2 + PLATFORM_W / 2) {
      ball.y = platY - BALL_R;
      ball.vy *= -0.3;
      if (Math.abs(ball.vy) < 30) ball.vy = 0;
    }

    // Ball falls off platform
    if (ball.y > h + 50) {
      gameOver = true;
      running = false;
      send({ type: "gameover", payload: { score } });
      return;
    }

    // Scroll obstacles
    scrollY += 60 * dt;
    if (obstacles.length === 0 || obstacles[obstacles.length - 1].y > scrollY - 150) {
      spawnObstacle();
    }

    // Move and check obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
      const obs = obstacles[i];
      obs.y += 60 * dt;

      // Remove off-screen
      if (obs.y > h + 50) {
        obstacles.splice(i, 1);
        score += 10;
        send({ type: "score", payload: { score } });
        continue;
      }

      // Collision
      if (ball.x + BALL_R > obs.x && ball.x - BALL_R < obs.x + OBSTACLE_W &&
          ball.y + BALL_R > obs.y && ball.y - BALL_R < obs.y + OBSTACLE_H) {
        if (!obs.leftGap) {
          gameOver = true;
          running = false;
          send({ type: "gameover", payload: { score } });
          return;
        }
        // Check if ball is in the gap
        if (ball.x > obs.gapX && ball.x < obs.gapX + obs.gapW) {
          // Safe
        } else {
          gameOver = true;
          running = false;
          send({ type: "gameover", payload: { score } });
          return;
        }
      }
    }

    // Keep ball in bounds
    if (ball.x < BALL_R) ball.x = BALL_R;
    if (ball.x > w - BALL_R) ball.x = w - BALL_R;
  }

  function draw() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#0a0a1a";
    ctx.fillRect(0, 0, w, h);

    // Background grid
    ctx.strokeStyle = "#ffffff08";
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = scrollY % 40; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Obstacles
    obstacles.forEach((obs) => {
      if (obs.leftGap) {
        // Draw walls with gap
        ctx.fillStyle = "#6C5CE7";
        ctx.fillRect(obs.x, obs.y, obs.gapX, OBSTACLE_H);
        ctx.fillRect(obs.gapX + obs.gapW, obs.y, w - obs.gapX - obs.gapW, OBSTACLE_H);
        ctx.fillStyle = "#6C5CE740";
        ctx.fillRect(obs.gapX, obs.y - 1, obs.gapW, 2);
      } else {
        ctx.fillStyle = "#6C5CE7";
        ctx.fillRect(obs.x, obs.y, OBSTACLE_W, OBSTACLE_H);
      }
    });

    // Platform
    ctx.save();
    ctx.translate(w / 2, h - 60);
    ctx.rotate(platform.angle);
    ctx.fillStyle = "#6C5CE7";
    ctx.beginPath();
    ctx.roundRect(-PLATFORM_W / 2, -PLATFORM_H / 2, PLATFORM_W, PLATFORM_H, 6);
    ctx.fill();
    ctx.fillStyle = "#7c6cf7";
    ctx.beginPath();
    ctx.roundRect(-PLATFORM_W / 2, -PLATFORM_H / 2, PLATFORM_W, 4, 2);
    ctx.fill();
    ctx.restore();

    // Ball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2);
    ctx.fillStyle = "#FDCB6E";
    ctx.fill();
    ctx.strokeStyle = "#E17055";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // HUD
    ctx.fillStyle = "#fff";
    ctx.font = "14px monospace";
    ctx.textAlign = "left";
    ctx.fillText("Puntos: " + score, 16, 24);

    if (!running && gameOver) {
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#fff";
      ctx.font = "24px monospace";
      ctx.textAlign = "center";
      ctx.fillText("Game Over", w / 2, h / 2 - 20);
      ctx.font = "16px monospace";
      ctx.fillText("Puntuación: " + score, w / 2, h / 2 + 20);
    }
  }

  function loop() {
    update(1 / 60);
    draw();
    requestAnimationFrame(loop);
  }

  // Keyboard input for tilt
  document.addEventListener("keydown", (e) => {
    if (e.code === "ArrowLeft" || e.code === "KeyA") platform.angle = -0.4;
    if (e.code === "ArrowRight" || e.code === "KeyD") platform.angle = 0.4;
  });
  document.addEventListener("keyup", (e) => {
    if (["ArrowLeft", "ArrowRight", "KeyA", "KeyD"].includes(e.code)) platform.angle = 0;
  });

  // Touch input
  let touchStartX = null;
  canvas.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    if (touchStartX !== null) {
      const dx = e.touches[0].clientX - touchStartX;
      platform.angle = Math.max(-0.5, Math.min(0.5, dx / 200));
    }
  }, { passive: false });
  canvas.addEventListener("touchend", () => {
    touchStartX = null;
    platform.angle = 0;
  }, { passive: false });

  // GameBridge
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

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

  let ball = { x: 0, y: 0, vx: 0, vy: 0 };
  let platform = { angle: 0, targetAngle: 0 };
  let obstacles = [];
  let particles = [];
  let ballTrail = [];
  let score = 0;
  let running = false;
  let gameOver = false;
  let scrollY = 0;
  let passedObstacles = 0;

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
    platform.targetAngle = 0;
    obstacles = [];
    particles = [];
    ballTrail = [];
    score = 0;
    passedObstacles = 0;
    gameOver = false;
    scrollY = 0;
  }

  function spawnParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 20 + Math.random() * 60;
      particles.push({
        x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        life: 0.3 + Math.random() * 0.4, maxLife: 0.3 + Math.random() * 0.4,
        color, r: 2 + Math.random() * 3,
      });
    }
  }

  function update(dt) {
    if (!running || gameOver) return;

    // Smooth platform angle
    platform.angle += (platform.targetAngle - platform.angle) * 8 * dt;

    const gravity = 420;
    const tiltForce = Math.sin(platform.angle) * 220;

    ball.vy += gravity * dt;
    ball.vx += tiltForce * dt;
    ball.vx *= 0.985;

    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;

    // Trail
    ballTrail.push({ x: ball.x, y: ball.y });
    if (ballTrail.length > 15) ballTrail.shift();

    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const platY = h - 60;

    if (ball.y + BALL_R > platY && ball.y - BALL_R < platY + PLATFORM_H &&
        ball.x > w / 2 - PLATFORM_W / 2 && ball.x < w / 2 + PLATFORM_W / 2) {
      ball.y = platY - BALL_R;
      ball.vy *= -0.25;
      if (Math.abs(ball.vy) < 30) ball.vy = 0;
    }

    if (ball.y > h + 50) {
      gameOver = true; running = false;
      spawnParticles(ball.x, h, "#FD79A8", 30);
      send({ type: "gameover", payload: { score } });
      return;
    }

    scrollY += 65 * dt;
    if (obstacles.length === 0 || obstacles[obstacles.length - 1].y > scrollY - 150) {
      spawnObstacle();
    }

    for (let i = obstacles.length - 1; i >= 0; i--) {
      const obs = obstacles[i];
      obs.y += 65 * dt;

      if (obs.y > platY + 50) {
        obstacles.splice(i, 1);
        if (!obs.hit) {
          score += 10 + Math.floor(Math.random() * 5);
          passedObstacles++;
          spawnParticles(w / 2, platY, "#00CEC9", 5);
          send({ type: "score", payload: { score } });
        }
        continue;
      }

      if (ball.x + BALL_R > obs.x && ball.x - BALL_R < obs.x + obs.w &&
          ball.y + BALL_R > obs.y && ball.y - BALL_R < obs.y + obs.h) {
        if (!obs.safe) {
          gameOver = true; running = false;
          spawnParticles(ball.x, ball.y, "#FD79A8", 20);
          send({ type: "gameover", payload: { score } });
          return;
        }
      }
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.life -= dt; p.vx *= 0.95; p.vy *= 0.95;
      if (p.life <= 0) particles.splice(i, 1);
    }
  }

  function spawnObstacle() {
    const w = canvas.clientWidth;
    const t = Math.random();
    if (t < 0.5) {
      obstacles.push({ x: Math.random() * (w - 40), y: scrollY - 40, w: 40, h: 12, safe: false, hit: false });
    } else if (t < 0.8) {
      const gapSize = 60 + Math.random() * 40;
      const gapX = Math.random() * (w - gapSize);
      obstacles.push({ x: 0, y: scrollY - 40, w: gapX, h: 12, safe: true, hit: false });
      obstacles.push({ x: gapX + gapSize, y: scrollY - 40, w: w - gapX - gapSize, h: 12, safe: true, hit: false });
    } else {
      obstacles.push({ x: w / 2 - 60, y: scrollY - 40, w: 120, h: 12, safe: false, hit: false });
    }
  }

  function draw() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);

    // Background
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "#0a0a1a");
    grad.addColorStop(1, "#0f0520");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = "#ffffff06";
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 35) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = scrollY % 35; y < h; y += 35) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // Particles
    particles.forEach((p) => {
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * alpha, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Obstacles with glow
    obstacles.forEach((obs) => {
      if (obs.safe) {
        ctx.fillStyle = "#2a1a3a";
        ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
        return;
      }
      ctx.shadowColor = "#FD79A8";
      ctx.shadowBlur = 10;
      ctx.fillStyle = "#FD79A8";
      ctx.beginPath();
      ctx.roundRect(obs.x, obs.y, obs.w, obs.h, 4);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Ball trail
    ballTrail.forEach((t, i) => {
      const alpha = (i / ballTrail.length) * 0.4;
      ctx.fillStyle = `rgba(253,203,110,${alpha})`;
      ctx.beginPath();
      ctx.arc(t.x, t.y, BALL_R * (0.2 + 0.8 * i / ballTrail.length), 0, Math.PI * 2);
      ctx.fill();
    });

    // Ball glow
    ctx.shadowColor = "#FDCB6E";
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2);
    ctx.fillStyle = "#FDCB6E";
    ctx.fill();
    ctx.strokeStyle = "#E17055";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Platform with glow
    ctx.save();
    ctx.translate(w / 2, h - 60);
    ctx.rotate(platform.angle);
    ctx.shadowColor = "#6C5CE7";
    ctx.shadowBlur = 15;
    ctx.fillStyle = "#6C5CE7";
    ctx.beginPath();
    ctx.roundRect(-PLATFORM_W / 2, -PLATFORM_H / 2, PLATFORM_W, PLATFORM_H, 6);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#8a7cf7";
    ctx.beginPath();
    ctx.roundRect(-PLATFORM_W / 2, -PLATFORM_H / 2, PLATFORM_W, 4, 2);
    ctx.fill();
    ctx.restore();

    // HUD
    ctx.fillStyle = "#fff";
    ctx.font = "14px monospace";
    ctx.textAlign = "left";
    ctx.fillText("Puntos: " + score, 16, 24);

    if (!running && gameOver) {
      ctx.fillStyle = "rgba(0,0,0,0.7)";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 28px monospace";
      ctx.textAlign = "center";
      ctx.shadowColor = "#6C5CE7";
      ctx.shadowBlur = 20;
      ctx.fillText("Game Over", w / 2, h / 2 - 20);
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

  document.addEventListener("keydown", (e) => {
    if (e.code === "ArrowLeft" || e.code === "KeyA") platform.targetAngle = -0.45;
    if (e.code === "ArrowRight" || e.code === "KeyD") platform.targetAngle = 0.45;
  });
  document.addEventListener("keyup", (e) => {
    if (["ArrowLeft", "ArrowRight", "KeyA", "KeyD"].includes(e.code)) platform.targetAngle = 0;
  });

  let touchStartX = null;
  canvas.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    if (touchStartX !== null) {
      const dx = e.touches[0].clientX - touchStartX;
      platform.targetAngle = Math.max(-0.5, Math.min(0.5, dx / 150));
    }
  }, { passive: false });
  canvas.addEventListener("touchend", () => {
    touchStartX = null;
    platform.targetAngle = 0;
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

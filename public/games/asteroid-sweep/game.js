(function () {
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const BRIDGE_ORIGIN = window.location.origin;

  function send(msg) {
    window.parent.postMessage({ ...msg, timestamp: Date.now() }, BRIDGE_ORIGIN);
  }

  let ship = { x: 0, y: 0, angle: 0, radius: 15 };
  let bullets = [];
  let asteroids = [];
  let particles = [];
  let scorePopups = [];
  let stars = [];
  let score = 0;
  let lives = 3;
  let running = false;
  let keys = {};
  let spawnTimer = 0;
  let gameTime = 0;
  let invulnTimer = 0;
  let thrusterOn = false;

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.scale(dpr, dpr);
    generateStars();
  }
  window.addEventListener("resize", resize);

  function generateStars() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    stars = [];
    for (let i = 0; i < 100; i++) {
      stars.push({ x: Math.random() * w, y: Math.random() * h, r: 0.5 + Math.random() * 1.5, s: 0.3 + Math.random() * 0.7 });
    }
  }

  function init() {
    ship.x = canvas.clientWidth / 2;
    ship.y = canvas.clientHeight / 2;
    ship.angle = -Math.PI / 2;
    bullets = [];
    asteroids = [];
    particles = [];
    scorePopups = [];
    score = 0;
    lives = 3;
    spawnTimer = 0;
    gameTime = 0;
    invulnTimer = 0;
  }

  function spawnParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 30 + Math.random() * 100;
      particles.push({
        x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        life: 0.5 + Math.random() * 0.5, maxLife: 0.5 + Math.random() * 0.5,
        color, r: 2 + Math.random() * 4,
      });
    }
  }

  function addScorePopup(x, y, pts) {
    scorePopups.push({ x, y, text: "+" + pts, life: 1, vy: -30 });
  }

  function spawnAsteroid() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const size = 20 + Math.random() * 30;
    let x, y;
    const side = Math.floor(Math.random() * 4);
    if (side === 0) { x = -size; y = Math.random() * h; }
    else if (side === 1) { x = w + size; y = Math.random() * h; }
    else if (side === 2) { x = Math.random() * w; y = -size; }
    else { x = Math.random() * w; y = h + size; }
    const dx = ship.x - x;
    const dy = ship.y - y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const speed = 30 + Math.random() * 40;
    const verts = 8 + Math.floor(Math.random() * 5);
    const vertices = [];
    for (let i = 0; i < verts; i++) {
      const angle = (Math.PI * 2 / verts) * i;
      const r = size * (0.7 + Math.random() * 0.3);
      vertices.push({ x: Math.cos(angle) * r, y: Math.sin(angle) * r });
    }
    asteroids.push({
      x, y, size, vx: (dx / dist) * speed, vy: (dy / dist) * speed,
      rotation: 0, rotSpeed: (Math.random() - 0.5) * 2, vertices,
    });
  }

  function shoot() {
    const speed = 300;
    bullets.push({
      x: ship.x + Math.cos(ship.angle) * ship.radius,
      y: ship.y + Math.sin(ship.angle) * ship.radius,
      vx: Math.cos(ship.angle) * speed,
      vy: Math.sin(ship.angle) * speed,
      life: 60, trail: [],
    });
  }

  function update(dt) {
    if (!running) return;
    gameTime += dt;
    if (invulnTimer > 0) invulnTimer -= dt;

    const speed = 120;
    thrusterOn = keys["ArrowUp"] || keys["KeyW"];
    if (keys["ArrowLeft"] || keys["KeyA"]) ship.angle -= 3 * dt;
    if (keys["ArrowRight"] || keys["KeyD"]) ship.angle += 3 * dt;
    if (thrusterOn) {
      ship.x += Math.cos(ship.angle) * speed * dt;
      ship.y += Math.sin(ship.angle) * speed * dt;
      spawnParticles(ship.x - Math.cos(ship.angle) * 15, ship.y - Math.sin(ship.angle) * 15, "#6C5CE7", 1);
    }
    if (keys["ArrowDown"] || keys["KeyS"]) {
      ship.x -= Math.cos(ship.angle) * speed * 0.6 * dt;
      ship.y -= Math.sin(ship.angle) * speed * 0.6 * dt;
    }

    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    ship.x = Math.max(0, Math.min(w, ship.x));
    ship.y = Math.max(0, Math.min(h, ship.y));

    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.life--;
      b.trail.push({ x: b.x, y: b.y });
      if (b.trail.length > 5) b.trail.shift();
      if (b.life <= 0 || b.x < 0 || b.x > w || b.y < 0 || b.y > h) {
        bullets.splice(i, 1);
        continue;
      }
      for (let j = asteroids.length - 1; j >= 0; j--) {
        const a = asteroids[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        if (dx * dx + dy * dy < a.size * a.size) {
          const pts = Math.ceil(100 / a.size * 30);
          addScorePopup(a.x, a.y, pts);
          spawnParticles(a.x, a.y, "#fdcb6e", 20);
          score += pts;
          send({ type: "score", payload: { score } });
          bullets.splice(i, 1);
          asteroids.splice(j, 1);
          break;
        }
      }
    }

    spawnTimer += dt;
    const spawnRate = Math.max(0.5, 2 - gameTime / 60);
    if (spawnTimer >= spawnRate) {
      spawnTimer = 0;
      spawnAsteroid();
    }

    for (let i = asteroids.length - 1; i >= 0; i--) {
      const a = asteroids[i];
      a.x += a.vx * dt;
      a.y += a.vy * dt;
      a.rotation += a.rotSpeed * dt;

      if (a.x < -a.size * 2) a.x = w + a.size * 2;
      if (a.x > w + a.size * 2) a.x = -a.size * 2;
      if (a.y < -a.size * 2) a.y = h + a.size * 2;
      if (a.y > h + a.size * 2) a.y = -a.size * 2;

      if (invulnTimer <= 0) {
        const dx = ship.x - a.x;
        const dy = ship.y - a.y;
        if (dx * dx + dy * dy < (ship.radius + a.size) * (ship.radius + a.size)) {
          spawnParticles(ship.x, ship.y, "#FD79A8", 30);
          asteroids.splice(i, 1);
          lives--;
          invulnTimer = 1.5;
          if (lives <= 0) {
            running = false;
            spawnParticles(ship.x, ship.y, "#FD79A8", 60);
            send({ type: "gameover", payload: { score } });
          }
        }
      }
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      p.vx *= 0.95;
      p.vy *= 0.95;
      if (p.life <= 0) particles.splice(i, 1);
    }

    for (let i = scorePopups.length - 1; i >= 0; i--) {
      const p = scorePopups[i];
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) scorePopups.splice(i, 1);
    }
  }

  function draw() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);

    // Space background
    const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.7);
    grad.addColorStop(0, "#0f0f1f");
    grad.addColorStop(1, "#050510");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Twinkling stars
    stars.forEach((s) => {
      const alpha = 0.3 + Math.sin(Date.now() * s.s * 0.003 + s.x) * 0.3;
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // Particles
    particles.forEach((p) => {
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * alpha, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * alpha * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });
    ctx.globalAlpha = 1;

    // Score popups
    scorePopups.forEach((p) => {
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = "#FDCB6E";
      ctx.font = "bold 16px monospace";
      ctx.textAlign = "center";
      ctx.fillText(p.text, p.x, p.y);
    });
    ctx.globalAlpha = 1;

    // Asteroids
    asteroids.forEach((a) => {
      ctx.save();
      ctx.translate(a.x, a.y);
      ctx.rotate(a.rotation);
      ctx.strokeStyle = "#6a6a8a";
      ctx.lineWidth = 2;
      ctx.shadowColor = "#6a6a8a";
      ctx.shadowBlur = 8;
      ctx.beginPath();
      a.vertices.forEach((v, i) => {
        i === 0 ? ctx.moveTo(v.x, v.y) : ctx.lineTo(v.x, v.y);
      });
      ctx.closePath();
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#2a2a3a40";
      ctx.fill();
      ctx.restore();
    });

    // Bullets with trail
    bullets.forEach((b) => {
      b.trail.forEach((t, i) => {
        const alpha = i / b.trail.length * 0.5;
        ctx.fillStyle = `rgba(253,203,110,${alpha})`;
        ctx.beginPath();
        ctx.arc(t.x, t.y, i * 0.4 + 1, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.shadowColor = "#fdcb6e";
      ctx.shadowBlur = 12;
      ctx.fillStyle = "#fdcb6e";
      ctx.beginPath();
      ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Ship with glow
    ctx.save();
    ctx.translate(ship.x, ship.y);
    ctx.rotate(ship.angle);

    // Thruster flame
    if (thrusterOn) {
      ctx.shadowColor = "#6C5CE7";
      ctx.shadowBlur = 20;
      ctx.fillStyle = "#6C5CE7";
      ctx.beginPath();
      ctx.moveTo(-ship.radius * 0.3, 0);
      const flicker = 0.7 + Math.random() * 0.6;
      ctx.lineTo(-ship.radius - 8 * flicker, -ship.radius * 0.3);
      ctx.lineTo(-ship.radius - 12 * flicker, 0);
      ctx.lineTo(-ship.radius - 8 * flicker, ship.radius * 0.3);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Ship body
    ctx.shadowColor = "#6C5CE7";
    ctx.shadowBlur = 12;
    ctx.strokeStyle = "#6C5CE7";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ship.radius + 5, 0);
    ctx.lineTo(-ship.radius, -ship.radius * 0.7);
    ctx.lineTo(-ship.radius * 0.3, 0);
    ctx.lineTo(-ship.radius, ship.radius * 0.7);
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = invulnTimer > 0 && Math.floor(invulnTimer * 10) % 2 === 0 ? "#6C5CE780" : "#6C5CE740";
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();

    // HUD
    ctx.fillStyle = "#fff";
    ctx.font = "14px monospace";
    ctx.textAlign = "left";
    ctx.fillText("Puntos: " + score, 16, 24);
    ctx.textAlign = "right";
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = i < lives ? "#FD79A8" : "#4a4a6a";
      ctx.fillText("♥", w - 16 - i * 22, 24);
    }

    if (!running) {
      ctx.fillStyle = "rgba(0,0,0,0.7)";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 28px monospace";
      ctx.textAlign = "center";
      const msg = lives <= 0 ? "Game Over" : "Asteroid Sweep";
      ctx.shadowColor = "#6C5CE7";
      ctx.shadowBlur = 20;
      ctx.fillText(msg, w / 2, h / 2 - 30);
      ctx.shadowBlur = 0;
      ctx.font = "16px monospace";
      ctx.fillText(lives <= 0 ? "Puntuación: " + score : "Presiona Iniciar", w / 2, h / 2 + 20);
    }
  }

  function loop() {
    update(1 / 60);
    draw();
    requestAnimationFrame(loop);
  }

  document.addEventListener("keydown", (e) => {
    keys[e.code] = true;
    if (e.code === "Space" && running) shoot();
  });
  document.addEventListener("keyup", (e) => { keys[e.code] = false; });
  canvas.addEventListener("click", () => { if (running) shoot(); });

  let touchX = null;
  canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    touchX = e.touches[0].clientX;
    if (running) shoot();
  }, { passive: false });
  canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    touchX = touch.clientX;
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

(function () {
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const BRIDGE_ORIGIN = window.location.origin;

  function send(msg) {
    window.parent.postMessage({ ...msg, timestamp: Date.now() }, BRIDGE_ORIGIN);
  }

  // Game state
  let ship = { x: 0, y: 0, angle: 0, radius: 15 };
  let bullets = [];
  let asteroids = [];
  let score = 0;
  let lives = 3;
  let running = false;
  let keys = {};
  let spawnTimer = 0;
  let gameTime = 0;

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.scale(dpr, dpr);
  }
  window.addEventListener("resize", resize);

  function init() {
    ship.x = canvas.clientWidth / 2;
    ship.y = canvas.clientHeight / 2;
    ship.angle = -Math.PI / 2;
    bullets = [];
    asteroids = [];
    score = 0;
    lives = 3;
    spawnTimer = 0;
    gameTime = 0;
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
    asteroids.push({
      x, y, size,
      vx: (dx / dist) * speed,
      vy: (dy / dist) * speed,
      rotation: 0,
      rotSpeed: (Math.random() - 0.5) * 2,
      vertices: 8 + Math.floor(Math.random() * 5),
    });
  }

  function shoot() {
    const speed = 300;
    bullets.push({
      x: ship.x + Math.cos(ship.angle) * ship.radius,
      y: ship.y + Math.sin(ship.angle) * ship.radius,
      vx: Math.cos(ship.angle) * speed,
      vy: Math.sin(ship.angle) * speed,
      life: 60,
    });
  }

  function update(dt) {
    if (!running) return;
    gameTime += dt;

    // Ship movement
    const speed = 120;
    if (keys["ArrowLeft"] || keys["KeyA"]) ship.angle -= 3 * dt;
    if (keys["ArrowRight"] || keys["KeyD"]) ship.angle += 3 * dt;
    if (keys["ArrowUp"] || keys["KeyW"]) {
      ship.x += Math.cos(ship.angle) * speed * dt;
      ship.y += Math.sin(ship.angle) * speed * dt;
    }
    if (keys["ArrowDown"] || keys["KeyS"]) {
      ship.x -= Math.cos(ship.angle) * speed * 0.6 * dt;
      ship.y -= Math.sin(ship.angle) * speed * 0.6 * dt;
    }

    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    ship.x = Math.max(0, Math.min(w, ship.x));
    ship.y = Math.max(0, Math.min(h, ship.y));

    // Bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.life--;
      if (b.life <= 0 || b.x < 0 || b.x > w || b.y < 0 || b.y > h) {
        bullets.splice(i, 1);
        continue;
      }
      // Check asteroid hit
      for (let j = asteroids.length - 1; j >= 0; j--) {
        const a = asteroids[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        if (dx * dx + dy * dy < a.size * a.size) {
          bullets.splice(i, 1);
          asteroids.splice(j, 1);
          score += Math.ceil(100 / a.size * 30);
          send({ type: "score", payload: { score } });
          break;
        }
      }
    }

    // Asteroids
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

      // Wrap around
      if (a.x < -a.size * 2) a.x = w + a.size * 2;
      if (a.x > w + a.size * 2) a.x = -a.size * 2;
      if (a.y < -a.size * 2) a.y = h + a.size * 2;
      if (a.y > h + a.size * 2) a.y = -a.size * 2;

      // Collision with ship
      const dx = ship.x - a.x;
      const dy = ship.y - a.y;
      if (dx * dx + dy * dy < (ship.radius + a.size) * (ship.radius + a.size)) {
        asteroids.splice(i, 1);
        lives--;
        ship.x = w / 2;
        ship.y = h / 2;
        if (lives <= 0) {
          running = false;
          send({ type: "gameover", payload: { score } });
        }
      }
    }
  }

  function draw() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#0a0a1a";
    ctx.fillRect(0, 0, w, h);

    // Stars
    ctx.fillStyle = "#ffffff20";
    for (let i = 0; i < 50; i++) {
      const sx = (i * 137.5 + 50) % w;
      const sy = (i * 97.3 + 30) % h;
      ctx.beginPath();
      ctx.arc(sx, sy, 1, 0, Math.PI * 2);
      ctx.fill();
    }

    // Asteroids
    asteroids.forEach((a) => {
      ctx.save();
      ctx.translate(a.x, a.y);
      ctx.rotate(a.rotation);
      ctx.strokeStyle = "#4a4a6a";
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < a.vertices; i++) {
        const angle = (Math.PI * 2 / a.vertices) * i;
        const r = a.size * (0.7 + Math.random() * 0.3);
        const px = Math.cos(angle) * r;
        const py = Math.sin(angle) * r;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    });

    // Bullets
    ctx.fillStyle = "#fdcb6e";
    bullets.forEach((b) => {
      ctx.beginPath();
      ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Ship
    ctx.save();
    ctx.translate(ship.x, ship.y);
    ctx.rotate(ship.angle);
    ctx.strokeStyle = "#6C5CE7";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ship.radius + 5, 0);
    ctx.lineTo(-ship.radius, -ship.radius * 0.7);
    ctx.lineTo(-ship.radius * 0.5, 0);
    ctx.lineTo(-ship.radius, ship.radius * 0.7);
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = "#6C5CE740";
    ctx.fill();
    ctx.restore();

    // HUD
    ctx.fillStyle = "#fff";
    ctx.font = "14px monospace";
    ctx.textAlign = "left";
    ctx.fillText("Puntos: " + score, 16, 24);
    ctx.textAlign = "right";
    ctx.fillText("Vidas: " + "♥".repeat(lives), w - 16, 24);

    if (!running) {
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#fff";
      ctx.font = "24px monospace";
      ctx.textAlign = "center";
      const msg = lives <= 0 ? "Game Over" : "Asteroid Sweep";
      ctx.fillText(msg, w / 2, h / 2 - 20);
      ctx.font = "14px monospace";
      ctx.fillText(lives <= 0 ? "Puntuación: " + score : "Presiona Iniciar", w / 2, h / 2 + 20);
    }
  }

  function loop() {
    const dt = 1 / 60;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  // Input
  document.addEventListener("keydown", (e) => {
    keys[e.code] = true;
    if (e.code === "Space" && running) shoot();
  });
  document.addEventListener("keyup", (e) => { keys[e.code] = false; });

  canvas.addEventListener("click", () => { if (running) shoot(); });

  // Touch controls
  let touchX = null;
  canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    touchX = touch.clientX;
    if (running) shoot();
  }, { passive: false });
  canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    if (touchX !== null) {
      const dx = touch.clientX - touchX;
      if (dx > 10) ship.angle += 0.05;
      else if (dx < -10) ship.angle -= 0.05;
      ship.x += Math.cos(ship.angle) * 3;
      ship.y += Math.sin(ship.angle) * 3;
    }
    touchX = touch.clientX;
  }, { passive: false });
  canvas.addEventListener("touchend", () => { touchX = null; }, { passive: false });

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

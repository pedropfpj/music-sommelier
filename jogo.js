const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreValue = document.getElementById("scoreValue");
const waveValue = document.getElementById("waveValue");
const gravityValue = document.getElementById("gravityValue");
const bestValue = document.getElementById("bestValue");
const flashText = document.getElementById("flashText");

const menuOverlay = document.getElementById("menuOverlay");
const gameOverOverlay = document.getElementById("gameOverOverlay");
const resultText = document.getElementById("resultText");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

const BEST_KEY = "gravity-tap-arena-best";
const GRAVITY_LABEL = {
  up: "Cima",
  down: "Baixo"
};
const GRAVITY_COLOR = {
  up: "#ffb07d",
  down: "#a8ffef"
};

const state = {
  running: false,
  score: 0,
  best: Number(localStorage.getItem(BEST_KEY) || 0),
  time: 0,
  wave: 1,
  gravityDir: 1,
  spawnShardTimer: 0.6,
  spawnBeamTimer: 2.8,
  shake: 0,
  shards: [],
  beams: [],
  particles: [],
  trail: [],
  player: {
    x: 180,
    y: 220,
    vy: 0,
    radius: 16
  }
};

let lastTime = 0;
let dpr = Math.max(1, window.devicePixelRatio || 1);

bestValue.textContent = String(state.best);

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function randomRange(min, max) {
  return min + Math.random() * (max - min);
}

function resizeCanvas() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  dpr = Math.max(1, window.devicePixelRatio || 1);
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  if (!state.running) {
    state.player.x = Math.max(120, width * 0.24);
    state.player.y = height * 0.52;
    drawScene();
  }
}

function showFlash(message, color = "#ddf9ff") {
  flashText.textContent = message;
  flashText.style.color = color;
  flashText.classList.remove("show");
  void flashText.offsetWidth;
  flashText.classList.add("show");
}

function gravityLabelFromDir(dir) {
  return dir < 0 ? GRAVITY_LABEL.up : GRAVITY_LABEL.down;
}

function gravityColorFromDir(dir) {
  return dir < 0 ? GRAVITY_COLOR.up : GRAVITY_COLOR.down;
}

function updateHud() {
  scoreValue.textContent = String(Math.floor(state.score));
  waveValue.textContent = String(state.wave);
  gravityValue.textContent = gravityLabelFromDir(state.gravityDir);
  gravityValue.style.color = gravityColorFromDir(state.gravityDir);
  bestValue.textContent = String(state.best);
}

function spawnBurst(x, y, color, count) {
  for (let i = 0; i < count; i += 1) {
    state.particles.push({
      x,
      y,
      vx: randomRange(-210, 210),
      vy: randomRange(-210, 210),
      life: randomRange(0.4, 0.85),
      ttl: randomRange(0.4, 0.85),
      size: randomRange(2, 4),
      color
    });
  }
}

function resetGame() {
  const h = canvas.clientHeight;
  const w = canvas.clientWidth;

  state.running = true;
  state.score = 0;
  state.time = 0;
  state.wave = 1;
  state.gravityDir = 1;
  state.spawnShardTimer = 0.5;
  state.spawnBeamTimer = 2.8;
  state.shake = 0;
  state.shards = [];
  state.beams = [];
  state.particles = [];
  state.trail = [];

  state.player.x = Math.max(120, w * 0.24);
  state.player.y = h * 0.5;
  state.player.vy = 0;

  updateHud();
}

function spawnShard() {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  const margin = 48;
  const fromLeft = Math.random() < 0.5;
  const waveBoost = (state.wave - 1) * 24;
  const x = fromLeft ? -26 : w + 26;
  const y = randomRange(margin, h - margin);
  const vx = (fromLeft ? 1 : -1) * randomRange(220 + waveBoost, 320 + waveBoost);
  const vy = randomRange(-70 - waveBoost * 0.18, 70 + waveBoost * 0.18);
  const wobbleAmp = randomRange(10, 32);
  const wobbleFreq = randomRange(3.6, 6.8);
  const radius = randomRange(8, 14);

  state.shards.push({
    x,
    y,
    vx,
    vy,
    radius,
    wobbleAmp,
    wobbleFreq,
    t: randomRange(0, Math.PI * 2),
    nearAwarded: false
  });
}

function spawnBeam() {
  const h = canvas.clientHeight;
  const margin = 70;
  const warning = clamp(0.95 - state.wave * 0.05, 0.42, 0.95);
  const active = clamp(0.62 - state.wave * 0.03, 0.24, 0.62);
  const thickness = clamp(18 + state.wave * 1.4, 18, 44);
  const y = randomRange(margin, h - margin);

  state.beams.push({
    y,
    thickness,
    warning,
    active,
    state: "warning"
  });
}

function startGame() {
  menuOverlay.classList.add("hidden");
  gameOverOverlay.classList.add("hidden");
  resetGame();
}

function triggerGravityFlip() {
  if (!state.running) {
    return;
  }

  state.gravityDir *= -1;
  const speedMagnitude = clamp(Math.abs(state.player.vy) * 0.62 + 210, 210, 460);
  state.player.vy = state.gravityDir * speedMagnitude;
  state.score += 3;

  const color = gravityColorFromDir(state.gravityDir);
  spawnBurst(state.player.x, state.player.y, color, 16);
  showFlash("Gravity Flip", color);
  updateHud();
}

function endGame() {
  state.running = false;
  const finalScore = Math.floor(state.score);
  const waveReached = state.wave;

  if (finalScore > state.best) {
    state.best = finalScore;
    localStorage.setItem(BEST_KEY, String(state.best));
    showFlash("Novo recorde", "#fef0cb");
  }

  updateHud();
  resultText.textContent = `Score ${finalScore} | Onda ${waveReached} | Recorde ${state.best}`;
  gameOverOverlay.classList.remove("hidden");
}

function updatePlayer(dt) {
  const p = state.player;
  const h = canvas.clientHeight;
  const gravityStrength = 1040;

  p.vy += state.gravityDir * gravityStrength * dt;
  p.y += p.vy * dt;

  state.trail.unshift({
    x: p.x,
    y: p.y,
    life: 0.28
  });
  if (state.trail.length > 24) {
    state.trail.length = 24;
  }
  for (const mark of state.trail) {
    mark.life -= dt;
  }
  state.trail = state.trail.filter((mark) => mark.life > 0);

  if (p.y - p.radius <= 0 || p.y + p.radius >= h) {
    state.shake = 0.35;
    endGame();
  }
}

function updateShards(dt) {
  const p = state.player;
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;

  for (const shard of state.shards) {
    shard.t += dt;
    shard.x += shard.vx * dt;
    shard.y += shard.vy * dt + Math.sin(shard.t * shard.wobbleFreq) * shard.wobbleAmp * dt;

    const dx = p.x - shard.x;
    const dy = p.y - shard.y;
    const collisionLimit = p.radius + shard.radius;
    const nearLimit = collisionLimit + 20;
    const dist2 = dx * dx + dy * dy;

    if (dist2 <= collisionLimit * collisionLimit) {
      state.shake = 0.35;
      endGame();
      return;
    }

    if (!shard.nearAwarded && dist2 <= nearLimit * nearLimit) {
      shard.nearAwarded = true;
      const bonus = 7 + Math.floor(state.wave * 1.5);
      state.score += bonus;
      showFlash(`Near Miss +${bonus}`, "#ffd9af");
    }
  }

  state.shards = state.shards.filter((shard) => {
    return shard.x > -80 && shard.x < w + 80 && shard.y > -90 && shard.y < h + 90;
  });
}

function updateBeams(dt) {
  const p = state.player;

  for (const beam of state.beams) {
    if (beam.state === "warning") {
      beam.warning -= dt;
      if (beam.warning <= 0) {
        beam.state = "active";
      }
      continue;
    }

    beam.active -= dt;
    const hit = Math.abs(p.y - beam.y) <= beam.thickness * 0.5 + p.radius;
    if (hit) {
      state.shake = 0.4;
      endGame();
      return;
    }
  }

  state.beams = state.beams.filter((beam) => {
    if (beam.state === "warning") {
      return beam.warning > 0;
    }
    return beam.active > 0;
  });
}

function updateParticles(dt) {
  for (const particle of state.particles) {
    particle.life -= dt;
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vy += 200 * dt;
  }
  state.particles = state.particles.filter((particle) => particle.life > 0);
}

function updateSpawners(dt) {
  const difficulty = 1 + (state.wave - 1) * 0.16;

  state.spawnShardTimer -= dt;
  if (state.spawnShardTimer <= 0) {
    spawnShard();
    if (Math.random() < clamp((state.wave - 2) * 0.1, 0, 0.35)) {
      spawnShard();
    }
    state.spawnShardTimer = randomRange(0.42, 0.92) / difficulty;
  }

  state.spawnBeamTimer -= dt;
  if (state.spawnBeamTimer <= 0) {
    spawnBeam();
    state.spawnBeamTimer = randomRange(2.4, 4) / Math.max(1, difficulty * 0.88);
  }
}

function update(dt) {
  state.time += dt;
  state.wave = 1 + Math.floor(state.time / 9.5);
  state.score += dt * (12 + state.wave * 1.9);

  updateSpawners(dt);
  updatePlayer(dt);
  if (!state.running) {
    return;
  }
  updateShards(dt);
  if (!state.running) {
    return;
  }
  updateBeams(dt);
  if (!state.running) {
    return;
  }
  updateParticles(dt);

  state.shake = Math.max(0, state.shake - dt * 1.8);
  updateHud();
}

function drawBackground(w, h, now) {
  const gradient = ctx.createLinearGradient(0, 0, 0, h);
  gradient.addColorStop(0, "#071522");
  gradient.addColorStop(0.5, "#0a1f31");
  gradient.addColorStop(1, "#06131f");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);

  const pulse = (Math.sin(now * 2.7) + 1) * 0.5;
  const splitY = h * 0.5;

  ctx.fillStyle = `rgba(54, 248, 212, ${(0.06 + pulse * 0.06).toFixed(3)})`;
  ctx.fillRect(0, splitY, w, h - splitY);
  ctx.fillStyle = `rgba(255, 145, 77, ${(0.05 + (1 - pulse) * 0.05).toFixed(3)})`;
  ctx.fillRect(0, 0, w, splitY);

  ctx.strokeStyle = "rgba(187, 230, 255, 0.22)";
  ctx.lineWidth = 1;
  const drift = (now * 34) % 34;
  for (let y = -34; y < h + 34; y += 34) {
    ctx.beginPath();
    ctx.moveTo(0, y + drift);
    ctx.lineTo(w, y + drift);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(210, 243, 255, 0.46)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, splitY);
  ctx.lineTo(w, splitY);
  ctx.stroke();
}

function drawShards() {
  for (const shard of state.shards) {
    ctx.save();
    ctx.translate(shard.x, shard.y);
    ctx.rotate(shard.t * 4.2);
    ctx.fillStyle = "#dff4ff";
    ctx.beginPath();
    ctx.moveTo(0, -shard.radius * 1.2);
    ctx.lineTo(shard.radius, shard.radius);
    ctx.lineTo(-shard.radius, shard.radius);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "rgba(111, 201, 255, 0.9)";
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.restore();
  }
}

function drawBeams(now) {
  const w = canvas.clientWidth;

  for (const beam of state.beams) {
    if (beam.state === "warning") {
      const flicker = 0.2 + Math.abs(Math.sin(now * 20)) * 0.45;
      ctx.strokeStyle = `rgba(255, 216, 180, ${flicker.toFixed(3)})`;
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(0, beam.y);
      ctx.lineTo(w, beam.y);
      ctx.stroke();
      ctx.setLineDash([]);
      continue;
    }

    const alpha = clamp(beam.active / 0.62, 0.25, 1);
    ctx.fillStyle = `rgba(255, 173, 118, ${(0.2 + alpha * 0.45).toFixed(3)})`;
    ctx.fillRect(0, beam.y - beam.thickness * 0.5, w, beam.thickness);
    ctx.strokeStyle = `rgba(255, 239, 224, ${(0.35 + alpha * 0.45).toFixed(3)})`;
    ctx.lineWidth = 1.8;
    ctx.strokeRect(0, beam.y - beam.thickness * 0.5, w, beam.thickness);
  }
}

function drawPlayer(now) {
  for (const mark of state.trail) {
    const alpha = clamp(mark.life / 0.28, 0, 1) * 0.25;
    ctx.fillStyle = `rgba(220, 246, 255, ${alpha.toFixed(3)})`;
    ctx.beginPath();
    ctx.arc(mark.x, mark.y, state.player.radius * 0.8, 0, Math.PI * 2);
    ctx.fill();
  }

  const p = state.player;
  const aura = p.radius + 8 + Math.sin(now * 10) * 2.5;
  const playerColor = gravityColorFromDir(state.gravityDir);
  ctx.fillStyle = colorWithAlpha(playerColor, 0.25);
  ctx.beginPath();
  ctx.arc(p.x, p.y, aura, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = playerColor;
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#f4fdff";
  ctx.lineWidth = 2.3;
  ctx.stroke();
}

function drawParticles() {
  for (const particle of state.particles) {
    const t = clamp(particle.life / particle.ttl, 0, 1);
    ctx.globalAlpha = t;
    ctx.fillStyle = particle.color;
    ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
  }
  ctx.globalAlpha = 1;
}

function drawScene() {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  const now = state.time;

  ctx.save();
  if (state.shake > 0) {
    const intensity = state.shake * 9;
    ctx.translate(randomRange(-intensity, intensity), randomRange(-intensity, intensity));
  }

  drawBackground(w, h, now);
  drawBeams(now);
  drawShards();
  drawPlayer(now);
  drawParticles();

  ctx.restore();
}

function colorWithAlpha(hex, alpha) {
  const normalized = hex.replace("#", "");
  const numeric = Number.parseInt(normalized, 16);
  const r = (numeric >> 16) & 255;
  const g = (numeric >> 8) & 255;
  const b = numeric & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function loop(timestamp) {
  const now = timestamp / 1000;
  const dt = Math.min(0.033, now - (lastTime || now));
  lastTime = now;

  if (state.running) {
    update(dt);
  }

  drawScene();
  requestAnimationFrame(loop);
}

function handleAction() {
  if (!state.running) {
    if (!menuOverlay.classList.contains("hidden") || !gameOverOverlay.classList.contains("hidden")) {
      startGame();
    }
    return;
  }

  triggerGravityFlip();
}

window.addEventListener("resize", resizeCanvas);

document.addEventListener("keydown", (event) => {
  if (event.code !== "Space" && event.code !== "ArrowUp") {
    return;
  }
  if (event.repeat) {
    return;
  }
  event.preventDefault();
  handleAction();
});

canvas.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  handleAction();
});

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);

resizeCanvas();
updateHud();
requestAnimationFrame(loop);

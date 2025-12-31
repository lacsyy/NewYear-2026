/* ================= STARS GENERATION (MINIMALIST) ================= */
const starsContainer = document.getElementById('starsContainer');
for (let i = 0; i < 50; i++) {
  const star = document.createElement('div');
  star.className = 'star';
  const size = Math.random() * 2 + 1;
  star.style.width = size + 'px';
  star.style.height = size + 'px';
  star.style.left = Math.random() * 100 + '%';
  star.style.top = Math.random() * 100 + '%';
  star.style.animationDelay = Math.random() * 4 + 's';
  starsContainer.appendChild(star);
}

/* ================= CANVAS SETUP ================= */
const canvas = document.getElementById("fireworks");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

/* ================= CLICK TO CREATE FIREWORKS ================= */
canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  // Create firework at click position
  createFireworkAtPosition(x, y);
  
  // Play sound
  const sound = document.getElementById("sound");
  sound.currentTime = 0;
  sound.play().catch(err => console.log('Audio play failed:', err));
});

/* ================= FIREWORK SYSTEM ================= */
let fireworks = [];
let particles = [];

const gravity = 0.08;
const colors = [
  "#ff0043", "#14fc56", "#1e90ff",
  "#f5da42", "#ff7b00", "#ff66ff",
  "#00ffff", "#ffd700", "#ff1493"
];

class Firework {
  constructor(startX = null, targetY = null) {
    this.x = startX || Math.random() * canvas.width;
    this.y = canvas.height;
    this.targetY = targetY || Math.random() * canvas.height * 0.4 + 50;
    this.speed = Math.random() * 3 + 6;
    this.color = colors[Math.floor(Math.random() * colors.length)];
    this.exploded = false;
  }

  update() {
    this.y -= this.speed;
    particles.push(new TrailParticle(this.x, this.y, this.color));

    if (this.y <= this.targetY) {
      this.explode();
      this.exploded = true;
    }
  }

  explode() {
    const count = Math.random() * 50 + 80;
    for (let i = 0; i < count; i++) {
      particles.push(new ExplosionParticle(this.x, this.y, this.color));
    }
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.color;
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

class TrailParticle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.alpha = 1;
    this.life = 20;
  }

  update() {
    this.life--;
    this.alpha -= 0.05;
  }

  draw() {
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, 2, 2);
    ctx.globalAlpha = 1;
  }
}

class ExplosionParticle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.angle = Math.random() * Math.PI * 2;
    this.speed = Math.random() * 6 + 2;
    this.friction = 0.97;
    this.alpha = 1;
    this.decay = Math.random() * 0.015 + 0.01;
    this.radius = Math.random() * 2 + 2;
  }

  update() {
    this.speed *= this.friction;
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed + gravity;
    this.alpha -= this.decay;
  }

  draw() {
    ctx.globalAlpha = this.alpha;
    ctx.shadowBlur = 15;
    ctx.shadowColor = this.color;

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }
}

/* ================= CREATE FIREWORK AT POSITION ================= */
function createFireworkAtPosition(x, targetY) {
  const firework = new Firework(x, targetY);
  fireworks.push(firework);
}

/* ================= ANIMATION LOOP ================= */
function animate() {
  // Use a very transparent clear to let the background show through
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  fireworks.forEach((fw, i) => {
    fw.update();
    fw.draw();
    if (fw.exploded) fireworks.splice(i, 1);
  });

  particles.forEach((p, i) => {
    p.update();
    p.draw();
    if (p.alpha <= 0 || p.life <= 0) particles.splice(i, 1);
  });

  requestAnimationFrame(animate);
}
animate();

/* ================= CELEBRATE BUTTON ================= */
function celebrate() {
  const sound = document.getElementById("sound");
  sound.currentTime = 0;
  sound.play().catch(err => console.log('Audio play failed:', err));
  
  for (let i = 0; i < 8; i++) {
    setTimeout(() => {
      fireworks.push(new Firework());
    }, i * 200);
  }
}

/* ================= COUNTDOWN TIMER ================= */
const countdownEl = document.getElementById("countdown");
const newYearDate = new Date("January 1, 2026 00:00:00").getTime();
let countdownFinished = false;

function updateCountdown() {
  const now = new Date().getTime();
  const diff = newYearDate - now;

  if (diff <= 0 && !countdownFinished) {
    countdownEl.innerHTML = "🎊 HAPPY NEW YEAR! 🎊";
    countdownFinished = true;
    celebrate();
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  countdownEl.innerHTML = `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

setInterval(updateCountdown, 1000);
updateCountdown();
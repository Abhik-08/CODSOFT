import { useEffect, useRef } from 'react';

const PARTICLE_COUNT = 60;
const CONNECTION_DIST = 120;

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function pickColor() {
  if (Math.random() > 0.7) return '#ff6b35';
  if (Math.random() > 0.5) return '#7c3aed';
  return '#ffffff';
}

function drawConnections(ctx, particles) {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dist = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
      if (dist < CONNECTION_DIST) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(255, 107, 53, ${0.06 * (1 - dist / CONNECTION_DIST)})`;
        ctx.lineWidth = 0.5;
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }
}

export default function ParticleBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: random(0, canvas.width),
      y: random(0, canvas.height),
      r: random(0.5, 2.5),
      dx: random(-0.3, 0.3),
      dy: random(-0.3, 0.3),
      opacity: random(0.1, 0.5),
      color: pickColor(),
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections (delegated to module-level helper to limit nesting depth)
      drawConnections(ctx, particles);

      // Draw particles
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
        ctx.globalAlpha = 1;

        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.6,
      }}
    />
  );
}

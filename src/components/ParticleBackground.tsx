import { useEffect, useRef } from 'react';

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
};

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cnv = canvas;
    const draw = ctx;

    const resizeCanvas = () => {
      cnv.width = window.innerWidth;
      cnv.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const particleCount = 80;
    const particles: Particle[] = [];
    const maxRadius = 5;
    const minRadius = 1;
    const speed = 0.5;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * cnv.width,
        y: Math.random() * cnv.height,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        radius: Math.random() * (maxRadius - minRadius) + minRadius,
        opacity: Math.random() * 0.5 + 0.3,
      });
    }

    let animationFrameId = 0;

    function animate() {
      draw.clearRect(0, 0, cnv.width, cnv.height);

      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0) particle.x = cnv.width;
        if (particle.x > cnv.width) particle.x = 0;
        if (particle.y < 0) particle.y = cnv.height;
        if (particle.y > cnv.height) particle.y = 0;

        // Gradient from emerald green to lighter green based on y position
        const gradientFactor = particle.y / cnv.height;
        const r = Math.floor(16 + gradientFactor * 64);
        const g = Math.floor(185 + gradientFactor * 30);
        const b = Math.floor(129 - gradientFactor * 40);

        draw.beginPath();
        draw.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        draw.fillStyle = `rgba(${r}, ${g}, ${b}, ${particle.opacity})`;
        draw.fill();

        draw.beginPath();
        draw.arc(particle.x, particle.y, particle.radius * 2, 0, Math.PI * 2);
        draw.fillStyle = `rgba(${r}, ${g}, ${b}, ${particle.opacity * 0.3})`;
        draw.fill();

        particles.forEach((other) => {
          const dx = particle.x - other.x;
          const dy = particle.y - other.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const maxDistance = 150;

          if (distance < maxDistance) {
            const otherGradientFactor = other.y / cnv.height;
            const avgR = Math.floor((r + 16 + otherGradientFactor * 64) / 2);
            const avgG = Math.floor((g + 185 + otherGradientFactor * 30) / 2);
            const avgB = Math.floor((b + 129 - otherGradientFactor * 40) / 2);

            draw.beginPath();
            draw.moveTo(particle.x, particle.y);
            draw.lineTo(other.x, other.y);
            draw.strokeStyle = `rgba(${avgR}, ${avgG}, ${avgB}, ${(1 - distance / maxDistance) * 0.25})`;
            draw.lineWidth = 1;
            draw.stroke();
          }
        });
      });

      animationFrameId = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[1]"
      aria-hidden
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed left-0 top-0 z-[1] h-full w-full"
        style={{ opacity: 0.9 }}
      />
    </div>
  );
}

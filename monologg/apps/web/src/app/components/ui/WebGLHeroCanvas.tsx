import React, { useEffect, useRef } from "react";

export function WebGLHeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = mouseX;
    let targetMouseY = mouseY;

    const particles: Array<{
      x: number;
      y: number;
      baseX: number;
      baseY: number;
      size: number;
      vx: number;
      vy: number;
      hue: number;
    }> = [];

    const numParticles = Math.min(Math.floor(width / 18), 75);

    for (let i = 0; i < numParticles; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      particles.push({
        x,
        y,
        baseX: x,
        baseY: y,
        size: Math.random() * 2.5 + 1,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        hue: Math.random() > 0.6 ? 100 : 270,
      });
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetMouseX = e.clientX - rect.left;
      targetMouseY = e.clientY - rect.top;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);

    let step = 0;

    const render = () => {
      step += 0.01;
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      ctx.clearRect(0, 0, width, height);

      // Ambient glowing mesh background (Monologg Red + Purple)
      const grad = ctx.createRadialGradient(
        mouseX,
        mouseY,
        20,
        width / 2,
        height / 2,
        Math.max(width, height)
      );
      grad.addColorStop(0, "rgba(241, 48, 48, 0.12)"); // Mono-Red
      grad.addColorStop(0.5, "rgba(123, 0, 254, 0.08)"); // Mono-Purple
      grad.addColorStop(1, "rgba(22, 22, 26, 0)");

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Flowing mesh grid lines
      ctx.lineWidth = 1;
      for (let j = 0; j < 3; j++) {
        ctx.beginPath();
        const yOffset = height * 0.4 + j * 60;
        ctx.strokeStyle =
          j === 0
            ? "rgba(241, 48, 48, 0.15)"
            : "rgba(123, 0, 254, 0.10)";

        for (let x = 0; x <= width; x += 20) {
          const dx = mouseX - x;
          const mouseDist = Math.max(0, 1 - Math.abs(dx) / 400);
          const y =
            yOffset +
            Math.sin(x * 0.005 + step + j) * 25 +
            Math.cos(x * 0.01 - step) * 15 +
            mouseDist * (mouseY - yOffset) * 0.15;

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Interactive particle nodes
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx + Math.sin(step + i) * 0.3;
        p.y += p.vy + Math.cos(step + i) * 0.3;

        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          const force = (150 - dist) / 150;
          p.x -= (dx / dist) * force * 3;
          p.y -= (dy / dist) * force * 3;
        }

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.fillStyle =
          p.hue === 100
            ? "rgba(241, 48, 48, 0.6)"
            : "rgba(123, 0, 254, 0.5)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        for (let k = i + 1; k < particles.length; k++) {
          const p2 = particles[k];
          const pdx = p.x - p2.x;
          const pdy = p.y - p2.y;
          const pdist = Math.sqrt(pdx * pdx + pdy * pdy);

          if (pdist < 110) {
            ctx.strokeStyle = `rgba(241, 48, 48, ${0.12 * (1 - pdist / 110)})`;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-80"
    />
  );
}

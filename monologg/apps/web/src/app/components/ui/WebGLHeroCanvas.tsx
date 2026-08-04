import React, { useEffect, useRef, useState } from "react";

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

    let mouseX = -1000;
    let mouseY = -1000;
    let targetMouseX = -1000;
    let targetMouseY = -1000;
    let hoverAlpha = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetMouseX = e.clientX - rect.left;
      targetMouseY = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      targetMouseX = -1000;
      targetMouseY = -1000;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("resize", handleResize);

    const gridSize = 48;

    const render = () => {
      mouseX += (targetMouseX - mouseX) * 0.08;
      mouseY += (targetMouseY - mouseY) * 0.08;

      const isHovered = mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height;
      const targetAlpha = isHovered ? 1 : 0;
      hoverAlpha += (targetAlpha - hoverAlpha) * 0.05;

      ctx.clearRect(0, 0, width, height);

      // Render architectural blueprint grid on hover
      if (hoverAlpha > 0.01) {
        ctx.save();
        ctx.globalAlpha = hoverAlpha * 0.75;
        ctx.strokeStyle = "rgba(241, 48, 48, 0.45)";
        ctx.lineWidth = 1;

        // Draw vertical grid lines
        for (let x = 0; x <= width; x += gridSize) {
          const dist = Math.abs(mouseX - x);
          if (dist < 400) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
          }
        }

        // Draw horizontal grid lines
        for (let y = 0; y <= height; y += gridSize) {
          const dist = Math.abs(mouseY - y);
          if (dist < 400) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
          }
        }

        // Mouse-following cursor spotlight ring
        const grad = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 320);
        grad.addColorStop(0, "rgba(241, 48, 48, 0.18)");
        grad.addColorStop(0.5, "rgba(123, 0, 254, 0.10)");
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Crosshair marker at cursor position
        ctx.strokeStyle = "rgba(241, 48, 48, 0.7)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 20, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
}

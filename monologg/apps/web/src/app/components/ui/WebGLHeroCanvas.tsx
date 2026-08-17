import React, { useEffect, useRef } from "react";

export function WebGLHeroCanvas({ opacityMultiplier = 0.07 }: { opacityMultiplier?: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    let mouseX = -1000;
    let mouseY = -1000;
    let targetMouseX = -1000;
    let targetMouseY = -1000;
    let hoverAlpha = 0;
    let scrollY = window.scrollY;

    const img = new Image();
    img.src = "/bg.svg";
    let pattern: CanvasPattern | null = null;
    
    const initPattern = () => {
      if (img.complete && img.naturalWidth > 0) {
        try {
          pattern = ctx.createPattern(img, "repeat");
        } catch {
          pattern = null;
        }
      }
    };

    img.onload = initPattern;
    initPattern();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetMouseX = e.clientX - rect.left;
      targetMouseY = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      targetMouseX = -1000;
      targetMouseY = -1000;
    };

    const handleScroll = () => {
      scrollY = window.scrollY;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
      initPattern();
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    const render = () => {
      mouseX += (targetMouseX - mouseX) * 0.08;
      mouseY += (targetMouseY - mouseY) * 0.08;

      const isHovered = mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height;
      const targetAlpha = isHovered ? 1 : 0;
      hoverAlpha += (targetAlpha - hoverAlpha) * 0.05;

      ctx.clearRect(0, 0, width, height);

      // Dynamic scroll reactive ambient intensity — pulse amplitude and the
      // floor both scale with opacityMultiplier so a low value (subtle) stays
      // subtle instead of being swamped by a fixed-size pulse/floor tuned for
      // a much higher intensity.
      const scrollPulse = Math.sin(scrollY * 0.003) * 0.03 * (opacityMultiplier / 0.2);
      const baseAlpha = Math.max(0.01 * (opacityMultiplier / 0.2), opacityMultiplier * 0.3 + scrollPulse);

      if (pattern) {
        // 1. Ambient base bg.svg grid layer across the section
        ctx.save();
        ctx.globalAlpha = baseAlpha;
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();

        // 2. Interactive mouse hover spotlight revealing bg.svg grid with vibrant accent halo
        if (hoverAlpha > 0.01) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(mouseX, mouseY, 340, 0, Math.PI * 2);
          ctx.clip();

          // High visibility reveal mask
          ctx.globalAlpha = Math.min(0.85, hoverAlpha * opacityMultiplier * 2.6);
          ctx.fillStyle = pattern;
          ctx.fillRect(0, 0, width, height);

          // Dual-tone accent halo (Mono-Red to Mono-Purple)
          const grad = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 340);
          grad.addColorStop(0, "rgba(241, 48, 48, 0.22)");
          grad.addColorStop(0.5, "rgba(123, 0, 254, 0.10)");
          grad.addColorStop(1, "rgba(0, 0, 0, 0)");

          ctx.fillStyle = grad;
          ctx.fillRect(mouseX - 340, mouseY - 340, 680, 680);
          ctx.restore();
        }
      } else {
        // Vector grid fallback if image loading
        if (hoverAlpha > 0.01) {
          ctx.save();
          ctx.globalAlpha = hoverAlpha * opacityMultiplier;
          ctx.strokeStyle = "rgba(241, 48, 48, 0.25)";
          ctx.lineWidth = 1;
          const gridSize = 48;
          for (let x = 0; x <= width; x += gridSize) {
            if (Math.abs(mouseX - x) < 320) {
              ctx.beginPath();
              ctx.moveTo(x, 0);
              ctx.lineTo(x, height);
              ctx.stroke();
            }
          }
          for (let y = 0; y <= height; y += gridSize) {
            if (Math.abs(mouseY - y) < 320) {
              ctx.beginPath();
              ctx.moveTo(0, y);
              ctx.lineTo(width, y);
              ctx.stroke();
            }
          }
          ctx.restore();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [opacityMultiplier]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
}

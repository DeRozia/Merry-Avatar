import React, { useEffect, useRef } from 'react';

const Snowfall: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const snowflakes: { x: number; y: number; r: number; d: number }[] = [];
    for (let i = 0; i < 50; i++) {
      snowflakes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 3 + 1, // radius
        d: Math.random() * 50 // density
      });
    }

    let animationFrameId: number;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      ctx.beginPath();
      
      for (let i = 0; i < snowflakes.length; i++) {
        const sf = snowflakes[i];
        ctx.moveTo(sf.x, sf.y);
        ctx.arc(sf.x, sf.y, sf.r, 0, Math.PI * 2, true);
      }
      ctx.fill();
      moveSnowflakes();
      animationFrameId = requestAnimationFrame(draw);
    };

    const moveSnowflakes = () => {
      for (let i = 0; i < snowflakes.length; i++) {
        const sf = snowflakes[i];
        sf.y += Math.pow(sf.d, 0.5) * 0.1 + 0.5; // Speed
        sf.x += Math.sin(sf.y * 0.01) * 0.5; // Sway

        // Reset if out of view
        if (sf.y > height) {
          snowflakes[i] = {
            x: Math.random() * width,
            y: 0,
            r: sf.r,
            d: sf.d
          };
        }
      }
    };

    draw();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="snow-container" />;
};

export default Snowfall;
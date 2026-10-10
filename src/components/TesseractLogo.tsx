import React, { useEffect, useRef } from 'react';

interface TesseractLogoProps {
  size?: number;
  className?: string;
  glow?: boolean;
  speed?: number;
}

/**
 * Genuine 3D Spinning Tesseract (4D Hypercube) Logo.
 * Continuously rotates in 3D space with:
 * - 16 hyper-dimensional vertices (8 outer + 8 concentric inner)
 * - 32 edge struts (12 outer edges, 12 inner edges, 8 cross-dimensional hyper-struts)
 * - 60 FPS silky smooth Canvas rendering with Retina display support
 * - Crystalline glowing cyan / electric sapphire aesthetic
 */
export const TesseractLogo: React.FC<TesseractLogoProps> = ({
  size = 32,
  className = '',
  glow = true,
  speed = 1.0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Retina display scaling
    const dpr = Math.min(window.devicePixelRatio || 2, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;

    // 16 3D Coordinates of a Tesseract:
    // Outer cube: 8 vertices at scale 1.0
    // Inner cube: 8 vertices at scale 0.52
    const outerScale = 0.95;
    const innerScale = 0.50;

    const baseVertices: [number, number, number][] = [];
    // Outer 8 vertices (indices 0 - 7)
    for (const x of [-1, 1]) {
      for (const y of [-1, 1]) {
        for (const z of [-1, 1]) {
          baseVertices.push([x * outerScale, y * outerScale, z * outerScale]);
        }
      }
    }
    // Inner 8 vertices (indices 8 - 15)
    for (const x of [-1, 1]) {
      for (const y of [-1, 1]) {
        for (const z of [-1, 1]) {
          baseVertices.push([x * innerScale, y * innerScale, z * innerScale]);
        }
      }
    }

    // 32 Connecting Struts:
    // Cube edge pairs for 8 vertices indexed in [-1, 1] loop:
    // (0,1), (0,2), (0,4), (1,3), (1,5), (2,3), (2,6), (3,7), (4,5), (4,6), (5,7), (6,7)
    const cubeEdges: [number, number][] = [
      [0, 1], [0, 2], [0, 4],
      [1, 3], [1, 5],
      [2, 3], [2, 6],
      [3, 7],
      [4, 5], [4, 6],
      [5, 7],
      [6, 7],
    ];

    const edges: [number, number, boolean][] = [];
    // Outer 12 edges
    cubeEdges.forEach(([a, b]) => edges.push([a, b, false]));
    // Inner 12 edges
    cubeEdges.forEach(([a, b]) => edges.push([a + 8, b + 8, true]));
    // 8 Cross-struts connecting corresponding outer and inner vertices
    for (let i = 0; i < 8; i++) {
      edges.push([i, i + 8, false]);
    }

    let angleX = 0.4;
    let angleY = 0.8;
    let angleZ = 0.2;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const renderScale = (canvas.width / 2) * 0.58;

      // Increment 3D rotation angles
      angleX += 0.014 * speed;
      angleY += 0.020 * speed;
      angleZ += 0.009 * speed;

      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);
      const cosZ = Math.cos(angleZ);
      const sinZ = Math.sin(angleZ);

      // Project vertices to 2D screen space
      const projected: { x: number; y: number; z: number }[] = [];

      for (let i = 0; i < 16; i++) {
        const [vx, vy, vz] = baseVertices[i];

        // 1. Rotate around Y axis
        const x1 = vx * cosY - vz * sinY;
        const y1 = vy;
        const z1 = vx * sinY + vz * cosY;

        // 2. Rotate around X axis
        const x2 = x1;
        const y2 = y1 * cosX - z1 * sinX;
        const z2 = y1 * sinX + z1 * cosX;

        // 3. Rotate around Z axis
        const x3 = x2 * cosZ - y2 * sinZ;
        const y3 = x2 * sinZ + y2 * cosZ;
        const z3 = z2;

        // Perspective projection
        const fov = 3.2;
        const pz = z3 + 3.4;
        const pers = fov / pz;

        projected.push({
          x: cx + x3 * renderScale * pers,
          y: cy + y3 * renderScale * pers,
          z: z3,
        });
      }

      // Draw ambient core glow if enabled
      if (glow) {
        const glowGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, canvas.width * 0.45);
        glowGrad.addColorStop(0, 'rgba(56, 189, 248, 0.4)');
        glowGrad.addColorStop(0.5, 'rgba(2, 132, 199, 0.15)');
        glowGrad.addColorStop(1, 'rgba(3, 105, 161, 0)');
        ctx.fillStyle = glowGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Sort edges by average Z depth for correct alpha blending
      const sortedEdges = [...edges].sort((e1, e2) => {
        const z1 = (projected[e1[0]].z + projected[e1[1]].z) / 2;
        const z2 = (projected[e2[0]].z + projected[e2[1]].z) / 2;
        return z1 - z2;
      });

      // Draw struts
      sortedEdges.forEach(([a, b, isInner]) => {
        const p1 = projected[a];
        const p2 = projected[b];
        const avgZ = (p1.z + p2.z) / 2;
        const alpha = Math.min(1, Math.max(0.3, 0.7 + avgZ * 0.25));

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);

        if (isInner) {
          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.95})`;
          ctx.lineWidth = 1.6 * dpr;
        } else {
          ctx.strokeStyle = `rgba(56, 189, 248, ${alpha * 0.85})`;
          ctx.lineWidth = 1.2 * dpr;
        }

        ctx.lineCap = 'round';
        ctx.stroke();
      });

      // Draw 16 glowing vertices
      projected.forEach((p, idx) => {
        const isInner = idx >= 8;
        const alpha = Math.min(1, Math.max(0.4, 0.75 + p.z * 0.25));
        const r = (isInner ? 2.0 : 2.5) * dpr;

        // Vertex glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 1.6, 0, Math.PI * 2);
        ctx.fillStyle = isInner
          ? `rgba(255, 255, 255, ${alpha * 0.5})`
          : `rgba(56, 189, 248, ${alpha * 0.5})`;
        ctx.fill();

        // Vertex core
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = isInner
          ? `rgba(255, 255, 255, ${alpha})`
          : `rgba(186, 230, 253, ${alpha})`;
        ctx.fill();
      });

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [size, glow, speed]);

  return (
    <div
      style={{ width: size, height: size }}
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      title="Tesseract 3D Hypercube"
    >
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size }}
        className="block filter drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]"
      />
    </div>
  );
};

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Tesseract3DCubeProps {
  size?: number; // size in px
  interactive?: boolean;
  burstOnHover?: boolean;
  className?: string;
}

/**
 * High-performance 3D Cosmic Tesseract component.
 * Renders an authentic glowing 4D hypercube/tesseract matching the user's reference:
 * Translucent glowing cyan crystal cube, internal rotating hyper-dimensional core,
 * cosmic nebula particle aura, and vibrant volumetric energy rays.
 */
export const Tesseract3DCube: React.FC<Tesseract3DCubeProps> = ({
  size = 40,
  interactive = false,
  burstOnHover = false,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = size;
    const height = size;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 3.6;

    // 2. Renderer with alpha support
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    containerRef.current.appendChild(renderer.domElement);

    // 3. Tesseract Geometry Group
    const tesseractGroup = new THREE.Group();
    scene.add(tesseractGroup);

    // A. Outer Translucent Crystalline Cube
    const outerGeo = new THREE.BoxGeometry(1.4, 1.4, 1.4);
    const outerMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#38bdf8'),
      emissive: new THREE.Color('#0284c7'),
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.45,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.6,
      ior: 1.5,
      wireframe: false,
    });
    const outerMesh = new THREE.Mesh(outerGeo, outerMat);
    tesseractGroup.add(outerMesh);

    // Outer Edge Lines (Glow wireframe)
    const outerEdges = new THREE.EdgesGeometry(outerGeo);
    const outerLineMat = new THREE.LineBasicMaterial({
      color: new THREE.Color('#67e8f9'),
      transparent: true,
      opacity: 0.95,
      linewidth: 1.5,
    });
    const outerLine = new THREE.LineSegments(outerEdges, outerLineMat);
    tesseractGroup.add(outerLine);

    // B. Inner Hypercube (Rotates at different axis)
    const innerGeo = new THREE.BoxGeometry(0.72, 0.72, 0.72);
    const innerMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#e0f2fe'),
      transparent: true,
      opacity: 0.65,
      wireframe: false,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    tesseractGroup.add(innerMesh);

    const innerEdges = new THREE.EdgesGeometry(innerGeo);
    const innerLineMat = new THREE.LineBasicMaterial({
      color: new THREE.Color('#ffffff'),
      transparent: true,
      opacity: 1,
    });
    const innerLine = new THREE.LineSegments(innerEdges, innerLineMat);
    tesseractGroup.add(innerLine);

    // C. 8 Hyper-dimensional vertex connecting beams
    const vertexLinesMat = new THREE.LineBasicMaterial({
      color: new THREE.Color('#38bdf8'),
      transparent: true,
      opacity: 0.75,
    });
    const points: THREE.Vector3[] = [];
    const corners = [
      [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
      [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
    ];
    corners.forEach(([x, y, z]) => {
      points.push(new THREE.Vector3(x * 0.7, y * 0.7, z * 0.7));
      points.push(new THREE.Vector3(x * 0.36, y * 0.36, z * 0.36));
    });
    const beamGeo = new THREE.BufferGeometry().setFromPoints(points);
    const beamLines = new THREE.LineSegments(beamGeo, vertexLinesMat);
    tesseractGroup.add(beamLines);

    // D. Swirling Cosmic Energy Core (Particles inside the tesseract)
    const particleCount = size > 80 ? 120 : 40;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 1.1;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 1.1;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 1.1;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: new THREE.Color('#7dd3fc'),
      size: size > 80 ? 0.08 : 0.05,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    tesseractGroup.add(particles);

    // E. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x38bdf8, 3, 10);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);

    const rimLight = new THREE.DirectionalLight(0xbae6fd, 2);
    rimLight.position.set(2, 3, 2);
    scene.add(rimLight);

    // Mouse Interaction
    let targetRotX = 0;
    let targetRotY = 0;
    let currentRotX = 0;
    let currentRotY = 0;
    let burstScale = 1;

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetRotY = x * 0.8;
      targetRotX = -y * 0.8;
    };

    const handleMouseEnter = () => {
      if (burstOnHover) {
        burstScale = 1.2;
      }
    };

    const handleMouseLeave = () => {
      burstScale = 1;
      targetRotX = 0;
      targetRotY = 0;
    };

    const containerEl = containerRef.current;
    if (interactive && containerEl) {
      containerEl.addEventListener('mousemove', handleMouseMove);
      containerEl.addEventListener('mouseenter', handleMouseEnter);
      containerEl.addEventListener('mouseleave', handleMouseLeave);
    }

    // Animation Loop
    let time = 0;
    const animate = () => {
      time += 0.018;

      // Natural 4D tesseract multi-axis rotation
      tesseractGroup.rotation.y += 0.015;
      tesseractGroup.rotation.x = Math.sin(time * 0.5) * 0.25;
      tesseractGroup.rotation.z = Math.cos(time * 0.3) * 0.15;

      // Inner hypercube counter-rotates
      innerMesh.rotation.y -= 0.025;
      innerMesh.rotation.x += 0.02;
      innerLine.rotation.y -= 0.025;
      innerLine.rotation.x += 0.02;

      // Particles cosmic pulsation
      particles.rotation.y += 0.03;
      particles.rotation.z -= 0.01;
      const scalePulse = 1 + Math.sin(time * 3) * 0.05;
      particles.scale.set(scalePulse, scalePulse, scalePulse);

      // Smooth mouse lerp
      currentRotX += (targetRotX - currentRotX) * 0.1;
      currentRotY += (targetRotY - currentRotY) * 0.1;
      tesseractGroup.position.x = currentRotY * 0.3;
      tesseractGroup.position.y = currentRotX * 0.3;

      // Scale lerp for burst
      tesseractGroup.scale.lerp(new THREE.Vector3(burstScale, burstScale, burstScale), 0.1);

      renderer.render(scene, camera);
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (interactive && containerEl) {
        containerEl.removeEventListener('mousemove', handleMouseMove);
        containerEl.removeEventListener('mouseenter', handleMouseEnter);
        containerEl.removeEventListener('mouseleave', handleMouseLeave);
      }
      outerGeo.dispose();
      outerMat.dispose();
      outerEdges.dispose();
      outerLineMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      innerEdges.dispose();
      innerLineMat.dispose();
      beamGeo.dispose();
      vertexLinesMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
      if (containerEl && renderer.domElement) {
        containerEl.removeChild(renderer.domElement);
      }
    };
  }, [size, interactive, burstOnHover]);

  return (
    <div
      ref={containerRef}
      style={{ width: size, height: size }}
      className={`relative inline-flex items-center justify-center select-none shrink-0 overflow-visible ${className}`}
    />
  );
};

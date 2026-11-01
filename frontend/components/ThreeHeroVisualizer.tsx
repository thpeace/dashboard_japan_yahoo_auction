"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ThreeHeroVisualizer() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 600;
    const height = mount.clientHeight || 500;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 18);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // 2. Primary 3D Wireframe Core / Gateway Globe
    const globeGeometry = new THREE.IcosahedronGeometry(6, 2);
    const globeMaterial = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });
    const globe = new THREE.Mesh(globeGeometry, globeMaterial);
    scene.add(globe);

    // Inner glowing sphere core
    const innerGeo = new THREE.SphereGeometry(4.8, 32, 32);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
    });
    const innerGlobe = new THREE.Mesh(innerGeo, innerMat);
    scene.add(innerGlobe);

    // 3. Japan Proxy Hub Nodes (Tokyo, Osaka, Fukuoka, Nagoya pins)
    const proxyNodes: THREE.Mesh[] = [];
    const proxyCoords = [
      { lat: 35.6762, lon: 139.6503, color: 0x10b981, label: "Tokyo Primary" },
      { lat: 34.6937, lon: 135.5023, color: 0x06b6d4, label: "Osaka Gateway" },
      { lat: 33.5904, lon: 130.4017, color: 0x8b5cf6, label: "Fukuoka Stealth" },
      { lat: 35.1815, lon: 136.9066, color: 0xf59e0b, label: "Nagoya Residential" },
    ];

    function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const z = radius * Math.sin(phi) * Math.sin(theta);
      const y = radius * Math.cos(phi);
      return new THREE.Vector3(x, y, z);
    }

    proxyCoords.forEach((p) => {
      const pos = latLonToVector3(p.lat, p.lon, 6.05);
      const nodeGeo = new THREE.SphereGeometry(0.24, 16, 16);
      const nodeMat = new THREE.MeshBasicMaterial({ color: p.color });
      const node = new THREE.Mesh(nodeGeo, nodeMat);
      node.position.copy(pos);
      globe.add(node);
      proxyNodes.push(node);

      // Pulse ring for each node
      const ringGeo = new THREE.RingGeometry(0.3, 0.45, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: p.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.copy(pos);
      ring.lookAt(0, 0, 0);
      globe.add(ring);
    });

    // 4. Connecting Bezier Splines / Communication Arcs between Nodes
    const curvePoints = [
      latLonToVector3(35.6762, 139.6503, 6.05),
      new THREE.Vector3(2.5, 3.8, 5.5),
      latLonToVector3(34.6937, 135.5023, 6.05),
    ];
    const curve = new THREE.CatmullRomCurve3(curvePoints);
    const tubeGeo = new THREE.TubeGeometry(curve, 40, 0.04, 8, false);
    const tubeMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.8,
    });
    const tube = new THREE.Mesh(tubeGeo, tubeMat);
    globe.add(tube);

    // 5. Orbital Particles (Automated Bidding Traffic)
    const particleCount = 450;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const radius = 7 + Math.random() * 5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      // Cyan to Emerald particle colors
      const isCyan = Math.random() > 0.4;
      colors[i * 3] = isCyan ? 0.2 : 0.06;
      colors[i * 3 + 1] = isCyan ? 0.75 : 0.9;
      colors[i * 3 + 2] = isCyan ? 0.98 : 0.5;
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 6. Mouse Interaction Parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = mount.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / width - 0.5) * 2;
      mouseY = ((e.clientY - rect.top) / height - 0.5) * 2;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // 7. Animation Loop
    let animationId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth camera parallax
      targetX = mouseX * 1.5;
      targetY = -mouseY * 1.2;
      camera.position.x += (targetX - camera.position.x) * 0.05;
      camera.position.y += (targetY - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      // Continuous rotation
      globe.rotation.y = elapsedTime * 0.15;
      globe.rotation.x = Math.sin(elapsedTime * 0.1) * 0.1;
      innerGlobe.rotation.y = -elapsedTime * 0.12;
      particles.rotation.y = elapsedTime * 0.06;
      particles.rotation.x = elapsedTime * 0.03;

      // Pulse proxy nodes
      const scale = 1 + Math.sin(elapsedTime * 4) * 0.25;
      proxyNodes.forEach((node) => node.scale.set(scale, scale, scale));

      renderer.render(scene, camera);
    };

    animate();

    // 8. Resize Handler
    const handleResize = () => {
      if (!mount) return;
      const newWidth = mount.clientWidth;
      const newHeight = mount.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
      globeGeometry.dispose();
      globeMaterial.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-[450px] sm:h-[520px] flex items-center justify-center overflow-hidden">
      {/* Three.js Canvas Container */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating HUD Badges over the 3D Canvas */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <div className="glass-panel px-3 py-1.5 rounded-full flex items-center space-x-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-slate-300 font-mono">JP Residential Gateway Active</span>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 z-10 pointer-events-none">
        <div className="glass-panel px-3 py-1.5 rounded-full flex items-center space-x-2 text-xs">
          <span className="text-cyan-400 font-mono">Sniper Engine: Ready (T-8s)</span>
        </div>
      </div>
    </div>
  );
}


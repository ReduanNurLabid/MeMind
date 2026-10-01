import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const CONFIG = {
  particleCount: 2200,
  connectionDistance: 1.15,
  brainColor: 0x00d2ff, // Cyan / electric blue
  connectionColor: 0xa855f7, // Deep purple / violet
  bgColor: 0x07070d
};

// Anatomical coordinates for trigger positioning
const ANATOMICAL_REGIONS = [
  { name: 'Left Prefrontal', pos: [-1.45, 1.15, 1.1] },
  { name: 'Right Prefrontal', pos: [1.45, 1.15, 1.1] },
  { name: 'Left Limbic / Amygdala', pos: [-1.65, -0.15, 0.35] },
  { name: 'Right Limbic / Temporal', pos: [1.65, -0.15, 0.35] },
  { name: 'Parietal Cortex', pos: [0, 1.5, -1.0] },
  { name: 'Cerebellar Reflex', pos: [0, -1.35, -1.25] },
  { name: 'Sensory Cortex', pos: [-0.9, 1.45, -0.2] },
  { name: 'Motor Cortex', pos: [0.9, 1.45, -0.2] }
];

// Helper to create circular particle glow texture
function createParticleGlowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  grad.addColorStop(0.25, 'rgba(160, 220, 255, 0.85)');
  grad.addColorStop(0.6, 'rgba(80, 120, 255, 0.25)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// Helper to create high-resolution 3D word badges as canvas textures
function createWordBadgeTexture(domain, word, response, timeDiff, colorHex) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // Background rounded rectangle
  const x = 12, y = 12, w = 488, h = 232, r = 26;
  
  ctx.shadowColor = colorHex;
  ctx.shadowBlur = 24;
  
  ctx.fillStyle = 'rgba(8, 8, 16, 0.94)';
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fill();

  ctx.lineWidth = 6;
  ctx.strokeStyle = colorHex;
  ctx.stroke();

  // Reset shadow for crisp text
  ctx.shadowBlur = 0;

  // Domain banner
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(domain.toUpperCase(), 256, 56);

  // Trigger Word (Dr. Freud)
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 44px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(word, 256, 118);

  // Patient's Response
  ctx.fillStyle = colorHex;
  ctx.font = 'italic bold 34px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  const displayResp = response ? `→ ${response}` : '→ [BLOCKED]';
  ctx.fillText(displayResp, 256, 175);

  // Delta time pill
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.font = '500 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  const deltaStr = (timeDiff >= 0 ? `+${timeDiff.toFixed(1)}s` : `${timeDiff.toFixed(1)}s`) + ' vs baseline';
  ctx.fillText(deltaStr, 256, 214);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  return texture;
}

export default function Brain3D({ triggers = [], avgBaselineTime = 2.0 }) {
  const mountRef = useRef(null);
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const controlsRef = useRef(null);
  const cameraRef = useRef(null);
  const targetNodesRef = useRef([]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 650;
    const isMobile = window.innerWidth <= 768;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(CONFIG.bgColor);
    scene.fog = new THREE.FogExp2(CONFIG.bgColor, 0.04);

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 2.5, 9.5);
    cameraRef.current = camera;

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: !isMobile, 
      preserveDrawingBuffer: true, 
      powerPreference: 'high-performance' 
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isMobile ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // 4. Controls Setup
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.75;
    controls.minDistance = 3.5;
    controls.maxDistance = 16.0;
    controls.maxPolarAngle = Math.PI * 0.85;
    controlsRef.current = controls;

    // 5. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x00d2ff, 2.0);
    dirLight1.position.set(6, 10, 8);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xa855f7, 2.0);
    dirLight2.position.set(-6, -8, -6);
    scene.add(dirLight2);

    const centerGlow = new THREE.PointLight(0x00d2ff, 3, 15);
    centerGlow.position.set(0, 0.5, 0);
    scene.add(centerGlow);

    // 6. Grid Helper (Sci-fi synaptic floor)
    const gridHelper = new THREE.GridHelper(24, 24, 0x3b82f6, 0x1e293b);
    gridHelper.position.y = -3.2;
    scene.add(gridHelper);

    // 7. Brain Model Group
    const brainGroup = new THREE.Group();
    scene.add(brainGroup);

    // 7.1 Realistic Brain Flesh Mesh
    const fleshyMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffaacc,
      emissive: 0x4a0022,
      roughness: 0.25,
      metalness: 0.05,
      clearcoat: isMobile ? 0 : 1.0,
      clearcoatRoughness: 0.15,
      transmission: isMobile ? 0 : 0.75, // Disable heavy dual-pass glass on mobile
      thickness: isMobile ? 0 : 1.5,
      transparent: true,
      opacity: isMobile ? 0.6 : 0.85,
      side: THREE.DoubleSide
    });

    if (!isMobile) {
      const loader = new GLTFLoader();
      const brainModelUrl = `${import.meta.env.BASE_URL}brain.glb`;
      loader.load(brainModelUrl, (gltf) => {
        gltf.scene.traverse((child) => {
          if (child.isMesh) {
            child.material = fleshyMaterial;
            
            // Perfectly center the geometry around its own local origin
            child.geometry.center();
            child.geometry.computeBoundingBox();
            
            const box = child.geometry.boundingBox;
            const size = new THREE.Vector3();
            box.getSize(size);
            
            const maxDim = Math.max(size.x, size.y, size.z);
            
            // Apply user's manually tweaked transforms
            const s = 3.6 / maxDim; 
            child.scale.set(s, s, s);
            
            child.rotation.set(
              -88 * Math.PI / 180,
              0 * Math.PI / 180,
              77 * Math.PI / 180
            );
            
            child.position.set(0, 0, 0);
            
            brainGroup.add(child);
          }
        });
      }, undefined, (error) => {
        console.error('Failed to load brain.glb:', error);
      });
    }

    // Points generation
    const points = [];
    const colors = [];

    const addEllipsoidPoints = (count, center, radius) => {
      for (let i = 0; i < count; i++) {
        const u = Math.random();
        const v = Math.random();
        const theta = 2 * Math.PI * u;
        const phi = Math.acos(2 * v - 1);
        const r = Math.cbrt(Math.random());

        const x = r * Math.sin(phi) * Math.cos(theta) * radius.x + center.x;
        const y = r * Math.sin(phi) * Math.sin(theta) * radius.y + center.y;
        const z = r * Math.cos(phi) * radius.z + center.z;

        points.push(new THREE.Vector3(x, y, z));

        const color = new THREE.Color();
        const mix = (z + 2.0) / 4.0;
        color.lerpColors(new THREE.Color(CONFIG.brainColor), new THREE.Color(CONFIG.connectionColor), Math.max(0, Math.min(1, mix)));
        colors.push(color.r, color.g, color.b);
      }
    };

    // Anatomical brain segments
    addEllipsoidPoints(900, new THREE.Vector3(-0.65, 0.2, 0), new THREE.Vector3(1.35, 1.7, 2.1)); // Left Hemisphere
    addEllipsoidPoints(900, new THREE.Vector3(0.65, 0.2, 0), new THREE.Vector3(1.35, 1.7, 2.1));  // Right Hemisphere
    addEllipsoidPoints(320, new THREE.Vector3(0, -1.3, -1.1), new THREE.Vector3(1.65, 0.95, 0.95)); // Cerebellum
    addEllipsoidPoints(80, new THREE.Vector3(0, -2.1, -0.2), new THREE.Vector3(0.55, 1.2, 0.55));  // Brain Stem

    // Brain Particles
    const particleGeometry = new THREE.BufferGeometry().setFromPoints(points);
    particleGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const particleTexture = createParticleGlowTexture();
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.16,
      vertexColors: true,
      map: particleTexture,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const brainParticles = new THREE.Points(particleGeometry, particleMaterial);
    brainGroup.add(brainParticles);

    // Neural Connections (Synaptic Web)
    const linePositions = [];
    const lineColors = [];
    const maxConnections = 4;
    const ptCount = points.length;

    for (let i = 0; i < ptCount; i += 2) {
      let connections = 0;
      for (let j = i + 1; j < ptCount; j += 2) {
        const dist = points[i].distanceTo(points[j]);
        if (dist < CONFIG.connectionDistance) {
          linePositions.push(points[i].x, points[i].y, points[i].z);
          linePositions.push(points[j].x, points[j].y, points[j].z);

          lineColors.push(colors[i * 3], colors[i * 3 + 1], colors[i * 3 + 2]);
          lineColors.push(colors[j * 3], colors[j * 3 + 1], colors[j * 3 + 2]);

          connections++;
          if (connections >= maxConnections) break;
        }
      }
    }

    const linesGeometry = new THREE.BufferGeometry();
    linesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    linesGeometry.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 3));

    const linesMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending
    });

    const brainLines = new THREE.LineSegments(linesGeometry, linesMaterial);
    brainGroup.add(brainLines);

    // 8. Map Trigger Words onto 3D Mind
    const triggerNodes = [];
    const nodeSpheres = [];
    const nodeSprites = [];

    triggers.forEach((t, idx) => {
      const region = ANATOMICAL_REGIONS[idx % ANATOMICAL_REGIONS.length];
      const timeDiff = t.timeTaken - avgBaselineTime;
      const isProblem = !t.response || timeDiff > 0.8;
      const isFast = timeDiff < -0.3;
      const colorHex = isProblem ? '#ef4444' : (isFast ? '#10b981' : '#6366f1');
      const threeColor = new THREE.Color(colorHex);

      const nodeGroup = new THREE.Group();
      nodeGroup.position.set(...region.pos);

      // Glowing Synaptic Core
      const sphereGeo = new THREE.SphereGeometry(0.18, 20, 20);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: threeColor,
        emissive: threeColor,
        emissiveIntensity: 2.5,
        roughness: 0.2
      });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      nodeGroup.add(sphere);
      nodeSpheres.push(sphere);

      // Light glow at synaptic node
      const nodeLight = new THREE.PointLight(threeColor, 1.8, 3.0);
      nodeGroup.add(nodeLight);

      // Synaptic Connection line from brain core to node
      const connectorGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(...region.pos)
      ]);
      const connectorMat = new THREE.LineBasicMaterial({
        color: threeColor,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending
      });
      const connectorLine = new THREE.Line(connectorGeo, connectorMat);
      brainGroup.add(connectorLine);

      // Floating 3D Word Billboard Sprite
      const spriteTexture = createWordBadgeTexture(t.domain, t.word, t.response, timeDiff, colorHex);
      const spriteMat = new THREE.SpriteMaterial({
        map: spriteTexture,
        transparent: true,
        opacity: 0.95,
        depthWrite: false
      });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.position.set(0, 0.55, 0);
      sprite.scale.set(2.2, 1.1, 1.0);
      nodeGroup.add(sprite);
      nodeSprites.push({ sprite, baseScale: [2.2, 1.1, 1.0] });

      brainGroup.add(nodeGroup);
      triggerNodes.push({ group: nodeGroup, pos: region.pos, color: colorHex });
    });

    targetNodesRef.current = triggerNodes;

    // 9. Resize Handling via ResizeObserver
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 800;
      const h = container.clientHeight || 650;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // 10. Animation Loop
    let animId;
    const startTime = performance.now();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = (performance.now() - startTime) * 0.001;

      // Smooth floating and gentle oscillation
      brainGroup.position.y = 0.2 + Math.sin(elapsed * 1.2) * 0.08;

      // Pulse nodes
      nodeSpheres.forEach((sphere, i) => {
        const pulse = 1.0 + Math.sin(elapsed * 3.0 + i) * 0.2;
        sphere.scale.set(pulse, pulse, pulse);
      });

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      controls.dispose();
      particleTexture.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      linesGeometry.dispose();
      linesMaterial.dispose();
      renderer.dispose();
      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [triggers, avgBaselineTime]);

  const focusOnNode = (idx) => {
    setHoveredIdx(idx);
    if (!controlsRef.current || !targetNodesRef.current[idx]) return;
    const node = targetNodesRef.current[idx];
    if (cameraRef.current && node) {
      // Temporarily pause auto rotate to inspect node
      controlsRef.current.autoRotate = false;
      const [nx, ny, nz] = node.pos;
      controlsRef.current.target.set(nx * 0.5, ny * 0.5, nz * 0.5);
      setTimeout(() => {
        if (controlsRef.current) controlsRef.current.autoRotate = true;
      }, 5000);
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '650px', background: 'var(--bg-dark)', borderRadius: '24px', overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Legend Overlay */}
      <div style={{ position: 'absolute', top: 20, left: 24, zIndex: 10, color: 'rgba(255,255,255,0.9)', pointerEvents: 'none', padding: '14px 22px', background: 'rgba(5, 5, 10, 0.75)', borderRadius: '16px', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.2rem' }}>🧠</span>
          <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#fff', letterSpacing: '0.04em' }}>Subconscious 3D Neural Map</h3>
        </div>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Drag with mouse to rotate in 3D &bull; Scroll to zoom &bull; Click card to locate</p>
        <div style={{ display: 'flex', gap: '16px', marginTop: '10px', fontSize: '0.78rem', fontWeight: 500 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: 9, height: 9, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 8px #ef4444' }}></div> Defensive Stall (+0.8s)</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: 9, height: 9, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }}></div> Instinct Burst (-0.3s)</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: 9, height: 9, borderRadius: '50%', background: '#6366f1', boxShadow: '0 0 8px #6366f1' }}></div> Neutral Baseline</span>
        </div>
      </div>

      {/* Reset Camera View Button */}
      <button 
        onClick={() => {
          if (controlsRef.current && cameraRef.current) {
            controlsRef.current.reset();
            cameraRef.current.position.set(0, 2.5, 9.5);
            controlsRef.current.target.set(0, 0, 0);
            controlsRef.current.autoRotate = true;
          }
        }}
        style={{
          position: 'absolute',
          top: 20,
          right: 24,
          zIndex: 10,
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          color: '#ffffff',
          borderRadius: '999px',
          padding: '8px 18px',
          fontSize: '0.8rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.18)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
      >
        <span>🔄</span> Reset Perspective
      </button>

      {/* 3D WebGL Canvas Container */}
      <div 
        ref={mountRef}
        className="brain-canvas-container"
        style={{ 
          width: '100%', 
          height: '100%', 
          minHeight: '650px', 
          cursor: 'grab', 
          display: 'block' 
        }} 
      />

      {/* Interactive Trigger HUD Cards on bottom of 3D brain */}
      <div className="hud-cards-container" style={{ 
        position: 'absolute', 
        bottom: '16px', 
        left: '20px', 
        right: '20px', 
        zIndex: 10,
        display: 'flex', 
        gap: '12px', 
        overflowX: 'auto', 
        padding: '8px 4px',
        scrollbarWidth: 'none'
      }}>
        {triggers.map((t, idx) => {
          const timeDiff = t.timeTaken - avgBaselineTime;
          const isProblem = !t.response || timeDiff > 0.8;
          const isFast = timeDiff < -0.3;
          const color = isProblem ? '#ef4444' : (isFast ? '#10b981' : '#6366f1');
          
          return (
            <div 
              key={idx}
              onClick={() => focusOnNode(idx)}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{
                flex: '1 0 170px',
                minWidth: '160px',
                background: hoveredIdx === idx ? 'rgba(15, 15, 25, 0.92)' : 'rgba(8, 8, 16, 0.78)',
                backdropFilter: 'blur(12px)',
                border: `1px solid ${hoveredIdx === idx ? color : 'rgba(255,255,255,0.12)'}`,
                borderLeft: `5px solid ${color}`,
                borderRadius: '14px',
                padding: '12px 14px',
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                transform: hoveredIdx === idx ? 'translateY(-6px) scale(1.02)' : 'none',
                boxShadow: hoveredIdx === idx ? `0 12px 28px ${color}40` : '0 4px 16px rgba(0,0,0,0.5)'
              }}
            >
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                {t.domain}
              </div>
              <div style={{ fontWeight: 700, fontSize: '1.2rem', color: '#fff', margin: '3px 0' }}>
                {t.word}
              </div>
              <div style={{ color: color, fontSize: '0.98rem', fontStyle: 'italic', fontWeight: 600 }}>
                &rarr; {t.response || '[BLOCKED]'}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '5px' }}>
                {t.timeTaken.toFixed(1)}s ({timeDiff > 0 ? '+' : ''}{timeDiff.toFixed(1)}s)
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

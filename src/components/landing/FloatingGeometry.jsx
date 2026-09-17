import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Sphere } from '@react-three/drei';
import * as THREE from 'three';

/* ── Helper: build a smooth tube from a set of 3D control-points ── */
function SmoothTube({ points, radius = 0.45, color = '#ffffff', metalness = 0.05, roughness = 0.18, tubularSegments = 200, radialSegments = 32, ...props }) {
  const curve = useMemo(() => {
    const pts = points.map(p => new THREE.Vector3(...p));
    return new THREE.CatmullRomCurve3(pts, true, 'centripetal', 0.5);
  }, [points]);

  return (
    <mesh castShadow receiveShadow {...props}>
      <tubeGeometry args={[curve, tubularSegments, radius, radialSegments, true]} />
      <meshPhysicalMaterial
        color={color}
        metalness={metalness}
        roughness={roughness}
        clearcoat={1}
        clearcoatRoughness={0.08}
        envMapIntensity={1.8}
        transmission={0.05}
        thickness={1}
      />
    </mesh>
  );
}

/* ── Large twisted loop — hero shape ── */
function TwistedLoop({ position, rotation, scale = 1, color = '#818cf8' }) {
  const ref = useRef();

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    ref.current.rotation.z = (rotation?.[2] || 0) + Math.sin(t * 0.15) * 0.08;
    ref.current.rotation.x = (rotation?.[0] || 0) + Math.cos(t * 0.12) * 0.06;
  });

  const points = [
    [0, 3, 0],
    [3, 2, 1.5],
    [4, 0, -1],
    [3, -2, 1],
    [0, -3.5, -0.5],
    [-2, -2, 1.5],
    [-3, 0, -1],
    [-2, 2, 0.5],
  ];

  return (
    <group ref={ref} position={position} scale={scale}>
      <SmoothTube points={points} radius={0.65} color={color} metalness={0.15} roughness={0.12} />
    </group>
  );
}

/* ── Flowing ribbon / S-curve ── */
function FlowingRibbon({ position, rotation, scale = 1, color = '#a78bfa' }) {
  const ref = useRef();

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    ref.current.rotation.y = (rotation?.[1] || 0) + Math.sin(t * 0.1) * 0.1;
    ref.current.rotation.z = (rotation?.[2] || 0) + Math.cos(t * 0.08) * 0.05;
  });

  const points = [
    [-4, 2, 0],
    [-2, 3, 2],
    [0, 1, -1],
    [2, -1, 2],
    [4, -3, 0],
    [3, -4, -2],
    [1, -2, -1],
  ];

  return (
    <group ref={ref} position={position} scale={scale}>
      <SmoothTube points={points} radius={0.5} color={color} metalness={0.12} roughness={0.15} tubularSegments={180} />
    </group>
  );
}

/* ── Organic knot shape ── */
function OrganicKnot({ position, scale = 1, color = '#6366f1' }) {
  const ref = useRef();

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    ref.current.rotation.y += 0.002;
    ref.current.rotation.x = Math.sin(t * 0.1) * 0.15;
  });

  const points = useMemo(() => {
    const pts = [];
    const n = 80;
    for (let i = 0; i < n; i++) {
      const t = (i / n) * Math.PI * 2;
      const r = 2 + Math.cos(3 * t);
      pts.push([
        r * Math.cos(2 * t) * 0.8,
        r * Math.sin(2 * t) * 0.8,
        Math.sin(3 * t) * 1.2,
      ]);
    }
    return pts;
  }, []);

  return (
    <group ref={ref} position={position} scale={scale}>
      <SmoothTube points={points} radius={0.4} color={color} metalness={0.2} roughness={0.1} tubularSegments={256} />
    </group>
  );
}

/* ── Glossy blob/sphere ── */
function GlossyBlob({ position, scale = 1, color = '#c4b5fd' }) {
  const ref = useRef();

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    ref.current.position.y = position[1] + Math.sin(t * 0.5) * 0.3;
  });

  return (
    <Sphere ref={ref} args={[1, 64, 64]} position={position} scale={scale} castShadow receiveShadow>
      <meshPhysicalMaterial
        color={color}
        metalness={0.1}
        roughness={0.1}
        clearcoat={1}
        clearcoatRoughness={0.05}
        envMapIntensity={2}
        transmission={0.15}
        thickness={1}
      />
    </Sphere>
  );
}

/* ── Wavy ring ── */
function WavyRing({ position, scale = 1, color = '#ddd6fe' }) {
  const ref = useRef();

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    ref.current.rotation.x = Math.PI / 3 + Math.sin(t * 0.12) * 0.1;
    ref.current.rotation.z += 0.001;
  });

  const points = useMemo(() => {
    const pts = [];
    const n = 60;
    for (let i = 0; i < n; i++) {
      const angle = (i / n) * Math.PI * 2;
      const r = 3;
      pts.push([
        Math.cos(angle) * r,
        Math.sin(angle) * r,
        Math.sin(angle * 3) * 0.6,
      ]);
    }
    return pts;
  }, []);

  return (
    <group ref={ref} position={position} scale={scale}>
      <SmoothTube points={points} radius={0.35} color={color} metalness={0.08} roughness={0.2} tubularSegments={200} />
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════
   Main scene — all shapes with mouse parallax
   ════════════════════════════════════════════════════════════════ */
export function FloatingGeometry() {
  const groupRef = useRef();

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();

    // Smooth mouse-follow parallax
    const targetX = state.pointer.x * 1.2;
    const targetY = state.pointer.y * 1.2;
    groupRef.current.position.x += (targetX - groupRef.current.position.x) * 0.04;
    groupRef.current.position.y += (targetY - groupRef.current.position.y) * 0.04;

    // Subtle breathing
    groupRef.current.rotation.y = Math.sin(t / 12) * 0.06;
    groupRef.current.rotation.x = Math.cos(t / 18) * 0.04;
  });

  return (
    <group ref={groupRef}>
      {/* ── RIGHT SIDE (dominant) ── */}

      {/* Large twisted loop — indigo */}
      <TwistedLoop position={[5.5, 0.5, -1]} rotation={[0.3, 0.5, 0.2]} scale={1.3} color="#818cf8" />

      {/* Organic trefoil knot — deeper indigo */}
      <OrganicKnot position={[7, -2, -4]} scale={0.9} color="#6366f1" />

      {/* Flowing ribbon — violet */}
      <FlowingRibbon position={[4, 3, -3]} rotation={[0, 0.4, 0.1]} scale={1.1} color="#a78bfa" />

      {/* Wavy ring — light violet */}
      <WavyRing position={[8, 1, -6]} scale={1.1} color="#ddd6fe" />

      {/* Glossy blob — warm peach accent */}
      <Float speed={2} rotationIntensity={0.3} floatIntensity={1.5}>
        <GlossyBlob position={[3, -3.5, 2]} scale={1.1} color="#fbbf24" />
      </Float>

      {/* Glossy blob — soft pink */}
      <Float speed={1.8} rotationIntensity={0.5} floatIntensity={1.2}>
        <GlossyBlob position={[9, 3, -2]} scale={0.7} color="#f0abfc" />
      </Float>

      {/* ── LEFT SIDE (very subtle, far back) ── */}
      <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.8}>
        <GlossyBlob position={[-5, 3.5, -9]} scale={0.6} color="#c7d2fe" />
      </Float>

      {/* ── BOTTOM accent — teal ── */}
      <Float speed={2.5} rotationIntensity={0.5} floatIntensity={2}>
        <GlossyBlob position={[6, -5, 1]} scale={0.5} color="#5eead4" />
      </Float>

      {/* Capsule accent — soft white */}
      <Float speed={1.5} rotationIntensity={0.8} floatIntensity={1.5} position={[10, 4, -1]} rotation={[Math.PI / 4, Math.PI / 4, 0]}>
        <mesh castShadow receiveShadow>
          <capsuleGeometry args={[0.5, 2.5, 32, 64]} />
          <meshPhysicalMaterial
            color="#e0e7ff"
            metalness={0.05}
            roughness={0.15}
            clearcoat={1}
            clearcoatRoughness={0.08}
            envMapIntensity={1.8}
          />
        </mesh>
      </Float>
    </group>
  );
}

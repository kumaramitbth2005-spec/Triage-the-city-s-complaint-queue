import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows } from '@react-three/drei';
import { FloatingGeometry } from './FloatingGeometry';

export function Background3D() {
  return (
    <div className="w-full h-full bg-stone-50">
      <Canvas
        shadows
        camera={{ position: [0, 0, 18], fov: 42 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]}
      >
        <color attach="background" args={['#fafaf9']} />

        {/* Key light — warm from top-right */}
        <directionalLight
          position={[12, 15, 10]}
          intensity={2}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-bias={-0.0001}
          color="#ffffff"
        />

        {/* Fill light — cool from left */}
        <directionalLight position={[-8, 5, 5]} intensity={0.8} color="#e8ecf0" />

        {/* Rim light — from behind */}
        <directionalLight position={[0, -5, -10]} intensity={0.4} color="#f0ebe6" />

        {/* Ambient fill */}
        <ambientLight intensity={0.6} />

        {/* Soft floor shadow */}
        <ContactShadows
          position={[0, -6, 0]}
          opacity={0.15}
          scale={30}
          blur={2.5}
          far={20}
          color="#a0a0a0"
        />

        <Suspense fallback={null}>
          <Environment preset="studio" environmentIntensity={0.8} />
          <FloatingGeometry />
        </Suspense>
      </Canvas>
    </div>
  );
}

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const VeilShader = {
  uniforms: {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color('#d7b77f') },
    uBgColor: { value: new THREE.Color('#f7f1e7') },
    uResolution: { value: new THREE.Vector2() }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uColor;
    uniform vec3 uBgColor;
    uniform vec2 uResolution;
    varying vec2 vUv;

    // Simple noise function
    float noise(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

    void main() {
      vec2 p = vUv * 2.0 - 1.0;
      float time = uTime * 0.2;
      
      float color = 0.0;
      color += sin(p.x * 10.0 + time) * 0.5 + 0.5;
      color += cos(p.y * 8.0 - time) * 0.5 + 0.5;
      color *= 0.2;

      // Add "fog" effect
      float fog = smoothstep(0.8, 0.0, length(p));
      vec3 finalColor = mix(uBgColor, uColor, color * fog);
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
};

const VeilMesh = () => {
  const meshRef = useRef();
  const { size } = useThree();
  
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor: { value: new THREE.Color('#d7b77f') },
    uBgColor: { value: new THREE.Color('#f7f1e7') },
    uResolution: { value: new THREE.Vector2(size.width, size.height) }
  }), [size]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.material.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[20, 20]} />
      <shaderMaterial 
        attach="material"
        args={[VeilShader]}
        uniforms={uniforms}
      />
    </mesh>
  );
};

export const DarkVeil = () => {
  return (
    <div className="absolute inset-0 z-0 bg-[#f7f1e7] pointer-events-none">
      <Canvas camera={{ position: [0, 0, 1] }}>
        <VeilMesh />
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-b from-[#f7f1e7]/60 via-transparent to-[#f7f1e7]" />
    </div>
  );
};

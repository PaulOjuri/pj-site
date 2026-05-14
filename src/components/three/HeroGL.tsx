'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

/* ─── Noise shader — organic, paper-like grain field ─────────── */
const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform vec2  uResolution;
  uniform vec2  uMouse;

  varying vec2 vUv;

  /* ---- Classic Perlin noise helpers ---- */
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    vec2 uv = vUv;

    /* Mouse influence — gentle warp toward cursor */
    vec2 mouseOffset = (uMouse - 0.5) * 0.04;
    uv += mouseOffset * (1.0 - length(uv - 0.5));

    /* Layered noise — slow drift */
    float t = uTime * 0.08;
    float n1 = snoise(vec3(uv * 2.2, t));
    float n2 = snoise(vec3(uv * 4.5 + 1.3, t * 1.4));
    float n3 = snoise(vec3(uv * 9.0 + 3.7, t * 0.6));
    float noise = n1 * 0.55 + n2 * 0.30 + n3 * 0.15;

    /* Paper palette: cream to warm terracotta accent */
    vec3 paper   = vec3(0.980, 0.976, 0.965);  /* #FAF9F6 */
    vec3 accent  = vec3(0.784, 0.467, 0.227);  /* #C8773A */
    vec3 muted   = vec3(0.918, 0.906, 0.886);  /* subtle warm grey */

    float blend = smoothstep(-0.3, 0.5, noise);
    vec3 col = mix(muted, paper, blend);

    /* Faint accent blush at high-noise peaks */
    float accentStrength = smoothstep(0.6, 1.0, noise) * 0.12;
    col = mix(col, accent, accentStrength);

    /* Vignette */
    float dist = length(vUv - 0.5);
    float vignette = 1.0 - smoothstep(0.3, 0.85, dist) * 0.25;
    col *= vignette;

    gl_FragColor = vec4(col, 1.0);
  }
`

/* ─── Fullscreen quad with shader ───────────────────────────── */
function ShaderPlane({ mouseRef }: { mouseRef: React.MutableRefObject<[number, number]> }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const { viewport } = useThree()

  const uniforms = useMemo(
    () => ({
      uTime:       { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uMouse:      { value: new THREE.Vector2(0.5, 0.5) },
    }),
    [],
  )

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const mat = meshRef.current.material as THREE.ShaderMaterial
    mat.uniforms.uTime.value = clock.getElapsedTime()
    mat.uniforms.uMouse.value.set(mouseRef.current[0], mouseRef.current[1])
  })

  return (
    <mesh ref={meshRef} scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  )
}

/* ─── Exported canvas wrapper ────────────────────────────────── */
export function HeroGL() {
  const mouseRef = useRef<[number, number]>([0.5, 0.5])

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseRef.current = [
      (e.clientX - rect.left) / rect.width,
      1 - (e.clientY - rect.top) / rect.height,
    ]
  }

  return (
    <div
      className="absolute inset-0"
      onMouseMove={handleMouseMove}
      aria-hidden="true"
    >
      <Canvas
        gl={{ antialias: false, alpha: false }}
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 1], near: 0.1, far: 10 }}
        style={{ width: '100%', height: '100%' }}
      >
        <ShaderPlane mouseRef={mouseRef} />
      </Canvas>
    </div>
  )
}

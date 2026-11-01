import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, ShieldCheck, FileText, Search, Sparkles, 
  ChevronDown, Layers, Activity, CheckCircle2 
} from 'lucide-react';

export function SmartCity3DExperience() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const tagsContainerRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activePanelIndex, setActivePanelIndex] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const tagBox = tagsContainerRef.current;
    const scroller = containerRef.current;
    if (!canvas || !tagBox || !scroller) return;

    let animId;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 768;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: !isMobile, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));
    if ('outputColorSpace' in renderer) {
      renderer.outputColorSpace = THREE.SRGBColorSpace;
    } else {
      renderer.outputEncoding = 3001; // sRGBEncoding constant value
    }
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    const HAZE = 0xc2958a;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(HAZE);
    scene.fog = new THREE.FogExp2(HAZE, isMobile ? 0.0048 : 0.0040);
    const camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.5, 1700);

    const rnd = Math.random;
    const pick = arr => arr[(rnd() * arr.length) | 0];
    const mkCanvas = (w, h = w) => {
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      return c;
    };
    const tex = (cv, rx = 1, ry = 1) => {
      const T = new THREE.CanvasTexture(cv);
      T.wrapS = T.wrapT = THREE.RepeatWrapping;
      if ('colorSpace' in T) T.colorSpace = THREE.SRGBColorSpace;
      else T.encoding = 3001; // sRGBEncoding constant value
      T.anisotropy = isMobile ? 2 : 8;
      T.repeat.set(rx, ry);
      return T;
    };

    // Dusk sky
    const skyCv = mkCanvas(4, 512);
    const sx = skyCv.getContext('2d');
    const sgr = sx.createLinearGradient(0, 0, 0, 512);
    [[0, '#0f1d44'], [0.30, '#2f4a86'], [0.46, '#d88f7a'], [0.5, '#f6bd8a'], [0.5001, '#9a7f86'], [1, '#3a3440']].forEach(s => sgr.addColorStop(s[0], s[1]));
    sx.fillStyle = sgr;
    sx.fillRect(0, 0, 4, 512);
    const skyMat = new THREE.MeshBasicMaterial({ map: tex(skyCv), side: THREE.BackSide, fog: false, depthWrite: false });
    const sky = new THREE.Mesh(new THREE.SphereGeometry(1200, 24, 16), skyMat);
    sky.renderOrder = -10;
    scene.add(sky);

    // Sun glow
    const glow = mkCanvas(256);
    const gx = glow.getContext('2d');
    const gg = gx.createRadialGradient(128, 128, 4, 128, 128, 128);
    gg.addColorStop(0, 'rgba(255,225,170,1)');
    gg.addColorStop(0.25, 'rgba(255,150,90,.55)');
    gg.addColorStop(1, 'rgba(255,120,80,0)');
    gx.fillStyle = gg;
    gx.fillRect(0, 0, 256, 256);
    const sun = new THREE.Mesh(
      new THREE.PlaneGeometry(900, 900),
      new THREE.MeshBasicMaterial({
        map: new THREE.CanvasTexture(glow),
        transparent: true,
        fog: false,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      })
    );
    sun.position.set(0, 45, -1000);
    scene.add(sun);

    scene.add(new THREE.HemisphereLight(0xb7c4ff, 0x4a3a3a, 0.75));
    const dirLight = new THREE.DirectionalLight(0xffb98a, 1.9);
    dirLight.position.set(-90, 70, 140);
    scene.add(dirLight);

    // Facade textures
    function facade(kind) {
      const S = 512, N = 8, C = S / N;
      const a = mkCanvas(S), b = mkCanvas(S);
      const A = a.getContext('2d'), B = b.getContext('2d');
      A.fillStyle = ['#46627f', '#243646', '#c4bcae', '#94604c'][kind];
      A.fillRect(0, 0, S, S);
      B.fillStyle = '#000';
      B.fillRect(0, 0, S, S);
      const glass = kind < 2;
      for (let r = 0; r < N; r++) {
        for (let c = 0; c < N; c++) {
          const x = c * C, y = r * C;
          const wx = glass ? x + 2 : x + C * 0.2;
          const wy = glass ? y + 2 : y + C * 0.16;
          const ww = glass ? C - 4 : C * 0.6;
          const wh = glass ? C * 0.74 : C * 0.62;
          const g = A.createLinearGradient(0, wy, 0, wy + wh);
          if (glass) {
            g.addColorStop(0, kind ? '#4f7490' : '#bcd6ea');
            g.addColorStop(1, kind ? '#14222e' : '#4d7396');
          } else {
            g.addColorStop(0, '#5a7088');
            g.addColorStop(1, '#1a2430');
          }
          A.fillStyle = g;
          A.fillRect(wx, wy, ww, wh);
          if (!glass) {
            A.strokeStyle = kind === 2 ? '#efe9dc' : '#d8c9b8';
            A.lineWidth = 3;
            A.strokeRect(wx, wy, ww, wh);
            A.fillStyle = 'rgba(0,0,0,.22)';
            A.fillRect(x + C * 0.15, y + C * 0.8, C * 0.7, 3);
          }
          if (rnd() < 0.42) {
            B.fillStyle = pick(['rgba(255,214,150,', 'rgba(255,236,200,', 'rgba(190,220,255,']) + (0.55 + rnd() * 0.45) + ')';
            B.fillRect(wx + 1, wy + 1, ww - 2, wh - 2);
          }
        }
      }
      if (glass) {
        A.fillStyle = 'rgba(10,20,30,.55)';
        for (let c = 0; c < N; c++) A.fillRect(c * C - 1, 0, 2, S);
      }
      for (let i = 0; i < 600; i++) {
        A.fillStyle = 'rgba(0,0,0,.05)';
        A.fillRect(rnd() * S, rnd() * S, 1 + rnd() * 3, 1 + rnd() * 3);
      }
      return { map: tex(a), em: tex(b) };
    }

    const mats = [0, 1, 2, 3].map(k => {
      const f = facade(k);
      return new THREE.MeshStandardMaterial({
        map: f.map,
        emissiveMap: f.em,
        emissive: 0xffffff,
        emissiveIntensity: 1.15,
        roughness: [0.18, 0.22, 0.85, 0.9][k],
        metalness: [0.7, 0.75, 0.05, 0][k]
      });
    });

    const roofMat = new THREE.MeshStandardMaterial({ color: 0x44474f, roughness: 0.9 });
    const metalMat = new THREE.MeshStandardMaterial({ color: 0xa9b2bd, metalness: 0.9, roughness: 0.3 });
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0xff3030 });
    const beacons = [];

    function box(w, h, d, mat, x, y, z) {
      const g = new THREE.BoxGeometry(w, h, d);
      if (mat.map) {
        const uv = g.attributes.uv;
        for (let k = 0; k < 24; k++) {
          const f = k >> 2, wd = f < 2 ? d : w;
          uv.setXY(k, uv.getX(k) * Math.max(1, Math.round(wd / 20.8)), uv.getY(k) * (f >= 2 && f < 4 ? 1 : Math.max(1, Math.round(h / 28.8))));
        }
      }
      const m = new THREE.Mesh(g, mat);
      m.position.set(x, y, z);
      scene.add(m);
      return m;
    }

    const tops = [], PLAZA_Z = -290;
    const maxScreens = isMobile ? 6 : 16;
    let screenCount = 0;

    // Animated LED screens (code stream, live dashboard, brand wall)
    const mkScr = (w, h) => { const c = mkCanvas(w, h); return { x: c.getContext('2d'), T: tex(c) }; };
    const sA = mkScr(256, 384), sB = mkScr(384, 256), sC = mkScr(256, 384);
    const SCREENS = [
      [sA, 8, 12],
      [sB, 12, 8],
      [sC, 8, 12]
    ].map(([sc, w, h]) => ({
      h,
      geo: new THREE.PlaneGeometry(w, h),
      mat: new THREE.MeshBasicMaterial({ map: sc.T, toneMapped: false })
    }));

    const scrCols = Array.from({ length: 16 }, () => rnd() * 384);
    const GL = '01{}<>/=+ABCDEF';
    sA.x.fillStyle = '#020a16';
    sA.x.fillRect(0, 0, 256, 384);

    function drawA() {
      const x = sA.x;
      x.fillStyle = 'rgba(2,10,22,.25)';
      x.fillRect(0, 0, 256, 384);
      x.font = 'bold 16px monospace';
      scrCols.forEach((y, i) => {
        x.fillStyle = '#d6fff2';
        x.fillText(GL[(rnd() * GL.length) | 0], i * 16, y);
        x.fillStyle = '#35e0ff';
        x.fillText(GL[(rnd() * GL.length) | 0], i * 16, y - 16);
        scrCols[i] = y > 384 && rnd() > 0.9 ? 0 : y + 16;
      });
      sA.T.needsUpdate = true;
    }

    function drawB(t) {
      const x = sB.x;
      x.fillStyle = '#07122b';
      x.fillRect(0, 0, 384, 256);
      x.fillStyle = '#fff';
      x.font = '600 18px sans-serif';
      x.fillText('SMART CITY LOAD', 16, 30);
      x.fillStyle = '#3dffb0';
      x.font = '600 34px sans-serif';
      x.fillText((98 + Math.sin(t) * 1.1).toFixed(1) + '%', 240, 40);
      for (let i = 0; i < 12; i++) {
        const h = 30 + (Math.sin(t * 2 + i * 0.7) * 0.5 + 0.5) * 120;
        x.fillStyle = i % 3 ? '#35e0ff' : '#ff3da6';
        x.fillRect(16 + i * 29, 236 - h, 20, h);
      }
      x.strokeStyle = '#fff';
      x.lineWidth = 2;
      x.beginPath();
      for (let i = 0; i <= 24; i++) {
        const yy = 110 + Math.sin(t * 1.5 + i * 0.5) * 30;
        i ? x.lineTo(16 + i * 14, yy) : x.moveTo(16, yy);
      }
      x.stroke();
      sB.T.needsUpdate = true;
    }

    // Replaced NEXA with SMART CITY
    function drawC(t) {
      const x = sC.x;
      const g = x.createLinearGradient(0, 0, 256, 384);
      g.addColorStop(0, 'hsl(' + ((t * 30) % 360) + ',90%,55%)');
      g.addColorStop(1, 'hsl(' + ((t * 30 + 120) % 360) + ',90%,45%)');
      x.fillStyle = g;
      x.fillRect(0, 0, 256, 384);
      x.fillStyle = '#fff';
      x.font = 'bold 50px sans-serif';
      x.fillText('SMART', 20, 160);
      x.fillText('CITY', 20, 222);
      if (Math.sin(t * 4) > 0) {
        x.fillStyle = '#3dffb0';
        x.beginPath();
        x.arc(32, 320, 9, 0, 7);
        x.fill();
      }
      x.fillStyle = '#fff';
      x.font = '600 22px sans-serif';
      x.fillText('AI LIVE', 50, 328);
      x.fillStyle = 'rgba(0,0,0,.12)';
      for (let y = 0; y < 384; y += 4) x.fillRect(0, y, 256, 2);
      sC.T.needsUpdate = true;
    }

    drawA();
    drawB(0);
    drawC(0);

    function building(x, z, w, d, h) {
      const tall = h > 55;
      const kind = tall ? (rnd() < 0.6 ? 0 : 1) : pick([2, 3, 2, 0, 1]);
      const fr = tall && rnd() < 0.65 ? [0.5, 0.3, 0.2] : (h > 35 && rnd() < 0.5 ? [0.65, 0.35] : [1]);
      let y = 0, cw = w, cd = d;
      fr.forEach((f, i) => {
        const th = h * f;
        box(cw, th, cd, mats[kind], x, y + th / 2, z);
        y += th;
        if (kind >= 2 || i === fr.length - 1) {
          box(cw + 0.8, 0.7, cd + 0.8, roofMat, x, y + 0.35, z);
          y += 0.7;
        }
        cw *= 0.78;
        cd *= 0.78;
      });
      if (kind < 2) {
        if (tall && rnd() < 0.35) {
          const cg = new THREE.ConeGeometry(cw * 1.5, cw * 3, 4);
          cg.rotateY(Math.PI / 4);
          const c = new THREE.Mesh(cg, metalMat);
          c.position.set(x, y + cw * 1.5, z);
          scene.add(c);
          y += cw * 3;
        } else {
          box(cw * 1.6, 3, cd * 1.6, roofMat, x, y + 1.5, z);
          y += 3;
        }
      }
      if (tall) tops.push({ x, y, z });
      if (h > 38 && screenCount < maxScreens && Math.abs(x) < 70 && rnd() < 0.3) {
        const sd = SCREENS[screenCount % 3];
        const sg = -Math.sign(x);
        const m = new THREE.Mesh(sd.geo, sd.mat);
        m.position.set(x + sg * (w / 2 + 0.06), Math.min(Math.max(h * fr[0] * 0.5, sd.h / 2 + 3), 40), z);
        m.rotation.y = sg * Math.PI / 2;
        scene.add(m);
        screenCount++;
      }
      if (tall) {
        const len = 10 + rnd() * 22;
        const a = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, len, 6), metalMat);
        a.position.set(x, y + len / 2, z);
        scene.add(a);
        const bc = new THREE.Mesh(new THREE.SphereGeometry(0.6, 8, 6), beaconMat);
        bc.position.set(x, y + len, z);
        scene.add(bc);
        beacons.push(bc);
      }
    }

    // City blocks
    const Z_START = 90, Z_END = -560, cols = isMobile ? 3 : 5;
    for (let z = Z_START; z > Z_END; z -= 18) {
      const dt = 1 + 0.9 * Math.exp(-Math.pow((z + 280) / 130, 2));
      for (const side of [-1, 1]) {
        let cur = 14 + rnd() * 3;
        for (let i = 0; i < cols; i++) {
          const w = 9 + rnd() * 8, d = 9 + rnd() * 7;
          let h = 14 + Math.pow(rnd(), 1.9) * 115 * dt;
          if (cur < 24) h *= 0.7;
          if (rnd() > 0.12 && !(Math.abs(z - PLAZA_Z) < 24 && cur < 52)) {
            building(side * (cur + w / 2), z + (rnd() - 0.5) * 3, w, d, h);
          }
          cur += w + 1 + rnd() * 3;
        }
      }
    }

    // Road, sidewalks, ground
    const rc = mkCanvas(256, 512);
    const R = rc.getContext('2d');
    R.fillStyle = '#2a2c33';
    R.fillRect(0, 0, 256, 512);
    for (let i = 0; i < 3000; i++) {
      R.fillStyle = 'rgba(255,255,255,' + (rnd() * 0.05) + ')';
      R.fillRect(rnd() * 256, rnd() * 512, 2, 2);
    }
    R.fillStyle = '#e8b93c';
    R.fillRect(124, 0, 3, 512);
    R.fillRect(130, 0, 3, 512);
    R.fillStyle = '#e9e9ea';
    for (let y = 0; y < 512; y += 128) {
      R.fillRect(63, y, 3, 64);
      R.fillRect(191, y, 3, 64);
    }
    R.fillRect(6, 0, 3, 512);
    R.fillRect(247, 0, 3, 512);
    const road = new THREE.Mesh(new THREE.PlaneGeometry(16, 700), new THREE.MeshStandardMaterial({ map: tex(rc, 1, 700 / 32), roughness: 0.8 }));
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0, -240);
    scene.add(road);

    for (const s of [-1, 1]) {
      box(5, 0.3, 700, new THREE.MeshStandardMaterial({ color: 0x7b7873, roughness: 0.9 }), s * 10.5, 0.15, -240);
    }
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1400), new THREE.MeshStandardMaterial({ color: 0x34343a, roughness: 1 }));
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, -0.02, -240);
    scene.add(ground);

    // Street lamps
    const lampZ = [];
    for (let z = 80; z > -560; z -= 30) lampZ.push(z);
    const poles = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.12, 0.15, 9, 6), metalMat, lampZ.length * 2);
    const heads = new THREE.InstancedMesh(new THREE.SphereGeometry(0.45, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffe1a8 }), lampZ.length * 2);
    const M = new THREE.Matrix4();
    let li = 0;
    for (const s of [-1, 1]) {
      for (const z of lampZ) {
        poles.setMatrixAt(li, M.makeTranslation(s * 8.6, 4.5, z));
        heads.setMatrixAt(li, M.makeTranslation(s * 7.8, 9.2, z));
        li++;
      }
    }
    scene.add(poles, heads);

    // Cars
    const cars = [];
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x0c1018, metalness: 0.8, roughness: 0.1 });
    const headMat = new THREE.MeshBasicMaterial({ color: 0xfff4d0 });
    const tailMat = new THREE.MeshBasicMaterial({ color: 0xff2a2a });
    const carCount = isMobile ? 18 : 36;
    for (let i = 0; i < carCount; i++) {
      const lane = [-6, -2, 2, 6][i % 4];
      const g = new THREE.Group();
      const bm = new THREE.MeshStandardMaterial({ color: pick([0x1a1d24, 0x8b1e2d, 0xd9d9de, 0x23406b, 0xc9a23a]), metalness: 0.6, roughness: 0.35 });
      const add = (geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); g.add(m); };
      add(new THREE.BoxGeometry(1.9, 0.75, 4.3), bm, 0, 0.65, 0);
      add(new THREE.BoxGeometry(1.6, 0.6, 2.3), glassMat, 0, 1.3, -0.2);
      for (const s of [-1, 1]) {
        add(new THREE.BoxGeometry(0.45, 0.25, 0.1), headMat, s * 0.6, 0.7, 2.17);
        add(new THREE.BoxGeometry(0.5, 0.22, 0.1), tailMat, s * 0.65, 0.75, -2.17);
      }
      g.position.set(lane + (rnd() - 0.5) * 0.6, 0, Z_START - rnd() * (Z_START - Z_END));
      if (lane < 0) g.rotation.y = Math.PI;
      g.userData.v = (lane > 0 ? 1 : -1) * (8 + rnd() * 12);
      scene.add(g);
      cars.push(g);
    }

    // Tech District Plazas
    const padMat = new THREE.MeshStandardMaterial({ color: 0x8a8680, roughness: 0.9 });
    const holos = [];
    const additive = (c, o) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });

    for (const sd of [-1, 1]) {
      const pl = new THREE.Mesh(new THREE.PlaneGeometry(41, 56), padMat);
      pl.rotation.x = -Math.PI / 2;
      pl.position.set(sd * 32.5, 0.03, -284);
      scene.add(pl);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(9, 0.18, 8, 48), new THREE.MeshBasicMaterial({ color: 0x35e0ff }));
      ring.rotation.x = Math.PI / 2;
      ring.position.set(sd * 32, 0.2, -285);
      scene.add(ring);
      const col = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 16, 16, 1, true), additive(0x35e0ff, 0.16));
      col.position.set(sd * 32, 8.2, -285);
      scene.add(col);
      const ico = new THREE.Mesh(new THREE.IcosahedronGeometry(2.6, 1), new THREE.MeshBasicMaterial({ color: 0xff3da6, wireframe: true }));
      ico.position.set(sd * 32, 10, -285);
      scene.add(ico);
      holos.push(ico);
    }

    const NT = isMobile ? 12 : 24;
    const trunks = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.2, 0.28, 2.2, 6), new THREE.MeshStandardMaterial({ color: 0x4a3626 }), NT);
    const crowns = new THREE.InstancedMesh(new THREE.SphereGeometry(1.7, 8, 6), new THREE.MeshStandardMaterial({ color: 0x3f6b3a, roughness: 1 }), NT);
    for (let i = 0; i < NT; i++) {
      let tx, tz, sd;
      do {
        sd = rnd() < 0.5 ? -1 : 1;
        tx = sd * (16 + rnd() * 34);
        tz = -262 - rnd() * 46;
      } while (Math.hypot(tx - sd * 32, tz + 285) < 11);
      trunks.setMatrixAt(i, M.makeTranslation(tx, 1.1, tz));
      crowns.setMatrixAt(i, M.makeTranslation(tx, 3.6, tz));
    }
    scene.add(trunks, crowns);

    // Cyber Data-Gates
    const gates = [];
    [-130, -210, -385, -470].forEach(zz => {
      const mat = new THREE.MeshBasicMaterial({ color: 0x35e0ff });
      const r1 = new THREE.Mesh(new THREE.TorusGeometry(14.5, 0.38, 8, 48), mat);
      r1.position.set(0, 15, zz);
      scene.add(r1);
      const segs = new THREE.Group();
      segs.position.set(0, 15, zz);
      for (let k = 0; k < 20; k++) {
        const a = k / 20 * Math.PI * 2;
        const b = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.5, 0.5), new THREE.MeshBasicMaterial({ color: 0xff3da6 }));
        b.position.set(Math.cos(a) * 13.2, Math.sin(a) * 13.2, 0);
        b.rotation.z = a;
        segs.add(b);
      }
      scene.add(segs);
      gates.push({ mat, segs });
    });

    // ─── COMMAND GANTRY (SMART CITY COMMAND CENTER) ───────────────────────────
    const tickets = [];
    let ticketSeq = 1041, resolvedCount = 0;
    const darkM = new THREE.MeshStandardMaterial({ color: 0x20242c, metalness: 0.8, roughness: 0.4 });
    const gantry = new THREE.Group();
    scene.add(gantry);
    const gadd = (w, h, d, x, y, z, mat) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat || darkM);
      m.position.set(x, y, z);
      gantry.add(m);
      return m;
    };
    gadd(2, 38, 2, -15, 19, -290);
    gadd(2, 38, 2, 15, 19, -290);
    gadd(33, 2.2, 2.4, 0, 37, -290);
    gadd(29, 12.4, 0.6, 0, 30, -290.4);
    gadd(33, 0.3, 0.3, 0, 35.7, -288.6, new THREE.MeshBasicMaterial({ color: 0x35e0ff }));

    const gS = mkScr(1024, 420);
    const gMesh = new THREE.Mesh(new THREE.PlaneGeometry(28, 11.5), new THREE.MeshBasicMaterial({ map: gS.T, toneMapped: false }));
    gMesh.position.set(0, 30, -290.05);
    gantry.add(gMesh);

    const STC = { 'REPORTED': '#ff5a5a', 'CREW EN ROUTE': '#ffc861', 'REPAIRING': '#35e0ff', 'RESOLVED': '#3dffb0' };

    // Brand updated to SMART CITY COMMAND CENTER
    function drawGantry(t) {
      const x = gS.x;
      x.fillStyle = '#050c1c';
      x.fillRect(0, 0, 1024, 420);
      x.fillStyle = '#0d2a55';
      x.fillRect(0, 0, 1024, 64);
      x.fillStyle = '#fff';
      x.font = '700 28px sans-serif';
      x.fillText('SMART CITY COMMAND CENTER', 24, 42);
      x.fillStyle = Math.sin(t * 4) > 0 ? '#3dffb0' : '#1b6a4c';
      x.beginPath();
      x.arc(930, 32, 9, 0, 7);
      x.fill();
      x.fillStyle = '#fff';
      x.font = '22px sans-serif';
      x.fillText('AI LIVE', 950, 40);

      const open = tickets.filter(k => k.status === 'REPORTED').length;
      const prog = tickets.filter(k => k.status === 'CREW EN ROUTE' || k.status === 'REPAIRING').length;

      [
        ['OPEN TICKETS', open, '#ff5a5a'],
        ['DISPATCHED CREWS', prog, '#ffc861'],
        ['RESOLVED TODAY', 1420 + resolvedCount, '#3dffb0']
      ].forEach((c, i) => {
        x.fillStyle = 'rgba(255,255,255,.07)';
        x.fillRect(24 + i * 330, 84, 310, 92);
        x.fillStyle = c[2];
        x.font = '700 46px sans-serif';
        x.fillText(c[1], 40 + i * 330, 142);
        x.fillStyle = '#9fb4cc';
        x.font = '16px sans-serif';
        x.fillText(c[0], 40 + i * 330, 166);
      });

      x.font = '22px sans-serif';
      tickets.slice(0, 5).forEach((k, i) => {
        const y = 222 + i * 38;
        x.fillStyle = '#8fb6e0';
        x.fillText('#' + k.id, 24, y);
        x.fillStyle = '#fff';
        x.fillText(k.title, 110, y);
        x.fillStyle = STC[k.status] || '#fff';
        x.fillText(k.status, 760, y);
      });

      if (!tickets.length) {
        x.fillStyle = '#7f93ad';
        x.fillText('Autonomous triage active · Monitoring 1.2M municipal IoT sensors & civic queues', 24, 240);
      }
      gS.T.needsUpdate = true;
    }
    drawGantry(0);

    // Sky beams
    tops.sort((a, b) => b.y - a.y);
    tops.slice(0, 5).forEach(tp => {
      const b = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 170, 8, 1, true), additive(pick([0x35e0ff, 0xff3da6]), 0.28));
      b.position.set(tp.x, tp.y + 85, tp.z);
      scene.add(b);
    });

    // Laser arcs
    const arcs = [];
    const bz = tops.slice().sort((a, b) => b.z - a.z);
    for (const A_ of bz) {
      if (arcs.length >= (isMobile ? 4 : 10)) break;
      if (A_.used) continue;
      const B_ = bz.find(o => o !== A_ && !o.used && Math.sign(o.x) !== Math.sign(A_.x) && Math.abs(o.z - A_.z) < 70);
      if (!B_) continue;
      A_.used = B_.used = true;
      const crv = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(A_.x, A_.y + 4, A_.z),
        new THREE.Vector3(0, Math.max(A_.y, B_.y) + 30, (A_.z + B_.z) / 2),
        new THREE.Vector3(B_.x, B_.y + 4, B_.z)
      );
      const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(crv.getPoints(24)),
        new THREE.LineBasicMaterial({ color: 0x7be9ff, transparent: true, opacity: 0.55 })
      );
      const pulse = new THREE.Mesh(new THREE.SphereGeometry(0.8, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      scene.add(line, pulse);
      arcs.push({ crv, pulse, off: rnd() });
    }

    // Drones
    const drones = [];
    const droneCount = isMobile ? 6 : 14;
    for (let i = 0; i < droneCount; i++) {
      const g = new THREE.Group();
      g.add(new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.3, 1.4), metalMat));
      const l = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 6), new THREE.MeshBasicMaterial({ color: pick([0x35e0ff, 0xff3da6, 0xffffff]) }));
      l.position.y = -0.3;
      g.add(l);
      scene.add(g);
      drones.push({ g, l, cx: (rnd() < 0.5 ? -1 : 1) * (3 + rnd() * 6), y: 22 + rnd() * 34, v: (rnd() < 0.5 ? -1 : 1) * (6 + rnd() * 8), off: rnd() * 650, ph: rnd() * 6.28 });
    }

    // Jointed Humanoids
    const HG = {
      leg: new THREE.BoxGeometry(0.17, 0.85, 0.17).translate(0, -0.425, 0),
      arm: new THREE.BoxGeometry(0.11, 0.56, 0.11).translate(0, -0.28, 0),
      torso: new THREE.BoxGeometry(0.44, 0.62, 0.25),
      head: new THREE.SphereGeometry(0.14, 8, 6),
      helmet: new THREE.SphereGeometry(0.165, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2)
    };
    const stdM = c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.8 });

    function makeHuman(shirt, pants, skin, helmet) {
      const g = new THREE.Group();
      const add = (geo, col, x, y, z) => {
        const m = new THREE.Mesh(geo, stdM(col));
        m.position.set(x, y, z);
        g.add(m);
        return m;
      };
      const legL = add(HG.leg, pants, -0.11, 0.85, 0);
      const legR = add(HG.leg, pants, 0.11, 0.85, 0);
      add(HG.torso, shirt, 0, 1.16, 0);
      add(HG.head, skin, 0, 1.58, 0);
      const armL = add(HG.arm, shirt, -0.29, 1.44, 0);
      const armR = add(HG.arm, shirt, 0.29, 1.44, 0);
      if (helmet) add(HG.helmet, helmet, 0, 1.6, 0);
      g.scale.setScalar(1.3);
      g.userData = { legL, legR, armL, armR };
      g.visible = false;
      scene.add(g);
      return g;
    }

    function pose(h, ph, amp, armAmp) {
      const u = h.userData;
      u.legL.rotation.x = Math.sin(ph) * amp;
      u.legR.rotation.x = -Math.sin(ph) * amp;
      u.armL.rotation.x = -Math.sin(ph) * armAmp;
      u.armR.rotation.x = Math.sin(ph) * armAmp;
    }

    // Crowds
    const NP = isMobile ? 120 : 280;
    const people = [];
    const mkI = (geo, n) => new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({ roughness: 0.85 }), n);
    const iTorso = mkI(HG.torso, NP);
    const iHead = mkI(HG.head, NP);
    const iLeg = mkI(HG.leg, NP * 2);
    const iArm = mkI(HG.arm, NP * 2);
    const clothes = [0xe04a4a, 0x2f6fdb, 0xf2f2f2, 0x1d1d22, 0xf0b429, 0x2fb36d, 0x9b59d6, 0xe86aa6, 0x6aa8d8].map(c => new THREE.Color(c));
    const pantsC = [0x1d2433, 0x2a3a5a, 0x3b3b3b, 0x5a4a36, 0x222222].map(c => new THREE.Color(c));
    const skins = [0xf1c9a5, 0xd9a273, 0xa8754f, 0x7a4b32, 0x4e3022].map(c => new THREE.Color(c));

    for (let i = 0; i < NP; i++) {
      const sh = pick(clothes), pn = pick(pantsC);
      iTorso.setColorAt(i, sh);
      iHead.setColorAt(i, pick(skins));
      iLeg.setColorAt(2 * i, pn);
      iLeg.setColorAt(2 * i + 1, pn);
      iArm.setColorAt(2 * i, sh);
      iArm.setColorAt(2 * i + 1, sh);
      if (i < NP * 0.58) {
        const sd = rnd() < 0.5 ? -1 : 1, dr = rnd() < 0.5 ? 1 : -1;
        people.push({ x: sd * (9 + rnd() * 3.4), y: 0.3, z: Z_START - rnd() * (Z_START - Z_END), vx: 0, vz: dr * (1 + rnd() * 0.9), wrap: true, ph: rnd() * 6.28, yaw: 0 });
      } else {
        const sd = rnd() < 0.5 ? -1 : 1, a = rnd() * 6.283, sp = rnd() < 0.2 ? 0 : 0.5 + rnd() * 0.9;
        people.push({ x: sd * (14 + rnd() * 36), y: 0.03, z: -262 - rnd() * 46, vx: Math.cos(a) * sp, vz: Math.sin(a) * sp, minX: 14, maxX: 50, minZ: -308, maxZ: -262, ph: rnd() * 6.28, yaw: rnd() * 6.28 });
      }
    }
    scene.add(iTorso, iHead, iLeg, iArm);

    const RM = new THREE.Matrix4(), WM = new THREE.Matrix4(), PO = new THREE.Object3D();
    function setPart(mesh, idx, px, py, pz, rx) {
      PO.position.set(px, py, pz);
      PO.rotation.set(rx, 0, 0);
      PO.scale.set(1, 1, 1);
      PO.updateMatrix();
      WM.multiplyMatrices(RM, PO.matrix);
      mesh.setMatrixAt(idx, WM);
    }
    function updatePeople(dt, t) {
      people.forEach((q, i) => {
        q.x += q.vx * dt;
        q.z += q.vz * dt;
        if (q.wrap) {
          if (q.z > Z_START) q.z = Z_END;
          else if (q.z < Z_END) q.z = Z_START;
        } else {
          const ax = Math.abs(q.x);
          if (ax < q.minX || ax > q.maxX) q.vx *= -1;
          if (q.z < q.minZ || q.z > q.maxZ) q.vz *= -1;
        }
        const sp = Math.hypot(q.vx, q.vz), moving = sp > 0.05;
        if (moving) q.yaw = Math.atan2(q.vx, q.vz);
        PO.position.set(q.x, q.y, q.z);
        PO.rotation.set(0, q.yaw, 0);
        PO.scale.setScalar(1.3);
        PO.updateMatrix();
        RM.copy(PO.matrix);
        const ph = t * sp * 4.2 + q.ph, sw = moving ? Math.sin(ph) * 0.65 : 0, bob = moving ? Math.abs(Math.cos(ph)) * 0.04 : 0;
        setPart(iTorso, i, 0, 1.16 + bob, 0, 0);
        setPart(iHead, i, 0, 1.58 + bob, 0, 0);
        setPart(iLeg, 2 * i, -0.11, 0.85, 0, sw);
        setPart(iLeg, 2 * i + 1, 0.11, 0.85, 0, -sw);
        setPart(iArm, 2 * i, -0.29, 1.44, 0, -sw * 0.9);
        setPart(iArm, 2 * i + 1, 0.29, 1.44, 0, sw * 0.9);
      });
      iTorso.instanceMatrix.needsUpdate = iHead.instanceMatrix.needsUpdate = iLeg.instanceMatrix.needsUpdate = iArm.instanceMatrix.needsUpdate = true;
    }
    [iTorso, iHead, iLeg, iArm].forEach(m => {
      m.instanceColor.needsUpdate = true;
      m.frustumCulled = false;
    });

    // ─── SMART CITY INCIDENTS LIFECYCLE ───────────────────────────────────────
    const cl = v => Math.min(1, Math.max(0, v));
    const ease = k => 1 - Math.pow(1 - k, 3);
    const lerp = (a, b, k) => a + (b - a) * k;
    const GANTRY = new THREE.Vector3(0, 30, -290);
    const bez = (o, a, b, c, k) => {
      const u = 1 - k;
      return o.set(
        u * u * a.x + 2 * u * k * b.x + k * k * c.x,
        u * u * a.y + 2 * u * k * b.y + k * k * c.y,
        u * u * a.z + 2 * u * k * b.z + k * k * c.z
      );
    };

    function makeVan(col) {
      const g = new THREE.Group();
      const add = (geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); g.add(m); return m; };
      add(new THREE.BoxGeometry(2.2, 1.7, 5.2), new THREE.MeshStandardMaterial({ color: col, metalness: 0.4, roughness: 0.4 }), 0, 1.15, 0);
      add(new THREE.BoxGeometry(2.0, 0.7, 1.4), glassMat, 0, 1.55, 1.9);
      add(new THREE.BoxGeometry(2.24, 0.18, 5.0), new THREE.MeshBasicMaterial({ color: 0xffffff }), 0, 1.0, 0);
      const beacon = add(new THREE.SphereGeometry(0.28, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffb020 }), 0, 2.2, 0.5);
      for (const s of [-1, 1]) {
        add(new THREE.BoxGeometry(0.5, 0.25, 0.1), headMat, s * 0.7, 0.9, 2.62);
        add(new THREE.BoxGeometry(0.5, 0.22, 0.1), tailMat, s * 0.7, 0.95, -2.62);
      }
      g.userData.beacon = beacon;
      g.visible = false;
      scene.add(g);
      return g;
    }

    const mkPts = (n, col, size, add) => {
      const pos = new Float32Array(n * 3);
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const pt = new THREE.Points(g, new THREE.PointsMaterial({
        color: col,
        size,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
        blending: add ? THREE.AdditiveBlending : THREE.NormalBlending
      }));
      pt.frustumCulled = false;
      return { pt, pos, g };
    };

    const BUILD = {
      water(root, prob) {
        const puddle = new THREE.Mesh(new THREE.CircleGeometry(2.8, 20), new THREE.MeshBasicMaterial({ color: 0x2f7fe0, transparent: true, opacity: 0.55 }));
        puddle.rotation.x = -Math.PI / 2;
        puddle.position.y = 0.05;
        prob.add(puddle);
        const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.6, 8), metalMat);
        pipe.position.y = 0.3;
        root.add(pipe);
        const N = isMobile ? 35 : 70;
        const sp = mkPts(N, 0xcfeaff, 0.4, false), vel = new Float32Array(N * 3);
        let fac = 1;
        prob.add(sp.pt);
        const reset = i => {
          sp.pos[i * 3] = sp.pos[i * 3 + 2] = 0;
          sp.pos[i * 3 + 1] = 0.4;
          vel[i * 3] = (rnd() - 0.5) * 4 * fac;
          vel[i * 3 + 1] = (6 + rnd() * 6) * fac;
          vel[i * 3 + 2] = (rnd() - 0.5) * 4 * fac;
        };
        for (let i = 0; i < N; i++) {
          reset(i);
          sp.pos[i * 3 + 1] = rnd() * 5;
        }
        return (t, dt, problem, k) => {
          prob.visible = problem;
          if (!problem) return;
          fac = 1 - 0.92 * k;
          puddle.scale.setScalar(1 - 0.85 * k);
          for (let i = 0; i < N; i++) {
            sp.pos[i * 3] += vel[i * 3] * dt;
            sp.pos[i * 3 + 1] += vel[i * 3 + 1] * dt;
            sp.pos[i * 3 + 2] += vel[i * 3 + 2] * dt;
            vel[i * 3 + 1] -= 14 * dt;
            if (sp.pos[i * 3 + 1] < 0.05) reset(i);
          }
          sp.g.attributes.position.needsUpdate = true;
        };
      },
      power(root, prob) {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 6.4, 8), metalMat);
        pole.position.y = 3.2;
        root.add(pole);
        const boxM = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.1, 1.1), darkM);
        boxM.position.y = 5.6;
        root.add(boxM);
        const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6), new THREE.MeshBasicMaterial({ color: 0x3dffb0 }));
        lamp.position.set(0, 5.6, 0.6);
        root.add(lamp);
        const flash = new THREE.Mesh(new THREE.SphereGeometry(0.45, 8, 6), additive(0xffa030, 0.9));
        flash.position.set(0, 5.6, 0.8);
        prob.add(flash);
        const N = isMobile ? 12 : 24;
        const sp = mkPts(N, 0xffc060, 0.3, true);
        prob.add(sp.pt);
        return (t, dt, problem, k, st) => {
          prob.visible = problem && st < 4;
          lamp.material.color.setHex(st === 0 || st === 5 ? 0x3dffb0 : st === 4 ? 0xffb020 : (Math.sin(t * 8) > 0 ? 0xff2a2a : 0x400808));
          if (!prob.visible) return;
          flash.visible = Math.sin(t * 37) > 0;
          for (let i = 0; i < N; i++) {
            sp.pos[i * 3] = (rnd() - 0.5) * 1.6;
            sp.pos[i * 3 + 1] = 5.2 + rnd() * 1.2;
            sp.pos[i * 3 + 2] = 0.8 + rnd() * 0.5;
          }
          sp.g.attributes.position.needsUpdate = true;
        };
      },
      garbage(root, prob) {
        const bin = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.2, 0.9), stdM(0x1f5a3a));
        bin.position.set(0, 0.6, -1);
        root.add(bin);
        const bags = [];
        for (let i = 0; i < (isMobile ? 8 : 14); i++) {
          const sc = 0.5 + rnd() * 0.4;
          const b = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 6), stdM(pick([0x111111, 0x222a22, 0x2a2a2a, 0x3a3a2a])));
          b.position.set((rnd() - 0.5) * 3.4, 0.35 * sc, (rnd() - 0.5) * 3.2);
          b.userData.s = sc;
          b.scale.setScalar(sc);
          prob.add(b);
          bags.push(b);
        }
        const fl = mkPts(8, 0x151515, 0.14, false);
        prob.add(fl.pt);
        return (t, dt, problem, k) => {
          prob.visible = problem;
          if (!problem) return;
          bags.forEach(b => b.scale.setScalar(b.userData.s * (1 - k)));
          for (let i = 0; i < 8; i++) {
            const a = t * 2.2 + i;
            fl.pos[i * 3] = Math.cos(a) * 1.2;
            fl.pos[i * 3 + 1] = 1.3 + Math.sin(a * 1.7) * 0.3;
            fl.pos[i * 3 + 2] = Math.sin(a) * 1.2;
          }
          fl.g.attributes.position.needsUpdate = true;
        };
      },
      pothole(root, prob) {
        const hg = new THREE.CircleGeometry(1.6, 18);
        hg.scale(1.4, 1, 1);
        hg.rotateX(-Math.PI / 2);
        const hole = new THREE.Mesh(hg, new THREE.MeshBasicMaterial({ color: 0x08080a }));
        hole.position.y = 0.03;
        prob.add(hole);
        for (let i = 0; i < 8; i++) {
          const a = i / 8 * 6.283;
          const c = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.12, 0.25), stdM(0x555555));
          c.position.set(Math.cos(a) * 2.4, 0.06, Math.sin(a) * 1.9);
          c.rotation.y = -a;
          prob.add(c);
        }
        const cones = [];
        for (let i = 0; i < 4; i++) {
          const a = i / 4 * 6.283 + 0.6;
          const c = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.8, 10), stdM(0xff6a00));
          c.position.set(Math.cos(a) * 3.1, 0.4, Math.sin(a) * 2.5);
          prob.add(c);
          cones.push(c);
        }
        return (t, dt, problem, k, st) => {
          prob.visible = problem;
          if (!problem) return;
          hole.scale.setScalar(Math.max(0.02, 1 - k * 0.97));
          cones.forEach(c => (c.visible = st < 5));
        };
      },
      signal(root, prob) {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 5, 8), metalMat);
        pole.position.y = 2.5;
        root.add(pole);
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.4, 0.4), darkM);
        head.position.y = 5.2;
        root.add(head);
        const on = [0xff3030, 0xffb020, 0x3dffb0];
        const off = [0x201010, 0x201808, 0x0a2015];
        const ls = [5.55, 5.2, 4.85].map(y => {
          const m = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 6), new THREE.MeshBasicMaterial({ color: 0x000000 }));
          m.position.set(0, y, 0.22);
          root.add(m);
          return m;
        });
        return (t, dt, problem) => {
          let a;
          if (problem) a = [Math.sin(t * 14) > 0, Math.sin(t * 9 + 1) > 0.5, false];
          else {
            const ph = t % 6;
            a = [ph >= 3, ph >= 2.4 && ph < 3, ph < 2.4];
          }
          ls.forEach((m, i) => m.material.color.setHex(a[i] ? on[i] : off[i]));
        };
      }
    };

    const INC_DEFS = [
      { type: 'water', z: -60, x: -6.5, title: 'Water Pipe Burst', sub: 'Sector 3 · Main Feeder', van: 0x2f7fe0 },
      { type: 'power', z: -150, x: 11.2, title: 'Power Outage', sub: 'Sector 5 · Transformer', van: 0xf0b429 },
      { type: 'garbage', z: -235, x: -11, title: 'Garbage Overflow', sub: 'Sector 7 · Commercial Ward', van: 0x2fb36d },
      { type: 'pothole', z: -335, x: 4, title: 'Road Pothole', sub: 'Ring Road · Lane 2', van: 0xff7a2f },
      { type: 'signal', z: -425, x: -9.4, title: 'Traffic Signal Failure', sub: 'Junction 12', van: 0xf2f2f2 }
    ];

    const DOT = ['#3dffb0', '#ff5a5a', '#ffc861', '#ffc861', '#35e0ff', '#3dffb0'];
    const incidents = INC_DEFS.map(def => {
      const side = def.x < 0 ? -1 : 1, dir = side, gy = (def.type === 'garbage' || def.type === 'power' || def.type === 'signal') ? 0.3 : 0;
      const root = new THREE.Group();
      root.position.set(def.x, gy, def.z);
      scene.add(root);
      const prob = new THREE.Group();
      root.add(prob);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.09, 6, 32), new THREE.MeshBasicMaterial({ color: 0xff3a3a }));
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.1;
      ring.visible = false;
      root.add(ring);
      const vis = BUILD[def.type](root, prob);
      const cx = side * 10.5, cz = def.z + 3;
      const citizen = makeHuman(0x2f6fdb, 0x2a3a5a, 0xd9a273);
      citizen.position.set(cx, 0.3, cz);
      citizen.rotation.y = Math.atan2(def.x - cx, def.z - cz);
      const phone = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.17, 0.02), new THREE.MeshBasicMaterial({ color: 0x7be9ff }));
      phone.position.set(0, -0.56, 0.07);
      phone.visible = false;
      citizen.userData.armR.add(phone);
      const workers = [0, 1].map(() => makeHuman(0xff7a00, 0x23304a, pick([0xd9a273, 0xa8754f, 0xf1c9a5]), 0xffd400));
      const van = makeVan(def.van), vanX = side * 6.2, spawnZ = def.z - dir * 60, stopZ = def.z - dir * 7;
      const door = [vanX + side * 1.6, stopZ], work = [[def.x - 1.1, def.z + 0.5], [def.x + 1.1, def.z - 0.5]];
      const pkt = new THREE.Group();
      [0.5, 0.35, 0.22].forEach(r => pkt.add(new THREE.Mesh(new THREE.SphereGeometry(r, 8, 6), new THREE.MeshBasicMaterial({ color: r > 0.4 ? 0xffffff : 0x7be9ff }))));
      pkt.visible = false;
      scene.add(pkt);
      const A = new THREE.Vector3(), B = new THREE.Vector3(), C = new THREE.Vector3();
      const showPkt = k => {
        C.set((A.x + B.x) / 2, Math.max(A.y, B.y) + 22, (A.z + B.z) / 2);
        pkt.children.forEach((c, i) => bez(c.position, A, C, B, cl(k - i * 0.05)));
        pkt.visible = k > 0 && k < 1.05;
      };
      const bu = mkPts(24, 0x3dffb0, 0.4, true);
      const bv = new Float32Array(24 * 3);
      for (let i = 0; i < 24; i++) {
        const a = rnd() * 6.283, r = 1 + rnd() * 2.5;
        bv[i * 3] = Math.cos(a) * r;
        bv[i * 3 + 1] = 4 + rnd() * 3;
        bv[i * 3 + 2] = Math.sin(a) * r;
      }
      bu.pt.visible = false;
      root.add(bu.pt);

      // DOM Tag
      const el = document.createElement('div');
      el.className = 'smart-city-hud-tag';
      el.innerHTML = '<i class="hud-dot"></i><div class="hud-body"><b class="hud-title"></b><span class="hud-sub"></span><div class="hud-pb"><u class="hud-fill"></u></div></div>';
      tagBox.appendChild(el);

      const dot = el.querySelector('.hud-dot');
      const tb = el.querySelector('.hud-title');
      const ts = el.querySelector('.hud-sub');
      const bar = el.querySelector('.hud-fill');
      const pbEl = el.querySelector('.hud-pb');
      const tagPos = new THREE.Vector3(def.x, gy + 7, def.z);
      const inc = { st: 0, t0: 0, next: 0, ticket: null, tagSt: -1 };

      function setTag() {
        const st = inc.st, id = inc.ticket ? inc.ticket.id : '';
        dot.style.background = dot.style.boxShadow = DOT[st];
        dot.style.boxShadow = '0 0 10px ' + DOT[st];
        tb.textContent = def.title;
        ts.textContent = [
          '',
          'Problem detected · ' + def.sub,
          'Citizen filed Ticket #' + id + ' via App',
          'Command assigned crew · En route',
          'Field repair in progress',
          'Resolved ✓ Ticket #' + id + ' closed'
        ][st];
        pbEl.style.display = st === 4 ? 'block' : 'none';
        inc.tagSt = st;
      }

      function enter(s, t) {
        inc.st = s;
        inc.t0 = t;
        if (s === 2) {
          inc.ticket = { id: ++ticketSeq, title: def.title, status: 'REPORTED' };
          tickets.unshift(inc.ticket);
          tickets.length = Math.min(tickets.length, 5);
        }
        if (s === 3) {
          inc.ticket.status = 'CREW EN ROUTE';
          van.visible = true;
        }
        if (s === 4) inc.ticket.status = 'REPAIRING';
        if (s === 5) {
          inc.ticket.status = 'RESOLVED';
          resolvedCount++;
        }
        if (s === 0) {
          van.visible = false;
          workers.forEach(w => (w.visible = false));
          inc.next = t + 3;
        }
      }

      return {
        placeTag() { place(el, tagPos, inc.st > 0); },
        update(dt, t, camZ) {
          const dist = camZ - def.z;
          let e = t - inc.t0;
          if (inc.st === 0) {
            if (dist < 200 && dist > -30 && t > inc.next) enter(1, t);
          } else if (inc.st === 1 && e > 1.4) enter(2, t);
          else if (inc.st === 2 && e > 3.0) enter(3, t);
          else if (inc.st === 3 && e > 3.4) enter(4, t);
          else if (inc.st === 4 && e > 4.2) enter(5, t);
          else if (inc.st === 5 && e > 9) enter(0, t);

          e = t - inc.t0;
          const st = inc.st, problem = st >= 1 && st <= 4, k = st === 4 ? cl((e - 1) / 3.2) : (st === 5 ? 1 : 0);
          if (inc.tagSt !== st) setTag();
          bar.style.width = (st === 4 ? k * 100 : 0) + '%';
          vis(t, dt, problem, k, st);
          ring.visible = (st > 0 && st < 5) || (st === 5 && e < 2.5);
          ring.material.color.setHex([0, 0xff3a3a, 0xff3a3a, 0xffb020, 0x35e0ff, 0x3dffb0][st]);
          ring.scale.setScalar(1 + 0.12 * Math.sin(t * 5));

          citizen.visible = st > 0;
          const cu = citizen.userData;
          let aR = 0, aL = 0, jump = 0;
          if (st === 2) aR = -1.5 * ease(cl(e / 0.5));
          else if (st === 3) aR = -1.5 * (1 - cl(e / 0.6));
          else if (st === 5 && e < 2) {
            aR = aL = -2.8;
            jump = Math.abs(Math.sin(e * 6)) * 0.18 * (1 - e / 2);
          }
          cu.armR.rotation.x = aR;
          cu.armL.rotation.x = aL;
          phone.visible = st === 2 || (st === 3 && e < 0.6);
          citizen.position.y = 0.3 + jump;

          pkt.visible = false;
          if (st === 2) {
            A.set(cx, 2.3, cz);
            B.copy(GANTRY);
            showPkt(e / 1.5);
          } else if (st === 3) {
            A.copy(GANTRY);
            B.set(van.position.x, 2.4, van.position.z);
            showPkt(e / 1.2);
          }

          if (st === 3) van.position.set(vanX, 0, lerp(spawnZ, stopZ, ease(cl(e / 3.4))));
          else if (st === 4) van.position.set(vanX, 0, stopZ);
          else if (st === 5) {
            const d = e > 1.5 ? dir * 4 * (e - 1.5) * (e - 1.5) : 0;
            van.position.set(vanX, 0, stopZ + d);
            if (Math.abs(d) > 110) van.visible = false;
          }
          van.rotation.y = dir < 0 ? Math.PI : 0;
          van.userData.beacon.visible = Math.sin(t * 10) > 0;

          workers.forEach((w, i) => {
            if (st === 4 || (st === 5 && e < 1.2)) {
              w.visible = true;
              let kk, from = door, to = work[i], moving;
              if (st === 4) {
                kk = cl(e / 1.0);
                moving = kk < 1;
              } else {
                kk = cl(e / 1.2);
                from = work[i];
                to = door;
                moving = true;
              }
              const x = lerp(from[0], to[0], kk), z = lerp(from[1], to[1], kk), y = st === 4 ? lerp(0, gy, kk) : lerp(gy, 0, kk);
              w.position.set(x, y, z);
              if (moving) {
                w.rotation.y = Math.atan2(to[0] - from[0], to[1] - from[1]);
                pose(w, t * 9 + i, 0.7, 0.6);
              } else {
                w.rotation.y = Math.atan2(def.x - x, def.z - z);
                pose(w, 0, 0, 0);
                w.userData.armR.rotation.x = -1.0 + Math.sin(t * 9 + i * 2) * 0.7;
                w.userData.armL.rotation.x = -0.5;
              }
            } else if (st !== 3) w.visible = false;
          });

          bu.pt.visible = st === 5 && e < 1.6;
          if (bu.pt.visible) {
            for (let i = 0; i < 24; i++) {
              bu.pos[i * 3] = bv[i * 3] * e;
              bu.pos[i * 3 + 1] = bv[i * 3 + 1] * e - 5 * e * e + 0.5;
              bu.pos[i * 3 + 2] = bv[i * 3 + 2] * e;
            }
            bu.g.attributes.position.needsUpdate = true;
          }
        }
      };
    });

    // Floating HUD labels
    const V = THREE.Vector3;
    const LABELS = [
      [new V(9, 18, -25), 'Smart Traffic', t => (12480 + ((Math.sin(t * 0.9) * 300) | 0)).toLocaleString() + ' vehicles synced'],
      [new V(0, 32, -130), 'AI Gateway', t => (4.2 + Math.sin(t) * 0.2).toFixed(1) + ' Gbps live triage'],
      [new V(-33, 13, -285), 'Crowd Sensing', t => (3204 + ((Math.sin(t * 1.3) * 40) | 0)).toLocaleString() + ' citizens active'],
      [new V(0, 42, -290), 'Command Center', () => 'Complaints auto-routed 24×7'],
      [new V(33, 13, -285), 'Municipal Grid', t => (99.8 + Math.sin(t) * 0.1).toFixed(1) + '% SLA uptime'],
      [new V(0, 32, -385), 'Field Dispatch', t => (128 + ((Math.sin(t * 0.5) * 6) | 0)) + ' crews online']
    ].map(([pos, title, fn]) => {
      const el = document.createElement('div');
      el.className = 'smart-city-hud-tag';
      el.innerHTML = '<i class="hud-dot"></i><div class="hud-body"><b class="hud-title">' + title + '</b><span class="hud-sub"></span></div>';
      tagBox.appendChild(el);
      return { pos, fn, el, sp: el.querySelector('.hud-sub') };
    });

    let lastTxt = -1, lastScr = 0;
    function place(el, pos, show) {
      const v = pos.clone().project(camera);
      const d = camera.position.distanceTo(pos);
      const o = show && v.z < 1 && Math.abs(v.x) < 0.92 && Math.abs(v.y) < 0.88 ? smooth(18, 40, d) * (1 - smooth(130, 200, d)) : 0;
      el.style.opacity = o;
      el.style.transform = 'translate(' + ((v.x * 0.5 + 0.5) * window.innerWidth) + 'px,' + ((-v.y * 0.5 + 0.5) * window.innerHeight) + 'px) translate(-50%,-120%)';
    }

    function updateLabels(t) {
      const upd = t - lastTxt > 0.5;
      if (upd) lastTxt = t;
      camera.updateMatrixWorld();
      for (const L of LABELS) {
        if (upd) L.sp.textContent = L.fn(t);
        place(L.el, L.pos, true);
      }
      incidents.forEach(i => i.placeTag());
    }

    // Scroll & Mouse Handling
    let target = 0, cur = 0, mx = 0, my = 0;
    const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
    const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };

    const readScroll = () => {
      const rect = scroller.getBoundingClientRect();
      const totalH = scroller.offsetHeight - window.innerHeight;
      if (totalH > 0) {
        const scrolled = -rect.top;
        const p = clamp(scrolled / totalH);
        target = p;
        setScrollProgress(p);

        if (p < 0.18) setActivePanelIndex(0);
        else if (p < 0.44) setActivePanelIndex(1);
        else if (p < 0.70) setActivePanelIndex(2);
        else if (p < 0.88) setActivePanelIndex(3);
        else setActivePanelIndex(4);
      }
    };

    const handlePointerMove = e => {
      mx = (e.clientX / window.innerWidth - 0.5);
      my = (e.clientY / window.innerHeight - 0.5);
    };

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    window.addEventListener('scroll', readScroll, { passive: true });
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('resize', handleResize);
    handleResize();
    readScroll();
    cur = target;

    // Animation Loop
    const clock = new THREE.Clock();
    function frame() {
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;
      cur += (target - cur) * (reduce ? 1 : 1 - Math.pow(0.0008, dt));
      const p = cur;
      const lift = smooth(0.72, 1, p);
      const x = Math.sin(p * Math.PI * 3) * 3.2 + mx * 4;
      const y = 8 + Math.sin(p * Math.PI) * 5 + lift * 105 - my * 2;
      const z = 70 - p * 540;

      camera.position.set(x, y, z);
      camera.lookAt(x * 0.4, y - 1.5 - lift * 52, z - 70);
      camera.fov = 62 + smooth(0, 0.1, p) * 6 - lift * 8;
      camera.updateProjectionMatrix();
      sky.position.copy(camera.position);

      if (!reduce) {
        for (const c of cars) {
          c.position.z += c.userData.v * dt;
          if (c.position.z > Z_START) c.position.z = Z_END;
          else if (c.position.z < Z_END) c.position.z = Z_START;
        }
        beacons.forEach((b, i) => (b.visible = Math.sin(t * 3 + i * 1.7) > 0));
        gates.forEach((gt, i) => {
          gt.mat.color.setHSL(0.52, 1, 0.5 + 0.15 * Math.sin(t * 2 + i));
          gt.segs.rotation.z = t * 0.4 * (i % 2 ? 1 : -1);
        });
        holos.forEach(h => {
          h.rotation.y = t;
          h.rotation.x = t * 0.6;
        });
        arcs.forEach(a => a.pulse.position.copy(a.crv.getPoint((t * 0.18 + a.off) % 1)));
        drones.forEach(d => {
          const m = (((d.off + t * d.v) % 650) + 650) % 650;
          d.g.position.set(d.cx + Math.sin(t * 0.7 + d.ph) * 3, d.y + Math.sin(t * 1.3 + d.ph) * 1.5, Z_START - m);
          d.g.rotation.y = t;
          d.l.visible = Math.sin(t * 6 + d.ph) > -0.3;
        });
        if (t - lastScr > 0.11) {
          lastScr = t;
          drawA();
          drawB(t);
          drawC(t);
          drawGantry(t);
        }
      }

      updatePeople(reduce ? 0 : dt, t);
      if (!reduce) {
        incidents.forEach(i => i.update(dt, t, camera.position.z));
      }
      updateLabels(t);

      renderer.render(scene, camera);
      animId = requestAnimationFrame(frame);
    }

    animId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('scroll', readScroll);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      tagBox.innerHTML = '';
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-[460vh] sm:h-[560vh] bg-[#0A1226] text-[#F4F8FF]">
      {/* Fixed Fullscreen 3D Canvas — covers entire page behind all content */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full block"
        style={{ zIndex: 0 }}
      />

      {/* Fixed vignette overlay — stays behind UI but softens canvas edges */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          background: `linear-gradient(to top, rgba(8,12,28,.55), transparent 48%),
                       linear-gradient(to bottom, rgba(8,12,28,.4), transparent 24%),
                       radial-gradient(ellipse at center, transparent 50%, rgba(8,12,28,.45) 100%)`
        }}
      />

      {/* Sticky UI Layer — panels, navbar, HUD tags */}
      <div className="sticky top-0 h-screen w-full overflow-hidden select-none" style={{ zIndex: 2 }}>

        {/* 3D Projected Dynamic HUD Tags */}
        <div ref={tagsContainerRef} className="absolute inset-0 pointer-events-none z-10 overflow-hidden" />

        {/* Navigation Bar inside Stage */}
        <header className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6 bg-gradient-to-b from-[#0A1226]/80 to-transparent backdrop-blur-xs">
          <Link to="/" className="flex items-center gap-2.5 text-white group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
              <Layers size={17} strokeWidth={2.5} />
            </div>
            <div>
              <span className="font-black text-sm sm:text-base tracking-wider uppercase text-white font-mono">
                Smart City
              </span>
              <span className="hidden sm:inline-block ml-2 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                CIVIC OS
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/citizen-portal"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold backdrop-blur-md transition-all active:scale-95"
            >
              <FileText size={14} className="text-cyan-400" />
              <span>Report Issue</span>
            </Link>

            <Link
              to="/track"
              className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold backdrop-blur-md transition-all active:scale-95"
            >
              <Search size={14} className="text-emerald-400" />
              <span>Track Ticket</span>
            </Link>

            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-md shadow-indigo-500/30 transition-all active:scale-95"
            >
              <ShieldCheck size={14} />
              <span>Operator Login</span>
            </Link>
          </div>
        </header>

        {/* ─── SCROLL PANELS (RESPONSIVE FOR ALL MEDIA) ──────────────────────── */}
        
        {/* Panel 0: Hero Entry */}
        <section 
          className={`absolute z-20 transition-all duration-700 pointer-events-none max-w-xl left-4 sm:left-12 lg:left-24 bottom-14 sm:bottom-20 ${
            activePanelIndex === 0 ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-6'
          }`}
        >
          <div className="p-5 sm:p-7 rounded-3xl bg-[#0A1226]/85 sm:bg-[#0A1226]/60 backdrop-blur-md border border-white/15 shadow-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-[11px] font-bold uppercase tracking-wider mb-3">
              <Sparkles size={12} className="text-cyan-400" />
              <span>Live Smart City Simulation</span>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-white">
              A city that <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-pink-400 bg-clip-text text-transparent">
                fixes itself.
              </span>
            </h1>
            <p className="mt-3 sm:mt-4 text-xs sm:text-base text-slate-200 leading-relaxed max-w-lg">
              Scroll down to ride through a live autonomous municipal district. Watch citizens file grievances and city crews resolve issues in real time.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link 
                to="/citizen-portal"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-slate-900 font-bold text-xs sm:text-sm hover:bg-cyan-300 transition-all shadow-lg shadow-white/10"
              >
                <span>Report Grievance</span>
                <ArrowRight size={14} />
              </Link>
              <a 
                href="#platform-features"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold backdrop-blur-md transition-all"
              >
                <span>Platform Details</span>
                <ChevronDown size={14} />
              </a>
            </div>
          </div>
        </section>

        {/* Panel 1: Citizens Report */}
        <section 
          className={`absolute z-20 transition-all duration-700 pointer-events-none max-w-lg left-4 sm:left-12 lg:left-24 top-28 sm:top-1/3 ${
            activePanelIndex === 1 ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-6'
          }`}
        >
          <div className="p-5 sm:p-7 rounded-3xl bg-[#0A1226]/85 sm:bg-[#0A1226]/60 backdrop-blur-md border border-white/15 shadow-2xl">
            <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest font-mono">
              01 · Citizen Intake
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white mt-1 leading-tight">
              Citizens report. <br />The city responds.
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-slate-200 leading-relaxed">
              A burst pipe, power cut, or overflowing garbage: one tap in the Citizen Portal routes the grievance straight to the Command Center with automated ward & urgency classification.
            </p>
          </div>
        </section>

        {/* Panel 2: Crews Arrive */}
        <section 
          className={`absolute z-20 transition-all duration-700 pointer-events-none max-w-lg right-4 sm:right-12 lg:right-24 top-28 sm:top-1/3 sm:text-right ${
            activePanelIndex === 2 ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-6'
          }`}
        >
          <div className="p-5 sm:p-7 rounded-3xl bg-[#0A1226]/85 sm:bg-[#0A1226]/60 backdrop-blur-md border border-white/15 shadow-2xl">
            <span className="text-[11px] font-bold text-pink-400 uppercase tracking-widest font-mono">
              02 · Autonomous Triage
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white mt-1 leading-tight">
              Crews arrive. <br />Problems disappear.
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-slate-200 leading-relaxed sm:ml-auto">
              Every complaint is auto-assigned to the nearest municipal field team. Dispatch vans navigate with GPS telemetry and close tickets with live photographic proof.
            </p>
          </div>
        </section>

        {/* Panel 3: Skyline Overview */}
        <section 
          className={`absolute z-20 transition-all duration-700 pointer-events-none max-w-lg left-4 sm:left-12 lg:left-24 top-28 sm:top-1/3 ${
            activePanelIndex === 3 ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-6'
          }`}
        >
          <div className="p-5 sm:p-7 rounded-3xl bg-[#0A1226]/85 sm:bg-[#0A1226]/60 backdrop-blur-md border border-white/15 shadow-2xl">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest font-mono">
              03 · Whole-City Observability
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white mt-1 leading-tight">
              Command from above.
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-slate-200 leading-relaxed">
              Watch the whole metropolitan infrastructure operate as a synchronized organism — from emergency escalations to SLA tracking and cross-department collaboration.
            </p>
          </div>
        </section>

        {/* Panel 4: Call to Action (End of Flight) */}
        <section 
          className={`absolute z-20 transition-all duration-700 pointer-events-none max-w-xl left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 text-center w-[92vw] sm:w-auto ${
            activePanelIndex === 4 ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95'
          }`}
        >
          <div className="p-6 sm:p-10 rounded-3xl bg-[#0A1226]/90 backdrop-blur-xl border border-white/20 shadow-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[11px] font-bold uppercase tracking-wider mb-3">
              <CheckCircle2 size={13} className="text-emerald-400" />
              <span>Smart City Platform Ready</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight">
              Empower your city today.
            </h2>
            <p className="mt-3 text-xs sm:text-base text-slate-300 max-w-md mx-auto leading-relaxed">
              Experience the citizen portal, track live grievances, or access the municipal operator command desk.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link 
                to="/citizen-portal"
                className="px-6 py-3 rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-indigo-500/30 transition-all active:scale-95 flex items-center gap-2"
              >
                <FileText size={16} />
                <span>Citizen Portal</span>
              </Link>

              <Link 
                to="/login"
                className="px-6 py-3 rounded-full bg-white text-slate-900 font-bold text-xs sm:text-sm hover:bg-slate-100 transition-all shadow-xl shadow-white/10 active:scale-95 flex items-center gap-2"
              >
                <ShieldCheck size={16} />
                <span>Operator Desk</span>
              </Link>

              <a 
                href="#platform-features"
                className="px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs sm:text-sm backdrop-blur-md transition-all active:scale-95 flex items-center gap-1.5"
              >
                <span>Full Feature Tour</span>
                <ChevronDown size={15} />
              </a>
            </div>
          </div>
        </section>

        {/* Scroll Progress Bar (Right side on desktop) */}
        <div className="hidden sm:block absolute z-20 right-4 sm:right-7 top-1/2 -translate-y-1/2 h-28 w-1 bg-white/20 rounded-full overflow-hidden">
          <div 
            className="w-full bg-gradient-to-b from-cyan-400 to-indigo-500 rounded-full transition-all duration-75"
            style={{ height: `${scrollProgress * 100}%` }}
          />
        </div>

        {/* Scroll Hint */}
        <div 
          className={`absolute z-20 left-1/2 -translate-x-1/2 bottom-6 flex items-center gap-2 text-xs text-slate-300/80 pointer-events-none transition-opacity duration-500 ${
            scrollProgress > 0.05 ? 'opacity-0' : 'opacity-100 animate-bounce'
          }`}
        >
          <span>Scroll down to fly through the city</span>
          <ChevronDown size={14} />
        </div>
      </div>

      {/* Embedded CSS for 3D Projected HUD Tags */}
      <style>{`
        .smart-city-hud-tag {
          position: absolute;
          left: 0;
          top: 0;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 8px 12px;
          border-radius: 12px;
          font-size: 12px;
          line-height: 1.35;
          color: #ffffff;
          background: rgba(10, 18, 38, 0.72);
          border: 1px solid rgba(255, 255, 255, 0.3);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          white-space: nowrap;
          pointer-events: none;
          will-change: transform, opacity;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
          max-width: min(85vw, 360px);
          overflow: hidden;
        }
        .smart-city-hud-tag .hud-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #3dffb0;
          box-shadow: 0 0 10px #3dffb0;
          flex-shrink: 0;
          animation: hud-pulse 1.6s infinite ease-in-out;
        }
        .smart-city-hud-tag .hud-body {
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .smart-city-hud-tag .hud-title {
          font-weight: 600;
          display: block;
          font-size: 12px;
          color: #ffffff;
        }
        .smart-city-hud-tag .hud-sub {
          color: #c3d5ea;
          font-size: 11px;
          display: block;
        }
        .smart-city-hud-tag .hud-pb {
          height: 3px;
          background: rgba(255, 255, 255, 0.22);
          border-radius: 2px;
          margin-top: 5px;
          overflow: hidden;
        }
        .smart-city-hud-tag .hud-fill {
          display: block;
          height: 100%;
          width: 0%;
          background: #35e0ff;
          border-radius: 2px;
          transition: width 0.1s linear;
        }
        @keyframes hud-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }
        @media (max-width: 640px) {
          .smart-city-hud-tag {
            padding: 6px 9px;
            font-size: 11px;
            border-radius: 9px;
          }
          .smart-city-hud-tag .hud-title {
            font-size: 11px;
          }
          .smart-city-hud-tag .hud-sub {
            font-size: 10px;
          }
        }
      `}</style>
    </div>
  );
}


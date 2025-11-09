import { useState, useEffect, useRef, useMemo } from 'react';
import { FaGithub, FaReact, FaPython, FaDesktop, FaHtml5, FaCss3Alt, FaBootstrap, FaHandPointer, FaArrowDown, FaArrowUp } from 'react-icons/fa';
import AOS from 'aos';
import { SiTailwindcss, SiVite, SiWebgl, SiFlask, SiRender, SiStreamlit, SiJavascript, SiOpencv } from 'react-icons/si';

import todoAppScreenshot from '../assets/todo.png';
import calculatorScreenshot from '../assets/Calculator.png';
import ttsScreenshot from '../assets/Ganesh-TTS.png';
import pythonpathScreenshot from '../assets/pythonpath.png'; // Assuming this is correct
import airDrawScreenshot from '../assets/Air-Ganesh.png';
import portfolioScreenshot from '../assets/Project-6-img.png';
import * as THREE from 'three';

import { Canvas, useFrame } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import { PerspectiveCamera } from '@react-three/drei';
import { degToRad } from 'three/src/math/MathUtils.js';

function extendMaterial(BaseMaterial, cfg) {
  const physical = THREE.ShaderLib.physical;
  const { vertexShader: baseVert, fragmentShader: baseFrag, uniforms: baseUniforms } = physical;
  const baseDefines = physical.defines ?? {};

  const uniforms = THREE.UniformsUtils.clone(baseUniforms);

  const defaults = new BaseMaterial(cfg.material || {});

  if (defaults.color) uniforms.diffuse.value = defaults.color;
  if ('roughness' in defaults) uniforms.roughness.value = defaults.roughness;
  if ('metalness' in defaults) uniforms.metalness.value = defaults.metalness;
  if ('envMap' in defaults) uniforms.envMap.value = defaults.envMap;
  if ('envMapIntensity' in defaults) uniforms.envMapIntensity.value = defaults.envMapIntensity;

  Object.entries(cfg.uniforms ?? {}).forEach(([key, u]) => {
    uniforms[key] = u !== null && typeof u === 'object' && 'value' in u ? u : { value: u };
  });

  let vert = `${cfg.header}\n${cfg.vertexHeader ?? ''}\n${baseVert}`;
  let frag = `${cfg.header}\n${cfg.fragmentHeader ?? ''}\n${baseFrag}`;

  for (const [inc, code] of Object.entries(cfg.vertex ?? {})) {
    vert = vert.replace(inc, `${inc}\n${code}`);
  }
  for (const [inc, code] of Object.entries(cfg.fragment ?? {})) {
    frag = frag.replace(inc, `${inc}\n${code}`);
  }

  const mat = new THREE.ShaderMaterial({
    defines: { ...baseDefines },
    uniforms,
    vertexShader: vert,
    fragmentShader: frag,
    lights: true,
    fog: !!cfg.material?.fog
  });

  return mat;
}

const CanvasWrapper = ({ children }) => {
  const canvasRef = useRef();
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIntersecting(entry.isIntersecting),
      { threshold: 0.01 }
    );

    if (canvasRef.current) {
      observer.observe(canvasRef.current);
    }

    return () => {
      if (canvasRef.current) observer.unobserve(canvasRef.current);
    };
  }, []);

  return (
    <Canvas ref={canvasRef} dpr={[1, 1.5]} frameloop={isIntersecting ? 'always' : 'never'} className="w-full h-full relative">
      {children}
    </Canvas>
  );
};

const hexToNormalizedRGB = hex => {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return [r / 255, g / 255, b / 255];
};

const noise = `
float random (in vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}
float noise (in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) +
           (c - a)* u.y * (1.0 - u.x) +
           (d - b) * u.x * u.y;
}
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
vec3 fade(vec3 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}
float cnoise(vec3 P){
  vec3 Pi0 = floor(P);
  vec3 Pi1 = Pi0 + vec3(1.0);
  Pi0 = mod(Pi0, 289.0);
  Pi1 = mod(Pi1, 289.0);
  vec3 Pf0 = fract(P);
  vec3 Pf1 = Pf0 - vec3(1.0);
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;
  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);
  vec4 gx0 = ixy0 / 7.0;
  vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);
  vec4 gx1 = ixy1 / 7.0;
  vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);
  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);
  vec4 norm0 = taylorInvSqrt(vec4(dot(g000,g000),dot(g010,g010),dot(g100,g100),dot(g110,g110)));
  g000 *= norm0.x; g010 *= norm0.y; g100 *= norm0.z; g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001,g001),dot(g011,g011),dot(g101,g101),dot(g111,g111)));
  g001 *= norm1.x; g011 *= norm1.y; g101 *= norm1.z; g111 *= norm1.w;
  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x,Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x,Pf1.y,Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy,Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy,Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x,Pf0.y,Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x,Pf1.yz));
  float n111 = dot(g111, Pf1);
  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000,n100,n010,n110),vec4(n001,n101,n011,n111),fade_xyz.z);
  vec2 n_yz = mix(n_z.xy,n_z.zw,fade_xyz.y);
  float n_xyz = mix(n_yz.x,n_yz.y,fade_xyz.x);
  return 2.2 * n_xyz;
}
`;

const Beams = ({
  beamWidth = 3,
  beamHeight = 15,
  beamNumber = 12,
  lightColor = '#ffffff',
  speed = 2,
  noiseIntensity = 1.75,
  scale = 0.2,
  rotation = 50
}) => {
  const beamMaterial = useMemo(
    () =>
      extendMaterial(THREE.MeshStandardMaterial, {
        header: `
  varying vec3 vEye;
  varying float vNoise;
  varying vec2 vUv;
  varying vec3 vPosition;
  uniform float time;
  uniform float uSpeed;
  uniform float uNoiseIntensity;
  uniform float uScale;
  ${noise}`,
        vertexHeader: `
  float getPos(vec3 pos) {
    vec3 noisePos =
      vec3(pos.x * 0., pos.y - uv.y, pos.z + time * uSpeed * 3.) * uScale;
    return cnoise(noisePos);
  }
  vec3 getCurrentPos(vec3 pos) {
    vec3 newpos = pos;
    newpos.z += getPos(pos);
    return newpos;
  }
  vec3 getNormal(vec3 pos) {
    vec3 curpos = getCurrentPos(pos);
    vec3 nextposX = getCurrentPos(pos + vec3(0.01, 0.0, 0.0));
    vec3 nextposZ = getCurrentPos(pos + vec3(0.0, -0.01, 0.0));
    vec3 tangentX = normalize(nextposX - curpos);
    vec3 tangentZ = normalize(nextposZ - curpos);
    return normalize(cross(tangentZ, tangentX));
  }`,
        fragmentHeader: '',
        vertex: {
          '#include <begin_vertex>': `transformed.z += getPos(transformed.xyz);`,
          '#include <beginnormal_vertex>': `objectNormal = getNormal(position.xyz);`
        },
        fragment: {
          '#include <dithering_fragment>': `
    float randomNoise = noise(gl_FragCoord.xy);
    gl_FragColor.rgb -= randomNoise / 15. * uNoiseIntensity;`
        },
        material: { fog: true },
        uniforms: {
          diffuse: new THREE.Color(...hexToNormalizedRGB('#000000')),
          time: { shared: true, mixed: true, linked: true, value: 0 },
          roughness: 0.3,
          metalness: 0.3,
          uSpeed: { shared: true, mixed: true, linked: true, value: speed },
          envMapIntensity: 10,
          uNoiseIntensity: noiseIntensity,
          uScale: scale
        }
      }),
    [speed, noiseIntensity, scale]
  );

  const [showAllProjects, setShowAllProjects] = useState(false);

  useEffect(() => {
    // Refresh AOS to detect new elements when they are shown/hidden
    AOS.refresh();
  }, [showAllProjects]);


  return (
    <section id="projects" className="relative bg-black w-full">
      {/* Canvas is now the absolute background, filling the section */}
      <div className="absolute inset-0 z-0">
        <CanvasWrapper >
          <group rotation={[0, 0, degToRad(rotation)]}>
            <PlaneNoise material={beamMaterial} count={beamNumber} width={beamWidth} height={beamHeight} />
            <DirLight color={lightColor} position={[0, 3, 10]} />
          </group>
          <ambientLight intensity={1} />
          <color attach="background" args={['#000000']} />
          <PerspectiveCamera makeDefault position={[0, 0, 20]} fov={30} />
        </CanvasWrapper>
      </div>
      {/* Content is in a relative container on top, centered */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full min-h-screen py-20 px-4 overflow-hidden">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-white" data-aos="fade-down">
            Projects
          </h2>
          <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {/* Project Card 1: To-Do List App */}
            <div 
              className="group bg-white/10 backdrop-blur-md rounded-lg shadow-lg w-full mx-auto border border-white/20 overflow-hidden flex flex-col"
              data-aos="fade-up"
            >
              <img src={todoAppScreenshot} alt="To-Do List App Screenshot" className="w-full h-48 object-cover transition-transform duration-300 ease-in-out group-hover:scale-105" />
              <div className="p-6 flex flex-col flex-grow">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-4">To-Do List App</h3>
                  <p className="text-sm sm:text-base text-gray-300 mb-4 flex-grow">A modern, feature-rich to-do list application built with React, Vite, and Tailwind CSS, featuring a dynamic WebGL background and smooth animations.</p>
                  <div className="flex flex-wrap items-center gap-x-4 sm:gap-x-6 gap-y-2 mb-4">
                    <div className="flex items-center gap-2 text-gray-300 text-sm" title="React"><FaReact className="text-sky-400" size={20} /> React</div>
                    <div className="flex items-center gap-2 text-gray-300 text-sm" title="Tailwind CSS"><SiTailwindcss className="text-cyan-400" size={20} /> Tailwind</div>
                    <div className="flex items-center gap-2 text-gray-300 text-sm" title="Vite"><SiVite className="text-purple-400" size={20} /> Vite</div>
                    <div className="flex items-center gap-2 text-gray-300 text-sm" title="WebGL"><SiWebgl className="text-orange-500" size={20} /> WebGL</div>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-auto pt-4">
                  <a href="https://ganesh-todo-app.netlify.app/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-white bg-gray-700 hover:bg-gray-600 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    View Live 
                  </a>
                  <a href="https://github.com/Ganeshpanda34/ToDO-List-App.git" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors" aria-label="GitHub Repository">
                    <FaGithub size={28} />
                  </a>
                </div>
              </div>
            </div>

            {/* Project Card 2: InfinityCalc */}
            <div 
              className="group bg-white/10 backdrop-blur-md rounded-lg shadow-lg w-full mx-auto border border-white/20 overflow-hidden flex flex-col"
              data-aos="fade-up" data-aos-delay="200"
            >
              <div className="w-full h-48 bg-gray-900 flex items-center justify-center overflow-hidden">
                <img src={calculatorScreenshot} alt="InfinityCalc App Screenshot" className="w-auto h-full object-contain transition-transform duration-300 ease-in-out group-hover:scale-105" />
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-4">InfinityCalc</h3>
                  <p className="text-sm sm:text-base text-gray-300 mb-4 flex-grow">A web-based calculator built with Python and Flask, featuring a responsive GUI and deployed on Render.</p>
                  <div className="flex flex-wrap items-center gap-x-4 sm:gap-x-6 gap-y-2 mb-4">
                    <div className="flex items-center gap-2 text-gray-300 text-sm" title="Python"><FaPython className="text-yellow-400" size={20} /> Python</div>
                    <div className="flex items-center gap-2 text-gray-300 text-sm" title="GUI"><FaDesktop className="text-gray-400" size={20} /> GUI</div>
                    <div className="flex items-center gap-2 text-gray-300 text-sm" title="Flask"><SiFlask className="text-white" size={20} /> Flask</div>
                    <div className="flex items-center gap-2 text-gray-300 text-sm" title="Render"><SiRender className="text-teal-400" size={20} /> Render</div>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-auto pt-4">
                  <a href="https://flask-smart-calculator.onrender.com/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-white bg-gray-700 hover:bg-gray-600 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    View Live 
                  </a>
                  <a href="https://github.com/Ganeshpanda34/flask-smart-calculator" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors" aria-label="GitHub Repository">
                    <FaGithub size={28} />
                  </a>
                </div>
              </div>
            </div>

            {/* Project Card 3: Ganesh's Text to Speech Converter */}
            <div 
              className="group bg-white/10 backdrop-blur-md rounded-lg shadow-lg w-full mx-auto border border-white/20 overflow-hidden flex flex-col"
              data-aos="fade-up" data-aos-delay="400"
            >
              <div className="w-full h-48 bg-gray-900 flex items-center justify-center overflow-hidden">
                <img src={ttsScreenshot} alt="Ganesh's Text to Speech Converter Screenshot" className="w-auto h-full object-contain transition-transform duration-300 ease-in-out group-hover:scale-105" />
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-4">Ganesh's Text to Speech Converter</h3>
                  <p className="text-sm sm:text-base text-gray-300 mb-4 flex-grow">A sleek and modern Text-to-Speech (TTS) application built with React and Tailwind CSS. This project features a stunning, responsive UI with dynamic animations and provides a seamless experience for converting text into natural-sounding speech.</p>
                  <div className="flex flex-wrap items-center gap-x-4 sm:gap-x-6 gap-y-2 mb-4">
                    <div className="flex items-center gap-2 text-gray-300 text-sm" title="React"><FaReact className="text-sky-400" size={20} /> React</div>
                    <div className="flex items-center gap-2 text-gray-300 text-sm" title="Tailwind CSS"><SiTailwindcss className="text-cyan-400" size={20} /> Tailwind</div>
                    <div className="flex items-center gap-2 text-gray-300 text-sm" title="Vite"><SiVite className="text-purple-400" size={20} /> Vite</div>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-auto pt-4">
                  <a href="https://ganesh-tts.netlify.app/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-white bg-gray-700 hover:bg-gray-600 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    View Live 
                  </a>
                  <a href="https://github.com/Ganeshpanda34/-Ganesh-s-Text-to-Speech-Converter.git" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors" aria-label="GitHub Repository">
                    <FaGithub size={28} />
                  </a>
                </div>
              </div>
            </div>

            {/* Project Card 4: Ganesh's PythonPath */}
            <div 
              className={`group bg-white/10 backdrop-blur-md rounded-lg shadow-lg w-full mx-auto border border-white/20 overflow-hidden flex-col ${showAllProjects ? 'flex' : 'hidden'}`}
              data-aos="fade-up" data-aos-delay="0"
            >
              <img src={pythonpathScreenshot} alt="Ganesh's PythonPath Screenshot" className="w-full h-48 object-cover transition-transform duration-300 ease-in-out group-hover:scale-105" />
              <div className="p-6 flex flex-col flex-grow">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-4">Ganesh's PythonPath</h3>
                  <p className="text-sm sm:text-base text-gray-300 mb-4 flex-grow">An interactive web application built with Python and Streamlit to showcase various Python concepts from beginner to advanced levels, deployed on Streamlit Community Cloud.</p>
                  <div className="flex flex-wrap items-center gap-x-4 sm:gap-x-6 gap-y-2 mb-4">
                    <div className="flex items-center gap-2 text-gray-300 text-sm" title="Python"><FaPython className="text-yellow-400" size={20} /> Python</div>
                    <div className="flex items-center gap-2 text-gray-300 text-sm" title="Streamlit"><SiStreamlit className="text-red-500" size={20} /> Streamlit</div>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-auto pt-4">
                  <a href="https://ganesh-pythonpath.streamlit.app/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-white bg-gray-700 hover:bg-gray-600 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    View Live 
                  </a>
                  <a href="https://github.com/Ganeshpanda34/Ganesh-s-PythonPath.git" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors" aria-label="GitHub Repository">
                    <FaGithub size={28} />
                  </a>
                </div>
              </div>
            </div>

            {/* Project Card 5: Ganesh | Air draw */}
            <div 
              className={`group bg-white/10 backdrop-blur-md rounded-lg shadow-lg w-full mx-auto border border-white/20 overflow-hidden flex-col ${showAllProjects ? 'flex' : 'hidden'}`}
              data-aos="fade-up" data-aos-delay="200"
            >
              <img src={airDrawScreenshot} alt="Ganesh | Air draw Screenshot" className="w-full h-48 object-cover transition-transform duration-300 ease-in-out group-hover:scale-105" />
              <div className="p-6 flex flex-col flex-grow">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-4">Ganesh | Air draw</h3>
                  <p className="text-sm sm:text-base text-gray-300 mb-4 flex-grow">An web application in which you will show your hand in pinch gesture to draw & later you can save into PNG format.</p>
                  <div className="flex flex-wrap items-center gap-x-4 sm:gap-x-6 gap-y-2 mb-4">
                    <div className="flex items-center gap-2 text-gray-300 text-sm" title="HTML5"><FaHtml5 className="text-orange-500" size={20} /> HTML5</div>
                    <div className="flex items-center gap-2 text-gray-300 text-sm" title="CSS3"><FaCss3Alt className="text-blue-500" size={20} /> CSS3</div>
                    <div className="flex items-center gap-2 text-gray-300 text-sm" title="JavaScript"><SiJavascript className="text-yellow-400" size={20} /> JavaScript</div>
                    <div className="flex items-center gap-2 text-gray-300 text-sm" title="Bootstrap"><FaBootstrap className="text-purple-500" size={20} /> Bootstrap</div>
                    <div className="flex items-center gap-2 text-gray-300 text-sm" title="MediaPipe"><FaHandPointer className="text-green-400" size={20} /> MediaPipe</div>
                    <div className="flex items-center gap-2 text-gray-300 text-sm" title="OpenCV"><SiOpencv className="text-blue-400" size={20} /> OpenCV</div>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-auto pt-4">
                  <a href="https://ganesh-air-draw.netlify.app/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-white bg-gray-700 hover:bg-gray-600 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    View Live 
                  </a>
                  <a href="https://github.com/Ganeshpanda34/Ganesh-Air-draw" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors" aria-label="GitHub Repository">
                    <FaGithub size={28} />
                  </a>
                </div>
              </div>
            </div>

            {/* Project Card 6: Portfolio Website */}
            <div 
              className={`group bg-white/10 backdrop-blur-md rounded-lg shadow-lg w-full mx-auto border border-white/20 overflow-hidden flex-col ${showAllProjects ? 'flex' : 'hidden'}`}
              data-aos="fade-up" data-aos-delay="400"
            >
              <img src={portfolioScreenshot} alt="Portfolio Website Screenshot" className="w-full h-48 object-cover transition-transform duration-300 ease-in-out group-hover:scale-105" />
              <div className="p-6 flex flex-col flex-grow">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-4">Portfolio Website</h3>
                  <p className="text-sm sm:text-base text-gray-300 mb-4 flex-grow">A responsive and modern personal portfolio built from scratch to showcase my skills, projects, and professional journey.</p>
                  <div className="flex flex-wrap items-center gap-x-4 sm:gap-x-6 gap-y-2 mb-4">
                    <div className="flex items-center gap-2 text-gray-300 text-sm" title="React"><FaReact className="text-sky-400" size={20} /> React</div>
                    <div className="flex items-center gap-2 text-gray-300 text-sm" title="Tailwind CSS"><SiTailwindcss className="text-cyan-400" size={20} /> Tailwind</div>
                    <div className="flex items-center gap-2 text-gray-300 text-sm" title="Vite"><SiVite className="text-purple-400" size={20} /> Vite</div>
                    <div className="flex items-center gap-2 text-gray-300 text-sm" title="WebGL"><SiWebgl className="text-orange-500" size={20} /> WebGL</div>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-auto pt-4">
                  <a href="https://ganesh-panda.netlify.app/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-white bg-gray-700 hover:bg-gray-600 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    View Live 
                  </a>
                  <a href="https://github.com/Ganeshpanda34/ganesh_portfolio" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors" aria-label="GitHub Repository">
                    <FaGithub size={28} />
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 text-center">
            <button
              onClick={() => setShowAllProjects(!showAllProjects)}
              className="inline-flex items-center justify-center text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-8 py-3 text-center transition-all duration-300 ease-in-out"
            >
              {showAllProjects ? (
                <>
                  View Less
                  <motion.span
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatType: 'loop' }}
                    className="ml-2"
                  >
                    <FaArrowUp />
                  </motion.span>
                </>
              ) : (
                <>
                  View More
                  <motion.span
                    animate={{ y: [0, 3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatType: 'loop' }}
                    className="ml-2"
                  >
                    <FaArrowDown />
                  </motion.span>
                </>
              )}
            </button>
          </div>
        </div>
    </section>
  );
};
Beams.displayName = 'Projects';
function createStackedPlanesBufferGeometry(n, width, height, spacing, heightSegments) {
  const geometry = new THREE.BufferGeometry();
  const numVertices = n * (heightSegments + 1) * 2;
  const numFaces = n * heightSegments * 2;
  const positions = new Float32Array(numVertices * 3);
  const indices = new Uint32Array(numFaces * 3);
  const uvs = new Float32Array(numVertices * 2);

  let vertexOffset = 0;
  let indexOffset = 0;
  let uvOffset = 0;
  const totalWidth = n * width + (n - 1) * spacing;
  const xOffsetBase = -totalWidth / 2;

  for (let i = 0; i < n; i++) {
    const xOffset = xOffsetBase + i * (width + spacing);
    const uvXOffset = Math.random() * 300;
    const uvYOffset = Math.random() * 300;

    for (let j = 0; j <= heightSegments; j++) {
      const y = height * (j / heightSegments - 0.5);
      const v0 = [xOffset, y, 0];
      const v1 = [xOffset + width, y, 0];
      positions.set([...v0, ...v1], vertexOffset * 3);

      const uvY = j / heightSegments;
      uvs.set([uvXOffset, uvY + uvYOffset, uvXOffset + 1, uvY + uvYOffset], uvOffset);

      if (j < heightSegments) {
        const a = vertexOffset,
          b = vertexOffset + 1,
          c = vertexOffset + 2,
          d = vertexOffset + 3;
        indices.set([a, b, c, c, b, d], indexOffset);
        indexOffset += 6;
      }
      vertexOffset += 2;
      uvOffset += 4;
    }
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  geometry.computeVertexNormals();
  return geometry;
}

const MergedPlanes = ({ material, width, count, height }) => {
  const mesh = useRef(null);
  const geometry = useMemo(
    () => createStackedPlanesBufferGeometry(count, width, height, 0, 100),
    [count, width, height]
  );
  useFrame((_, delta) => {
    mesh.current.material.uniforms.time.value += 0.1 * delta;
  });
  return <mesh ref={mesh} geometry={geometry} material={material} />;
};
MergedPlanes.displayName = 'MergedPlanes';

const PlaneNoise = (props) => (
  <MergedPlanes material={props.material} width={props.width} count={props.count} height={props.height} />
);
PlaneNoise.displayName = 'PlaneNoise';

const DirLight = ({ position, color }) => {
  const dir = useRef(null);
  useEffect(() => {
    if (!dir.current) return;
    const cam = dir.current.shadow.camera;
    if (!cam) return;
    cam.top = 24;
    cam.bottom = -24;
    cam.left = -24;
    cam.right = 24;
    cam.far = 64;
    dir.current.shadow.bias = -0.004;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <directionalLight ref={dir} color={color} intensity={1} position={position} />;
};

export default Beams;

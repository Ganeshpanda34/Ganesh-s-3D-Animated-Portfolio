import { useEffect, useRef } from "react";
import { Renderer, Camera, Geometry, Program, Mesh } from "ogl";
import { FaReact, FaNodeJs, FaTools, FaPython } from "react-icons/fa";

const defaultColors = ["#ffffff", "#ffffff", "#ffffff"];

const hexToRgb = (hex) => {
  hex = hex.replace(/^#/, "");
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const int = parseInt(hex, 16);
  const r = ((int >> 16) & 255) / 255;
  const g = ((int >> 8) & 255) / 255;
  const b = (int & 255) / 255;
  return [r, g, b];
};

const vertex = /* glsl */ `
  attribute vec3 position;
  attribute vec4 random;
  attribute vec3 color;
  uniform mat4 modelMatrix;
  uniform mat4 viewMatrix;
  uniform mat4 projectionMatrix;
  uniform float uTime;
  uniform float uSpread;
  uniform float uBaseSize;
  uniform float uSizeRandomness;
  
  varying vec4 vRandom;
  varying vec3 vColor;
  
  void main() {
    vRandom = random;
    vColor = color;
    
    vec3 pos = position * uSpread;
    pos.z *= 10.0;
    
    vec4 mPos = modelMatrix * vec4(pos, 1.0);
    float t = uTime;
    mPos.x += sin(t * random.z + 6.28 * random.w) * mix(0.1, 1.5, random.x);
    mPos.y += sin(t * random.y + 6.28 * random.x) * mix(0.1, 1.5, random.w);
    mPos.z += sin(t * random.w + 6.28 * random.y) * mix(0.1, 1.5, random.z);
    
    vec4 mvPos = viewMatrix * mPos;

    if (uSizeRandomness == 0.0) {
      gl_PointSize = uBaseSize;
    } else {
      gl_PointSize = (uBaseSize * (1.0 + uSizeRandomness * (random.x - 0.5))) / length(mvPos.xyz);
    }

    gl_Position = projectionMatrix * mvPos;
  }
`;

const fragment = /* glsl */ `
  precision highp float;
  
  uniform float uTime;
  uniform float uAlphaParticles;
  varying vec4 vRandom;
  varying vec3 vColor;
  
  void main() {
    vec2 uv = gl_PointCoord.xy;
    float d = length(uv - vec2(0.5));
    
    if(uAlphaParticles < 0.5) {
      if(d > 0.5) {
        discard;
      }
      gl_FragColor = vec4(vColor + 0.2 * sin(uv.yxx + uTime + vRandom.y * 6.28), 1.0);
    } else {
      float circle = smoothstep(0.5, 0.4, d) * 0.8;
      gl_FragColor = vec4(vColor + 0.2 * sin(uv.yxx + uTime + vRandom.y * 6.28), circle);
    }
  }
`;

const SkillCard = ({ icon, title, skills }) => (
  <div
    data-aos="fade-up" data-aos-once="false"
    className="bg-gray-900 bg-opacity-50 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-pink-500/20 transition-all duration-300 ease-in-out transform hover:-translate-y-2 border border-gray-800 hover:border-pink-500/50"
  >
    <div className="flex items-center mb-4">
      <div className="text-pink-400 text-3xl mr-4">{icon}</div>
      <h3 className="text-xl font-bold text-white">{title}</h3>
    </div>
    <ul className="space-y-2 text-gray-300">
      {skills.map((skill, index) => (
        <li key={index} className="text-sm">
          <span>{skill}</span>
        </li>
      ))}
    </ul>
  </div>
);

const Particles = ({
  particleCount = 200,
  particleSpread = 10,
  speed = 0.1,
  particleColors,
  moveParticlesOnHover = false,
  particleHoverFactor = 1,
  alphaParticles = false,
  particleBaseSize = 100,
  sizeRandomness = 1,
  cameraDistance = 20,
  disableRotation = false,
  className,
}) => {
  const containerRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new Renderer({ depth: false, alpha: true });
    const gl = renderer.gl;
    gl.canvas.className = "absolute top-0 left-0 w-full h-full z-0";
    container.appendChild(gl.canvas);
    gl.clearColor(0, 0, 0, 0);

    const camera = new Camera(gl, { fov: 15 });
    camera.position.set(0, 0, cameraDistance);

    const resize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      renderer.setSize(width, height);
      camera.perspective({ aspect: gl.canvas.width / gl.canvas.height });
    };
    window.addEventListener("resize", resize, false);
    resize();

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseRef.current = { x, y };
    };

    if (moveParticlesOnHover) {
      container.addEventListener("mousemove", handleMouseMove);
    }

    const count = particleCount;
    const positions = new Float32Array(count * 3);
    const randoms = new Float32Array(count * 4);
    const colors = new Float32Array(count * 3);
    const palette =
      particleColors && particleColors.length > 0
        ? particleColors
        : defaultColors;

    for (let i = 0; i < count; i++) {
      let x, y, z, len;
      do {
        x = Math.random() * 2 - 1;
        y = Math.random() * 2 - 1;
        z = Math.random() * 2 - 1;
        len = x * x + y * y + z * z;
      } while (len > 1 || len === 0);
      const r = Math.cbrt(Math.random());
      positions.set([x * r, y * r, z * r], i * 3);
      randoms.set(
        [Math.random(), Math.random(), Math.random(), Math.random()],
        i * 4
      );
      const col = hexToRgb(palette[Math.floor(Math.random() * palette.length)]);
      colors.set(col, i * 3);
    }

    const geometry = new Geometry(gl, {
      position: { size: 3, data: positions },
      random: { size: 4, data: randoms },
      color: { size: 3, data: colors },
    });

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uTime: { value: 0 },
        uSpread: { value: particleSpread },
        uBaseSize: { value: particleBaseSize },
        uSizeRandomness: { value: sizeRandomness },
        uAlphaParticles: { value: alphaParticles ? 1 : 0 },
      },
      transparent: true,
      depthTest: false,
    });

    const particles = new Mesh(gl, { mode: gl.POINTS, geometry, program });

    let animationFrameId;
    let lastTime = performance.now();
    let elapsed = 0;

    const update = (t) => {
      animationFrameId = requestAnimationFrame(update);
      const delta = t - lastTime;
      lastTime = t;
      elapsed += delta * speed;

      program.uniforms.uTime.value = elapsed * 0.001;

      if (moveParticlesOnHover) {
        particles.position.x = -mouseRef.current.x * particleHoverFactor;
        particles.position.y = -mouseRef.current.y * particleHoverFactor;
      } else {
        particles.position.x = 0;
        particles.position.y = 0;
      }

      if (!disableRotation) {
        particles.rotation.x = Math.sin(elapsed * 0.0002) * 0.1;
        particles.rotation.y = Math.cos(elapsed * 0.0005) * 0.15;
        particles.rotation.z += 0.01 * speed;
      }

      renderer.render({ scene: particles, camera });
    };

    animationFrameId = requestAnimationFrame(update);

    return () => {
      window.removeEventListener("resize", resize);
      if (moveParticlesOnHover) {
        container.removeEventListener("mousemove", handleMouseMove);
      }
      cancelAnimationFrame(animationFrameId);
      if (container.contains(gl.canvas)) {
        container.removeChild(gl.canvas);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    particleCount,
    particleSpread,
    speed,
    moveParticlesOnHover,
    particleHoverFactor,
    alphaParticles,
    particleBaseSize,
    sizeRandomness,
    cameraDistance,
    disableRotation,
  ]);

  return (
    <section id="skills" ref={containerRef} className={`relative w-full h-full ${className}`}>
      {/* Overlay for content */}
      <div
        className="relative z-10 flex flex-col items-center justify-center p-4 py-20 md:py-24 min-h-screen"
      >
        <div className="w-full max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-white" data-aos="fade-down" data-aos-once="false">
            Skills
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <SkillCard
              icon={<FaReact />}
              title="Frontend Development"
              skills={[
                <span className="flex items-center" key="html5">
                  <span
                    role="img"
                    aria-label="HTML5"
                    className="w-4 h-4 mr-2 inline-block bg-contain bg-center bg-no-repeat"
                    style={{
                      backgroundImage:
                        "url('https://cdn.simpleicons.org/html5/ff3e00')",
                    }}
                  />
                  <span>HTML5</span>
                </span>,
                <span className="flex items-center" key="css3">
                  <span
                    role="img"
                    aria-label="CSS3"
                    className="w-4 h-4 mr-2 inline-block bg-contain bg-center bg-no-repeat"
                    style={{
                      backgroundImage:
                        "url('https://img.icons8.com/color/48/css3.png')",
                    }}
                  />
                  <span>CSS3</span>
                </span>,
                <span className="flex items-center" key="js">
                  <span
                    role="img"
                    aria-label="JavaScript"
                    className="w-4 h-4 mr-2 inline-block bg-contain bg-center bg-no-repeat"
                    style={{
                      backgroundImage:
                        "url('https://cdn.simpleicons.org/javascript/f7df1e')",
                    }}
                  
                  />
                  <span>JavaScript</span>
                </span>,
                <span className="flex items-center" key="bootstrap">
                  <span
                    role="img"
                    aria-label="Bootstrap"
                    className="w-4 h-4 mr-2 inline-block bg-contain bg-center bg-no-repeat"
                    style={{
                      backgroundImage:
                        "url('https://cdn.simpleicons.org/bootstrap/7952b3')",
                    }}
                  />
                  <span>Bootstrap 5</span>
                </span>,
                <span className="flex items-center" key="react">
                  <span
                    role="img"
                    aria-label="React"
                    className="w-4 h-4 mr-2 inline-block bg-contain bg-center bg-no-repeat"
                    style={{
                      backgroundImage:
                        "url('https://cdn.simpleicons.org/react/61dafb')",
                    }}
                  />
                  <span>React</span>
                </span>,
                <span className="flex items-center" key="tailwind">
                  <span
                    role="img"
                    aria-label="Tailwind CSS"
                    className="w-4 h-4 mr-2 inline-block bg-contain bg-center bg-no-repeat"
                    style={{
                      backgroundImage:
                        "url('https://cdn.simpleicons.org/tailwindcss/06b6d4')",
                    }}
                  />
                  <span>Tailwind CSS</span>
                </span>,
                <span className="flex items-center" key="framer">
                  <span
                    role="img"
                    aria-label="Framer Motion"
                    className="w-4 h-4 mr-2 inline-block bg-contain bg-center bg-no-repeat"
                    style={{
                      backgroundImage:
                        "url('https://cdn.simpleicons.org/framer/0055FF')",
                    }}
                  />
                  <span>Framer Motion</span>
                </span>,
              ]}
            />
            <SkillCard
              icon={<FaPython />}
              title="Backend Development"
              skills={[
                <span className="flex items-center" key="python">
                  <span
                    role="img"
                    aria-label="Python"
                    className="w-4 h-4 mr-2 inline-block bg-contain bg-center bg-no-repeat"
                    style={{
                      backgroundImage:
                        "url('https://cdn.simpleicons.org/python/3776ab')",
                    }}
                  />
                  <span>Python</span>
                </span>,
                <span className="flex items-center" key="flask">
                  <span
                    role="img"
                    aria-label="Flask"
                    className="w-4 h-4 mr-2 inline-block bg-contain bg-center bg-no-repeat"
                    style={{
                      backgroundImage:
                        "url('https://cdn.simpleicons.org/flask/FFFFFF')",
                    }}
                  />
                  <span>Flask</span>
                </span>,
                <span className="flex items-center" key="streamlit">
                  <span
                    role="img"
                    aria-label="Streamlit"
                    className="w-4 h-4 mr-2 inline-block bg-contain bg-center bg-no-repeat"
                    style={{
                      backgroundImage:
                        "url('https://cdn.simpleicons.org/streamlit/ff4b4b')",
                    }}
                  />
                  <span>Streamlit</span>
                </span>,
              ]}
            />
            <SkillCard
              icon={<FaTools />}
              title="Tools & Platforms"
              skills={[
                <span className="flex items-center" key="git">
                  <span
                    role="img"
                    aria-label="Git"
                    className="w-4 h-4 mr-2 inline-block bg-contain bg-center bg-no-repeat"
                    style={{
                      backgroundImage:
                        "url('https://cdn.simpleicons.org/git/f05032')",
                    }}
                  />
                  <span>Git</span>
                </span>,
                <span className="flex items-center" key="github">
                  <span
                    role="img"
                    aria-label="GitHub"
                    className="w-4 h-4 mr-2 inline-block bg-contain bg-center bg-no-repeat"
                    style={{
                      backgroundImage:
                        "url('https://cdn.simpleicons.org/github/FFFFFF')",
                    }}
                  />
                  <span>GitHub</span>
                </span>,
                <span className="flex items-center" key="netlify">
                  <span
                    role="img"
                    aria-label="Netlify"
                    className="w-4 h-4 mr-2 inline-block bg-contain bg-center bg-no-repeat"
                    style={{
                      backgroundImage:
                        "url('https://cdn.simpleicons.org/netlify/00c7b7')",
                    }}
                  />
                  <span>Netlify</span>
                </span>,
                <span className="flex items-center" key="render">
                  <span
                    role="img"
                    aria-label="Render"
                    className="w-4 h-4 mr-2 inline-block bg-contain bg-center bg-no-repeat"
                    style={{
                      backgroundImage:
                        "url('https://cdn.simpleicons.org/render/00b3b3')",
                    }}
                  />
                  <span>Render</span>
                </span>,
                <span className="flex items-center" key="streamlit-cloud">
                  <span
                    role="img"
                    aria-label="Streamlit Community Cloud"
                    className="w-4 h-4 mr-2 inline-block bg-contain bg-center bg-no-repeat"
                    style={{
                      backgroundImage:
                        "url('https://cdn.simpleicons.org/streamlit/ff4b4b')",
                    }}
                  />
                  <span>Streamlit Community Cloud</span>
                </span>,
                <span className="flex items-center" key="vscode">
                  <span
                    role="img"
                    aria-label="Visual Studio Code"
                    className="w-4 h-4 mr-2 inline-block bg-contain bg-center bg-no-repeat"
                    style={{
                      backgroundImage:
                        "url('https://img.icons8.com/color/48/visual-studio-code-2019.png')",
                    }}
                  />
                  <span>Visual Studio Code</span>
                </span>,
              ]}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Particles;

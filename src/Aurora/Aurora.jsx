import { Renderer, Program, Mesh, Color, Triangle } from 'ogl';
import { useEffect, useRef, useState } from 'react';
import ProfileImage2 from "../assets/ProfileImage2.png";
import ResumePDF from "../assets/Ganesh-Full-Stack-Developer-Resume.pdf";
import { IoMdCheckmarkCircleOutline, IoMdDownload } from 'react-icons/io';


const VERT = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = `#version 300 es
precision mediump float;

uniform float uTime;
uniform float uAmplitude;
uniform vec3 uColorStops[3];
uniform vec2 uResolution;
uniform float uBlend;

out vec4 fragColor;

vec3 permute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec2 v){
  const vec4 C = vec4(
      0.211324865405187, 0.366025403784439,
      -0.577350269189626, 0.024390243902439
  );
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);

  vec3 p = permute(
      permute(i.y + vec3(0.0, i1.y, 1.0))
    + i.x + vec3(0.0, i1.x, 1.0)
  );

  vec3 m = max(
      0.5 - vec3(
          dot(x0, x0),
          dot(x12.xy, x12.xy),
          dot(x12.zw, x12.zw)
      ), 
      0.0
  );
  m = m * m;
  m = m * m;

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);

  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

struct ColorStop {
  vec3 color;
  float position;
};

#define COLOR_RAMP(colors, factor, finalColor) {              \
  int index = 0;                                            \
  for (int i = 0; i < 2; i++) {                               \
     ColorStop currentColor = colors[i];                    \
     bool isInBetween = currentColor.position <= factor;    \
     index = int(mix(float(index), float(i), float(isInBetween))); \
  }                                                         \
  ColorStop currentColor = colors[index];                   \
  ColorStop nextColor = colors[index + 1];                  \
  float range = nextColor.position - currentColor.position; \
  float lerpFactor = (factor - currentColor.position) / range; \
  finalColor = mix(currentColor.color, nextColor.color, lerpFactor); \
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  
  ColorStop colors[3];
  colors[0] = ColorStop(uColorStops[0], 0.0);
  colors[1] = ColorStop(uColorStops[1], 0.5);
  colors[2] = ColorStop(uColorStops[2], 1.0);
  
  vec3 rampColor;
  COLOR_RAMP(colors, uv.x, rampColor);
  
  float height = snoise(vec2(uv.x * 2.0 + uTime * 0.1, uTime * 0.25)) * 0.5 * uAmplitude;
  height = exp(height);
  height = (uv.y * 2.0 - height + 0.2);
  float intensity = 0.6 * height;
  
  float midPoint = 0.20;
  float auroraAlpha = smoothstep(midPoint - uBlend * 0.5, midPoint + uBlend * 0.5, intensity);
  
  vec3 auroraColor = intensity * rampColor;
  
  fragColor = vec4(auroraColor * auroraAlpha, auroraAlpha);
}
`;

const CheckIcon = () => (
  <IoMdCheckmarkCircleOutline className="w-5 h-5 mr-2 text-pink-400 flex-shrink-0" />
);

export default function Aurora({ colorStops = ['#5227FF', '#7cff67', '#5227FF'], amplitude = 1.0, blend = 0.5, speed = 0.5, className = "", setShowToast }) {
  const propsRef = useRef({ colorStops, amplitude, blend, speed, className });
  propsRef.current = { colorStops, amplitude, blend, speed, className };

  const ctnDom = useRef(null);

  useEffect(() => {
    let isVisible = false;
    const ctn = ctnDom.current;
    if (!ctn) return;

    const renderer = new Renderer({
      alpha: true,
      premultipliedAlpha: true,
      antialias: true,
      dpr: Math.min(window.devicePixelRatio, 2) * 0.8, // Render at 80% resolution
      powerPreference: 'low-power'
    });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    // The blend func is set to ONE, ONE_MINUS_SRC_ALPHA which is good for transparent backgrounds.
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.canvas.style.backgroundColor = 'transparent';

    let program;

    function resize() {
      if (!ctn) return;
      const width = ctn.offsetWidth;
      const height = ctn.offsetHeight;
      renderer.setSize(width, height);
      if (program) {
        program.uniforms.uResolution.value = [width, height];
      }
    }
    window.addEventListener('resize', resize);

    const geometry = new Triangle(gl);
    if (geometry.attributes.uv) {
      delete geometry.attributes.uv;
    }

    const colorStopsArray = colorStops.map(hex => {
      const c = new Color(hex);
      return [c.r, c.g, c.b];
    });

    program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uTime: { value: 0 },
        uAmplitude: { value: amplitude },
        uColorStops: { value: colorStopsArray },
        uResolution: { value: [ctn.offsetWidth, ctn.offsetHeight] },
        uBlend: { value: blend }
      }
    });

    const mesh = new Mesh(gl, { geometry, program });
    ctn.appendChild(gl.canvas);

    let animateId = 0;
    const update = t => {
      animateId = requestAnimationFrame(update);
      if (!isVisible) return; // Pause animation if not visible
      const { time: propTime = t * 0.01, speed: propSpeed = 1.0 } = propsRef.current;
      program.uniforms.uTime.value = propTime * propSpeed * 0.1;
      program.uniforms.uAmplitude.value = propsRef.current.amplitude ?? 1.0;
      program.uniforms.uBlend.value = propsRef.current.blend ?? blend;
      const stops = propsRef.current.colorStops ?? colorStops; 
      program.uniforms.uColorStops.value = stops.map(hex => {
        const c = new Color(hex);
        return [c.r, c.g, c.b];
      });
      renderer.render({ scene: mesh });
    };
    animateId = requestAnimationFrame(update);

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.01 } // Start/stop when even a small part is visible
    );

    if (ctn) {
      observer.observe(ctn);
    }

    resize();

    return () => {
      cancelAnimationFrame(animateId);
      if (ctn) observer.unobserve(ctn);
      window.removeEventListener('resize', resize);
      if (ctn && gl.canvas.parentNode === ctn) {
        ctn.removeChild(gl.canvas);
      }
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amplitude, blend, colorStops, speed]);

  const handleDownload = () => {
    setShowToast(true);
  };

  return (
    <section id="about" className="relative flex items-center justify-center py-24 md:py-32 overflow-hidden">
      <div ref={ctnDom} className={`absolute inset-0 z-0 w-full h-full ${className}`} />
      <div className="relative z-10 container mx-auto px-6 text-white" data-aos-once="false">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-12" data-aos="fade-down" data-aos-once="false">About Me</h2>
        <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-16">
          {/* Left Side: Image */}
          <div className="w-full md:w-1/3 flex justify-center" data-aos="fade-right" data-aos-delay="200" data-aos-once="false">
            <div className="animated-border relative w-80 h-80 md:w-[26rem] md:h-[26rem] rounded-lg overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-300 group">
              <img src={ProfileImage2} alt="Ganesh" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            </div>
          </div>

          {/* Right Side: Text Content */}
          <div className="w-full md:w-2/3 text-left" data-aos="fade-left" data-aos-delay="400" data-aos-once="false">
            <p className="text-gray-300 mb-4 text-lg">
              I am a passionate Frontend Developer with a strong foundation in web technologies. As a fresher, I specialize in creating responsive, accessible, and performance-optimized web applications.
            </p>
            <p className="text-gray-300 mb-4 text-lg">
              My journey in web development started with a curiosity about how websites work, which led me to pursue a degree in 'BSc-ITM'. Since then, I've worked on various projects, continuously improving my skills and staying updated with the latest industry trends.
            </p>
            <p className="text-gray-300 mb-6 text-lg">
              When I'm not coding, I explore cutting-edge AI tools and industry innovations to stay ahead of the tech curve, I prioritize fitness and physical training or enjoy listening to music & podcasts.
            </p>
            <ul className="space-y-2 mb-8">
              <li className="flex items-center text-gray-300" data-aos="fade-left" data-aos-delay="500" data-aos-once="false"><CheckIcon />Mobile-first, user-focused development</li>
              <li className="flex items-center text-gray-300" data-aos="fade-left" data-aos-delay="600" data-aos-once="false"><CheckIcon />UI/UX Principles</li>
              <li className="flex items-center text-gray-300" data-aos="fade-left" data-aos-delay="700" data-aos-once="false"><CheckIcon />Cross-Browser Compatibility</li>
              <li className="flex items-center text-gray-300" data-aos="fade-left" data-aos-delay="800" data-aos-once="false"><CheckIcon />Intuitive, clean interface design</li>
              <li className="flex items-center text-gray-300" data-aos="fade-left" data-aos-delay="900" data-aos-once="false"><CheckIcon />Code with vibe — where design meets emotion</li>
              <li className="flex items-center text-gray-300" data-aos="fade-left" data-aos-delay="1000" data-aos-once="false"><CheckIcon />Always learning. Always improving</li>
            </ul>
            <div data-aos="fade-up" data-aos-delay="1100" data-aos-once="false">
              <a
                href={ResumePDF}
                download="Ganesh-Full-Stack-Developer-Resume.pdf"
                onClick={handleDownload}
                className="inline-flex items-center justify-center bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105 border-2 border-transparent hover:border-white"
              >
                <IoMdDownload className="mr-2" />
                <span>Download Resume</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

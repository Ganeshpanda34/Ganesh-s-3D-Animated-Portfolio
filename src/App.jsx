import { useState, useLayoutEffect, useEffect } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, AnimatePresence } from 'framer-motion';
import AOS from 'aos';
import 'aos/dist/aos.css';
import CardNav from './CardNav/CardNav.jsx';
import DarkVeil from './DarkVeil/DarkVeil';
import Aurora from './Aurora/Aurora';
import { IoMdCheckmarkCircleOutline } from 'react-icons/io';
import LightRays from './LightRays/LightRays.jsx';
import Particles from './Particles/Particles.jsx';
import Toast from './Contact/Toast.jsx';
import Beams from './Beams/Beams.jsx';
import Contact from './Contact/Contact.jsx';

const CheckIcon = () => (
  <IoMdCheckmarkCircleOutline className="w-5 h-5 mr-2 text-pink-400 flex-shrink-0" />
);

const App = () => {
  const navItems = [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { label: 'Education', href: '#education' },
    { label: 'Skills', href: '#skills' },
    { label: 'Projects', href: '#projects' },
    { label: 'Contact', href: '#contact' },
  ];

  const [activeItem, setActiveItem] = useState(navItems[0].label);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    AOS.init({ duration: 1000, once: false });
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast({ show: false, message: '', type: 'success' });
  };

  const handleSmoothScroll = (e) => {
    e.preventDefault();
    const targetId = e.currentTarget.getAttribute('href').substring(1);
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Set the body background color to black to prevent white flashes between sections.
  useEffect(() => {
    document.body.style.backgroundColor = '#000';
    // Cleanup function to reset the background color if the app unmounts
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, []);

  useLayoutEffect(() => {
    const sections = navItems.map(item => document.querySelector(item.href));

    sections.forEach(section => {
      if (section) {
        ScrollTrigger.create({
          trigger: section,
          start: "top 40%",
          end: "bottom 40%",
          onEnter: () => {
            const navItem = navItems.find(item => item.href === `#${section.id}`);
            if (navItem) {
              setActiveItem(navItem.label);
            }
          },
          onEnterBack: () => {
            const navItem = navItems.find(item => item.href === `#${section.id}`);
            if (navItem) {
              setActiveItem(navItem.label);
            }
          },
        });
      }
    });

    // Clean up ScrollTriggers on unmount
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  // Custom styles for the animated border effect
  const customStyles = `
    @keyframes rotate {
      100% {
        transform: rotate(1turn);
      }
    }
    .animated-border::before {
      content: '';
      position: absolute;
      z-index: -1;
      inset: -5px; /* Increased from -3px to make the border thicker */
      border-radius: 0.75rem; /* 12px, to match rounded-lg */
      background: conic-gradient(from var(--angle), #FF3232, #FF94B4, #3A29FF, #FF94B4, #FF3232);
      animation: rotate 4s linear infinite;
      filter: blur(10px); /* Added a default blur for a glow effect */
      opacity: 0.8; /* Make it visible by default */
      transition: filter 0.3s ease-in-out, opacity 0.3s ease-in-out;
    }
    .animated-border:hover::before {
      opacity: 1; /* Full opacity on hover */
      filter: blur(20px); /* Increase blur on hover for a stronger glow */
    }
    @property --angle {
      syntax: '<angle>';
      initial-value: 0deg;
      inherits: false;
    }
  `;

  return (
    // Set a permanent dark background
    <div className="relative bg-black min-h-screen">
      {/* The header is now fixed, allowing the hero section to start at the top and be overlaid by the transparent navigation bar */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <CardNav
          logo="Ganesh"
          logoAlt="Company Logo"
          items={navItems}
          activeItem={activeItem}
          setActiveItem={setActiveItem}
          onNavItemClick={handleSmoothScroll}
          menuColor="#fff"
        />
      </header>
      <main className="bg-black">
        <style>{customStyles}</style>
        {/* The DarkVeil component now acts as the hero section */}
        <section id="home">
          <DarkVeil resolutionScale={0.75} targetFps={30} />
        </section>

        <Aurora
          colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
          blend={0.4}
          amplitude={1.0}
          speed={0.2}
          setShowToast={() => showToast('Resume download started!')}
        />
       

      <AnimatePresence>
        {toast.show && (
          <Toast message={toast.message} type={toast.type} onClose={hideToast} />
        )}
      </AnimatePresence>
        <LightRays
          raysOrigin="top-center"
          raysColor="#00ffffff"
          raysSpeed={0.5}
          lightSpread={5}
          rayLength={1.5}
          followMouse={true}
          mouseInfluence={0.1}
          noiseAmount={0.1}
          distortion={0.05}
          className="custom-rays"
        />
        <Particles
          particleColors={['#ffffff', '#ffffff']}
          particleCount={400}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={100}
          moveParticlesOnHover={true}
          alphaParticles={false}
          disableRotation={false}
        />
        <Beams beamWidth={3} beamHeight={20} beamNumber={12} lightColor="#ffffff" speed={2} noiseIntensity={1.75} scale={0.2} rotation={50} />
        <Contact showToast={showToast} handleSmoothScroll={handleSmoothScroll} />
     

 
        
      </main>
    </div>

  );
};

export default App;

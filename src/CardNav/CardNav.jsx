import { useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { motion } from 'framer-motion';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import {
  HiHome,
  HiUser,
  HiAcademicCap,
  HiCode,
  HiBriefcase,
  HiMail
} from 'react-icons/hi';

gsap.registerPlugin(ScrollToPlugin);
gsap.registerPlugin(ScrollTrigger);

const CardNav = ({
  logo,
  logoAlt = 'Logo',
  items, activeItem, setActiveItem, className = '', menuColor,
  buttonBgColor,
  buttonTextColor
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navRef = useRef(null);
  const tlRef = useRef(null);

  const iconMap = {
    Home: <HiHome className="inline-block mr-3 h-5 w-5" />,
    About: <HiUser className="inline-block mr-3 h-5 w-5" />,
    Education: <HiAcademicCap className="inline-block mr-3 h-5 w-5" />,
    Skills: <HiCode className="inline-block mr-3 h-5 w-5" />,
    Projects: <HiBriefcase className="inline-block mr-3 h-5 w-5" />,
    Contact: <HiMail className="inline-block mr-3 h-5 w-5" />
  };

  const calculateHeight = () => {
    const navEl = navRef.current;
    if (!navEl) return 60;

    const contentEl = navEl.querySelector('.card-nav-content');
    if (contentEl) {
      const topBar = 70; // Corresponds to h-[70px]
      const contentHeight = contentEl.scrollHeight;
      const padding = 16;

      return topBar + contentHeight + padding;
    }
    return 60;
  };

  const createTimeline = () => {
    const navEl = navRef.current;
    if (!navEl) return null;

    const tl = gsap.timeline({ paused: true });

    tl.to(navEl, {
      height: calculateHeight,
      duration: 0.4,
      ease: 'power3.out'
    });

    return tl;
  };

  useLayoutEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && isExpanded) {
        setIsExpanded(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isExpanded]);

  const toggleMenu = () => {
    setIsExpanded(prev => !prev);
  };

  useLayoutEffect(() => {
    if (!tlRef.current) {
      tlRef.current = createTimeline();
    }
    if (isExpanded) {
      tlRef.current.play();
    } else {
      tlRef.current.reverse(0); // Reverse from its end
    }
    return () => {
      // Don't kill on re-renders, only on unmount if needed.
    };
  }, [isExpanded]);

  const handleLinkClick = (e, item) => {
    e.preventDefault();
    setActiveItem(item.label);

    gsap.to(window, {
      duration: 1.2,
      scrollTo: {
        y: item.href,
        offsetY: 70, // Adjust this offset to account for your nav bar's height
      },
      ease: 'power2.inOut',
      onComplete: () => {
        if (isExpanded) toggleMenu();
      }
    });
  };

  const handleLogoClick = (e) => {
    e.preventDefault();
    // Set 'Home' as active and scroll to the top of the page.
    setActiveItem('Home');
    gsap.to(window, {
      duration: 1.5,
      scrollTo: 0,
      ease: 'power3.inOut'
    });

    // Close mobile menu if it's open
    if (isExpanded) {
      toggleMenu();
    }
  };

  const navContainerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const navItemVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <div
      className={`card-nav-container w-full z-[99] ${className}`.trim()}
      data-aos="fade-down"
    >
      <nav
        ref={navRef}
        className={`card-nav ${isExpanded ? 'open' : ''} block h-[70px] p-0 relative overflow-hidden will-change-[height] bg-black/30 backdrop-blur-lg shadow-lg shadow-black/20`}
      >
        <div className="card-nav-top absolute inset-x-0 top-0 h-[70px] flex items-center justify-between px-6 z-[2]">
          {/* Hamburger for Mobile */}
          <div className="logo-container flex items-center order-1 ">
            <a href="#" onClick={handleLogoClick}>
              <div className="logo cursor-pointer text-2xl font-bold tracking-wider uppercase transition-all duration-500 ease-in-out hover:scale-110 hover:rotate-360 text-blue-400 hover:drop-shadow-[0_0_6px_theme(colors.blue.400)]">
                {logo}
              </div>
            </a>
          </div>
          <div className={`hamburger-menu ${isExpanded ? 'open' : ''} group h-full flex flex-col items-center justify-center cursor-pointer gap-[6px] order-3 md:hidden`}
            onClick={toggleMenu}
            role="button"
            aria-label={isExpanded ? 'Close menu' : 'Open menu'}
            tabIndex={0}
            style={{ color: menuColor || '#000' }}
          >
            <div className={`hamburger-line w-[30px] h-[2px] bg-current transition-transform duration-300 ease-linear group-hover:opacity-75 ${isExpanded ? 'translate-y-[4px] rotate-45' : ''}`} />
            <div className={`hamburger-line w-[30px] h-[2px] bg-current transition-transform duration-300 ease-linear group-hover:opacity-75 ${isExpanded ? '-translate-y-[4px] -rotate-45' : ''}`} />
          </div>

          {/* Desktop Menu Items */}
          <motion.div
            className="hidden md:flex items-center gap-6 order-2"
            initial="hidden"
            animate="visible"
            variants={navContainerVariants}
          >
            {(items || []).map((item) => (
              <motion.a
                key={item.label}
                href={item.href}
                onClick={(e) => handleLinkClick(e, item)}
                className={`relative font-semibold cursor-pointer px-4 py-2 transition-colors duration-300 ${
                  activeItem === item.label ? 'text-white' : 'text-gray-300 hover:text-white'
                }`}
                variants={navItemVariants}
              >
                <span className="relative z-10">{item.label}</span>
                {activeItem === item.label && (
                  <motion.div
                    layoutId="active-nav-item"
                    className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-lg"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
              </motion.a>
            ))}
          </motion.div>

        </div>

        <div
          className={`card-nav-content absolute left-0 right-0 top-[70px] bottom-0 p-4 flex flex-col items-start gap-2 justify-start z-[1] md:hidden ${
            isExpanded ? 'visible pointer-events-auto' : 'invisible pointer-events-none'
          }`}
          aria-hidden={!isExpanded}
        >
          {(items || []).map((item) => (
            <motion.a
              key={item.label}
              href={item.href}
              onClick={(e) => handleLinkClick(e, item)}
              className={`font-semibold text-lg cursor-pointer p-3 transition-all duration-300 w-full text-left flex items-center rounded-md ${
                activeItem === item.label 
                  ? 'bg-blue-500 text-white font-bold border-l-4 border-white' 
                  : 'text-white hover:bg-white/10'
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: isExpanded ? 1 : 0, x: isExpanded ? 0 : -20 }}
              transition={{
                duration: 0.3,
                ease: 'easeOut',
              }}
            >
              {iconMap[item.label]}
              <span>{item.label}</span>
            </motion.a>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default CardNav;

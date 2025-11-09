import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { // It's a good practice to keep icon imports organized
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhone,
  FaGithub,
  FaLinkedin,
  FaTwitter,
  FaInstagram,
  FaWhatsapp,
  FaPaperPlane,
  FaSpinner,
  FaArrowUp
} from 'react-icons/fa';

// 1. Abstracting repetitive UI into smaller components
const ContactInfoItem = ({ icon, title, text, href }) => (
  <div className="flex items-start gap-4 mb-6">
    {icon}
    <div>
      <h5 className="text-lg font-semibold text-white font-heading">{title}</h5>
      <a href={href} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-cyan-400 transition-colors">
        {text}
      </a>
    </div>
  </div>
);

const SocialLink = ({ href, icon }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="text-gray-400 text-2xl hover:text-cyan-400 transition-all duration-300 hover:scale-110">
    {icon}
  </a>
);

// 2. Defining data separately for easier maintenance
const contactDetails = [
  {
    icon: <FaMapMarkerAlt className="text-cyan-400 text-2xl mt-1" />,
    title: 'Location',
    text: 'Bhadrak, Odisha, India',
    href: 'https://www.google.com/maps/place/Buddha+Vihar,+Bhadrak,+Odisha+756100',
  },
  {
    icon: <FaEnvelope className="text-cyan-400 text-2xl mt-1" />,
    title: 'Email',
    text: 'roy862452@gmail.com',
    href: 'mailto:roy862452@gmail.com',
  },
  {
    icon: <FaPhone className="text-cyan-400 text-2xl mt-1" />,
    title: 'Phone',
    text: '+91 8249873663',
    href: 'tel:+918249873663',
  },
];

const socialLinks = [
  { href: 'https://github.com/GaneshPanda34', icon: <FaGithub /> },
  { href: 'https://www.linkedin.com/in/ganesh-panda-0322a4255/', icon: <FaLinkedin /> },
  { href: 'https://twitter.com/@GaneshPanda34', icon: <FaTwitter /> },
  { href: 'https://www.instagram.com/ganesh_panda69', icon: <FaInstagram /> },
  { href: 'https://wa.me/8249873663', icon: <FaWhatsapp /> },
];

const initialFormData = {
  name: '',
  email: '',
  form_subject: '',
  message: '',
};

const Contact = ({ showToast, handleSmoothScroll }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setErrors({ ...errors, [e.target.name]: null });
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required.';
    if (!formData.email) {
      newErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid.';
    }
    if (!formData.form_subject) newErrors.form_subject = 'Subject is required.';
    if (!formData.message) newErrors.message = 'Message is required.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          access_key: 'de117e27-5032-423e-849e-d50b911a7af2', // Hardcoded access key
          subject: 'New Contact Form Submission from Portfolio',
          from_name: "Ganesh's Portfolio",
        })
      });

      const json = await response.json();

      if (json.success) {
        showToast('Message sent successfully!');
        // 4. Cleaner state reset
        setFormData(initialFormData);
        setErrors({});
      } else {
        showToast(json.message || 'Something went wrong!', 'error');
      }
    } catch (error) {
      showToast('An error occurred. Please try again later.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="bg-gradient-to-b from-gray-900/90 to-black/90 py-16 sm:py-20 overflow-x-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-center mb-12 sm:mb-16 text-3xl sm:text-4xl font-bold text-white font-heading" data-aos="fade-down">
          Contact <span className="text-cyan-400">Me</span>
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5 lg:col-start-2" data-aos="fade-right">
            <h4 className="text-2xl sm:text-3xl font-bold text-white mb-6 font-heading">Get in Touch</h4>
            {contactDetails.map((detail) => (
              <ContactInfoItem key={detail.title} {...detail} />
            ))}
            <div className="mt-8">
              <h5 className="text-xl font-semibold text-white mb-4 font-heading">Follow Me</h5>
              <div className="flex flex-wrap gap-4">
                {socialLinks.map((link) => (
                  <SocialLink key={link.href} {...link} />
                ))}
              </div>
            </div>
          </div>
          <div className="lg:col-span-5 mt-12 lg:mt-0" data-aos="fade-left" data-aos-delay="200">
            <form onSubmit={handleSubmit} noValidate>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-gray-300 mb-2 text-sm font-medium">Name</label>
                  <input id="name" placeholder="e.g. John Doe" required className={`w-full bg-gray-800/50 border rounded-md py-2 px-4 text-white focus:outline-none focus:ring-2 ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-cyan-500'}`} type="text" value={formData.name} onChange={handleChange} name="name" />
                  {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label htmlFor="email" className="block text-gray-300 mb-2 text-sm font-medium">Email</label>
                  <input id="email" placeholder="e.g. john.doe@example.com" required className={`w-full bg-gray-800/50 border rounded-md py-2 px-4 text-white focus:outline-none focus:ring-2 ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-cyan-500'}`} type="email" value={formData.email} onChange={handleChange} name="email" />
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="form_subject" className="block text-gray-300 mb-2 text-sm font-medium">Subject</label>
                  <input id="form_subject" placeholder="e.g. Project Inquiry" required className={`w-full bg-gray-800/50 border rounded-md py-2 px-4 text-white focus:outline-none focus:ring-2 ${errors.form_subject ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-cyan-500'}`} type="text" value={formData.form_subject} onChange={handleChange} name="form_subject" />
                  {errors.form_subject && <p className="text-red-400 text-xs mt-1">{errors.form_subject}</p>}
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="message" className="block text-gray-300 mb-2 text-sm font-medium">Message</label>
                  <textarea id="message" name="message" rows="5" placeholder="Hello, I'd like to discuss..." required className={`w-full bg-gray-800/50 border rounded-md py-2 px-4 text-white focus:outline-none focus:ring-2 ${errors.message ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-cyan-500'}`} value={formData.message} onChange={handleChange}></textarea>
                  {errors.message && <p className="text-red-400 text-xs mt-1">{errors.message}</p>}
                </div>
                <div className="md:col-span-2">
                  <button type="submit" disabled={loading} className="inline-flex items-center justify-center gap-3 px-6 py-3 text-lg font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-500 rounded-md hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 shadow-lg shadow-cyan-500/20 transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed">
                    {loading ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Message</span>
                        <FaPaperPlane />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
        {/* Footer Section */}
        <footer className="mt-20 pt-10 border-t border-gray-800">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
              <div className="text-left lg:col-span-2" data-aos="fade-up">
                <div className="text-3xl font-bold mb-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text inline-block drop-shadow-[0_1px_2px_rgba(0,255,255,0.3)]">
                  Ganesh Prasad Panda
                </div>
                <p className="text-gray-400 mb-6 max-w-sm">
                  I don't build websites – I craft magnetic digital experiences that pull users in and don't let go. Let's create something unforgettable⚡
                </p>
                <div className="flex flex-wrap justify-start gap-5">
                  <a href="https://github.com/GaneshPanda34" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-cyan-400 transition-colors duration-300 text-2xl"><FaGithub /></a>
                  <a href="https://www.linkedin.com/in/ganesh-panda-0322a4255/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-cyan-400 transition-colors duration-300 text-2xl"><FaLinkedin /></a>
                  <a href="https://twitter.com/@GaneshPanda34" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-cyan-400 transition-colors duration-300 text-2xl"><FaTwitter /></a>
                  <a href="https://www.instagram.com/ganesh_panda69" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-cyan-400 transition-colors duration-300 text-2xl"><FaInstagram /></a>
                </div>
              </div>
              <div className="text-left" data-aos="fade-up" data-aos-delay="100">
                <h5 className="text-lg font-semibold mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text inline-block drop-shadow-[0_1px_2px_rgba(0,255,255,0.3)]">Quick Links</h5>
                <ul>
                  <li className="mb-2"><a href="#home" onClick={handleSmoothScroll} className="text-gray-400 hover:text-cyan-400 transition-colors no-underline">Home</a></li>
                  <li className="mb-2"><a href="#about" onClick={handleSmoothScroll} className="text-gray-400 hover:text-cyan-400 transition-colors no-underline">About</a></li>
                  <li className="mb-2"><a href="#education" onClick={handleSmoothScroll} className="text-gray-400 hover:text-cyan-400 transition-colors no-underline">Education</a></li>
                  <li className="mb-2"><a href="#skills" onClick={handleSmoothScroll} className="text-gray-400 hover:text-cyan-400 transition-colors no-underline">Skills</a></li>
                  <li className="mb-2"><a href="#projects" onClick={handleSmoothScroll} className="text-gray-400 hover:text-cyan-400 transition-colors no-underline">Projects</a></li>
                  <li className="mb-2"><a href="#contact" onClick={handleSmoothScroll} className="text-gray-400 hover:text-cyan-400 transition-colors no-underline">Contact</a></li>
                </ul>
              </div>
              <div className="text-left" data-aos="fade-up" data-aos-delay="200">
                <h5 className="text-lg font-semibold mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text inline-block drop-shadow-[0_1px_2px_rgba(0,255,255,0.3)]">Services</h5>
                <ul className="space-y-2">
                  <li className="text-gray-400">Web Development</li>
                  <li className="text-gray-400">UI/UX Design</li>
                  <li className="text-gray-400">Responsive Design with Mobile-first approach</li>
                  <li className="text-gray-400">Vibe Coding</li>
                </ul>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center text-gray-500 pb-8">
              <p className="mb-4 md:mb-0 text-center md:text-left">
                © 2025 <span className="text-cyan-400">Ganesh</span>. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
      {/* Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, y: 50 }}
            animate={{
              opacity: 1,
              y: [0, -10, 0], // Subtle bounce animation
            }}
            exit={{ opacity: 0, y: 50 }}
            transition={{
              opacity: { duration: 0.3 },
              y: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
            }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-8 right-8 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full p-3 shadow-lg shadow-cyan-500/30 hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-gray-900 z-50"
            aria-label="Back to top"
          >
            <FaArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Contact;
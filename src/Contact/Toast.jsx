import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { IoMdCheckmarkCircleOutline, IoMdCloseCircleOutline } from 'react-icons/io';

const icons = {
  success: <IoMdCheckmarkCircleOutline className="mr-3 text-2xl" />,
  error: <IoMdCloseCircleOutline className="mr-3 text-2xl" />,
};

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Toast will be visible for 5 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`fixed bottom-5 right-5 z-50 ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white py-3 px-6 rounded-lg shadow-xl flex items-center`}
    >
      {icons[type]}
      <span className="font-semibold">{message}</span>
    </motion.div>
  );
};

export default Toast;
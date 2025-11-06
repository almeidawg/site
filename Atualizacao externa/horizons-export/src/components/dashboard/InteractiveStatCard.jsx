import React from 'react';
import { motion } from 'framer-motion';

const InteractiveStatCard = ({ title, value, icon: Icon, color, onClick, index }) => {
  
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: index * 0.1,
        duration: 0.5,
      },
    },
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.05, y: -5, zIndex: 10 }}
      onClick={onClick}
      className="relative glass-effect rounded-2xl p-6 cursor-pointer group overflow-hidden"
    >
      <div className="flex items-center justify-between">
        <div className="z-10">
          <p className="text-muted-foreground font-semibold mb-1">{title}</p>
          <h3 className="text-4xl font-bold text-gray-800">{value}</h3>
        </div>
        <div className="relative w-20 h-20">
           <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
              <Icon className="text-white" size={32} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default InteractiveStatCard;
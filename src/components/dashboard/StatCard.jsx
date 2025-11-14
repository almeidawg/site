
import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, count, icon: Icon, color, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className="bg-white rounded-2xl p-6 cursor-pointer group border border-gray-200/80 shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-500 font-medium mb-1 truncate">{title}</p>
          <h3 className="text-3xl font-bold text-gray-800 mb-2 break-all">{value}</h3>
          <p className="text-xs text-gray-400 truncate">{count}</p>
        </div>
        {Icon && (
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform flex-shrink-0 ml-4`}>
            <Icon size={24} />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StatCard;

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, trend, onClick, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -4 }}
      onClick={onClick}
      className="glass-effect rounded-2xl p-6 cursor-pointer group"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-2">{title}</p>
          <h3 className="text-3xl font-bold mb-2">{value}</h3>
          {trend && (
            <div className="flex items-center gap-1 text-emerald-600">
                <TrendingUp size={16} />
                <span className="text-sm font-medium">{trend}</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
          <Icon className="text-white" size={24} />
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;
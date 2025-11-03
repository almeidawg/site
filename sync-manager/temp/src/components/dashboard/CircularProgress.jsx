import React from 'react';
import { motion } from 'framer-motion';

const CircularProgress = ({ percentage, color, size = 96, strokeWidth = 8 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  // Ensure color has a default if not provided, or handle it where it's used
  const defaultColors = ['from-gray-500', 'to-gray-600'];
  const colors = color ? color.split(' ') : defaultColors;
  const fromColor = colors[0] || defaultColors[0];
  const toColor = colors[1] || defaultColors[1];

  // Extract color names for use in style
  const from = fromColor.replace('from-', '');
  const to = toColor.replace('to-', '');
  
  const gradientId = `progressGradient-${from}-${to}`;

  const svgVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } }
  }

  const pathVariants = {
    hidden: {
      strokeDashoffset: circumference
    },
    visible: {
      strokeDashoffset: offset,
      transition: {
        duration: 1.5,
        ease: "easeInOut"
      }
    }
  }

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      variants={svgVariants}
      initial="hidden"
      animate="visible"
      className="transform -rotate-90"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={`var(--tw-gradient-from-${from})`} />
          <stop offset="100%" stopColor={`var(--tw-gradient-to-${to})`} />
        </linearGradient>
      </defs>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={strokeWidth}
        className="stroke-gray-200"
        fill="transparent"
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={strokeWidth}
        stroke={`url(#${gradientId})`}
        fill="transparent"
        strokeLinecap="round"
        strokeDasharray={circumference}
        variants={pathVariants}
      />
    </motion.svg>
  );
};

export default CircularProgress;
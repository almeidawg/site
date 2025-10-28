import React from 'react';
import { motion } from 'framer-motion';
import { Construction } from 'lucide-react';

const PlaceholderPage = ({ title }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center h-[calc(100vh-12rem)] text-center glass-effect rounded-2xl p-8"
    >
      <div className="w-24 h-24 bg-gradient-to-br from-purple-200 to-fuchsia-200 rounded-full mx-auto flex items-center justify-center mb-6">
        <Construction className="text-purple-600" size={50} />
      </div>
      <h1 className="text-3xl font-bold mb-2">Módulo de {title}</h1>
      <p className="text-muted-foreground max-w-md">
        Esta área está em construção e será o seu novo centro de gerenciamento para {title.toLowerCase()}.
      </p>
      <p className="text-sm mt-4 text-purple-700 font-semibold">Fique de olho nas próximas atualizações! 🚀</p>
    </motion.div>
  );
};

export default PlaceholderPage;

import React from 'react';
import { motion } from 'framer-motion';
import { Project } from '../types';

interface BentoCardProps {
  project: Project;
  onClick: (project: Project) => void;
}

const BentoCard: React.FC<BentoCardProps> = ({ project, onClick }) => {
  const getAspectRatioClass = () => {
    switch (project.size) {
      case 'portrait': return 'aspect-[3/4]';
      case 'landscape': return 'aspect-[4/3]';
      case 'tall': return 'aspect-[9/16]';
      case 'wide': return 'aspect-[16/9]';
      case 'square': return 'aspect-square';
      default: return 'aspect-square';
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="break-inside-avoid mb-6 cursor-pointer"
      onClick={() => onClick(project)}
    >
      <div className={`group relative overflow-hidden rounded-[2rem] bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all duration-500 ${getAspectRatioClass()}`}>
        <motion.img
          loading="lazy"
          src={project.image}
          alt={project.title}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute inset-0 p-6 flex flex-col justify-end text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
          <div className="flex flex-wrap gap-2 mb-3">
            {project.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider">
                #{tag}
              </span>
            ))}
          </div>
          <h3 className="text-xl font-bold leading-tight mb-1">{project.title}</h3>
          <p className="text-sm text-zinc-300 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
            {project.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default BentoCard;
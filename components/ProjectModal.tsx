
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Project, ProjectMedia } from '../types';
import { X, Info } from 'lucide-react';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

// Sub-component for rendering different media types in the gallery
const ProjectMediaRenderer: React.FC<{ media: ProjectMedia }> = ({ media }) => {
  if (media.type === 'video') {
    return (
      <div className="relative group rounded-3xl overflow-hidden bg-black aspect-video shadow-lg">
        <video
          src={media.url}
          className="w-full h-full object-cover"
          controls
          autoPlay
          muted
          loop
        />
        {media.caption && (
          <div className="absolute bottom-0 inset-x-0 p-4 bg-black/60 backdrop-blur-md text-white text-xs font-bold">
            {media.caption}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative group rounded-3xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shadow-lg">
      <img
        src={media.url}
        alt={media.caption || 'Project media'}
        className="w-full h-auto object-cover"
      />
      {media.caption && (
        <div className="absolute bottom-0 inset-x-0 p-4 bg-white/60 dark:bg-black/60 backdrop-blur-md text-zinc-900 dark:text-white text-xs font-bold">
          {media.caption}
        </div>
      )}
    </div>
  );
};

// Main ProjectModal component exported as default
const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose }) => {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (project) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [project]);

  return (
    <AnimatePresence>
      {project && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-zinc-950/80 backdrop-blur-xl"
          />
          
          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="w-full max-w-5xl max-h-[90vh] bg-white dark:bg-zinc-950 rounded-[3rem] overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800 pointer-events-auto flex flex-col">
              
              {/* Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between p-8 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-100 dark:border-zinc-900">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
                    <Info className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">{project.title}</h2>
                    <div className="flex gap-2 mt-1">
                      {project.tags.map(tag => (
                        <span key={tag} className="text-[10px] font-black uppercase tracking-widest text-zinc-400">#{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-500 hover:text-zinc-950 dark:hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                  
                  {/* Left Column: Media and Full Text */}
                  <div className="lg:col-span-2 space-y-12">
                    {/* Hero Media */}
                    <div className="rounded-[2.5rem] overflow-hidden bg-zinc-100 dark:bg-zinc-900 shadow-xl border border-zinc-200 dark:border-zinc-800">
                      {project.videoUrl ? (
                        <video 
                          src={project.videoUrl} 
                          className="w-full h-full object-cover" 
                          controls 
                          autoPlay 
                          muted 
                          loop 
                        />
                      ) : (
                        <img 
                          src={project.image} 
                          alt={project.title} 
                          className="w-full h-full object-cover" 
                        />
                      )}
                    </div>

                    {/* Detailed Content */}
                    <div className="prose prose-zinc dark:prose-invert max-w-none">
                      <div className="text-zinc-600 dark:text-zinc-400 text-lg leading-relaxed whitespace-pre-line font-medium">
                        {project.fullContent || project.description}
                      </div>
                    </div>

                    {/* Secondary Gallery */}
                    {project.gallery && project.gallery.length > 0 && (
                      <div className="space-y-8">
                        <h4 className="text-sm font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-100 dark:border-zinc-900 pb-4">Project Gallery</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {project.gallery.map((media, idx) => (
                            <ProjectMediaRenderer key={idx} media={media} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Metadata */}
                  <div className="lg:col-span-1 space-y-8">
                    {/* Project Stats Card */}
                    {project.stats && (
                      <div className="p-8 rounded-[2rem] bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-6">
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Metadata</h4>
                        <div className="space-y-4">
                          {project.stats.map((stat, idx) => (
                            <div key={idx} className="flex flex-col gap-1">
                              <span className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-600 tracking-wider">{stat.label}</span>
                              <span className="text-sm font-bold text-zinc-900 dark:text-zinc-200">{stat.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Simple closing info */}
                    <div className="p-8 rounded-[2.5rem] bg-zinc-100/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 flex flex-col gap-2">
                       <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 leading-relaxed">
                         This project explores the boundaries of digital craft through meticulous attention to detail and user-centric design principles.
                       </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProjectModal;

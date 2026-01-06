
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Project, ProjectMedia } from '../types';
import { X, Info } from 'lucide-react';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
  allProjects?: Project[];
  onSelectProject?: (project: Project) => void;
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

// Lightbox Component
const Lightbox: React.FC<{ src: string | null; onClose: () => void }> = ({ src, onClose }) => (
  <AnimatePresence>
    {src && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 cursor-zoom-out"
      >
        <motion.img
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          src={src}
          alt="Full screen preview"
          className="max-w-full max-h-[95vh] w-auto h-auto object-contain rounded-lg shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
        >
          <X className="w-8 h-8" />
        </button>
      </motion.div>
    )}
  </AnimatePresence>
);

// Smart Bento Image Component
const BentoGridImage: React.FC<{ src: string; index: number; onClick: () => void }> = ({ src, index, onClick }) => {
  const [spanClass, setSpanClass] = React.useState('col-span-1 row-span-1 opacity-0');

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const ratio = img.naturalWidth / img.naturalHeight;

    // Determine span based on ratio
    // Landscape (Wide)
    if (ratio > 1.2) {
      setSpanClass('col-span-2 row-span-1 opacity-100');
    }
    // Portrait (Tall)
    else if (ratio < 0.8) {
      setSpanClass('col-span-1 row-span-2 opacity-100');
    }
    // Square-ish
    else {
      setSpanClass('col-span-1 row-span-1 opacity-100');
    }
  };

  return (
    <div
      className={`relative group rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 shadow-sm border border-zinc-200 dark:border-zinc-800 cursor-zoom-in transition-all duration-500 hover:shadow-lg ${spanClass}`}
      onClick={onClick}
    >
      <img
        src={src}
        alt={`Gallery ${index}`}
        onLoad={handleLoad}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
        <span className="bg-white/90 dark:bg-black/80 backdrop-blur text-xs font-bold px-3 py-1 rounded-full text-zinc-900 dark:text-white pointer-events-none">
          Expand
        </span>
      </div>
    </div>
  );
};

// Main ProjectModal component exported as default
const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose, allProjects = [], onSelectProject }) => {
  const [lightboxImage, setLightboxImage] = React.useState<string | null>(null);

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
    <>
      <Lightbox src={lightboxImage} onClose={() => setLightboxImage(null)} />
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
                      <div className="flex gap-2 mt-2">
                        {project.tags.map(tag => (
                          <span key={tag} className="px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[10px] font-black uppercase tracking-widest text-zinc-500">#{tag}</span>
                        ))}
                      </div>
                      {project.tools && project.tools.length > 0 && (
                        <div className="flex gap-2 mt-2">
                          {project.tools.map(tool => (
                            <span key={tool} className="px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">{tool}</span>
                          ))}
                        </div>
                      )}
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
                    <div className="lg:col-span-3 space-y-12">
                      {/* Hero Media */}


                      {/* Detailed Content */}
                      <div className="prose prose-zinc dark:prose-invert max-w-none">
                        <div className="text-zinc-600 dark:text-zinc-400 text-lg leading-relaxed whitespace-pre-line font-medium mb-12">
                          {project.fullContent || project.description}
                        </div>

                        {/* Content Images Bento Grid (Including Main Image) */}
                        <div className="space-y-6">
                          <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Gallery</h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px] grid-flow-dense">
                            {/* Include main image if no video, then content images */}
                            {(!project.videoUrl ? [project.image, ...(project.contentImages || [])] : (project.contentImages || [])).map((img, idx) => (
                              <BentoGridImage
                                key={idx}
                                src={img}
                                index={idx}
                                onClick={() => setLightboxImage(img)}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Secondary Gallery (Project Gallery from Data) */}
                      {project.gallery && project.gallery.length > 0 && (
                        <div className="space-y-8 pt-8 border-t border-zinc-100 dark:border-zinc-800">
                          <h4 className="text-sm font-black uppercase tracking-widest text-zinc-400">Additional Media</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {project.gallery.map((media, idx) => (
                              <ProjectMediaRenderer key={idx} media={media} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Related Projects */}
                    {allProjects.length > 0 && (
                      <div className="mt-12 pt-12 border-t border-zinc-100 dark:border-zinc-900 lg:col-span-3">
                        <h3 className="text-xl font-black text-zinc-900 dark:text-white mb-6">Related Projects</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {allProjects
                            .filter(p => p.id !== project.id && p.tags.some(t => project.tags.includes(t)))
                            .slice(0, 3)
                            .map(related => (
                              <div
                                key={related.id}
                                onClick={() => onSelectProject?.(related)}
                                className="group cursor-pointer"
                              >
                                <div className="aspect-video rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 mb-3">
                                  <img src={related.image} alt={related.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                </div>
                                <h4 className="font-bold text-zinc-900 dark:text-white group-hover:text-blue-500 transition-colors">{related.title}</h4>
                                <p className="text-xs text-zinc-500 line-clamp-1">{related.description}</p>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Right Column Removed as requested */}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProjectModal;

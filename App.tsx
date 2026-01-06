
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform, useVelocity } from 'framer-motion';
import { Moon, Sun, Search, Command, Github, Linkedin, ExternalLink, Mail, MapPin, Briefcase, User, Send, ChevronRight, ShieldCheck, QrCode, Instagram, Camera, Palette, Menu, X } from 'lucide-react';
import { Project, Theme } from './types';
import { PROJECTS } from './data/projects';
import BentoCard from './components/BentoCard';
import TagFilter from './components/TagFilter';
import ProjectModal from './components/ProjectModal';
import EventBadge from './components/EventBadge';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import AdminPanel from './components/AdminPanel';
import { supabase } from './utils/supabase';

// Fix for default marker icon in React Leaflet
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

type View = 'work' | 'about' | 'contact' | 'admin';

// Custom Behance Icon since it's not in basic Lucide sets
const BehanceIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9 12a2 2 0 0 0-2-2H4v4h3a2 2 0 0 0 2-2z" />
    <path d="M9 18a2 2 0 0 0-2-2H4v4h3a2 2 0 0 0 2-2z" />
    <path d="M4 6h5" />
    <path d="M14 13h7" />
    <path d="M14 17a3 3 0 0 0 6 0v-2h-6v2z" />
    <path d="M14 11h6" />
  </svg>
);

const Navbar = ({ theme, toggleTheme, currentView, setView }: {
  theme: Theme,
  toggleTheme: () => void,
  currentView: View,
  setView: (v: View) => void
}) => {
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks: { name: string, id: View }[] = [
    { name: 'Work', id: 'work' },
    { name: 'About', id: 'about' },
    { name: 'Contact', id: 'contact' }
  ];

  return (
    <>
      <motion.nav
        initial={false}
        animate={{
          paddingTop: scrolled ? '0.75rem' : '1.5rem',
          paddingBottom: scrolled ? '0.75rem' : '1.5rem',
          backgroundColor: scrolled ? (theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(9, 9, 11, 0.8)') : 'transparent',
        }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 border-b border-transparent ${scrolled ? 'backdrop-blur-2xl border-zinc-200/50 dark:border-zinc-800/50 shadow-sm' : ''
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between relative">
          <motion.div
            onClick={() => {
              setView('work');
              setIsMobileMenuOpen(false);
            }}
            className="flex items-center gap-3 group cursor-pointer"
            whileHover={{ scale: 1.02 }}
          >
            <div className="relative w-10 h-10 flex items-center justify-center">
              <motion.div
                animate={{ rotate: [0, 90, 180, 270, 360] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 rounded-xl opacity-20 blur-md group-hover:opacity-40 transition-opacity"
              />
              <div className="relative z-10 w-9 h-9 bg-zinc-950 dark:bg-white rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:rotate-12 group-hover:scale-110">
                <Command className="w-5 h-5 text-white dark:text-black" />
              </div>
            </div>
            <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-950 to-zinc-500 dark:from-white dark:to-zinc-400">
              fajarahnf
            </span>
          </motion.div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center bg-zinc-200/40 dark:bg-zinc-800/40 backdrop-blur-md px-1.5 py-1.5 rounded-2xl border border-white/20 dark:border-zinc-700/30 relative">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => setView(link.id)}
                onMouseEnter={() => setHoveredTab(link.id)}
                onMouseLeave={() => setHoveredTab(null)}
                className={`relative px-6 py-2 text-sm font-bold transition-colors z-10 ${currentView === link.id ? 'text-zinc-950 dark:text-white' : 'text-zinc-500 dark:text-zinc-400'
                  }`}
              >
                {link.name}
                {(hoveredTab === link.id || currentView === link.id) && (
                  <motion.div
                    layoutId="liquid-pill"
                    className="absolute inset-0 bg-white dark:bg-zinc-700 rounded-xl shadow-sm z-[-1]"
                    initial={false}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 shadow-sm"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </motion.button>

            {/* Mobile Menu Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 shadow-sm"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl pt-32 px-6 md:hidden"
          >
            <div className="flex flex-col gap-6">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => {
                    setView(link.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`text-4xl font-black tracking-tight text-left ${currentView === link.id ? 'text-blue-600 dark:text-blue-500' : 'text-zinc-900 dark:text-white'
                    }`}
                >
                  {link.name}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};



const WorkView = ({ projects, isLoading, resetTags, setSelectedProject }: {
  projects: Project[],
  isLoading: boolean,
  resetTags: () => void,
  setSelectedProject: (p: Project) => void
}) => (
  <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full">
    {isLoading ? (
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="break-inside-avoid mb-6 rounded-3xl bg-zinc-200 dark:bg-zinc-800 animate-pulse aspect-square" />
        ))}
      </div>
    ) : (
      <AnimatePresence mode="popLayout">
        <motion.div layout className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6">
          {projects.map((project) => (
            <BentoCard key={project.id} project={project} onClick={setSelectedProject} />
          ))}
        </motion.div>
      </AnimatePresence>
    )}
    {projects.length === 0 && !isLoading && (
      <div className="py-20 text-center">
        <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-900 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Search className="w-10 h-10 text-zinc-300 dark:text-zinc-700" />
        </div>
        <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">No projects matched</h3>
        <button onClick={resetTags} className="mt-4 px-8 py-3 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-bold transition-all hover:scale-105">Clear filters</button>
      </div>
    )}
  </motion.section>
);

const AboutView = () => (
  <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div className="md:col-span-1 md:row-span-2 h-[650px] md:h-auto min-h-[600px]">
      <EventBadge />
    </div>
    <div className="md:col-span-2 p-10 rounded-[3rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-center relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full pointer-events-none group-hover:bg-blue-500/10 transition-all duration-700" />
      <h2 className="text-4xl font-black mb-6 text-zinc-900 dark:text-white leading-tight transition-colors">Crafting visual stories as a <span className="text-blue-500">Creative Designer</span>.</h2>
      <p className="text-xl text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-2xl transition-colors">
        With a multi-disciplinary background spanning 3D motion, character design, and interface engineering, I lead teams to create immersive digital experiences that push the boundaries of visual storytelling.
      </p>
    </div>
    <div className="md:col-span-1 p-8 rounded-[2rem] bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-colors hover:border-zinc-300 dark:hover:border-zinc-700">
      <h4 className="flex items-center gap-2 font-black mb-6 text-xs uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
        <Briefcase className="w-3 h-3" /> Expertise
      </h4>
      <div className="flex flex-wrap gap-2">
        {['Direction', 'Illustration', '3D Motion', 'Game UI', 'IoT Interface', 'Branding', 'Photography', 'React'].map(skill => (
          <span key={skill} className="px-4 py-2 bg-white dark:bg-zinc-800 rounded-xl text-sm font-semibold border border-zinc-200 dark:border-zinc-700 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md text-zinc-700 dark:text-zinc-300">
            {skill}
          </span>
        ))}
      </div>
    </div>
    <div className="md:col-span-1 p-0 rounded-[2rem] bg-zinc-100 dark:bg-zinc-900 overflow-hidden relative h-full min-h-[300px]">
      <MapContainer center={[-7.7956, 110.3695]} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false} dragging={false} scrollWheelZoom={false}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        <Marker position={[-7.7956, 110.3695]}>
          <Popup>Yogyakarta, Indonesia</Popup>
        </Marker>
      </MapContainer>
      <div className="absolute bottom-4 left-4 z-[400] bg-white/80 dark:bg-black/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 shadow-lg">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-500" />
          <span className="text-xs font-bold text-zinc-900 dark:text-white">Yogyakarta, ID</span>
        </div>
      </div>
    </div>
    <div className="md:col-span-3 p-12 rounded-[3rem] bg-zinc-950 dark:bg-white text-white dark:text-black flex flex-col md:flex-row justify-between items-center gap-10 shadow-2xl relative overflow-hidden group transition-colors">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
      <div className="text-center md:text-left relative z-10">
        <h3 className="text-4xl font-black mb-3 tracking-tight dark:text-zinc-900">Let's start a project</h3>
        <p className="text-zinc-400 dark:text-zinc-500 text-lg">Combining aesthetics with technology.</p>
      </div>
      <button className="relative z-10 px-10 py-5 bg-blue-600 text-white rounded-2xl font-black text-xl hover:scale-105 active:scale-95 transition-transform flex items-center gap-4 shadow-xl">
        Get in Touch <ChevronRight className="w-8 h-8" />
      </button>
    </div>
  </motion.section>
);

const ContactView = () => (
  <motion.section
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="w-full max-w-7xl mx-auto"
  >
    <div className="text-center mb-16">
      <h1 className="text-5xl md:text-8xl font-black mb-6 text-zinc-950 dark:text-white tracking-tighter transition-colors">
        Let's <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">Connect</span>.
      </h1>
      <p className="text-2xl text-zinc-500 dark:text-zinc-400 font-bold transition-colors">
        Open for direction, photography, and high-end design inquiries.
      </p>
    </div>

    {/* Dynamic Bento Grid Layout for Contact */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-fr">

      {/* Main Contact Form - Large Span */}
      <div className="md:col-span-2 md:row-span-2 p-10 rounded-[3rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between transition-colors">
        <div className="mb-8">
          <h4 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 mb-6">Send a Message</h4>
          <form className="space-y-6" onSubmit={e => e.preventDefault()}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input type="text" placeholder="Name" className="w-full px-6 py-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border-2 border-transparent focus:border-blue-500 outline-none transition-all text-zinc-900 dark:text-white font-bold" />
              <input type="email" placeholder="Email" className="w-full px-6 py-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border-2 border-transparent focus:border-blue-500 outline-none transition-all text-zinc-900 dark:text-white font-bold" />
            </div>
            <textarea rows={4} placeholder="Tell me about your vision..." className="w-full px-6 py-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border-2 border-transparent focus:border-blue-500 outline-none transition-all text-zinc-900 dark:text-white font-bold resize-none" />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-6 rounded-2xl bg-blue-600 text-white font-black text-xl flex items-center justify-center gap-3 shadow-xl"
            >
              <Send className="w-6 h-6" /> Send Message
            </motion.button>
          </form>
        </div>
      </div>

      {/* Direct Contact Card */}
      <div className="md:col-span-1 p-8 rounded-[2.5rem] bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between transition-colors hover:border-zinc-300 dark:hover:border-zinc-700">
        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">Email Me</h4>
        <div className="mt-8">
          <Mail className="w-8 h-8 text-blue-500 mb-4" />
          <a href="mailto:fajarahnf@gmail.com" className="text-xl font-black text-zinc-950 dark:text-white hover:text-blue-500 transition-colors break-words">
            fajarahnf@gmail.com
          </a>
        </div>
      </div>

      {/* Social Links Bento Card */}
      <div className="md:col-span-1 p-8 rounded-[2.5rem] bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between transition-colors hover:border-zinc-300 dark:hover:border-zinc-700">
        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">Socials</h4>
        <div className="grid grid-cols-2 gap-3 mt-8">
          <a href="https://www.behance.net/FajarAhnaf" target="_blank" rel="noopener noreferrer" className="p-4 rounded-2xl bg-white dark:bg-zinc-800 flex items-center justify-center border border-zinc-100 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-blue-500 transition-all hover:shadow-lg"><BehanceIcon className="w-6 h-6" /></a>
          <a href="https://www.instagram.com/fajarahnf/" target="_blank" rel="noopener noreferrer" className="p-4 rounded-2xl bg-white dark:bg-zinc-800 flex items-center justify-center border border-zinc-100 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-all hover:shadow-lg"><Instagram className="w-6 h-6" /></a>
          <a href="https://www.linkedin.com/in/fajarahnf" target="_blank" rel="noopener noreferrer" className="p-4 rounded-2xl bg-white dark:bg-zinc-800 flex items-center justify-center border border-zinc-100 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-blue-700 transition-all hover:shadow-lg"><Linkedin className="w-6 h-6" /></a>
          <a href="https://github.com/anothersunrisee" target="_blank" rel="noopener noreferrer" className="p-4 rounded-2xl bg-white dark:bg-zinc-800 flex items-center justify-center border border-zinc-100 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-all hover:shadow-lg"><Github className="w-6 h-6" /></a>
        </div>
      </div>

      {/* Visual / Photography Card */}
      <div className="md:col-span-1 md:row-span-1 rounded-[2.5rem] overflow-hidden relative group">
        <img src="https://picsum.photos/seed/studio/600/600" alt="Creative Studio" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute bottom-6 left-6 flex items-center gap-3 text-white">
          <Camera className="w-5 h-5 text-blue-400" />
          <span className="font-bold text-sm tracking-tight">Studio Life</span>
        </div>
      </div>

      {/* Location / Status Card */}
      <div className="md:col-span-1 p-0 rounded-[2.5rem] bg-zinc-100 dark:bg-zinc-900 overflow-hidden relative shadow-xl h-full min-h-[200px]">
        <MapContainer center={[-7.7956, 110.3695]} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false} dragging={false} scrollWheelZoom={false}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          <Marker position={[-7.7956, 110.3695]}>
            <Popup>Yogyakarta, Indonesia</Popup>
          </Marker>
        </MapContainer>
        <div className="absolute top-4 right-4 z-[400]">
          <div className="px-3 py-1 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm border border-white/20 text-zinc-900 dark:text-white">Available</div>
        </div>
        <div className="absolute bottom-4 left-4 z-[400] bg-white/80 dark:bg-black/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 shadow-lg">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-500" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-zinc-900 dark:text-white leading-none">Yogyakarta, ID</span>
              <span className="text-[8px] font-bold text-zinc-500 dark:text-zinc-400 leading-none">Remote-ready</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  </motion.section>
);

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>('light');
  const [view, setView] = useState<View>('work');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [shuffledProjects, setShuffledProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Dynamic SEO System
  useEffect(() => {
    const seoMap: Record<View, { title: string, description: string, keywords: string }> = {
      work: {
        title: 'fajarahnf portfolio | creative designer',
        description: 'Explore the creative portfolio of Fajar Ahnaf Mahardika, featuring projects in UI/UX, character design, motion graphics, and branding.',
        keywords: 'Portfolio, Design, UI Design, 3D Motion, Creative Direction, Behance, Dribbble'
      },
      about: {
        title: 'About | fajarahnf portfolio',
        description: 'Learn more about Fajar Ahnaf Mahardika, a multi-disciplinary creative designer based in Yogyakarta specializing in visual storytelling.',
        keywords: 'Biography, Creative Director, Design Philosophy, Berlin Designer, Professional Background'
      },
      contact: {
        title: 'Contact | fajarahnf portfolio',
        description: 'Get in touch for collaborations, direction, or high-end design inquiries. Fajar Ahnaf Mahardika is available for global projects.',
        keywords: 'Contact, Collaboration, Hire Designer, Freelance Design, Project Inquiry'
      },
      admin: {
        title: 'Admin Panel | fajarahnf',
        description: 'Restricted Access',
        keywords: 'admin, hidden'
      }
    };

    const currentSEO = seoMap[view];
    document.title = currentSEO.title;

    const descMeta = document.getElementById('meta-description');
    if (descMeta) descMeta.setAttribute('content', currentSEO.description);

    const keywordsMeta = document.getElementById('meta-keywords');
    if (keywordsMeta) keywordsMeta.setAttribute('content', currentSEO.keywords);
  }, [view]);

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#sysadminpanel') {
        setView('admin');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    if (window.location.hash === '#sysadminpanel') {
      setView('admin');
    }
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const initialTheme = savedTheme || systemTheme;

    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  useEffect(() => {
    // New Logic: Fetch from Supabase
    const fetchProjects = async () => {
      try {
        const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
        if (error) throw error;

        // If database is empty, fallback to empty array or we could keep local mock as fallback if desired
        // For now, let's trust the DB. But to ensure types align and shuffle:
        const dbProjects = ((data || []).map((p: any) => ({
          ...p,
          contentImages: p.content_images || (p.contentimage ? [p.contentimage] : [])
        }))) as Project[];
        const randomized = [...dbProjects].sort(() => Math.random() - 0.5);

        setShuffledProjects(randomized);
      } catch (err) {
        console.error('Error loading projects:', err);
        // Fallback to local data if DB fails completely?
        // setShuffledProjects([...PROJECTS].sort(() => Math.random() - 0.5));
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const filteredProjects = useMemo(() => {
    if (selectedTags.length === 0) return shuffledProjects;
    return shuffledProjects.filter((project) =>
      selectedTags.every((tag) => project.tags.includes(tag))
    );
  }, [shuffledProjects, selectedTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const resetTags = () => setSelectedTags([]);

  const handleNavChange = (v: View) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setView(v);
  };

  return (
    <div className="min-h-screen transition-colors duration-500 dark:bg-zinc-950 selection:bg-blue-500 selection:text-white">
      <Navbar theme={theme} toggleTheme={toggleTheme} currentView={view} setView={handleNavChange} />

      <main className="max-w-7xl mx-auto px-4 pt-32 pb-20 overflow-hidden">
        <AnimatePresence mode="wait">
          {view === 'work' && (
            <motion.div key="work-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <header className="py-20 text-center">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="inline-block px-4 py-2 mb-8 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm font-black uppercase tracking-widest border border-blue-500/20 shadow-sm">Available for global direction</motion.div>
                <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-5xl md:text-8xl font-black tracking-tighter text-zinc-950 dark:text-white mb-8 leading-[0.95] transition-colors">Visual Visionary & <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">Creative Designer</span></motion.h1>
              </header>
              <TagFilter selectedTags={selectedTags} toggleTag={toggleTag} resetTags={resetTags} />
              <WorkView projects={filteredProjects} isLoading={isLoading} resetTags={resetTags} setSelectedProject={setSelectedProject} />
            </motion.div>
          )}
          {view === 'about' && (
            <motion.div key="about-view" className="py-10">
              <AboutView />
            </motion.div>
          )}
          {view === 'contact' && (
            <motion.div key="contact-view" className="py-10">
              <ContactView />
            </motion.div>
          )}
          {view === 'admin' && (
            <motion.div key="admin-view" className="py-10">
              <AdminPanel />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        allProjects={shuffledProjects}
        onSelectProject={setSelectedProject}
      />

      <footer className="py-24 border-t border-zinc-100 dark:border-zinc-900 bg-white dark:bg-zinc-950 transition-colors">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16">
          <div className="col-span-1 lg:col-span-2">
            <div className="flex items-center gap-3 mb-8">
              <Command className="w-10 h-10 text-zinc-950 dark:text-white transition-colors" />
              <span className="font-black text-3xl text-zinc-950 dark:text-white tracking-tighter transition-colors">fajarahnf.</span>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-sm text-xl leading-relaxed font-bold transition-colors">Leading creative teams and crafting immersive visual stories through design, motion, and technology.</p>
          </div>
          <div>
            <h4 className="font-black text-zinc-950 dark:text-white mb-8 uppercase text-xs tracking-widest transition-colors">Navigation</h4>
            <div className="flex flex-col gap-5">
              <button onClick={() => handleNavChange('work')} className="text-left text-lg text-zinc-500 font-bold hover:text-zinc-950 dark:hover:text-white transition-colors">Work</button>
              <button onClick={() => handleNavChange('about')} className="text-left text-lg text-zinc-500 font-bold hover:text-zinc-950 dark:hover:text-white transition-colors">About</button>
              <button onClick={() => handleNavChange('contact')} className="text-left text-lg text-zinc-500 font-bold hover:text-zinc-950 dark:hover:text-white transition-colors">Contact</button>
            </div>
          </div>
          <div>
            <h4 className="font-black text-zinc-950 dark:text-white mb-8 uppercase text-xs tracking-widest transition-colors">Connect</h4>
            <div className="flex flex-col gap-5">
              <a href="https://www.behance.net/FajarAhnaf" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-zinc-500 font-bold hover:text-zinc-950 dark:hover:text-white transition-colors text-lg">Behance</a>
              <a href="https://github.com/anothersunrisee" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-zinc-500 font-bold hover:text-zinc-950 dark:hover:text-white transition-colors text-lg">GitHub</a>
              <a href="https://www.linkedin.com/in/fajarahnf" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-zinc-500 font-bold hover:text-zinc-950 dark:hover:text-white transition-colors text-lg">LinkedIn</a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-24 pt-10 border-t border-zinc-100 dark:border-zinc-900 flex flex-col md:flex-row justify-between items-center text-sm text-zinc-400 font-black uppercase tracking-widest gap-6 transition-colors">
          <span>© {new Date().getFullYear()} Fajar Ahnaf Mahardika.</span>
          <span className="flex items-center gap-3">Visualizing the future from <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" /> Yogyakarta</span>
        </div>
      </footer>
    </div>
  );
};

export default App;

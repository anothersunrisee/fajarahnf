
import { Project } from '../types';

export const ALL_TAGS = ['Illustration', '2D', 'Branding', 'UI/UX', 'Motion', '3D', 'Strategy'];

export const PROJECTS: Project[] = [
  {
    id: '1',
    title: 'Neon Tokyo Illustration Series',
    description: 'A series of vibrant cyberpunk illustrations exploring the intersection of traditional Japanese architecture and futuristic cityscapes.',
    tags: ['Illustration', '2D', 'Branding'],
    image: 'https://images.unsplash.com/photo-1542641728-6ca359b085f4?q=80&w=1965&auto=format&fit=crop',
    size: 'portrait',
    link: 'https://github.com',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-cyberpunk-city-street-with-neon-lights-at-night-41551-large.mp4',
    fullContent: `
      ## The Vision
      The Neon Tokyo series was born from a fascination with the "old meets new" dichotomy of Japan. Over six months, I documented architectural details in Kyoto and reimagined them with the high-tech, low-life aesthetic of classic cyberpunk literature.
      
      ## Creative Process
      Each piece started with a physical ink sketch before being digitized. The coloring process involved layering vibrant cyan and magenta highlights against deep charcoal shadows to simulate the glow of street-level advertisements.
      
      ## Outcome
      The series was featured in several international design magazines and led to a collaboration with a major streetwear brand for a limited capsule collection.
    `,
    stats: [
      { label: 'Year', value: '2024' },
      { label: 'Role', value: 'Lead Illustrator' },
      { label: 'Tools', value: 'Procreate, Photoshop' }
    ],
    gallery: [
      { type: 'image', url: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=1965&auto=format&fit=crop', caption: 'Initial sketch phase' },
      { type: 'image', url: 'https://images.unsplash.com/photo-1605142859862-978be7eba909?q=80&w=2070&auto=format&fit=crop', caption: 'Color theory explorations' },
      { type: 'image', url: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=2070&auto=format&fit=crop', caption: 'Final detailing' }
    ]
  },
  {
    id: '2',
    title: 'Abstract Motion Interface',
    description: 'Experimental UI components using generative motion and glassmorphism for a futuristic music streaming dashboard.',
    tags: ['UI/UX', 'Motion'],
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1964&auto=format&fit=crop',
    size: 'landscape',
    link: 'https://github.com',
    fullContent: `
      ## Reimagining Sound
      Traditional music interfaces are often rigid. This project aimed to make navigation as fluid as the music itself. We used Framer Motion and custom shaders to create a dashboard that responds to audio frequencies in real-time.
      
      ## The Challenge
      Balancing high-intensity animation with usability. We had to ensure that while the interface was "alive", the core functionality remained intuitive for first-time users.
    `,
    stats: [
      { label: 'Client', value: 'Pulse Audio' },
      { label: 'Tech', value: 'React, Three.js' },
      { label: 'Timeline', value: '3 Months' }
    ],
    gallery: [
      { type: 'video', url: 'https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-his-computer-34354-large.mp4', caption: 'Interface flow demonstration' },
      { type: 'image', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop', caption: 'Device mockups' }
    ]
  },
  {
    id: '3',
    title: 'Eco-Brand Identity',
    description: 'Comprehensive branding and packaging design for a sustainable skincare startup focusing on biodegradable materials.',
    tags: ['Branding', 'Strategy'],
    image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=2070&auto=format&fit=crop',
    size: 'square',
    link: 'https://github.com',
    fullContent: `
      ## Pure Origins
      Eco-Brand identity was built on the concept of "minimal footprint". We avoided using secondary packaging and focused on a single-material approach that could be easily composted.
      
      ## Visual Language
      Earth tones mixed with high-contrast typography create a sense of modern luxury that doesn't feel "preachy". It's sustainability for the mainstream.
    `,
    stats: [
      { label: 'Industry', value: 'Skincare' },
      { label: 'Scope', value: 'Full Identity' },
      { label: 'Status', value: 'Launched' }
    ]
  },
  {
    id: '4',
    title: 'Character Design: Mech-Soul',
    description: '3D character sculpts exploring a world where machines have developed biological traits over thousands of years.',
    tags: ['3D', 'Illustration'],
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop',
    size: 'portrait',
    link: 'https://github.com',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-robot-head-moving-slightly-30985-large.mp4',
    fullContent: `
      ## Post-Human Evolution
      The Mech-Soul project is a speculative design exercise. I wanted to see what happens when the distinction between hardware and DNA vanishes. 
      
      ## Artistic Approach
      Used ZBrush for organic-mechanical blending. The textures incorporate rusted metal with moss and vines, suggesting a world reclaimed by nature.
    `,
    stats: [
      { label: 'Engine', value: 'Unreal 5' },
      { label: 'Model', value: '250k Polys' },
      { label: 'Artist', value: 'Self-initiated' }
    ],
    gallery: [
      { type: 'image', url: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070&auto=format&fit=crop', caption: 'Texture detail' },
      { type: 'image', url: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1974&auto=format&fit=crop', caption: 'Character lineup' }
    ]
  },
  {
    id: '5',
    title: 'Financial App Redesign',
    description: 'Streamlining complex investment data into a clean, mobile-first experience for Gen-Z investors.',
    tags: ['UI/UX'],
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop',
    size: 'landscape',
    link: 'https://github.com'
  },
  {
    id: '6',
    title: 'Vogue Photography Exhibit',
    description: 'A digital gallery showcasing minimalist fashion photography centered on texture and form.',
    tags: ['Photography', 'UI/UX'],
    image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=2073&auto=format&fit=crop',
    size: 'square',
    link: 'https://github.com'
  }
];

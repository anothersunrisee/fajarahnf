import React from 'react';
import { motion } from 'framer-motion';

const stickers = [
    { src: '/assets/stickers/sticker-mug-1.png?v=2', rotate: 15, x: -350, y: 50, scale: 1 },
    { src: '/assets/stickers/sticker-mug-2.png?v=2', rotate: -10, x: 350, y: -50, scale: 0.9 },
    { src: '/assets/stickers/sticker-keychain-1.png?v=2', rotate: 25, x: -250, y: -80, scale: 0.8 },
    { src: '/assets/stickers/sticker-keychain-2.png?v=2', rotate: -5, x: 280, y: 80, scale: 0.85 },
    { src: '/assets/stickers/sticker-keychain-3.png?v=2', rotate: 45, x: 380, y: 120, scale: 0.7 },
    { src: '/assets/stickers/sticker-keychain-4.png?v=2', rotate: -30, x: -380, y: 150, scale: 0.75 },
    { src: '/assets/stickers/sticker-card-1.png?v=2', rotate: 5, x: 0, y: 160, scale: 0.9 },
];

interface HeroStickersProps {
    constraintsRef: React.RefObject<Element>;
    theme: string;
}

const HeroStickers: React.FC<HeroStickersProps> = ({ constraintsRef, theme }) => {
    const [isMobile, setIsMobile] = React.useState(false);

    React.useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {stickers.map((sticker, i) => {
                // Adjust position spread for mobile to keep them closer to center
                const mobileScale = sticker.scale * 0.6;
                const mobileX = sticker.x * 0.4;
                const mobileY = sticker.y * 0.6;

                return (
                    <motion.div
                        key={sticker.src}
                        className="absolute cursor-grab active:cursor-grabbing pointer-events-auto filter drop-shadow-xl"
                        drag
                        dragConstraints={constraintsRef}
                        dragElastic={0.2}
                        dragMomentum={true}
                        initial={{
                            opacity: 0,
                            scale: 0,
                            x: 0,
                            y: 0
                        }}
                        animate={{
                            opacity: 1,
                            scale: isMobile ? mobileScale : sticker.scale,
                            x: isMobile ? mobileX : sticker.x,
                            y: isMobile ? mobileY : sticker.y,
                            rotate: sticker.rotate,
                            zIndex: 40
                        }}
                        transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 20,
                            delay: 0.2 + (i * 0.1)
                        }}
                        whileHover={{ scale: (isMobile ? mobileScale : sticker.scale) * 1.1, zIndex: 50, rotate: 0 }}
                        whileDrag={{ scale: (isMobile ? mobileScale : sticker.scale) * 1.2, zIndex: 60, cursor: 'grabbing' }}
                    >
                        <img
                            src={sticker.src}
                            alt="Decorative sticker"
                            className="w-24 h-24 md:w-40 md:h-40 object-contain pointer-events-none select-none"
                            draggable={false}
                        />
                    </motion.div>
                );
            })}
        </div>
    );
};

export default React.memo(HeroStickers);

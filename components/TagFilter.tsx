
import React from 'react';
import { motion } from 'framer-motion';
import { ALL_TAGS } from '../data/projects';

interface TagFilterProps {
  selectedTags: string[];
  toggleTag: (tag: string) => void;
  resetTags: () => void;
}

const TagFilter: React.FC<TagFilterProps> = ({ selectedTags, toggleTag, resetTags }) => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 py-8 px-4">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={resetTags}
        className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm ${
          selectedTags.length === 0
            ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950'
            : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
        }`}
      >
        All Projects
      </motion.button>
      
      {ALL_TAGS.map((tag) => {
        const isSelected = selectedTags.includes(tag);
        return (
          <motion.button
            key={tag}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => toggleTag(tag)}
            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm ${
              isSelected
                ? 'bg-blue-600 text-white dark:bg-blue-500'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
            }`}
          >
            #{tag}
          </motion.button>
        );
      })}
    </div>
  );
};

export default TagFilter;
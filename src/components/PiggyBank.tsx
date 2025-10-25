'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface Word {
  id: number;
  turkish: string;
  english: string;
  level: string;
}

interface PiggyBankProps {
  correctWords: Word[];
  incorrectWords: Word[];
}

export default function PiggyBank({ correctWords, incorrectWords }: PiggyBankProps) {
  return (
    <div className="w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700 p-2 sm:p-3">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
        {/* Doğru Kartlar Kumbarası */}
        <div className="w-full">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-xs sm:text-sm">
              ✓
            </div>
            <h3 className="text-xs sm:text-sm font-semibold text-green-600 dark:text-green-400">
              Doğru ({correctWords.length})
            </h3>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg sm:rounded-xl p-1.5 sm:p-2 h-16 sm:h-20 overflow-y-auto border border-green-200 dark:border-green-800">
            <AnimatePresence>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {correctWords.map((word, index) => (
                  <motion.div
                    key={`${word.id}-${index}`}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="px-2 sm:px-3 py-0.5 sm:py-1 bg-green-500 text-white text-[10px] sm:text-xs rounded-full font-medium"
                  >
                    {word.turkish}
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          </div>
        </div>

        {/* Yanlış Kartlar Kumbarası */}
        <div className="w-full">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-xs sm:text-sm">
              ✗
            </div>
            <h3 className="text-xs sm:text-sm font-semibold text-red-600 dark:text-red-400">
              Yanlış ({incorrectWords.length})
            </h3>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg sm:rounded-xl p-1.5 sm:p-2 h-16 sm:h-20 overflow-y-auto border border-red-200 dark:border-red-800">
            <AnimatePresence>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {incorrectWords.map((word, index) => (
                  <motion.div
                    key={`${word.id}-${index}`}
                    initial={{ scale: 0, rotate: 180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="px-2 sm:px-3 py-0.5 sm:py-1 bg-red-500 text-white text-[10px] sm:text-xs rounded-full font-medium"
                  >
                    {word.turkish}
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}


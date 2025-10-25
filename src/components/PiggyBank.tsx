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
    <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700 p-4">
      <div className="max-w-7xl mx-auto flex gap-4 justify-center">
        {/* Doğru Kartlar Kumbarası */}
        <div className="flex-1 max-w-md">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
              ✓
            </div>
            <h3 className="font-semibold text-green-600 dark:text-green-400">
              Doğru Kartlar ({correctWords.length})
            </h3>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 h-24 overflow-y-auto border-2 border-green-200 dark:border-green-800">
            <AnimatePresence>
              <div className="flex flex-wrap gap-2">
                {correctWords.map((word, index) => (
                  <motion.div
                    key={`${word.id}-${index}`}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="px-3 py-1 bg-green-500 text-white text-xs rounded-full font-medium"
                  >
                    {word.turkish}
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          </div>
        </div>

        {/* Yanlış Kartlar Kumbarası */}
        <div className="flex-1 max-w-md">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white font-bold">
              ✗
            </div>
            <h3 className="font-semibold text-red-600 dark:text-red-400">
              Yanlış Kartlar ({incorrectWords.length})
            </h3>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3 h-24 overflow-y-auto border-2 border-red-200 dark:border-red-800">
            <AnimatePresence>
              <div className="flex flex-wrap gap-2">
                {incorrectWords.map((word, index) => (
                  <motion.div
                    key={`${word.id}-${index}`}
                    initial={{ scale: 0, rotate: 180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="px-3 py-1 bg-red-500 text-white text-xs rounded-full font-medium"
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


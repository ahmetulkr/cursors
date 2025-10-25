'use client';

import { motion } from 'framer-motion';

interface ProgressBarProps {
  current: number;
  total: number;
  correct: number;
  incorrect: number;
  score?: number;
}

export default function ProgressBar({ current, total, correct, incorrect, score = 0 }: ProgressBarProps) {
  const percentage = (current / total) * 100;

  return (
    <div className="w-full space-y-2 sm:space-y-3">
      {/* Progress Bar */}
      <div className="relative h-1.5 sm:h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-purple-500"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* İstatistikler */}
      <div className="flex flex-wrap justify-between items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
        <div className="flex flex-wrap gap-1.5 sm:gap-3">
          <div className="flex items-center gap-1 sm:gap-1.5">
            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-green-500" />
            <span className="text-gray-700 dark:text-gray-300">
              Doğru: <span className="font-bold">{correct}</span>
            </span>
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5">
            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-red-500" />
            <span className="text-gray-700 dark:text-gray-300">
              Yanlış: <span className="font-bold">{incorrect}</span>
            </span>
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5">
            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-yellow-500" />
            <span className="text-gray-700 dark:text-gray-300">
              Puan: <span className="font-bold">{score}</span>
            </span>
          </div>
        </div>
        <span className="text-gray-600 dark:text-gray-400 font-medium whitespace-nowrap">
          {current} / {total}
        </span>
      </div>
    </div>
  );
}


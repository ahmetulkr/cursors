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
    <div className="w-full max-w-2xl space-y-4">
      {/* Progress Bar */}
      <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-purple-500"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* İstatistikler */}
      <div className="flex justify-between items-center text-sm">
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-gray-700 dark:text-gray-300">
              Doğru: <span className="font-bold">{correct}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-gray-700 dark:text-gray-300">
              Yanlış: <span className="font-bold">{incorrect}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-gray-700 dark:text-gray-300">
              Puan: <span className="font-bold">{score}</span>
            </span>
          </div>
        </div>
        <span className="text-gray-600 dark:text-gray-400 font-medium">
          {current} / {total}
        </span>
      </div>
    </div>
  );
}


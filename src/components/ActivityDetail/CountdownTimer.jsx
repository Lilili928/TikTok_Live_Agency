import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function pad(n) {
  return String(n).padStart(2, '0');
}

const AnimatedValue = ({ value }) => (
  <span className="relative overflow-hidden inline-flex items-center justify-center bg-[#F0F3F6] text-gray-800 font-bold rounded-md px-2.5 py-1 min-w-[32px] h-7 text-sm leading-none">
    <AnimatePresence mode="popLayout">
      <motion.span
        key={value}
        initial={{ y: -14, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 14, opacity: 0 }}
        transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
        className="absolute inline-flex items-center justify-center"
      >
        {value}
      </motion.span>
    </AnimatePresence>
  </span>
);

export default function CountdownTimer({ endDate }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calc = () => {
      const diff = new Date(endDate).getTime() - Date.now();
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      };
    };
    setTimeLeft(calc());
    const timer = setInterval(() => setTimeLeft(calc()), 1000);
    return () => clearInterval(timer);
  }, [endDate]);

  const { days, hours, minutes, seconds } = timeLeft;

  return (
    <div className="flex items-center gap-x-1.5 text-sm font-medium text-slate-500">
      <span className="text-slate-400">Ends in</span>

      <span className="inline-flex items-center justify-center bg-[#F0F3F6] text-gray-800 font-bold rounded-md px-2 py-1 min-w-[24px] h-7 text-sm leading-none">
        {days}
      </span>

      <span className="text-slate-400">days</span>

      <AnimatedValue value={pad(hours)} />

      <span className="text-slate-300 font-normal">:</span>

      <AnimatedValue value={pad(minutes)} />

      <span className="text-slate-300 font-normal">:</span>

      <AnimatedValue value={pad(seconds)} />
    </div>
  );
}

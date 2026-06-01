'use client';

import { motion, useReducedMotion } from 'framer-motion';
import HeroHeader from '@/components/HeroHeader';
import {
  HeroBadge,
  HeroButtons,
  HeroStatsPanel,
  HeroTitleBlock,
  type HeroHeaderContent,
} from '@/components/HeroHeaderContent';

const stagger = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  }),
};

export default function HeroHeaderClient(props: HeroHeaderContent) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <HeroHeader {...props} />;
  }

  return (
    <header className="relative grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)] lg:items-end">
      <div className="space-y-7 text-center lg:text-left">
        <motion.div custom={0} variants={stagger} initial="hidden" animate="visible">
          <HeroBadge />
        </motion.div>

        <motion.div
          custom={1}
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-4xl lg:mx-0"
        >
          <HeroTitleBlock />
        </motion.div>

        <motion.div
          custom={2}
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start"
        >
          <HeroButtons />
        </motion.div>
      </div>

      <motion.aside
        custom={3}
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="glass-panel rounded-3xl border border-white/10 p-5 shadow-[0_0_40px_rgba(2,8,23,0.45)] md:p-6"
      >
        <HeroStatsPanel {...props} />
      </motion.aside>
    </header>
  );
}

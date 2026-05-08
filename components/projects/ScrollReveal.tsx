'use client';

import { motion, useReducedMotion } from 'framer-motion';
import React from 'react';

type ScrollRevealProps = {
  children: React.ReactNode;
};

export default function ScrollReveal({ children }: ScrollRevealProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <>
      {React.Children.map(children, (child, index) => (
        <motion.div
          initial={
            shouldReduceMotion ? undefined : { opacity: 0, y: 30 }
          }
          whileInView={
            shouldReduceMotion ? undefined : { opacity: 1, y: 0 }
          }
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: index * 0.05 }}
        >
          {child}
        </motion.div>
      ))}
    </>
  );
}
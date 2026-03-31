/**
 * Centralized animation constants for a unified premium feel on mobile.
 */

export const isMobile = () => typeof window !== 'undefined' && window.innerWidth < 1024;

export const MOB_DURATIONS = {
  fast: 0.15,      // Snappy taps, micro-interactions
  normal: 0.3,    // Standard transitions, fades
  slow: 0.5,      // Content reveals, slide-ins
  extraSlow: 0.8  // Complex staged animations
};

/**
 * Fizens-inspired "spring" easing for a high-end feel.
 * Used for scale, transform, and opacity.
 */
export const MOB_EASE = [0.16, 1, 0.3, 1] as const;

export const MOB_TRANSITION = {
  duration: MOB_DURATIONS.normal,
  ease: MOB_EASE,
};

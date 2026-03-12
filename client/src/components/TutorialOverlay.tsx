/**
 * Tutorial Overlay - The Guiding Hand of Sin
 *
 * Renders a dark overlay with a spotlight cutout around the target element,
 * plus a tooltip with step info, navigation, and sassy narrator quips.
 * Uses portal rendering to sit above everything.
 *
 * Mobile-responsive: tooltip shrinks to fit viewport, uses safe-area insets,
 * and centers on small screens to prevent overflow.
 */

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, GraduationCap, Sparkles } from "lucide-react";
import { useTutorial } from "@/contexts/TutorialContext";

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export default function TutorialOverlay() {
  const {
    isActive,
    currentStep,
    pageStepIndex,
    pageStepCount,
    globalStepIndex,
    totalSteps,
    nextStep,
    prevStep,
    skipTutorial,
  } = useTutorial();

  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const [isMobile, setIsMobile] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Detect mobile viewport
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Find and measure the target element
  const measureTarget = useCallback(() => {
    if (!currentStep || !currentStep.targetSelector) {
      setTargetRect(null);
      return;
    }

    const el = document.querySelector(currentStep.targetSelector);
    if (!el) {
      setTargetRect(null);
      return;
    }

    const rect = el.getBoundingClientRect();
    const padding = 8;
    setTargetRect({
      top: rect.top - padding,
      left: rect.left - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
    });
  }, [currentStep]);

  // Measure on step change and window resize
  useEffect(() => {
    if (!isActive) return;

    measureTarget();

    const handleResize = () => measureTarget();
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleResize, true);

    // Re-measure periodically in case elements move (animations, etc.)
    const interval = setInterval(measureTarget, 500);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleResize, true);
      clearInterval(interval);
    };
  }, [isActive, currentStep, measureTarget]);

  // Calculate tooltip position — mobile-aware
  useEffect(() => {
    if (!currentStep) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const margin = 12;

    // On mobile: always center the tooltip, constrained to viewport
    if (isMobile) {
      const mobileWidth = Math.min(vw - margin * 2, 340);
      setTooltipStyle({
        position: "fixed",
        bottom: `${margin}px`,
        left: `${(vw - mobileWidth) / 2}px`,
        width: `${mobileWidth}px`,
        maxHeight: `${vh * 0.55}px`,
        overflowY: "auto",
      });
      return;
    }

    // Desktop: position relative to target
    const tooltipWidth = 340;
    const tooltipHeight = 220;
    const gap = 16;

    if (!currentStep.targetSelector || !targetRect) {
      setTooltipStyle({
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: `${tooltipWidth}px`,
      });
      return;
    }

    let top = 0;
    let left = 0;
    const pos = currentStep.position;

    if (pos === "bottom") {
      top = targetRect.top + targetRect.height + gap;
      left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
    } else if (pos === "top") {
      top = targetRect.top - tooltipHeight - gap;
      left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
    } else if (pos === "right") {
      top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
      left = targetRect.left + targetRect.width + gap;
    } else if (pos === "left") {
      top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
      left = targetRect.left - tooltipWidth - gap;
    }

    // Clamp to viewport
    left = Math.max(margin, Math.min(left, vw - tooltipWidth - margin));
    top = Math.max(margin, Math.min(top, vh - tooltipHeight - margin));

    setTooltipStyle({
      position: "fixed",
      top: `${top}px`,
      left: `${left}px`,
      width: `${tooltipWidth}px`,
    });
  }, [currentStep, targetRect, isMobile]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") skipTutorial();
      if (e.key === "ArrowRight" || e.key === "Enter") nextStep();
      if (e.key === "ArrowLeft") prevStep();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive, nextStep, prevStep, skipTutorial]);

  if (!isActive || !currentStep) return null;

  const isFirstStep = pageStepIndex === 0 && globalStepIndex === 0;
  const isLastStep = globalStepIndex === totalSteps - 1;
  const isLastOnPage = pageStepIndex === pageStepCount - 1;

  return (
    <AnimatePresence>
      <motion.div
        ref={overlayRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-[9999]"
        style={{ pointerEvents: "auto" }}
      >
        {/* Dark overlay with spotlight cutout */}
        <svg
          className="absolute inset-0 w-full h-full"
          style={{ pointerEvents: "none" }}
        >
          <defs>
            <mask id="tutorial-mask">
              <rect width="100%" height="100%" fill="white" />
              {targetRect && (
                <rect
                  x={targetRect.left}
                  y={targetRect.top}
                  width={targetRect.width}
                  height={targetRect.height}
                  rx="12"
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.75)"
            mask="url(#tutorial-mask)"
          />
        </svg>

        {/* Spotlight border glow */}
        {targetRect && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute rounded-xl pointer-events-none"
            style={{
              top: targetRect.top,
              left: targetRect.left,
              width: targetRect.width,
              height: targetRect.height,
              boxShadow: "0 0 0 2px oklch(0.82 0.16 195 / 0.5), 0 0 20px oklch(0.82 0.16 195 / 0.2)",
            }}
          />
        )}

        {/* Click blocker (except on target area) */}
        <div
          className="absolute inset-0"
          onClick={(e) => {
            // Allow clicks on the target element
            if (targetRect) {
              const { clientX, clientY } = e;
              if (
                clientX >= targetRect.left &&
                clientX <= targetRect.left + targetRect.width &&
                clientY >= targetRect.top &&
                clientY <= targetRect.top + targetRect.height
              ) {
                return; // Let the click through
              }
            }
            e.stopPropagation();
          }}
        />

        {/* Tooltip — mobile-responsive */}
        <motion.div
          key={currentStep.id}
          initial={{ opacity: 0, y: isMobile ? 30 : 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: isMobile ? 30 : -10, scale: 0.95 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          style={tooltipStyle}
          className="z-[10000] pointer-events-auto"
        >
          <div className="bg-background/95 backdrop-blur-xl border border-candle/30 rounded-2xl p-4 sm:p-5 shadow-[0_0_30px_oklch(0.82_0.16_195/0.15)]">
            {/* Header */}
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-candle/10 border border-candle/20 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-candle" />
                </div>
                <div className="min-w-0">
                  <h3
                    className="text-xs sm:text-sm font-bold text-foreground tracking-wide truncate"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {currentStep.title}
                  </h3>
                  <p
                    className="text-[9px] text-muted-foreground/60 uppercase tracking-wider"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    Step {globalStepIndex + 1} of {totalSteps}
                  </p>
                </div>
              </div>
              <button
                onClick={skipTutorial}
                className="text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors p-1 shrink-0"
                title="Skip tutorial (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <p
              className="text-[11px] sm:text-[12px] text-foreground/80 leading-relaxed mb-2 sm:mb-3"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {currentStep.body}
            </p>

            {/* Narrator quip */}
            {currentStep.quip && (
              <div className="flex items-start gap-2 mb-3 sm:mb-4 bg-background/40 rounded-lg p-2 sm:p-2.5 border border-border/10">
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-greed-glow/70 mt-0.5 shrink-0" />
                <p
                  className="text-[10px] sm:text-[11px] text-greed-glow/70 italic leading-relaxed"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  "{currentStep.quip}"
                </p>
              </div>
            )}

            {/* Progress bar */}
            <div className="w-full h-1 bg-border/10 rounded-full mb-2 sm:mb-3 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: "oklch(0.82 0.16 195)" }}
                initial={{ width: 0 }}
                animate={{ width: `${((globalStepIndex + 1) / totalSteps) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={prevStep}
                disabled={isFirstStep}
                className="flex items-center gap-1 text-[10px] sm:text-[11px] text-muted-foreground/60 hover:text-foreground/80 disabled:opacity-30 disabled:cursor-not-allowed transition-colors px-2 py-1.5 rounded-lg hover:bg-border/10"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                <ChevronLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                BACK
              </button>

              <button
                onClick={skipTutorial}
                className="text-[9px] sm:text-[10px] text-muted-foreground/40 hover:text-muted-foreground/60 transition-colors px-2 py-1"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                SKIP ALL
              </button>

              <button
                onClick={nextStep}
                className="flex items-center gap-1 text-[10px] sm:text-[11px] text-candle font-semibold hover:text-candle/80 transition-colors px-2.5 sm:px-3 py-1.5 rounded-lg bg-candle/10 hover:bg-candle/15 border border-candle/20"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {isLastStep ? "FINISH" : isLastOnPage ? "GOT IT" : "NEXT"}
                {!isLastStep && <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
              </button>
            </div>

            {/* Keyboard hint — hide on mobile (no keyboard) */}
            {!isMobile && (
              <p
                className="text-[8px] text-muted-foreground/30 text-center mt-2 tracking-wider"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                ARROW KEYS OR ENTER TO NAVIGATE &middot; ESC TO SKIP
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

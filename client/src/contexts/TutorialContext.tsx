/**
 * Tutorial Context - The Puppet Master of Onboarding
 *
 * Manages tutorial state across pages: which step we're on,
 * whether the tutorial is active, and localStorage persistence.
 * Wraps the entire app so any page can participate.
 *
 * KEY FIX: Tutorial only auto-triggers ONCE. Once skipped or completed,
 * it never auto-triggers again. The "How to Play" button is the only
 * way to restart it after dismissal.
 */

import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import {
  type TutorialPage,
  type TutorialStep,
  getStepsForPage,
  getGlobalStepIndex,
  ALL_TUTORIAL_STEPS,
  TOTAL_STEPS,
} from "@/lib/tutorialSteps";

const STORAGE_KEY = "7sins_tutorial_completed";
const STORAGE_DISMISSED_KEY = "7sins_tutorial_dismissed";

interface TutorialContextValue {
  /** Whether the tutorial is currently running */
  isActive: boolean;
  /** Current step object (null if not active or between pages) */
  currentStep: TutorialStep | null;
  /** Current step index within the current page */
  pageStepIndex: number;
  /** Total steps for the current page */
  pageStepCount: number;
  /** Global step index across all pages */
  globalStepIndex: number;
  /** Total steps across all pages */
  totalSteps: number;
  /** Whether the tutorial has been completed or dismissed before */
  hasCompleted: boolean;
  /** Start the tutorial from the beginning (or a specific page) */
  startTutorial: (page?: TutorialPage) => void;
  /** Advance to the next step */
  nextStep: () => void;
  /** Go back to the previous step */
  prevStep: () => void;
  /** Skip/end the tutorial entirely */
  skipTutorial: () => void;
  /** Set the current page (called by page components) */
  setCurrentPage: (page: TutorialPage) => void;
  /** Check if a specific page's tutorial is complete */
  isPageComplete: (page: TutorialPage) => boolean;
}

const TutorialContext = createContext<TutorialContextValue | null>(null);

export function TutorialProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [currentPage, setCurrentPageState] = useState<TutorialPage>("home");
  const [pageStepIndex, setPageStepIndex] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(() => {
    try {
      return (
        localStorage.getItem(STORAGE_KEY) === "true" ||
        localStorage.getItem(STORAGE_DISMISSED_KEY) === "true"
      );
    } catch {
      return false;
    }
  });

  // Track whether this is a manual start (from "How to Play" button)
  // vs. an auto-trigger. Only used to prevent re-triggering.
  const manualStartRef = useRef(false);

  const pageSteps = getStepsForPage(currentPage);
  const currentStep = isActive ? pageSteps[pageStepIndex] ?? null : null;
  const globalStepIndex = currentStep ? getGlobalStepIndex(currentStep.id) : -1;

  const startTutorial = useCallback((page?: TutorialPage) => {
    manualStartRef.current = true;
    const startPage = page || "home";
    setCurrentPageState(startPage);
    setPageStepIndex(0);
    setIsActive(true);
  }, []);

  const nextStep = useCallback(() => {
    const steps = getStepsForPage(currentPage);
    if (pageStepIndex < steps.length - 1) {
      setPageStepIndex((prev) => prev + 1);
    } else {
      // End of this page's steps
      const pageOrder: TutorialPage[] = ["home", "lobby", "game"];
      const currentPageIdx = pageOrder.indexOf(currentPage);
      if (currentPageIdx < pageOrder.length - 1) {
        // More pages exist, but we stop here — user needs to navigate
        // Tutorial is done for this page, mark as completed
        setIsActive(false);
        setHasCompleted(true);
        try {
          localStorage.setItem(STORAGE_KEY, "true");
        } catch {}
      } else {
        // Last page — tutorial fully complete
        setIsActive(false);
        setHasCompleted(true);
        try {
          localStorage.setItem(STORAGE_KEY, "true");
        } catch {}
      }
    }
  }, [currentPage, pageStepIndex]);

  const prevStep = useCallback(() => {
    if (pageStepIndex > 0) {
      setPageStepIndex((prev) => prev - 1);
    }
  }, [pageStepIndex]);

  const skipTutorial = useCallback(() => {
    setIsActive(false);
    setHasCompleted(true);
    try {
      localStorage.setItem(STORAGE_KEY, "true");
      localStorage.setItem(STORAGE_DISMISSED_KEY, "true");
    } catch {}
  }, []);

  const setCurrentPage = useCallback((page: TutorialPage) => {
    setCurrentPageState(page);
    // Do NOT auto-resume tutorial on page change.
    // The tutorial only runs when explicitly started.
  }, []);

  const isPageComplete = useCallback((page: TutorialPage): boolean => {
    return hasCompleted;
  }, [hasCompleted]);

  return (
    <TutorialContext.Provider
      value={{
        isActive,
        currentStep,
        pageStepIndex,
        pageStepCount: pageSteps.length,
        globalStepIndex,
        totalSteps: TOTAL_STEPS,
        hasCompleted,
        startTutorial,
        nextStep,
        prevStep,
        skipTutorial,
        setCurrentPage,
        isPageComplete,
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
}

export function useTutorial() {
  const ctx = useContext(TutorialContext);
  if (!ctx) {
    throw new Error("useTutorial must be used within a TutorialProvider");
  }
  return ctx;
}

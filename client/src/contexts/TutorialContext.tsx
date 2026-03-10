/**
 * Tutorial Context - The Puppet Master of Onboarding
 *
 * Manages tutorial state across pages: which step we're on,
 * whether the tutorial is active, and localStorage persistence.
 * Wraps the entire app so any page can participate.
 */

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import {
  type TutorialPage,
  type TutorialStep,
  getStepsForPage,
  getGlobalStepIndex,
  ALL_TUTORIAL_STEPS,
  TOTAL_STEPS,
} from "@/lib/tutorialSteps";

const STORAGE_KEY = "7sins_tutorial_completed";
const TUTORIAL_ACTIVE_KEY = "7sins_tutorial_active";
const TUTORIAL_STEP_KEY = "7sins_tutorial_step";

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
  /** Whether the tutorial has been completed before */
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
  const [hasCompleted, setHasCompleted] = useState(false);

  // Load persisted state on mount
  useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEY) === "true";
    setHasCompleted(completed);

    // Restore active tutorial if it was interrupted
    const wasActive = localStorage.getItem(TUTORIAL_ACTIVE_KEY) === "true";
    const savedStep = localStorage.getItem(TUTORIAL_STEP_KEY);
    if (wasActive && savedStep) {
      const stepIndex = parseInt(savedStep, 10);
      if (!isNaN(stepIndex)) {
        setIsActive(true);
        // Find which page this step belongs to
        const step = ALL_TUTORIAL_STEPS[stepIndex];
        if (step) {
          setCurrentPageState(step.page);
          const pageSteps = getStepsForPage(step.page);
          const localIndex = pageSteps.findIndex((s) => s.id === step.id);
          setPageStepIndex(localIndex >= 0 ? localIndex : 0);
        }
      }
    }
  }, []);

  // Persist tutorial state
  useEffect(() => {
    if (isActive) {
      localStorage.setItem(TUTORIAL_ACTIVE_KEY, "true");
      const steps = getStepsForPage(currentPage);
      const step = steps[pageStepIndex];
      if (step) {
        const globalIdx = getGlobalStepIndex(step.id);
        localStorage.setItem(TUTORIAL_STEP_KEY, String(globalIdx));
      }
    } else {
      localStorage.removeItem(TUTORIAL_ACTIVE_KEY);
      localStorage.removeItem(TUTORIAL_STEP_KEY);
    }
  }, [isActive, currentPage, pageStepIndex]);

  const pageSteps = getStepsForPage(currentPage);
  const currentStep = isActive ? pageSteps[pageStepIndex] ?? null : null;
  const globalStepIndex = currentStep ? getGlobalStepIndex(currentStep.id) : -1;

  const startTutorial = useCallback((page?: TutorialPage) => {
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
      // End of page steps — mark page complete, check if there's a next page
      const pageOrder: TutorialPage[] = ["home", "lobby", "game"];
      const currentPageIdx = pageOrder.indexOf(currentPage);
      if (currentPageIdx < pageOrder.length - 1) {
        // There are more pages, but we wait for the user to navigate there
        // The tutorial pauses between pages
        setIsActive(false);
        // Save that we should resume on the next page
        const nextPage = pageOrder[currentPageIdx + 1];
        localStorage.setItem(TUTORIAL_ACTIVE_KEY, "true");
        const nextPageSteps = getStepsForPage(nextPage);
        if (nextPageSteps.length > 0) {
          const globalIdx = getGlobalStepIndex(nextPageSteps[0].id);
          localStorage.setItem(TUTORIAL_STEP_KEY, String(globalIdx));
        }
      } else {
        // Tutorial complete!
        setIsActive(false);
        setHasCompleted(true);
        localStorage.setItem(STORAGE_KEY, "true");
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
    localStorage.setItem(STORAGE_KEY, "true");
    localStorage.removeItem(TUTORIAL_ACTIVE_KEY);
    localStorage.removeItem(TUTORIAL_STEP_KEY);
  }, []);

  const setCurrentPage = useCallback((page: TutorialPage) => {
    setCurrentPageState(page);
    // Check if we should resume tutorial on this page
    const wasActive = localStorage.getItem(TUTORIAL_ACTIVE_KEY) === "true";
    const savedStep = localStorage.getItem(TUTORIAL_STEP_KEY);
    if (wasActive && savedStep) {
      const stepIndex = parseInt(savedStep, 10);
      const step = ALL_TUTORIAL_STEPS[stepIndex];
      if (step && step.page === page) {
        const pageSteps = getStepsForPage(page);
        const localIndex = pageSteps.findIndex((s) => s.id === step.id);
        setPageStepIndex(localIndex >= 0 ? localIndex : 0);
        setIsActive(true);
      }
    }
  }, []);

  const isPageComplete = useCallback((page: TutorialPage): boolean => {
    if (hasCompleted) return true;
    const pageOrder: TutorialPage[] = ["home", "lobby", "game"];
    const targetIdx = pageOrder.indexOf(page);
    const currentIdx = pageOrder.indexOf(currentPage);
    // A page is complete if we're past it
    return targetIdx < currentIdx;
  }, [hasCompleted, currentPage]);

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

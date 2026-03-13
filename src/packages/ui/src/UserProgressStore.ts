import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── UserProgressStore ────────────────────────────────────────────────────────
// Tracks tutorial completion and total maps created.
// Persisted to localStorage under key 'user-progress'.

interface UserProgressState {
  tutorialComplete: boolean;
  mapsCreated: number;
  setTutorialComplete: () => void;
  incrementMapsCreated: () => void;
}

export const useUserProgressStore = create<UserProgressState>()(
  persist(
    (set) => ({
      tutorialComplete: false,
      mapsCreated: 0,
      setTutorialComplete: () => set({ tutorialComplete: true }),
      incrementMapsCreated: () => set((s) => ({ mapsCreated: s.mapsCreated + 1 })),
    }),
    { name: 'user-progress' }
  )
);

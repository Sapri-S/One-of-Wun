/**
 * Synthetic demo profiles for the roadmap (FR-01). Not real people, not real data.
 * Steps are 0-based indexes into home.roadmap.milestones (8 steps).
 */
export type ProfileId = 'notReady' | 'ready';
export type StepState = 'done' | 'current' | 'next' | 'gated' | 'open';
export type Status = 'stop' | 'wait' | 'go';

export interface Profile {
  /** Steps finished. */
  done: number[];
  /** "You are here". */
  current: number;
  /** Steps paused by a readiness gate (Jidoka) until high-interest debt is gone. */
  gated: number[];
  /** Steps unlocked by passing the readiness gate. */
  open: number[];
  status: Status;
}

export const PROFILES: Record<ProfileId, Profile> = {
  // $2,400 card debt at 24.9% APR, $300 saved → working on the $1,000 cushion; investing is gated.
  notReady: { done: [0, 1], current: 2, gated: [6, 7], open: [], status: 'stop' },
  // No high-interest debt, bills covered, $1,000 saved → growing the cushion; investing is open.
  ready: { done: [0, 1, 2, 3, 4], current: 5, gated: [], open: [6, 7], status: 'go' },
};

export function stepState(p: Profile, i: number): StepState {
  if (p.done.includes(i)) return 'done';
  if (p.current === i) return 'current';
  if (p.gated.includes(i)) return 'gated';
  if (p.open.includes(i)) return 'open';
  return 'next';
}

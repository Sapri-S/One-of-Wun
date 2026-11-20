/**
 * F8 — Life Stages data. Copy lives in i18n (`path.*`); this file holds ids, numbers and links.
 * Tab ids are also the URL hashes (/your-path#gig), so no other element may use them as an id.
 */
import type { BadgeKind } from '../../components/SafetyBadge.astro';

/** SECURE 2.0 extra contribution room for ages 50+ in 2026 (SHARED §7 F8). */
export const CATCH_UP_2026 = { k401: 8000, ira: 1100 } as const;

export type StageId = 'catch-up' | 'gig' | 'first-gen' | 'banked';

export interface Stage {
  id: StageId;
  /** i18n key under path.* for this stage's copy. */
  key: 'catchUp' | 'gig' | 'firstGen' | 'banked';
  badge: BadgeKind;
  /** Glossary ids shown as "Words to know". */
  terms: string[];
  /** Internal "Try this tool" link (language-neutral path). */
  tool: string;
}

export const STAGES: Stage[] = [
  { id: 'catch-up', key: 'catchUp', badge: 'talk-to-pro', terms: ['secure-2', 'catch-up-contribution', 'social-security', '401k', 'ira'], tool: '/save#calculator' },
  { id: 'gig', key: 'gig', badge: 'education', terms: ['1099', 'emergency-fund', 'kaizen'], tool: '/save#calculator' },
  { id: 'first-gen', key: 'firstGen', badge: 'your-choice', terms: ['401k-match', 'apr', 'emergency-fund'], tool: '/next-step' },
  { id: 'banked', key: 'banked', badge: 'education', terms: ['fdic', 'credit-union', 'check-casher'], tool: '/help' },
];

export const LINKS = {
  vita: 'https://www.irs.gov/vita',
  gigTax: 'https://www.irs.gov/businesses/gig-economy-tax-center',
  bankFind: 'https://banks.data.fdic.gov/bankfind-suite/bankfind',
  ncua: 'https://mapping.ncua.gov/',
} as const;

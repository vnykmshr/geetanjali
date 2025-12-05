/**
 * Consulting Principles Taxonomy
 * Used across VerseDetail and related components
 *
 * These principles represent ethical leadership concepts from the Bhagavad Geeta
 * mapped to modern consulting and business contexts.
 */

export const PRINCIPLE_TAXONOMY = {
  duty_focus: {
    label: 'Duty-focused action',
    description: 'Act based on dharma and responsibility, not on desired outcomes.',
  },
  detachment: {
    label: 'Non-attachment to outcomes',
    description: 'Emphasize process over results. Perform actions without attachment.',
  },
  self_control: {
    label: 'Leader temperament',
    description: 'Cultivate self-discipline, mental clarity, and personal integrity.',
  },
  informed_choice: {
    label: 'Autonomous decision-making',
    description: 'Make decisions with full knowledge and freedom.',
  },
  role_fit: {
    label: 'Fit tasks to nature',
    description: 'Match responsibilities to natural capabilities and strengths.',
  },
  compassion: {
    label: 'Compassionate equilibrium',
    description: 'Minimize harm and balance stakeholder needs with empathy.',
  },
  self_responsibility: {
    label: 'Self-effort and example',
    description: 'Lead through personal action and take responsibility for growth.',
  },
  ethical_character: {
    label: 'Character traits',
    description: 'Filter actions through virtuous qualities like truthfulness and courage.',
  },
  consistent_duty: {
    label: 'Consistent performance',
    description: 'Perform duties regularly. Avoid impulsive or erratic behavior.',
  },
} as const;

export type PrincipleId = keyof typeof PRINCIPLE_TAXONOMY;

export function getPrincipleLabel(principleId: string): string {
  const principle = PRINCIPLE_TAXONOMY[principleId as PrincipleId];
  return principle?.label ?? principleId;
}

export function getPrincipleDescription(principleId: string): string {
  const principle = PRINCIPLE_TAXONOMY[principleId as PrincipleId];
  return principle?.description ?? '';
}

/**
 * Consulting Principles Taxonomy
 * Used across VerseDetail and related components
 *
 * These principles represent ethical leadership concepts from the Bhagavad Geeta
 * mapped to modern consulting and business contexts.
 */

export const PRINCIPLE_TAXONOMY = {
  duty_focus: {
    label: "Duty-focused action",
    shortLabel: "Duty",
    description:
      "Act based on dharma and responsibility, not on desired outcomes.",
  },
  detachment: {
    label: "Non-attachment to outcomes",
    shortLabel: "Detachment",
    description:
      "Emphasize process over results. Perform actions without attachment.",
  },
  self_control: {
    label: "Leader temperament",
    shortLabel: "Temperament",
    description:
      "Cultivate self-discipline, mental clarity, and personal integrity.",
  },
  informed_choice: {
    label: "Autonomous decision-making",
    shortLabel: "Autonomy",
    description: "Make decisions with full knowledge and freedom.",
  },
  role_fit: {
    label: "Fit tasks to nature",
    shortLabel: "Role Fit",
    description:
      "Match responsibilities to natural capabilities and strengths.",
  },
  compassion: {
    label: "Compassionate equilibrium",
    shortLabel: "Compassion",
    description: "Minimize harm and balance stakeholder needs with empathy.",
  },
  self_responsibility: {
    label: "Self-effort and example",
    shortLabel: "Self-effort",
    description:
      "Lead through personal action and take responsibility for growth.",
  },
  ethical_character: {
    label: "Character traits",
    shortLabel: "Character",
    description:
      "Filter actions through virtuous qualities like truthfulness and courage.",
  },
  consistent_duty: {
    label: "Consistent performance",
    shortLabel: "Consistency",
    description:
      "Perform duties regularly. Avoid impulsive or erratic behavior.",
  },
} as const;

export type PrincipleId = keyof typeof PRINCIPLE_TAXONOMY;

export function getPrincipleLabel(principleId: string): string {
  const principle = PRINCIPLE_TAXONOMY[principleId as PrincipleId];
  return principle?.label ?? principleId;
}

export function getPrincipleShortLabel(principleId: string): string {
  const principle = PRINCIPLE_TAXONOMY[principleId as PrincipleId];
  return principle?.shortLabel ?? principleId;
}

export function getPrincipleDescription(principleId: string): string {
  const principle = PRINCIPLE_TAXONOMY[principleId as PrincipleId];
  return principle?.description ?? "";
}

---
layout: default
title: Design
description: Frontend design language and UX patterns in Geetanjali.
---

# Design

Geetanjali's frontend uses a cohesive design system built for clarity and warmth.

## Philosophy

Three principles guide the design:

1. **Mobile-first** — Design for phones, scale up to desktop
2. **Content-forward** — Scripture is the hero, UI is the frame
3. **Warm accessibility** — Inviting colors, readable text, clear interactions

## Visual Identity

### Color System

```
SURFACES                           INTERACTIVE
├── Base:     white, gray-50       ├── Primary:  orange-600
├── Warm:     amber-50             ├── Hover:    orange-700
└── Elevated: amber-100            └── Active:   orange-800

TEXT                               BORDERS
├── Primary:   gray-900            ├── Default:  amber-200
├── Secondary: gray-600            ├── Subtle:   amber-100
├── Muted:     gray-400            └── Focus:    orange-500
└── Sanskrit:  amber-900
```

Amber creates warmth. Orange signals action. Gray provides contrast.

### Typography

| Usage | Font | Scale |
|-------|------|-------|
| Headings | Spectral (serif) | 2xl → 4xl |
| Body | Source Sans Pro | base → lg |
| Sanskrit | Noto Serif Devanagari | base → 3xl |

```
Mobile (base)           Desktop (lg+)
─────────────           ─────────────
H1: text-2xl     →      text-4xl
H2: text-xl      →      text-2xl
Body: text-base  →      text-lg
```

### Spacing

Responsive padding scales with viewport:

```
Cards:    p-3 sm:p-4 lg:p-6
Sections: py-6 sm:py-8 lg:py-12
Gaps:     gap-3 sm:gap-4 lg:gap-6
```

## Responsive Patterns

Two primary breakpoints:

| Breakpoint | Width | Use Case |
|------------|-------|----------|
| `sm:` | 640px | Most responsive changes |
| `lg:` | 1024px | Desktop enhancements |

`md:` (768px) is reserved for navigation toggle only.

### Grid Layouts

```
Mobile          Tablet           Desktop
1 column        2 columns        3-4 columns
─────────       ─────────        ─────────
  [card]          [card][card]     [card][card][card][card]
  [card]          [card][card]     [card][card][card][card]
```

Implementation: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`

### Navigation

Mobile shows hamburger menu with slide-out drawer. Desktop shows inline links.

```
Mobile                    Desktop
──────                    ───────
[Logo] [≡]                [Logo] [Read] [Verses] [Search] [Ask →]
```

## Component Patterns

### Buttons

| Type | Style |
|------|-------|
| Primary CTA | `bg-orange-600 text-white px-6 py-3 rounded-xl` |
| Secondary | `bg-amber-100 text-amber-800 px-4 py-2 rounded-lg` |
| Ghost | `text-orange-600 hover:text-orange-700` |

Hero CTAs scale: `px-6 py-3 sm:px-8 sm:py-3.5`

### Cards

```
┌─────────────────────────────────────────┐
│  bg-amber-50 rounded-xl border-amber-200 │
│  p-3 sm:p-4                             │
│  hover:shadow-md hover:-translate-y-0.5  │
│  transition-all duration-150             │
└─────────────────────────────────────────┘
```

### Form Inputs

```css
px-3 sm:px-4 py-2.5 sm:py-2
border border-amber-200 rounded-lg
focus:ring-2 focus:ring-orange-500
text-base sm:text-sm
```

Larger touch targets on mobile (py-2.5), compact on desktop (py-2).

### Loading States

Skeleton loaders match final layout structure:

```
┌──────────────────────┐   ┌──────────────────────┐
│  ████████░░░░░░░░░   │   │  ॥ 2.47 ॥            │
│  ██████████████░░░   │ → │  कर्मण्येवाधिकारस्ते      │
│  ████████░░░░░░░░░   │   │  "Focus on duty..."   │
└──────────────────────┘   └──────────────────────┘
     skeleton                   loaded
```

### Thinking Animation

Shimmer effect for AI processing:

```css
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
background: linear-gradient(
  90deg,
  amber-100 0%,
  amber-50 50%,
  amber-100 100%
);
background-size: 200% 100%;
animation: shimmer 1.5s infinite;
```

## Page Layouts

### Standard Page

```
┌──────────────────────────────────────────────────────┐
│  [Navbar]                                            │
├──────────────────────────────────────────────────────┤
│                                                      │
│    [Page Title]                                      │
│    [Subtitle]                                        │
│                                                      │
│    ┌────────────────────────────────────────────┐   │
│    │  [Main Content Area]                       │   │
│    │  max-w-6xl mx-auto px-4                    │   │
│    └────────────────────────────────────────────┘   │
│                                                      │
├──────────────────────────────────────────────────────┤
│  [Footer]                                            │
└──────────────────────────────────────────────────────┘
```

### Reading Mode

```
┌──────────────────────────────────────────────────────┐
│  [Minimal Header]                                    │
├──────────────────────────────────────────────────────┤
│                                                      │
│                        ॐ                             │
│           [Large Sanskrit Text]                      │
│                  ॥ 2.47 ॥                            │
│                                                      │
│         [Tap for translation]                        │
│                                                      │
│  ← swipe →                                           │
│                                                      │
├──────────────────────────────────────────────────────┤
│  [◀] [Chapter Selector] [Font Size] [▶]              │
└──────────────────────────────────────────────────────┘
```

Minimal chrome. Sanskrit is the hero. Progressive disclosure.

## Interaction Patterns

### Navigation

| Action | Mobile | Desktop |
|--------|--------|---------|
| Next verse | Swipe left | → or J |
| Previous | Swipe right | ← or K |
| Toggle translation | Tap verse | Tap verse |
| Quick search | — | ⌘K |

### Focus Management

- `focus-visible:ring-2 focus-visible:ring-orange-500`
- Focus visible only on keyboard navigation
- Logical tab order

### Transitions

```css
transition-all duration-150    /* Quick interactions */
transition-all duration-300    /* Panel reveals */
ease-in-out                    /* Natural motion */
```

## Accessibility

- **Contrast**: All text meets WCAG AA (4.5:1 minimum)
- **Touch targets**: 44x44px minimum on mobile
- **Focus indicators**: Visible on all interactive elements
- **Screen readers**: ARIA labels and semantic HTML
- **Reduced motion**: Respects `prefers-reduced-motion`

## Implementation Notes

### Font Loading

Google Fonts with `font-display: swap`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="...Spectral|Source+Sans+Pro|Noto+Serif+Devanagari" rel="stylesheet">
```

### Tailwind Config

```js
fontFamily: {
  heading: ['Spectral', 'serif'],
  body: ['Source Sans Pro', 'sans-serif'],
  sanskrit: ['Noto Serif Devanagari', 'serif'],
}
```

### CSS Variables

No CSS variables—all design tokens live in Tailwind classes for consistency and tree-shaking.

---
layout: default
title: Design
description: Frontend design language and UX patterns in Geetanjali.
---

# Design

The UI should feel like a quiet library, not a busy app. Warm colors, readable type, and enough space to breathe. The scripture is the star — the interface just helps you find and absorb it.

This doc covers the visual language and patterns we use across Geetanjali.

## Philosophy

Four principles guide the design:

1. **Mobile-first** — Design for phones, scale up to desktop
2. **Content-forward** — Scripture is the hero, UI is the frame
3. **Warm accessibility** — Inviting colors, readable text, clear interactions
4. **Theme parity** — Light and dark modes are equal citizens, not afterthoughts

## Visual Identity

### Color System

#### Light Mode (Default)

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

#### Dark Mode

```
SURFACES                           INTERACTIVE
├── Base:     gray-900             ├── Primary:  orange-600
├── Warm:     gray-800             ├── Hover:    orange-500
└── Reading:  stone-900, stone-800 └── Active:   orange-400

TEXT                               BORDERS
├── Primary:   gray-100            ├── Default:  gray-700
├── Secondary: gray-300            ├── Subtle:   gray-800
├── Tertiary:  gray-400            └── Focus:    orange-500
├── Muted:     gray-500
└── Sanskrit:  amber-400, amber-200

FOCUS STATES
├── Ring:        orange-500
└── Ring offset: gray-900
```

**Stone in dark mode**: Reading-focused components (ReadingMode, VerseFocus, IntroCard, ChapterSelector) use `stone-800/900` instead of `gray-800/900` for a warmer feel that aligns with the "quiet library" philosophy.

**Text hierarchy in dark mode**: Use `gray-100` for primary content, `gray-300` for secondary labels, `gray-400` for tertiary/helper text, and `gray-500` sparingly for truly de-emphasized content. Avoid using the same gray value for both light and dark modes — dark mode typically needs one step lighter for equivalent visual weight.

#### Semantic Colors

Reserved for specific content types:

| Color | Use Case | Components |
|-------|----------|------------|
| Purple/Pink | Reflections & contemplation | ReflectionsSection, case views |
| Green | Steps, success, positive actions | StepsSection, confirmations |
| Blue | Follow-ups, secondary paths | Follow-up questions, info states |
| Red | Favorites, destructive actions | Heart icons, delete buttons |

```
REFLECTIONS (purple-pink gradient)
Light                              Dark
├── Background: purple-50/pink-50  ├── Background: purple-900/20, pink-900/20
├── Border:     purple-100         ├── Border:     purple-800
├── Icon:       purple-600         ├── Icon:       purple-400
└── Text:       purple-700         └── Text:       purple-400

STEPS (green)
Light                              Dark
├── Background: green-100          ├── Background: green-900/40
├── Border:     green-300          ├── Border:     green-700
├── Icon:       green-600          ├── Icon:       green-400
└── Text:       green-700          └── Text:       green-400

FOLLOW-UPS (blue)
Light                              Dark
├── Background: blue-50            ├── Background: blue-900/30
├── Border:     blue-100           ├── Border:     blue-800
├── Icon:       blue-600           ├── Icon:       blue-400
└── Text:       blue-700           └── Text:       blue-400

FAVORITES & ERRORS (red)
Light                              Dark
├── Filled:     red-500            ├── Filled:     red-500
├── Unfilled:   gray-400           ├── Unfilled:   gray-500
├── Error bg:   red-50             ├── Error bg:   red-900/20
└── Error text: red-600            └── Error text: red-400
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

Two-tier color system aligned with "quiet library" design philosophy:

#### Primary CTAs (Orange-600)
Page-level actions that drive navigation or major decisions.

| Use Case | Example |
|----------|---------|
| Hero buttons | "Get Started", "Explore Verses" |
| Form submissions | Login, Signup, Submit Consultation |
| Navigation CTAs | "New Consultation", "Go Home" |
| Primary filters | Featured/All/Chapter filter pills |
| Search buttons | Main search submit |

```
Light:  bg-orange-600 hover:bg-orange-700 text-white
Dark:   dark:bg-orange-600 dark:hover:bg-orange-500 text-white
Focus:  focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 focus:ring-orange-500

px-6 py-3 rounded-xl (hero)
px-4 py-2 rounded-lg (inline)
```

#### Contextual Actions (Amber-600)
In-content interactions that feel softer, more contemplative.

| Use Case | Example |
|----------|---------|
| Reading mode controls | "Start Reading", "Start Intro" |
| Secondary filters | Topic/principle pills |
| Clear/reset actions | "Clear filters" within content |
| Toggle switches | Translation toggle |
| Non-destructive confirms | Modal confirms (non-delete) |

```
bg-amber-600 hover:bg-amber-700 text-white
px-4 py-2 rounded-lg
```

#### Secondary (Outline)
```
bg-amber-100 text-amber-800 border border-amber-200
hover:bg-amber-200
```

#### Ghost
```
text-orange-600 hover:text-orange-700
```

Hero CTAs scale: `px-6 py-3 sm:px-8 sm:py-3.5`

### Cards

```
┌───────────────────────────────────────────┐
│  Light: bg-amber-50 border-amber-200      │
│  Dark:  dark:bg-gray-800 dark:border-gray-700
│                                           │
│  p-3 sm:p-4 rounded-xl                    │
│  hover:shadow-md hover:-translate-y-0.5   │
│  transition-all duration-150              │
└───────────────────────────────────────────┘
```

For elevated/highlighted cards:
```
Light: bg-white shadow-lg border-amber-200
Dark:  dark:bg-gray-800 dark:border-gray-700
```

### Form Inputs

```css
/* Sizing */
px-3 sm:px-4 py-2.5 sm:py-2
text-base sm:text-sm
rounded-lg

/* Light mode */
bg-white border-amber-200
text-gray-900 placeholder-gray-500

/* Dark mode */
dark:bg-gray-800 dark:border-gray-600
dark:text-gray-100 dark:placeholder-gray-400

/* Focus (both modes) */
focus:ring-2 focus:ring-orange-500 focus:border-transparent
```

Larger touch targets on mobile (py-2.5), compact on desktop (py-2).

### Loading States

Skeleton loaders match final layout structure:

```
┌──────────────────────┐   ┌──────────────────────┐
│  ████████░░░░░░░░░   │   │  ॥ 2.47 ॥            │
│  ██████████████░░░   │ → │  कर्मण्येवाधिकारस्ते         │
│  ████████░░░░░░░░░   │   │  "Focus on duty..."  │
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
│    ┌────────────────────────────────────────────┐    │
│    │  [Main Content Area]                       │    │
│    │  max-w-6xl mx-auto px-4                    │    │
│    └────────────────────────────────────────────┘    │
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
│                        ॐ                            │
│           [Large Sanskrit Text]                      │
│                  ॥ 2.47 ॥                           │
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

## Dark Mode Guidelines

Dark mode is a first-class feature, not a retrofit. Every component should be designed with both themes in mind from the start.

### Principles

1. **Always pair light and dark** — Every color class needs its `dark:` counterpart
2. **Shift, don't invert** — Dark mode isn't just inverted colors; adjust for visual weight
3. **Maintain hierarchy** — Text levels (primary → muted) should feel equivalent in both modes
4. **Test both modes** — Verify readability and aesthetics in light and dark before shipping

### Common Patterns

| Element | Light | Dark |
|---------|-------|------|
| Page background | `from-orange-50 to-red-50` | `dark:from-gray-900 dark:to-gray-900` |
| Card background | `bg-white` | `dark:bg-gray-800` |
| Primary text | `text-gray-900` | `dark:text-gray-100` |
| Secondary text | `text-gray-600` | `dark:text-gray-400` |
| Muted text | `text-gray-500` | `dark:text-gray-400` (not gray-500) |
| Borders | `border-gray-200` | `dark:border-gray-700` |
| Warm borders | `border-amber-200` | `dark:border-gray-600` |
| Focus ring offset | `focus:ring-offset-2` | `dark:focus:ring-offset-gray-900` |

### Opacity for Semantic Backgrounds

Use opacity modifiers for colored backgrounds in dark mode to avoid harsh contrast:

```
Light: bg-purple-50        →  Dark: dark:bg-purple-900/20
Light: bg-green-100        →  Dark: dark:bg-green-900/40
Light: bg-blue-50          →  Dark: dark:bg-blue-900/30
Light: bg-red-50           →  Dark: dark:bg-red-900/20
```

### Checklist for New Components

Before considering a component complete:

- [ ] All backgrounds have `dark:` variants
- [ ] All text colors have `dark:` variants with appropriate contrast
- [ ] All borders have `dark:` variants
- [ ] Focus states include `dark:focus:ring-offset-gray-900`
- [ ] Hover states work in both modes
- [ ] Placeholder text is visible in dark mode
- [ ] Semantic colors (success, error, info) have dark variants
- [ ] Component tested visually in both themes

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

Most design tokens live in Tailwind classes for consistency and tree-shaking. CSS custom properties are used only for values that need runtime access (animations):

```css
:root {
  --color-amber-400: 251 191 36;   /* Warm shimmer effects */
  --color-orange-400: 251 146 60;  /* Processing glow effects */
}
```

These RGB values enable opacity modifiers in CSS animations: `rgb(var(--color-amber-400) / 0.2)`

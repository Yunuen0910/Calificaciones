---
name: AulaGrade Academic SaaS
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#444651'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#757682'
  outline-variant: '#c5c5d3'
  surface-tint: '#4059aa'
  primary: '#00236f'
  on-primary: '#ffffff'
  primary-container: '#1e3a8a'
  on-primary-container: '#90a8ff'
  inverse-primary: '#b6c4ff'
  secondary: '#0051d5'
  on-secondary: '#ffffff'
  secondary-container: '#316bf3'
  on-secondary-container: '#fefcff'
  tertiary: '#340081'
  on-tertiary: '#ffffff'
  tertiary-container: '#4e03b8'
  on-tertiary-container: '#b89cff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b6c4ff'
  on-primary-fixed: '#00164e'
  on-primary-fixed-variant: '#264191'
  secondary-fixed: '#dbe1ff'
  secondary-fixed-dim: '#b4c5ff'
  on-secondary-fixed: '#00174b'
  on-secondary-fixed-variant: '#003ea8'
  tertiary-fixed: '#e9ddff'
  tertiary-fixed-dim: '#d0bcff'
  on-tertiary-fixed: '#23005c'
  on-tertiary-fixed-variant: '#5516be'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.025em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  title-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  title-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.02em
  mono-numeric:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.01em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-tablet: 1.5rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 1.75rem
  space-2xl: 2.5rem
---

## Brand & Style

This design system targets K-12 educators, university professors, and school administrators navigating daily grading workflows, attendance rosters, and student outcome analytics. The interface pairs the ergonomic speed and dense utility of tools like Linear and Notion with the institutional clarity of Google Classroom Pro. 

### Aesthetic Philosophy
The visual direction balances precision-engineered minimalism with institutional trustworthiness:
- **High-Utility Ergonomics:** High information density without visual chaos. Layouts prioritize fast keyboard navigation, clear tabular scans, and zero friction during bulk grading.
- **Micro-Structured Depth:** Subtle structural borders (`#E2E8F0`) and layered surface containers replace heavy decorative drop shadows, keeping rendering lightweight and visual fatigue low across prolonged working sessions.
- **Semantic Vividness:** High-contrast, mathematically tuned semantic tokens cut through neutral slate canvases to highlight passing thresholds, missing tasks, and anomalous student trajectories instantly.

## Colors

The palette establishes an authoritative, academic foundation punctuated by purposeful semantic hues.

### Palette Architecture
- **Primary (`#1E3A8A`)**: Deep Academic Indigo. Serves as the bedrock for global navigation headers, high-level brand markers, selected tab indicators, and dominant interactive anchors.
- **Secondary (`#2563EB`)**: Royal Cobalt. Applied to active states, focused form controls, batch-action triggers, and keyboard focus rings.
- **Tertiary (`#8B5CF6`)**: Electric Violet. Reserved exclusively for celebratory and extracurricular markers: participation badges, honors flags, extra credit points, and advanced rubrics.
- **Neutral (`#64748B`)**: Slate neutral axis. Provides structural stability ranging from high-contrast ink (`#0F172A`) to canvas whites (`#FFFFFF`) and slate tints (`#F8FAFC`).

### Academic Semantic Tokens
- **Passing / Mastery (Success):** `#10B981` (Surface: `#ECFDF5`, Border: `#A7F3D0`). Used for passing grades (≥70%), submitted assignments, and verified attendance.
- **Warning / At-Risk:** `#F59E0B` (Surface: `#FFFBEB`, Border: `#FDE68A`). Used for borderline students (60-69%), impending deadlines, and excused absences.
- **Critical / Remedial:** `#EF4444` (Surface: `#FEF2F2`, Border: `#FECACA`). Used for failing marks (<60%), unexcused absences, and missing deliverables.
- **Bonus / Participation:** `#8B5CF6` (Surface: `#F5F3FF`, Border: `#DDD6FE`). Used for bonus achievements, collaborative peer reviews, and qualitative remarks.

## Typography

The typography relies entirely on Inter to ensure uniform metric performance across dense table grids and analytical viewports.

### Numeric & Tabular Rules
- Apply OpenType tabular figures (`font-feature-settings: 'tnum' 1, 'cv05' 1`) to all grade entry points, student ID listings, percentages, and metrics. This ensures decimal places align vertically without horizontal jitter.
- The `mono-numeric` style must be enforced across gradebook cells, GPAs, and class statistical distributions.

### Hierarchy & Legibility
- Headings use optical negative tracking (`-0.015em` to `-0.025em`) to stay tight and crisp alongside dense navigational structures.
- Body and label styles keep neutral or slightly positive tracking to maintain legibility when rendered in muted neutral slate colors.

## Layout & Spacing

The layout is built around a hybrid productivity engine: a collapsible operational sidebar paired with a flexible fluid viewport tailored for dynamic data tables and analytical dashboards.

### Responsive Breakpoints & Viewport Rules
- **Desktop (≥1280px):** 12-column grid or unconstrained horizontal gradebook matrix. Sticky row headers (Student Identity) and sticky column headers (Assignment/Competency) anchor viewport scrolling.
- **Tablet (768px – 1279px):** Collapsible vertical navigation into an icon rail (64px). Tables switch to targeted sticky columns with horizontal swipe navigation and pinned average grades.
- **Mobile (<768px):** Single-column layout. Gradebook matrices convert to stacked student cards with quick-tap status badges and modal-based grade editing.

### Spacing Density Principles
- Base unit: 4px grid.
- Density in working views: Table cells utilize condensed padding (`space-xs` vertically [4px], `space-sm` horizontally [8px]) to maximize the visible roster area on standard laptop displays.
- Density in configuration views: Settings, syllabus builders, and analytics summaries step up to standard comfortable spacing (`space-md` to `space-lg`).

## Elevation & Depth

This design system avoids heavy shadows, instead achieving hierarchy through structural lines, contrast shifts, and functional tonal containment.

### Surface Tiers
- **Canvas Base (`#F8FAFC`):** The primary application canvas behind cards, tables, and dashboards.
- **Primary Surface (`#FFFFFF`):** Cards, table bodies, toolbars, and sheets. Always bounded by a 1px border of `#E2E8F0`.
- **Raised Interactive Layer:** Contextual popovers, grade entry tooltips, and floating bulk-action bars use `#FFFFFF` paired with an ultra-fine structural shadow: `0 4px 6px -1px rgba(15, 23, 42, 0.06), 0 2px 4px -2px rgba(15, 23, 42, 0.04)`.
- **Modal / Overlay Layer:** Backdrop blur (`backdrop-filter: blur(4px)`) backed by `rgba(15, 23, 42, 0.45)`. Dialogs feature crisp perimeter containment with `#E2E8F0` and `0 20px 25px -5px rgba(15, 23, 42, 0.1)`.

### Border Integrity
- Default divider & container border: `1px solid #E2E8F0`.
- Active table cell / cell focus: `2px solid #2563EB` with an offset of `-1px` to preserve table dimensions during rapid keyboard navigation.

## Shapes

The design system adopts a crisp, modern geometry (`roundedness: 1` / Soft). This preserves high pixel efficiency and maximizes available cell area in complex data matrices.

### Radii Guidelines
- **Input Fields, Table Cells, and Action Buttons:** `0.25rem` (4px). Keeps input boundaries clean and allows controls to sit comfortably within tight rows.
- **Cards, Panels, and Containers:** `0.5rem` (8px). Softens larger surface blocks without wasting interior corner space.
- **Modals, Floating Panels, and Drawers:** `0.75rem` (12px). Delivers subtle visual separation for overlay components.
- **Badges, Status Chips, and Avatar Tokens:** `9999px` (Full Pill). Differentiates meta tags and semantic indicators from rectangular input controls.

## Components

### Buttons
- **Primary:** Background `#1E3A8A`, text `#FFFFFF`, border `transparent`. Hover: `#2563EB`. Active: `#1D4ED8`. Focus: `2px solid #2563EB` with 2px offset.
- **Secondary / Outline:** Background `#FFFFFF`, text `#0F172A`, border `1px solid #E2E8F0`. Hover: `#F8FAFC`, border `#CBD5E1`.
- **Subtle / Ghost:** Background `transparent`, text `#475569`. Hover: `#F1F5F9`, text `#0F172A`. Ideal for gradebook cell action triggers.
- **Destructive:** Background `#FEF2F2`, text `#EF4444`, border `1px solid #FECACA`. Hover: Background `#EF4444`, text `#FFFFFF`.

### Chips & Semantic Status Badges
- Height: 22px, padding: `0 8px`, border-radius: `9999px`, typography: `label-sm`.
- **Approved / Complete:** Text `#065F46`, background `#ECFDF5`, border `1px solid #A7F3D0`.
- **At Risk / Missing:** Text `#92400E`, background `#FFFBEB`, border `1px solid #FDE68A`.
- **Failed / Overdue:** Text `#991B1B`, background `#FEF2F2`, border `1px solid #FECACA`.
- **Extra Credit / Bonus:** Text `#5B21B6`, background `#F5F3FF`, border `1px solid #DDD6FE`.

### Gradebook Grid Cells (Specialized Component)
- Standard height: 36px. Direct inline editable text with `mono-numeric` sizing.
- Hover: Border `1px dashed #94A3B8`.
- Focus / Editing: Background `#FFFFFF`, border `2px solid #2563EB`, text `#0F172A`, z-index: 2.
- Out-of-bounds error state: Background `#FEF2F2`, border `2px solid #EF4444`.

### Form Fields & Inputs
- Height: 36px (Compact) and 40px (Default).
- Border: `1px solid #CBD5E1`, background `#FFFFFF`, text `#0F172A`, placeholder `#94A3B8`.
- Focus: Border color `#2563EB`, box-shadow `0 0 0 1px #2563EB`.

### Checkboxes & Selection Controls
- Checkbox dimensions: 16px × 16px, border radius: 3px.
- Unchecked: Border `1.5px solid #CBD5E1`, background `#FFFFFF`.
- Checked: Border `#2563EB`, background `#2563EB`, white checkmark icon.

### Data Cards & Dashboard Panels
- Background: `#FFFFFF`, border: `1px solid #E2E8F0`, border-radius: `8px`.
- Header section: Height 48px, horizontal padding `space-md`, border-bottom `1px solid #F1F5F9`.
- Header typography uses `title-sm` with action buttons aligned to the right.
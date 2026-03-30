# Frontend Theme Roles

## Purpose
This frontend keeps a dark-only shell and uses lighter paper surfaces to make content readable on mobile. The goal is to preserve the Canhoes identity while avoiding dark-on-dark reading areas.

## Token roles
- `--bg-void`, `--bg-deep`, `--bg-surface`: shell depth, outer layout, bottom dock, sticky chrome.
- `--bg-paper`, `--bg-paper-soft`, `--bg-paper-muted`: readable content surfaces for cards, forms, post text, and admin control areas.
- `--text-primary`, `--text-secondary`, `--text-muted`: text on dark shell surfaces.
- `--ink-primary`, `--ink-secondary`, `--ink-muted`: text on paper surfaces.
- `--moss`, `--neon-green`, `--glow-green`: primary Canhoes control color, live state, success, and active product identity.
- `--accent-purple`, `--accent-purple-soft`, `--accent-purple-deep`, `--glow-purple`: secondary accent only for selected states, glow, celebratory energy, and high-focus UI.
- `--brown-dark`, `--brown`, `--beige`: grounded accent family for tactile actions and editorial balance.

## Usage rules
- Keep the shell dark. Do not introduce light theme behavior.
- Put reading-heavy content on paper surfaces instead of deep green panels.
- Use green as the main action/state language.
- Use purple as accent only. It should never become the dominant base surface or replace green as the primary identity.
- On paper surfaces, always use ink tokens instead of shell-light text colors.
- On dark surfaces, always use shell text tokens instead of ink colors.

## Component guidance
- Buttons:
  - primary actions can use moss/brown depending on context
  - focus and selected affordances can use purple accents
- Cards:
  - admin control cards, post bodies, forms, and comment blocks should prefer paper surfaces
  - shell summary or framing cards can stay dark
- Tabs and chips:
  - active/selected states may use purple glow or border
  - neutral state should stay green/beige aligned
- Badges:
  - semantic color first
  - purple only for selected/high-energy emphasis

## Guardrails
- Do not stack dark card on dark shell if the card contains long-form text.
- Do not use purple for default navigation, default buttons, or large background fills.
- If a surface is hard to read on mobile, move it toward paper before adding stronger glow or saturation.

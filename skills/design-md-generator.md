# Skill: DESIGN.md Generator

**Type:** prompt
**Owner:** Lonnell Williams (ldw.build)
**Public:** yes — safe to expose to AI agents.

## What it does
Generates a `DESIGN.md` — a machine-readable design-identity file that AI build tools (Claude Code, Cursor, Figma Make, Stitch) read before building, so output matches a brand instead of defaulting to generic.

## Inputs (ask the user for these)
- Brand name + one-line positioning.
- Colour palette (hex + role for each).
- Typography (display / body / mono) and any hard rules.
- Voice: required vocabulary, banned vocabulary, tone.
- Any hard "never" rules (bright lines).

## Output structure
`Overview · Colours (token / hex / role table) · Typography (stack + rules) · Elevation & space · Components · Voice (required/banned vocab) · Do · Don't`

## Rules
- Be specific and machine-parseable: tables, exact hex, exact font names.
- Encode "never" rules explicitly in the Don't section (e.g., "never pure white #FFFFFF").
- Keep it to one screen of editing — the value is a tight, droppable file, not an essay.

## Guardrails
- Output is generic-purpose (works for any brand the user supplies).
- Does not expose any specific client's private brand lock.

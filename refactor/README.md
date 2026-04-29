# Refactor Workspace

This folder is the isolated workspace for the modernization effort.

## Phase 1 status

Phase 1 is focused on preserving current generator behavior before any UI or architecture changes:

- legacy generator logic copied into a Node-testable TypeScript module
- deterministic randomness support added for tests
- characterization tests added around the current placement behavior
- fixture summary added for a seeded run
- shared types and pure helper modules extracted from the legacy generator
- a small core-style API layer now sits on top of the locked legacy generator

The original static app under `../src/` remains the source of truth for the current browser experience.

## Current tooling note

This workspace currently runs TypeScript directly on Node 22 using built-in type stripping.
That keeps Phase 1 lightweight and dependency-free while behavior is being locked down.

## Commands

```bash
npm test
```

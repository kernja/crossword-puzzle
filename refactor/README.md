# Refactor Workspace

This folder is the isolated workspace for the modernization effort.

## Phase 1 status

Phase 1 is focused on preserving current generator behavior before any UI or architecture changes:

- legacy generator logic copied into a Node-testable module
- deterministic randomness support added for tests
- characterization tests added around the current placement behavior
- fixture summary added for a seeded run

The original static app under `../src/` remains the source of truth for the current browser experience.

## Commands

```bash
npm test
```


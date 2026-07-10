# Contributing to HarmonyOS A2UI Protocol

Thank you for your interest in contributing to the HarmonyOS A2UI Protocol project.

## How to Contribute

### Protocol Modifications

All protocol modifications follow a 5-stage GAP workflow managed through `protocol-gaps/`. See `protocol-gaps/AGENTS.md` for details.

**Pre-modification gate (must be completed before editing specification):**

1. GAP registered in `protocol-gaps/GAPS.md` with status `pending`
2. Affinity validation passed (A/B comparison or lightweight regression)
3. Evaluation report path recorded in pending README

### Commit Message Format

```
type[(scope)]: description
```

| type | purpose |
|------|---------|
| feat | New feature / protocol capability |
| fix | Bug fix |
| spec | Protocol specification refinement |
| refactor | Code restructuring |
| breaking | Incompatible changes |
| chore | Tooling / process |
| docs | Documentation |

Commits containing `GAP-XXX` references will be automatically annotated in CHANGELOG entries.

### Running Evaluations

```bash
cd eval
npm install

# Single design point evaluation
npm run eval:scope

# Full protocol evaluation
npm run eval

# Run with specific model
ONLY_MODEL=deepseek npm run eval:scope
```

### Environment Setup

Create `eval/.env` with API keys (see `eval/.env.example`):

```
GLM_API_KEY=xxx
DEEPSEEK_API_KEY=xxx
```

## Code Style

- TypeScript with ES2022 modules
- No separate compile step (executed via `tsx`)
- All paths use `resolve()` with computed root constants
- Follow existing patterns in neighboring files

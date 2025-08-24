# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Build and Validation
```bash
node build.js  # Normalize TSVs and regenerate packs.json
```

### Pre-commit Verification
```bash
./tools/verify-build.sh  # Check if build.js would produce changes
```

## Architecture

This repository hosts downloadable prompt packs for the Idea Loom iOS app. The architecture follows a content-as-data pattern:

### Pack Structure
- Each pack in `packs/` contains:
  - `manifest.json`: Pack metadata (id, name, version, categories with icons/colors)
  - `*.tsv` files: Prompt data for each category

### TSV Schema
- **v1 (current)**: Single column `text` containing the prompt
- **v2+ (staged)**: Two columns `text` and optional `help` (short hint in parentheses)
- The build script automatically:
  - Capitalizes first letters
  - Detects and splits `text (help)` patterns into proper columns
  - Alphabetizes by text column
  - Validates column structure

### Schema Versioning
- `schema.json` declares the current major schema version
- Breaking changes trigger:
  1. Tagging current app store version `vX.Y.Z`
  2. Bumping `schemaMajor`
  3. Landing changes on `main`
- Apps fetch from matching tags when schema is newer than supported

### Build Process
The `build.js` script:
1. Normalizes all TSV files (capitalization, format, alphabetization)
2. Validates pack manifests
3. Regenerates `packs.json` with all pack metadata
4. CI enforces that `build.js` produces no changes

## Important Notes

- Hold off on pushing until explicitly told we are ready for a release
- Follow the latest schema/versioning policy in README.md
- Prompts should be personal and imaginative (not requiring research)
- When adding help hints, keep them brief and playful (2-4 words typically)
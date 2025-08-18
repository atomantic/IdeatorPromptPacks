# Idea Loom Prompt Packs

This repository hosts downloadable prompt packs for the Idea Loom app - a creative brainstorming iOS app that helps users generate ideas through guided prompts.

## Available Packs

Browse the `packs.json` file to see all available prompt packs that can be downloaded directly from within the Idea Loom app.

## Pack Structure

Each prompt pack consists of:
- A `manifest.json` file with pack metadata
- One or more `.tsv` files containing prompts for each category
- Categories are organized by theme (e.g., creative, professional, lifestyle)

### TSV Format

Schema v1 (current on `main`):
- Columns: `text` (prompt text)

Schema v2+ (staged on `main` when introduced):
- Columns: `text`, `help` (optional short hint shown in app)

Example (v1):
```tsv
text
business ideas to explore
ways to improve my workspace
```

Example (v2):
```tsv
text	help
business ideas to explore	(person + pain + promise)
```

## Creating Your Own Pack

To create a custom prompt pack:

1. Create a new folder in `packs/` with your pack ID
2. Add a `manifest.json` file:
```json
{
  "id": "your-pack-id",
  "name": "Your Pack Name",
  "version": "1.0.0",
  "description": "Description of your pack",
  "author": "Your Name",
  "categories": [
    {
      "id": "category1",
      "name": "Category Name",
      "file": "category1.tsv",
      "icon": "system.icon.name",
      "color": "blue"
    }
  ]
}
```

3. Create TSV files for each category
4. Submit a pull request to add your pack

## Contributing

We welcome contributions! Please follow these guidelines:
- Keep prompts appropriate for all audiences
- Ensure prompts can be completed without external research
- Focus on ideation and imagination rather than factual knowledge
- Group related prompts into logical categories

Formatting and validation:
- Run `node build.js` before committing. It will:
  - Capitalize the first letter of each prompt text
  - Ensure TSV rows are `text` or `text\thelp` only
  - Recover lines where help was added without a tab (e.g., `Title (hint)`)
  - Alphabetize rows by the `text` column
  - Regenerate `packs.json`
- CI runs the same checks and will fail if `build.js` would change files.

Optional pre-commit hook:
- Install the local git hook to enforce normalization automatically:
  ```bash
  chmod +x scripts/pre-commit tools/verify-build.sh
  ln -sf "$(pwd)/scripts/pre-commit" .git/hooks/pre-commit
  ```
  Now commits will abort if you forget to run the build.

## Pack Categories

### Core Pack (Built-in)
- Personal Development
- Professional
- Creative
- Lifestyle
- Relationships
- Entertainment
- Travel & Adventure
- Learning & Skills
- Financial
- Social Impact
- Health & Fitness
- Mindfulness
- Self Care
- Gratitude

### Community Packs (Downloadable)
- Tech Startup Pack
- Creative Writing Pack
- Family & Parenting Pack
- Surreal Ideation Pack
- Disaster Prep
- And more coming soon!

## License

All prompt packs in this repository are provided under the MIT License. Feel free to use, modify, and share!

## Support

For issues or questions about prompt packs, please open an issue in this repository.
For app-related issues, visit the main app repository.

## Versioning and Schema Policy

- The root `schema.json` declares the current major schema version used on `main` (e.g., `{ "schemaMajor": 1 }`).
- App releases are tagged in this repo as `vX.Y.Z` (matching the App Store version).
- `main` can introduce breaking schema changes at any time. When that happens:
  1. Tag the repo with the current store version `vX.Y.Z` so older apps have a stable snapshot.
  2. Bump `schemaMajor` in `schema.json` on `main`.
  3. Land breaking changes on `main`.
- Ideator app behavior:
  - If `schemaMajor` on `main` is greater than the app’s supported schema, the app fetches packs from the matching tag `vX.Y.Z`.
  - Otherwise, the app uses `main`.
  - If a fetch from a tag fails (e.g., tag not present), the app falls back to `main`.

# Ideator Prompt Packs

This repository hosts downloadable prompt packs for the [Ideator app](https://github.com/atomantic/Ideator) - a creative brainstorming iOS app that helps users generate ideas through guided prompts.

## Available Packs

Browse the `packs.json` file to see all available prompt packs that can be downloaded directly from within the Ideator app.

## Pack Structure

Each prompt pack consists of:
- A `manifest.json` file with pack metadata
- One or more `.tsv` files containing prompts for each category
- Categories are organized by theme (e.g., creative, professional, lifestyle)

### TSV Format

Each category TSV file has a single column:
- `text`: The prompt text

Example:
```tsv
text
business ideas to explore
ways to improve my workspace
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
- Test your pack in the Ideator app before submitting

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
- And more coming soon!

## License

All prompt packs in this repository are provided under the MIT License. Feel free to use, modify, and share!

## Support

For issues or questions about prompt packs, please open an issue in this repository.
For app-related issues, visit the [main Ideator repository](https://github.com/atomantic/Ideator).
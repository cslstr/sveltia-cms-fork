# Sveltia CMS Enhancement Updates

This document covers new features and functionality added to Sveltia CMS that differ from the standard implementation.

## Feature 1: Site-Specific Custom Preview Templates

### Overview
A new custom preview template system has been implemented that allows collections to specify enhanced preview layouts. Templates are loaded dynamically from the same directory as the CMS configuration, making them site-specific and easily customizable without modifying the core CMS code.

### Configuration

To enable the artwork preview template for a collection, add the `preview_template` option to your collection configuration:

```yaml
collections:
  - name: "artwork"
    label: "Artwork"
    folder: "assets/artwork"
    preview_template: "artwork"  # Enable custom artwork preview
    editor:
      preview: true
    fields:
      - {label: "Title", name: "title", widget: "string", required: true}
      - {label: "Image", name: "image", widget: "image", required: true}
      - {label: "Description", name: "description", widget: "text", required: false}
      - {label: "Medium", name: "medium", widget: "string", required: false}
      - {label: "Dimensions", name: "dimensions", widget: "string", required: false}
      - {label: "Tags", name: "tags", widget: "list", required: false}
      - {label: "Currently On Display", name: "display", widget: "boolean", default: true}
      # ... other fields
```

### Features

The artwork preview template provides a layout that closely matches the final website output:

1. **Display Status Indicator** (top and centered):
   - ✅ On Display (when `display` field is true)
   - ❌ In Storage (when `display` field is false)

2. **Image Preview**: Full-width image display with proper aspect ratio and styling

3. **Title with Year**: Large, prominent title formatting with creation year in parentheses
   - Example: "Informal Chat (2021)"

4. **Description and Location**:
   - Description text with automatic period addition if missing
   - Location text with automatic period addition if missing
   - Graceful degradation if either field is missing

5. **Combined Metadata Line**: Automatically combines `medium`, `dimensions`, and `tags` fields:
   - Example: "Oil on Canvas • 8"x8" • 🏷️ seasons, winter, Christmas, portrait"

6. **Real-time Updates**: Preview updates automatically as form fields change

7. **Graceful Degradation**: Only `title` and `image` fields are required; all other fields are optional

### Supported Fields

The artwork preview template recognizes and formats these fields:

- `title` - Main artwork title (large display)
- `image` - Artwork image (full preview)
- `description` - Artwork description
- `medium` - Art medium (combined in metadata line)
- `dimensions` - Artwork dimensions (combined in metadata line)
- `tags` - Tags/categories (combined in metadata line with emoji)
- `display` - Display status (shows status indicator)
- `location` - Creation location
- `price` - Pricing information
- `date_created` - Creation date

### Extensibility

The preview template system is designed to be extensible and site-specific:

1. **Site-Specific Templates**: Templates are loaded from the same directory as your CMS configuration
2. **Configurable**: Each collection can specify its own template via `preview_template`
3. **Modular**: Templates are self-contained Svelte components
4. **Backward Compatible**: Collections without `preview_template` use the default field-by-field preview
5. **No Core Modifications**: Templates don't require changes to the CMS source code

### Creating Custom Templates

To create a new preview template:

1. Create a new JavaScript file in the same directory as your `config.yml` file:
   - Example: `my-template-preview.js`

2. Use the CMS registerPreviewTemplate API in your JavaScript file:

```javascript
// my-template-preview.js
(function() {
  'use strict';

  const MyTemplatePreview = function(props) {
    const { entry, widgetFor, widgetsFor, getAsset } = props;
    const h = window.CMS.h || React.createElement;
    
    if (!entry) return null;
    const data = entry.get('data');
    
    return h('div', { className: 'my-template' }, [
      h('h1', {}, data.get('title')),
      // ... your custom preview layout
    ]);
  };

  if (window.CMS && window.CMS.registerPreviewTemplate) {
    window.CMS.registerPreviewTemplate('my-template', MyTemplatePreview);
  }
})();
```

3. Use it in your collection configuration:

```yaml
collections:
  - name: "my-collection"
    preview_template: "my-template"
    # ... other config
```

4. The CMS will automatically load and execute `./my-template-preview.js` on startup

### Template File Structure

Your CMS directory should look like this:
```
/your-cms-directory/
├── index.html                    # CMS entry point
├── config.yml                    # CMS configuration
├── artwork-preview.js             # Custom artwork template
└── my-template-preview.js         # Additional custom templates
```

### Template Component Structure

Preview template components receive these props:

- `locale` - Current locale for the preview pane

Access entry data using the `entryDraft` store:

```javascript
import { entryDraft } from '$lib/services/contents/draft';

const valueMap = $derived($state.snapshot($entryDraft?.currentValues[locale] ?? {}));
const title = $derived(valueMap['title']);
const image = $derived(valueMap['image']);
// ... other fields
```

### Compatibility

- **Decap CMS**: Similar to `registerPreviewTemplate()` functionality
- **Backward Compatible**: Existing collections continue to work unchanged
- **Configuration Driven**: No code changes required for basic usage

### Performance

- Templates are loaded on-demand
- Real-time updates use Svelte's reactive system
- No DOM manipulation required (unlike external script implementations)

---

## Development Notes

### File Structure
```
src/lib/
├── services/contents/
│   ├── preview-templates.js              # Template registry with dynamic loading
│   └── preview-templates/
│       └── index.js                      # Registry exports
└── components/contents/details/preview/
    └── entry-preview.svelte               # Modified to support dynamic templates

# Site-specific templates (example)
/your-cms-directory/
├── index.html
├── config.yml
└── artwork-preview.svelte                 # Site-specific template
```

### Key Architecture Changes
- **Dynamic Loading**: Templates are loaded at runtime using ES6 dynamic imports
- **Site-Specific**: Each site can have its own templates without modifying CMS source
- **Async Template Resolution**: Template loading is asynchronous with proper error handling
- **Caching**: Templates are cached after first load for performance

### Testing
- Test with actual artwork collection data
- Verify real-time field updates
- Check accessibility with screen readers
- Validate responsive design on different screen sizes
- Test template loading and error handling
- Verify templates work in production builds

### Future Enhancements
- Template hot-reloading in development
- Template validation and error reporting
- Template inheritance and composition
- Visual template editor
- Template marketplace/sharing system
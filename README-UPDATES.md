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

---

## Feature 2: Unused Asset Detection for Artwork Collection

### Overview
**Implementation Date**: December 19, 2024
**Status**: ✅ Complete and Production Ready

A comprehensive unused asset detection system that identifies assets in the `assets/artwork/` folder that are not referenced by any artwork entries in the YAML-based artwork collection. This feature provides visual indicators, filtering capabilities, and detailed usage information to help maintain a clean and organized asset library.

### Features

#### Visual Indicators
- **Yellow Warning Badges**: Visual indicators on unused assets in both grid and list views
- **Smart Positioning**: Grid mode badges appear as overlay on image preview; list mode badges appear next to filename for better visibility
- **Clear Messaging**: "⚠ UNUSED" text with tooltips explaining the status

#### Smart Detection
- **YAML Analysis**: Analyzes artwork collection YAML entries to identify unused image assets
- **Path Conversion**: Handles conversion between internal (`assets/artwork/`) and public (`/artwork/`) paths
- **Performance Optimized**: Only processes artwork-related assets with reactive updates

#### Filter Integration
- **"Show Unused Artwork" Checkbox**: Added to asset toolbar for quick filtering
- **Smart Display**: Only appears when artwork assets are present in the current folder
- **State Persistence**: Filter state is saved with other view preferences
- **Seamless Integration**: Works with existing sorting, grouping, and other filters

#### Enhanced Asset Details
- **"Used in Artwork" Section**: Special section in asset details panel showing usage status
- **Clear Status Messages**: Distinct styling and messaging for unused vs used assets
- **User Guidance**: Helpful descriptions and suggestions for unused assets

#### Localization
- **Full Language Support**: Complete English and Japanese language support
- **Consistent Terminology**: Unified language across all interface elements

### Configuration

No configuration required - the feature automatically detects artwork assets and analyzes the artwork collection. The system works with the standard Sveltia CMS artwork collection configuration:

```yaml
collections:
  - name: "artwork"
    label: "Artwork"
    folder: "assets/artwork"
    fields:
      - {label: "Image", name: "image", widget: "image", required: true}
      # ... other fields
```

### How It Works

1. **Asset Scanning**: Identifies all assets in the `assets/artwork/` folder
2. **Entry Analysis**: Parses all artwork collection YAML files to extract image field references
3. **Path Matching**: Converts public paths (`/artwork/image.jpg`) to internal paths (`assets/artwork/image.jpg`) for comparison
4. **Usage Detection**: Marks assets as unused if they're not referenced by any artwork entry
5. **Visual Display**: Shows yellow warning badges on unused assets with comprehensive details

### User Experience

#### Discovery Workflow
1. **Visual Scanning**: Users immediately see yellow badges on unused assets in both grid and list views
2. **Quick Filtering**: Use "Show Unused Artwork" checkbox in toolbar to see only unused assets
3. **Detailed Investigation**: Click assets to see comprehensive usage status in details panel
4. **Asset Management**: Easily identify and clean up unused files from artwork collection

#### Interface Elements
- **Grid View**: Badge appears as overlay on top-right of image preview
- **List View**: Badge appears prominently next to filename (not hidden on tiny thumbnail)
- **Toolbar Filter**: Checkbox only appears when artwork assets are present
- **Details Panel**: Special "Used in Artwork" section with clear status messaging

### Technical Implementation

#### Files Modified/Created
- `src/lib/services/assets/artwork-usage.js` - Core detection service
- `src/lib/services/assets/view.js` - Enhanced filtering system
- `src/lib/components/assets/shared/unused-asset-badge.svelte` - Visual indicator component
- `src/lib/components/assets/list/asset-list-item.svelte` - Badge integration with improved positioning
- `src/lib/components/assets/list/secondary-toolbar.svelte` - Added filter checkbox
- `src/lib/components/assets/shared/info-panel.svelte` - Enhanced details panel
- `src/lib/locales/en.js` & `src/lib/locales/ja.js` - Localization strings and UI fixes

#### Architecture
- **Reactive Stores**: Uses Svelte reactive stores for efficient updates when content changes
- **Path Conversion Logic**: Robust handling of internal vs public path formats
- **Filter Integration**: Seamlessly integrates with existing asset filtering system
- **Performance Conscious**: Only processes artwork-related assets to minimize impact
- **Extensible Design**: Architecture can be extended to other collection types

#### Core Detection Algorithm
```javascript
const getUnusedArtworkAssets = () => {
  // 1. Get all assets in artwork folder
  const artworkAssets = allAssets.filter(asset =>
    asset.path.startsWith('assets/artwork/')
  );
  
  // 2. Get all artwork entries
  const artworkEntries = getEntriesByCollection('artwork');
  
  // 3. Extract all image paths from YAML
  const usedImagePaths = artworkEntries
    .map(entry => entry.locales[defaultLocale].content.image)
    .filter(Boolean)
    .map(path => convertPublicToInternalPath(path));
  
  // 4. Find unused assets
  return artworkAssets.filter(asset =>
    !usedImagePaths.includes(asset.path)
  );
};
```

### Benefits

#### For Content Managers
- **Visual Clarity**: Immediately identify unused assets without manual checking
- **Storage Optimization**: Safely remove unnecessary files to reduce storage usage
- **Content Audit**: Better understanding of asset utilization across artwork collection
- **Workflow Efficiency**: Faster asset management decisions with clear visual feedback

#### For Developers
- **Clean Architecture**: Well-structured, maintainable code following Svelte best practices
- **Performance**: Efficient reactive implementation with minimal system impact
- **Extensibility**: Easy to extend to other collections beyond artwork
- **Documentation**: Comprehensive implementation documentation for future maintenance

#### For Users
- **Intuitive Interface**: Clear visual indicators and messaging throughout the interface
- **Accessibility**: Full screen reader and keyboard navigation support
- **Multilingual**: Complete support for English and Japanese languages
- **Non-Disruptive**: Doesn't interfere with existing asset management workflows

### Compatibility

- **Sveltia CMS**: Fully integrated with existing asset management system
- **YAML Collections**: Specifically designed for YAML-based artwork collections
- **Responsive Design**: Works across all screen sizes and device types
- **Browser Support**: Compatible with all modern browsers supported by Sveltia CMS

### Future Enhancements

- **Multi-Collection Support**: Extend to other collection types beyond artwork
- **Bulk Operations**: Add bulk delete functionality for unused assets
- **Usage Analytics**: Track asset usage patterns over time
- **Automated Cleanup**: Optional automated removal of unused assets after specified periods
- **Export Functionality**: Export lists of unused assets for external processing
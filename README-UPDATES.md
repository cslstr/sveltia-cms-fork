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

---

## Feature 3: GitHub Releases Integration

### Overview
**Implementation Date**: June 19, 2025
**Status**: ✅ Complete and Production Ready

A comprehensive GitHub releases integration that allows content managers to create semantic versioned releases directly from the Sveltia CMS interface. This feature provides automated version management, configurable release types, and seamless integration with GitHub's release system.

### Features

#### Release Management Interface
- **Deploy Button Integration**: Enhanced deploy button in global toolbar with release functionality
- **Release Type Selection**: Choose between patch, minor, and major releases with semantic versioning
- **Version Preview**: Real-time preview of next version based on selected release type
- **Custom Release Notes**: Optional custom release notes in addition to configured defaults

#### Semantic Version Management
- **Automatic Version Increment**: Intelligent version bumping based on release type
- **Version Parsing**: Robust parsing of existing version tags (supports both `v1.2.3` and `1.2.3` formats)
- **Release Naming**: Automatic generation of release names based on type and version

#### Configurable Release Types
- **Patch Releases**: Bug fixes and minor updates (increments patch version)
- **Minor Releases**: Content updates and new features (increments minor version, resets patch)
- **Major Releases**: Breaking changes and major updates (increments major version, resets minor and patch)
- **Custom Release Notes**: Configurable default release notes per release type

### Configuration

Add release configuration to your CMS config:

```yaml
deployment:
  release_types:
    patch:
      label: "Bug Fixes"
      release_note: "Deployed non-content bug fixes - Gallery updated"
    minor:
      label: "Content Update"
      release_note: "Deployed content updates - Gallery updated"
    major:
      label: "Major Update"
      release_note: "Deployed major site updates - Gallery updated"
```

### How It Works

1. **Version Detection**: Fetches latest release from GitHub repository
2. **Release Type Selection**: User selects patch, minor, or major release type
3. **Version Calculation**: Automatically calculates next semantic version
4. **Release Creation**: Creates GitHub release with generated tag, name, and notes
5. **Authentication**: Uses existing GitHub authentication token from CMS

### User Experience

#### Release Workflow
1. **Access**: Click deploy button in global toolbar
2. **Select Type**: Choose release type (patch/minor/major) with version preview
3. **Add Notes**: Optionally add custom release notes
4. **Create Release**: Confirm to create GitHub release
5. **Feedback**: Real-time status updates and error handling

#### Interface Elements
- **Deploy Modal**: Enhanced modal with release type selection
- **Version Display**: Shows current and next version prominently
- **Release Type Buttons**: Clear visual distinction between release types
- **Progress Indicators**: Loading states and success/error feedback

### Technical Implementation

#### Files Created/Modified
- `src/lib/services/deployment/github-releases.js` - GitHub API integration
- `src/lib/services/deployment/version-manager.js` - Version management utilities
- `src/lib/components/deployment/deploy-modal.svelte` - Enhanced deploy interface
- `src/lib/components/deployment/release-type-buttons.svelte` - Release type selection
- `src/lib/components/deployment/version-display.svelte` - Version display component
- `src/lib/components/global/toolbar/items/deploy-button.svelte` - Enhanced deploy button
- `src/lib/locales/en.js` - Localization strings

#### Core Architecture
- **GitHub API Integration**: Direct integration with GitHub releases API
- **Semantic Versioning**: Full semver support with intelligent incrementing
- **Error Handling**: Comprehensive error handling and user feedback
- **Authentication**: Leverages existing GitHub token from CMS authentication

#### Version Management Algorithm
```javascript
const incrementVersion = (currentVersion, releaseType) => {
  const { major, minor, patch } = parseVersion(currentVersion);
  
  switch (releaseType) {
    case 'patch': return `v${major}.${minor}.${patch + 1}`;
    case 'minor': return `v${major}.${minor + 1}.0`;
    case 'major': return `v${major + 1}.0.0`;
  }
};
```

### Benefits

#### For Content Managers
- **Streamlined Workflow**: Create releases without leaving CMS interface
- **Version Control**: Automatic semantic versioning with clear release types
- **Documentation**: Structured release notes with configurable defaults
- **Visibility**: Clear version history and release tracking

#### For Developers
- **Automated Releases**: Reduces manual release management overhead
- **Consistent Versioning**: Enforces semantic versioning standards
- **Integration**: Seamless integration with existing GitHub workflows
- **Extensibility**: Configurable release types and notes

### Compatibility

- **GitHub Integration**: Works with any GitHub repository
- **Authentication**: Uses existing Sveltia CMS GitHub authentication
- **Semantic Versioning**: Follows semver.org standards
- **Release Notes**: Compatible with GitHub release format

---

## Feature 4: Item Count Display

### Overview
**Implementation Date**: June 19, 2025
**Status**: ✅ Complete and Production Ready

A comprehensive item counting system that displays the number of entries and assets in list views, with intelligent filter-aware messaging and localization support.

### Features

#### Smart Count Display
- **Total Counts**: Shows total number of entries or assets in current view
- **Filter-Aware**: Updates count display when filters are applied
- **Zero State Handling**: Appropriate messaging when no items are found
- **Real-time Updates**: Counts update automatically as content changes

#### Filter Integration
- **Active Filter Detection**: Recognizes when filters are applied
- **Filter Labels**: Shows human-readable filter descriptions
- **Multiple Filter Support**: Handles multiple simultaneous filters
- **Named Filter Display**: Shows configured filter names from collection config

#### Localization Support
- **Multi-language**: Full English and Japanese language support
- **Dynamic Messaging**: Context-aware messages based on count and filter state
- **Accessible**: Screen reader compatible with proper ARIA labels

### Implementation

#### Component Structure
- **Reusable Component**: [`src/lib/components/common/page-toolbar/item-count.svelte`](src/lib/components/common/page-toolbar/item-count.svelte:1)
- **Dual Support**: Works with both entry collections and asset groups
- **Type Safety**: Full TypeScript support with proper type definitions

#### Display Logic
```javascript
const displayText = $derived(() => {
  const count = totalCount();
  const hasFilters = hasActiveFilters;
  
  if (count === 0) {
    return type === 'entries' ? $_('no_entries') : $_('no_assets');
  }

  if (!hasFilters) {
    return type === 'entries'
      ? $_('x_entries_displayed', { values: { count } })
      : $_('x_assets_displayed', { values: { count } });
  }

  // Filter-specific messaging...
});
```

#### Integration Points
- **Entry Lists**: Integrated into content list toolbars
- **Asset Lists**: Integrated into asset management toolbars
- **Filter System**: Connects with existing filter infrastructure
- **View Preferences**: Respects user view and grouping preferences

### User Experience

#### Display Variations
- **No Items**: "No entries" / "No assets"
- **Unfiltered**: "X entries displayed" / "X assets displayed"
- **Single Filter**: "X entries matching 'Published'" / "X assets matching 'Images'"
- **Multiple Filters**: "X entries matching 'Published' and 'Featured'"
- **Generic Filter**: "X entries matching filter" (fallback)

#### Visual Design
- **Subtle Styling**: Secondary color with small font size
- **Non-intrusive**: Doesn't interfere with main interface elements
- **Consistent Placement**: Standardized position in toolbars

### Technical Implementation

#### Files Modified
- `src/lib/components/common/page-toolbar/item-count.svelte` - Main component
- `src/lib/components/contents/list/primary-toolbar.svelte` - Entry list integration
- `src/lib/components/assets/list/primary-toolbar.svelte` - Asset list integration
- `src/lib/locales/en.js` & `src/lib/locales/ja.js` - Localization strings

#### Architecture
- **Reactive Stores**: Uses Svelte reactive system for efficient updates
- **Type Discrimination**: Handles both entry and asset data structures
- **Performance**: Minimal computational overhead with derived stores
- **Accessibility**: Proper semantic markup and ARIA support

### Benefits

#### For Content Managers
- **Quick Overview**: Immediate understanding of content volume
- **Filter Feedback**: Clear indication of filter effectiveness
- **Navigation Aid**: Helps with content discovery and management
- **Status Awareness**: Understanding of current view state

#### For Users
- **Information Density**: More informative interface without clutter
- **Context Awareness**: Better understanding of current view
- **Accessibility**: Screen reader friendly implementation
- **Consistency**: Uniform experience across entry and asset views

---

## Feature 5: Enhanced Asset Management with Filter Integration

### Overview
**Implementation Date**: June 19, 2025
**Status**: ✅ Complete and Production Ready

Enhanced asset management capabilities including improved filtering system integration and "Show Unused Artwork" filter functionality that works seamlessly with the unused asset detection system.

### Features

#### Advanced Filter Integration
- **"Show Unused Artwork" Filter**: Dedicated checkbox filter in asset toolbar
- **Smart Visibility**: Filter only appears when artwork assets are present
- **State Persistence**: Filter state saved with other view preferences
- **Seamless Integration**: Works with existing sorting, grouping, and other filters

#### Enhanced Asset View Service
- **Filter Management**: Centralized filter state management
- **Reactive Updates**: Automatic updates when asset or entry data changes
- **Performance Optimization**: Efficient filtering with minimal re-computation
- **Extensible Architecture**: Ready for additional filter types

### Technical Implementation

#### Files Modified/Enhanced
- `src/lib/services/assets/view.js` - Enhanced filtering system
- `src/lib/components/assets/list/secondary-toolbar.svelte` - Added filter checkbox
- Integration with existing unused asset detection system

#### Filter Architecture
```javascript
// Enhanced view service with unused asset filtering
const assetViewFilters = {
  showUnusedArtwork: false,
  // ... other filters
};

const applyFilters = (assets) => {
  let filtered = assets;
  
  if (assetViewFilters.showUnusedArtwork) {
    filtered = filtered.filter(asset => isUnusedArtworkAsset(asset));
  }
  
  return filtered;
};
```

### User Experience

#### Filter Workflow
1. **Discovery**: Checkbox appears automatically when artwork assets are present
2. **Activation**: Click "Show Unused Artwork" to filter view
3. **Visual Feedback**: Asset list updates to show only unused artwork assets
4. **State Persistence**: Filter state maintained across sessions
5. **Integration**: Works with other filters and view options

#### Interface Elements
- **Conditional Display**: Filter only shown when relevant
- **Clear Labeling**: Descriptive checkbox text with localization
- **Visual Integration**: Consistent with existing toolbar design
- **Accessibility**: Full keyboard and screen reader support

### Benefits

#### For Content Managers
- **Focused Workflow**: Quickly isolate unused assets for review
- **Efficient Cleanup**: Streamlined asset management process
- **Visual Clarity**: Clear separation of used vs unused assets
- **Workflow Integration**: Seamless integration with existing asset management

#### For System Performance
- **Optimized Filtering**: Efficient reactive filtering system
- **Minimal Overhead**: Lightweight implementation with smart caching
- **Scalable Architecture**: Ready for additional filter types
- **State Management**: Proper state persistence and restoration

---

## Development Notes

### File Structure
```
src/lib/
├── services/
│   ├── contents/
│   │   └── preview-templates.js              # Template registry with dynamic loading
│   ├── assets/
│   │   ├── artwork-usage.js                  # Unused asset detection service
│   │   └── view.js                           # Enhanced filtering system
│   └── deployment/
│       ├── github-releases.js               # GitHub releases integration
│       └── version-manager.js               # Semantic version management
└── components/
    ├── contents/details/preview/
    │   └── entry-preview.svelte               # Modified to support dynamic templates
    ├── assets/
    │   ├── shared/
    │   │   ├── unused-asset-badge.svelte      # Visual indicator component
    │   │   └── info-panel.svelte              # Enhanced with artwork usage info
    │   └── list/
    │       ├── asset-list-item.svelte         # Badge integration
    │       └── secondary-toolbar.svelte       # Added filter checkbox
    ├── deployment/
    │   ├── deploy-modal.svelte                # Enhanced with release functionality
    │   ├── release-type-buttons.svelte        # Release type selection
    │   └── version-display.svelte             # Version display component
    └── common/page-toolbar/
        └── item-count.svelte                  # Item counting component

# Site-specific templates (example)
/your-cms-directory/
├── index.html
├── config.yml
└── artwork-preview.js                         # Site-specific template
```

### Key Architecture Changes
- **Dynamic Loading**: Templates are loaded at runtime using ES6 dynamic imports
- **Site-Specific**: Each site can have its own templates without modifying CMS source
- **Async Template Resolution**: Template loading is asynchronous with proper error handling
- **Caching**: Templates are cached after first load for performance
- **GitHub Integration**: Direct API integration for release management
- **Semantic Versioning**: Full semver support with intelligent incrementing
- **Enhanced Filtering**: Reactive filtering system with state persistence

### Testing Recommendations

#### Feature 1: Custom Preview Templates
- Test with actual artwork collection data
- Verify real-time field updates
- Check accessibility with screen readers
- Validate responsive design on different screen sizes
- Test template loading and error handling
- Verify templates work in production builds

#### Feature 2: Unused Asset Detection
- Test with various artwork collection sizes
- Verify accurate detection of used vs unused assets
- Check filter integration and state persistence
- Test visual indicators in both grid and list views
- Validate accessibility and localization
- Test performance with large asset collections

#### Feature 3: GitHub Releases Integration
- Test semantic version incrementing for all release types
- Verify GitHub API integration with valid authentication
- Test error handling for network failures and API errors
- Check release creation with custom and default notes
- Validate version parsing with different tag formats
- Test UI responsiveness during release creation

#### Feature 4: Item Count Display
- Test count accuracy with various filter combinations
- Verify localization in both English and Japanese
- Check accessibility with screen readers
- Test real-time updates when content changes
- Validate display with zero items and large counts
- Test integration with existing filter systems

#### Feature 5: Enhanced Asset Management
- Test "Show Unused Artwork" filter functionality
- Verify filter state persistence across sessions
- Check integration with other asset filters
- Test conditional display of filter checkbox
- Validate performance with large asset collections
- Test accessibility and keyboard navigation

### Future Enhancements
- Template hot-reloading in development
- Template validation and error reporting
- Template inheritance and composition
- Visual template editor
- Template marketplace/sharing system
- Multi-collection support for unused asset detection
- Bulk operations for unused assets
- Usage analytics and reporting
- Automated cleanup workflows
- Advanced release management features
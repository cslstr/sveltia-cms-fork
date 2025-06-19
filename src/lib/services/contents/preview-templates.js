/**
 * @fileoverview Preview template registry for custom collection previews
 * Provides a system for registering and resolving custom preview templates
 * similar to Decap CMS's registerPreviewTemplate functionality.
 * 
 * Templates can be loaded from:
 * 1. Built-in templates (registered via registerPreviewTemplate)
 * 2. Site-specific templates (loaded from site-admin directory)
 */

/**
 * @import { ComponentType } from 'svelte';
 */

/**
 * Registry of available preview templates
 * @type {Record<string, ComponentType>}
 */
const previewTemplates = {};

/**
 * Cache for dynamically loaded templates
 * @type {Record<string, Promise<ComponentType | null> | ComponentType>}
 */
const templateCache = {};

/**
 * Register a preview template for use with collections
 * @param {string} name Template name (e.g., 'artwork')
 * @param {ComponentType} component Svelte component for the preview
 */
export const registerPreviewTemplate = (name, component) => {
  previewTemplates[name] = component;
};

/**
 * Load all available preview template scripts from the site directory
 * This is called once during initialization
 */
export const loadSiteTemplates = async () => {
  // Try to load templates that are known to exist
  // We'll check for artwork template specifically since it's in the config
  const templatesToTry = ['artwork'];
  
  for (const templateName of templatesToTry) {
    try {
      const scriptPath = window.location.pathname === '/admin'
        ? `/admin/${templateName}-preview.js`
        : `./${templateName}-preview.js`;
      
      const response = await fetch(scriptPath);
      
      if (response.ok) {
        const scriptContent = await response.text();
        
        // Create and execute the script
        const script = document.createElement('script');
        script.textContent = scriptContent;
        document.head.appendChild(script);
        document.head.removeChild(script);
        
        console.log(`Loaded preview template: ${templateName}`);
      }
    } catch (error) {
      // Silently ignore missing templates
      console.warn(`Could not load template ${templateName}:`, /** @type {Error} */ (error).message);
    }
  }
};

/**
 * Try to load a specific template script if not already loaded
 * @param {string} templateName Name of the template to load
 * @returns {Promise<ComponentType | null>} Preview component or null if not found
 */
const loadSiteTemplate = async (templateName) => {
  // If template is already registered, return it
  if (previewTemplates[templateName]) {
    return previewTemplates[templateName];
  }
  
  try {
    const scriptPath = window.location.pathname === '/admin'
      ? `/admin/${templateName}-preview.js`
      : `./${templateName}-preview.js`;
    
    const response = await fetch(scriptPath);
    
    if (!response.ok) {
      return null;
    }
    
    const scriptContent = await response.text();
    
    // Create and execute the script
    const script = document.createElement('script');
    script.textContent = scriptContent;
    document.head.appendChild(script);
    document.head.removeChild(script);
    
    // Return the newly registered template
    return previewTemplates[templateName] || null;
  } catch (error) {
    console.warn(`Failed to load site template '${templateName}':`, error);
    return null;
  }
};

/**
 * Get a preview template by name
 * @param {string} templateName Name of the template to retrieve
 * @returns {ComponentType | null} Preview component or null if not found
 */
export const getPreviewTemplate = (templateName) => {
  // Check built-in templates first
  if (previewTemplates[templateName]) {
    return previewTemplates[templateName];
  }

  // Templates should be loaded at startup, so just return null if not found
  return null;
};

/**
 * Get a preview template by name (async version for backward compatibility)
 * @param {string} templateName Name of the template to retrieve
 * @returns {Promise<ComponentType | null>} Preview component or null if not found
 */
export const getPreviewTemplateAsync = async (templateName) => {
  // First check built-in templates
  if (previewTemplates[templateName]) {
    return previewTemplates[templateName];
  }

  // Check cache for dynamically loaded templates
  if (templateCache[templateName]) {
    const cached = templateCache[templateName];
    return cached instanceof Promise ? await cached : cached;
  }

  // Try to load from site directory
  const loadPromise = loadSiteTemplate(templateName);
  templateCache[templateName] = loadPromise;
  
  const component = await loadPromise;
  if (component) {
    templateCache[templateName] = component;
    return component;
  }

  // Clean up failed cache entry
  delete templateCache[templateName];
  return null;
};

/**
 * Get all registered preview template names (built-in only)
 * @returns {string[]} Array of template names
 */
export const getAvailableTemplates = () => {
  return Object.keys(previewTemplates);
};

/**
 * Check if a preview template is registered (built-in only)
 * @param {string} templateName Name of the template to check
 * @returns {boolean} True if template exists
 */
export const hasPreviewTemplate = (templateName) => {
  return templateName in previewTemplates;
};

/**
 * Clear the template cache (useful for development)
 */
export const clearTemplateCache = () => {
  Object.keys(templateCache).forEach(key => delete templateCache[key]);
};
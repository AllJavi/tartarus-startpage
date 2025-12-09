/**
 * SearchSuggestionsAPI - Base class for search suggestion APIs
 */
class SearchSuggestionsAPI {
  constructor() {
    this.cache = new Map();
    this.cacheTTL = 10000; // 10 seconds
  }

  /**
   * Fetch suggestions for a query
   * @param {string} query - Search query
   * @returns {Promise<Array<string>>} - Array of suggestions
   */
  async fetchSuggestions(query) {
    throw new Error('fetchSuggestions must be implemented by subclass');
  }

  /**
   * Get cached suggestions or fetch new ones
   * @param {string} query - Search query
   * @returns {Promise<Array<string>>} - Array of suggestions
   */
  async getSuggestions(query) {
    if (!query || query.length < 1) return [];

    const cacheKey = query.toLowerCase();
    const cached = this.cache.get(cacheKey);

    if (cached && (Date.now() - cached.timestamp) < this.cacheTTL) {
      return cached.suggestions;
    }

    try {
      const suggestions = await this.fetchSuggestions(query);
      this.cache.set(cacheKey, {
        suggestions,
        timestamp: Date.now()
      });
      return suggestions;
    } catch (error) {
      console.warn('Failed to fetch suggestions:', error);
      return [];
    }
  }

  clearCache() {
    this.cache.clear();
  }
}

/**
 * GoogleSuggestionsAPI - Google Suggest API implementation using local proxy
 */
class GoogleSuggestionsAPI extends SearchSuggestionsAPI {
  async fetchSuggestions(query) {
    const url = `http://localhost:3001/api/google-suggest?q=${encodeURIComponent(query)}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Proxy API error: ${response.status}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Proxy request failed');
    }

    return data.suggestions || [];
  }
}

/**
 * DuckDuckGoSuggestionsAPI - DuckDuckGo autocomplete API implementation
 */
class DuckDuckGoSuggestionsAPI extends SearchSuggestionsAPI {
  async fetchSuggestions(query) {
    const url = `https://duckduckgo.com/ac/?q=${encodeURIComponent(query)}&type=list`;
    console.log('Making DuckDuckGo API request:', url);

    const response = await fetch(url);
    console.log('DuckDuckGo API response status:', response.status);
    if (!response.ok) {
      throw new Error(`DuckDuckGo API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('DuckDuckGo API response data:', data);
    // DuckDuckGo returns: [{"phrase": "suggestion1"}, {"phrase": "suggestion2"}, ...]
    const suggestions = Array.isArray(data) ? data.map(item => item.phrase).filter(Boolean) : [];
    console.log('Extracted DuckDuckGo suggestions:', suggestions);
    return suggestions;
  }
}

/**
 * InlineAutocompleteEngine - Handles prediction logic using API suggestions
 */
class InlineAutocompleteEngine {
  constructor(apiClient) {
    this.apiClient = apiClient;
    this.cache = new Map();
    this.pendingRequests = new Map();
  }

  /**
   * Find best matching prediction for query using API
   * @param {string} query - Current user input
   * @returns {Promise<string|null>} - Best matching suggestion or null
   */
  async findPrediction(query) {
    console.log('findPrediction called with query:', query);
    if (!query || query.length < 1) return null;

    const cacheKey = query.toLowerCase();

    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < 5000) { // 5 second cache for API results
        console.log('Returning cached suggestion:', cached.suggestion);
        return cached.suggestion;
      }
    }

    // Check if there's already a pending request for this query
    if (this.pendingRequests.has(cacheKey)) {
      console.log('Returning pending request for:', cacheKey);
      return this.pendingRequests.get(cacheKey);
    }

    // Start new API request
    console.log('Starting new API request for:', query);
    const requestPromise = this.fetchAndCachePrediction(query, cacheKey);
    this.pendingRequests.set(cacheKey, requestPromise);

    try {
      const result = await requestPromise;
      console.log('API request completed, result:', result);
      return result;
    } finally {
      this.pendingRequests.delete(cacheKey);
    }
  }

  /**
   * Fetch prediction from API and cache result
   * @param {string} query - User input
   * @param {string} cacheKey - Cache key
   * @returns {Promise<string|null>} - Best suggestion or null
   */
  async fetchAndCachePrediction(query, cacheKey) {
    try {
      const suggestions = await this.apiClient.getSuggestions(query);

      // Find best suggestion (first one that starts with query)
      const bestSuggestion = suggestions.find(suggestion =>
        suggestion.toLowerCase().startsWith(query.toLowerCase()) &&
        suggestion.toLowerCase() !== query.toLowerCase()
      );

      // Cache the result
      this.cache.set(cacheKey, {
        suggestion: bestSuggestion || null,
        timestamp: Date.now()
      });

      return bestSuggestion || null;
    } catch (error) {
      console.warn('Failed to fetch suggestions:', error);
      // Cache null result to avoid repeated failed requests
      this.cache.set(cacheKey, {
        suggestion: null,
        timestamp: Date.now()
      });
      return null;
    }
  }

  /**
   * Clear all caches
   */
  clearCache() {
    this.cache.clear();
    this.pendingRequests.clear();
    if (this.apiClient) {
      this.apiClient.clearCache();
    }
  }

  /**
   * Update API client
   * @param {SearchSuggestionsAPI} newApiClient - New API client
   */
  updateApiClient(newApiClient) {
    this.apiClient = newApiClient;
    this.clearCache();
  }
}

/**
 * InlineChipManager - Handles inline chip positioning and management
 */
class InlineChipManager {
  constructor(refs) {
    this.refs = refs;
    this.chips = [];
  }

  /**
   * Add a chip for the specified engine
   * @param {string} engineKey - Engine key
   * @param {Object} engine - Engine configuration
   */
  addChip(engineKey, engine) {
    // Remove existing chip for this engine if it exists
    this.removeChip(engineKey);

    const chip = document.createElement('div');
    chip.className = 'inline-engine-chip';
    chip.dataset.engine = engineKey;
    chip.innerHTML = `
        <img class="inline-chip-icon" src="${this.getEngineIcon(engineKey)}" alt="${engine[1]}" onerror="this.style.display='none'">
        <span class="inline-chip-text">${engine[1]}</span>
        <span class="inline-chip-remove" onclick="window.searchComponent.removeInlineChip('${engineKey}')">×</span>
      `;

    this.refs.chipLayer.appendChild(chip);
    this.chips.push({ key: engineKey, element: chip });
    this.updatePositions();
  }

  /**
   * Remove a chip for the specified engine
   * @param {string} engineKey - Engine key
   */
  removeChip(engineKey) {
    const chipIndex = this.chips.findIndex(chip => chip.key === engineKey);
    if (chipIndex !== -1) {
      const chip = this.chips[chipIndex];
      chip.element.remove();
      this.chips.splice(chipIndex, 1);
      this.updatePositions();
    }
  }

  /**
   * Clear all chips
   */
  clearChips() {
    this.chips.forEach(chip => chip.element.remove());
    this.chips = [];
    this.updatePositions();
  }

  /**
   * Get total width of all chips including gaps
   * @returns {number} - Total width in pixels
   */
  getTotalChipWidth() {
    if (this.chips.length === 0) return 0;

    let totalWidth = 0;
    this.chips.forEach(chip => {
      // Cache width to avoid repeated getBoundingClientRect calls
      if (!chip.cachedWidth) {
        chip.cachedWidth = chip.element.getBoundingClientRect().width;
      }
      totalWidth += chip.cachedWidth;
    });

    // Add gap between chips (8px margin-right)
    if (this.chips.length > 0) {
      totalWidth += (this.chips.length - 1) * 8;
    }

    return totalWidth;
  }

  /**
   * Update chip positions and adjust ghost layer positioning
   */
  updatePositions() {
    // Ghost layer always fills remaining space after chips
    const ghostLayer = this.refs.ghostLayer;
    const chipLayer = this.refs.chipLayer;

    if (this.chips.length > 0) {
      ghostLayer.style.left = `${chipLayer.scrollLeft}px`;
      ghostLayer.style.width = `calc(100% - ${chipLayer.scrollWidth}px)`;
    } else {
      ghostLayer.style.left = '0px';
      ghostLayer.style.width = '100%';
    }
  }

  /**
   * Get engine icon URL
   * @param {string} engineKey - Engine key
   * @returns {string} - Icon URL
   */
  getEngineIcon(engineKey) {
    const engineUrl = window.searchComponent.engines[engineKey]?.[0];
    if (!engineUrl) return '';

    try {
      const url = new URL(engineUrl.startsWith('http') ? engineUrl : 'https://' + engineUrl);
      return `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=16`;
    } catch (e) {
      return '';
    }
  }

  /**
   * Get active chips
   * @returns {Array} - Array of chip objects
   */
  getChips() {
    return this.chips;
  }
}

/**
 * InlineGhostRenderer - Simplified ghost text renderer using transparent text technique
 */
class InlineGhostRenderer {
  constructor(refs, chipManager) {
    this.refs = refs;
    this.chipManager = chipManager;
    this.currentSuggestion = '';
    this.userText = '';
  }

  /**
   * Render ghost suggestion using transparent text for user input + visible text for completion
   * @param {string} userText - Current user input
   * @param {string} suggestion - Full suggested text
   */
  renderSuggestion(userText, suggestion) {
    if (!suggestion || suggestion === userText || !suggestion.toLowerCase().startsWith(userText.toLowerCase())) {
      this.clearSuggestion();
      return;
    }

    this.currentSuggestion = suggestion;
    this.userText = userText;

    // Match input styles exactly for perfect alignment
    const input = window.searchComponent.refs.input;
    const inputStyles = getComputedStyle(input);

    this.refs.ghostLayer.style.fontSize = inputStyles.fontSize;
    this.refs.ghostLayer.style.fontFamily = inputStyles.fontFamily;
    this.refs.ghostLayer.style.fontWeight = inputStyles.fontWeight;
    this.refs.ghostLayer.style.letterSpacing = inputStyles.letterSpacing;
    this.refs.ghostLayer.style.lineHeight = inputStyles.lineHeight;
    this.refs.ghostLayer.style.paddingTop = inputStyles.paddingTop;
    this.refs.ghostLayer.style.paddingBottom = inputStyles.paddingBottom;
    this.refs.ghostLayer.style.paddingLeft = inputStyles.paddingLeft;
    this.refs.ghostLayer.style.paddingRight = inputStyles.paddingRight;

    // Use the elegant transparent text technique
    const invisiblePart = suggestion.substring(0, userText.length); // preserves original casing
    const visiblePart = suggestion.substring(userText.length);

    this.refs.ghostLayer.innerHTML = `<span class="autocomplete-invisible">${invisiblePart}</span>${visiblePart}`;
    this.refs.ghostLayer.style.display = 'block';
  }

  /**
   * Clear the ghost suggestion
   */
  clearSuggestion() {
    this.currentSuggestion = '';
    this.userText = '';
    this.refs.ghostLayer.style.display = 'none';
    this.refs.ghostLayer.innerHTML = '';
  }

  /**
   * Get current suggestion text
   * @returns {string}
   */
  getCurrentSuggestion() {
    return this.currentSuggestion;
  }

  /**
   * Get current user text
   * @returns {string}
   */
  getUserText() {
    return this.userText;
  }
}

/**
 * InlineAutocompleteController - Simplified controller using the elegant approach
 */
class InlineAutocompleteController {
  constructor(searchComponent, engine, chipManager, ghostRenderer) {
    this.searchComponent = searchComponent;
    this.engine = engine;
    this.chipManager = chipManager;
    this.ghostRenderer = ghostRenderer;
    this.isComposing = false;

    this.setupEventListeners();
  }

  setupEventListeners() {
    const input = this.searchComponent.refs.input;

    // Input event - API caching handles performance
    input.addEventListener('input', (e) => {
      if (this.isComposing) return;
      this.handleInput(e);
    });

    // IME composition events
    input.addEventListener('compositionstart', () => {
      this.isComposing = true;
      this.ghostRenderer.clearSuggestion();
    });

    input.addEventListener('compositionend', () => {
      this.isComposing = false;
      this.handleInput({ target: input });
    });

    // Keyboard events for acceptance/cancellation
    input.addEventListener('keydown', (e) => {
      this.handleKeydown(e);
    });
  }

  /**
   * Handle input changes
   */
  async handleInput(event) {
    const value = event.target.value;
    console.log('handleInput called with value:', value);
    try {
      const suggestion = await this.engine.findPrediction(value);
      console.log('Got suggestion:', suggestion);
      if (suggestion) {
        this.ghostRenderer.renderSuggestion(value, suggestion);
      } else {
        this.ghostRenderer.clearSuggestion();
      }
    } catch (error) {
      console.warn('Error fetching suggestions:', error);
      this.ghostRenderer.clearSuggestion();
    }
  }

  /**
   * Handle keyboard interactions
   */
  handleKeydown(event) {
    const { key } = event;
    const currentSuggestion = this.ghostRenderer.getCurrentSuggestion();

    if (!currentSuggestion) return;

    // Accept suggestion (Tab/Right Arrow just fill, Enter searches)
    if (key === 'Tab' || key === 'ArrowRight') {
      event.preventDefault();
      this.acceptSuggestion(false);
      return;
    }

    // Accept and search
    if (key === 'Enter') {
      event.preventDefault();
      this.acceptSuggestion(true);
      return;
    }

    // Cancel suggestion
    if (key === 'Escape') {
      this.ghostRenderer.clearSuggestion();
    }
  }

  /**
   * Accept the current suggestion
   * @param {boolean} shouldSearch - Whether to perform search after accepting
   */
  acceptSuggestion(shouldSearch = false) {
    const suggestion = this.ghostRenderer.getCurrentSuggestion();
    if (suggestion) {
      this.searchComponent.refs.input.value = suggestion;
      this.ghostRenderer.clearSuggestion();
      if (shouldSearch) {
        this.searchComponent.performSearch(suggestion);
      }
    }
  }
}

class Search extends Component {
  refs = {
    search: '#search',
    input: '#search input[type="text"]',
    inputContainer: '.search-input-container',
    chipLayer: '.inline-chip-layer',
    ghostLayer: '.inline-ghost-layer',
    engines: '.search-engines',
    engineTiles: '.engine-tiles',
    close: '.close'
  };

  constructor() {
    super();

    this.engines = CONFIG.search.engines;
    this.selectedEngine = 'g'; // Default to Google
    this.searchHistory = this.loadSearchHistory();
    this.userText = '';
    this.suggestionText = '';
    this.debounceTimer = null;
    this.proxyServerProcess = null;
  }

  style() {
    return `
        #search {
            position: absolute;
            display: flex;
            align-items: center;
            justify-content: center;
            width: calc(100% - 2px);
            height: 100%;
            background: rgb(24 24 29 / 80%);
            z-index: 99;
            visibility: hidden;
            top: -100%;
            backdrop-filter: blur(5px);
            transition: all .2s ease-in-out;
        }

        #search.active {
            top: 0;
            visibility: visible;
        }

        #search div {
            position: relative;
        }

        .search-input-container {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            width: 100%;
            padding: .5em 0;
        }

      .inline-autocomplete-container {
        display: flex;
        align-items: center;
        padding: 8px 16px;
        border-radius: 8px;
        border: 2px solid rgba(212, 190, 152, 0.2);
        background: rgba(40, 40, 40, 0.8);
        width: 100%;
        box-sizing: border-box;
      }

      .inline-autocomplete-container:focus-within {
        border-color: #d4be98;
      }

      .chip-ghost-wrapper {
        display: flex;
        align-items: center;
        flex: 1;
        position: relative;
        min-height: 48px;
        overflow: hidden;
      }

      .inline-chip-layer {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;
        max-width: 70%; /* responsive limit */
        overflow-x: auto;
        scrollbar-width: none;
        margin-right: 10px;
      }
      .inline-chip-layer::-webkit-scrollbar { display: none; }

      .inline-ghost-layer {
        position: absolute;
        left: 0;
        top: 0;
        color: rgba(212, 190, 152, 0.4);
        font: 500 22px 'Roboto', sans-serif;
        line-height: 48px;
        pointer-events: none;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        width: 100%;
        z-index: 1;
        display: none;
      }

      .autocomplete-invisible {
        color: #d4be98;
      }

      input[type="text"] {
        flex: 1;
        border: none;
        outline: none;
        background: transparent;
        font: 500 22px 'Roboto', sans-serif;
        line-height: 48px;
        color: #d4be98;
        min-width: 0;
        z-index: 2;
      }

      .inline-engine-chip {
        flex-shrink: 0;
        height: 32px;
        padding: 0 8px;
        display: flex;
        align-items: center;
        gap: 4px;
        border-radius: 16px;
        background: rgba(212, 190, 152, 0.2);
        border: 1px solid rgba(212, 190, 152, 0.3);
        font-size: 12px;
      }

      .inline-chip-icon {
        width: 15px;
        height: 15px;
        border-radius: 2px;
        flex-shrink: 0;
      }

      .inline-chip-text {
        flex-shrink: 0;
        fontSize: 12px;
        fontWeight: 500;
        color: #d4be98;
      }

      .inline-chip-remove {
        cursor: pointer;
        font-size: 14px;
        color: rgba(212, 190, 152, 0.6);
      }
      .inline-chip-remove:hover { color: #ea6962; }

        .search-suggestion-overlay {
            position: absolute;
            left: 0;
            top: 0;
            pointer-events: none;
            color: rgba(212, 190, 152, 0.4);
            font: 500 22px 'Roboto', sans-serif;
            letter-spacing: 1px;
            white-space: pre;
            z-index: 1;
            opacity: 0;
            transition: opacity 0.1s ease-in-out;
            visibility: hidden;
            /* Constrain overlay to input area only */
            width: calc(100% - 40px); /* Account for close button */
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .search-suggestion-overlay.visible {
            visibility: visible;
            opacity: 1;
        }

        .engine-chips {
            display: flex;
            align-items: center;
            gap: 8px;
            pointer-events: none;
            z-index: 10;
            margin-right: 8px;
        }

        .engine-chip {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 4px 8px;
            background: rgba(212, 190, 152, 0.2);
            border: 1px solid rgba(212, 190, 152, 0.3);
            border-radius: 8px;
            font-size: 11px;
            font-weight: 500;
            color: #d4be98;
            white-space: nowrap;
            width: fit-content;
            pointer-events: auto;
            height: 24px;
            box-sizing: border-box;
        }

        .engine-chip-icon {
            width: 10px;
            height: 10px;
            border-radius: 2px;
            flex-shrink: 0;
        }

        .engine-chip-remove {
            cursor: pointer;
            color: rgba(212, 190, 152, 0.6);
            font-size: 12px;
            line-height: 1;
            padding: 0 1px;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
        }

        .engine-chip-remove:hover {
            color: #ea6962;
        }

        #search input::selection {
            background: rgba(231, 138, 78, 0.3);
            color: #d4be98;
        }

        #search input::placeholder {
            color: rgba(212, 190, 152, 0.5);
        }

        #search .close {
            background: 0;
            border: 0;
            outline: 0;
            color: #d4be98;
            cursor: pointer;
            font-size: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 24px;
            height: 24px;
            margin-left: 8px;
            flex-shrink: 0;
        }

        #search .close:hover {
            filter: opacity(.5);
        }

        .search-engines {
            list-style: none;
            color: rgba(212, 190, 152, 0.5);
            display: flex;
            padding: 0;
            top: 50px;
            left: 0;
            margin: 1em 0 0 0;
        }

        .search-engines li p {
            cursor: default;
            transition: all .2s;
            font-size: 12px;
            font-family: 'Roboto', sans-serif;
        }

        .search-engines li {
            margin: 0 1em 0 0;
        }

        .search-engines li.active {
            color: #d4be98;
            font-weight: 700;
        }

        .engine-tiles {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 12px;
            margin: 1.5em 0 1em 0;
            max-width: 600px;
        }

        .engine-tile {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 12px 16px;
            background: rgba(212, 190, 152, 0.1);
            border: 2px solid rgba(212, 190, 152, 0.2);
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            font-family: 'Roboto', sans-serif;
            font-size: 14px;
            font-weight: 500;
            color: rgba(212, 190, 152, 0.7);
            text-align: center;
            min-height: 48px;
        }

        .engine-tile:hover {
            background: rgba(212, 190, 152, 0.15);
            border-color: rgba(212, 190, 152, 0.4);
            transform: translateY(-2px);
            color: #d4be98;
        }

        .engine-tile.active {
            background: rgba(212, 190, 152, 0.2);
            border-color: #d4be98;
            color: #d4be98;
            box-shadow: 0 0 0 2px rgba(212, 190, 152, 0.3);
        }

        .engine-tile-icon {
            margin-right: 8px;
            width: 16px;
            height: 16px;
            opacity: 0.8;
            border-radius: 2px;
        }

        @media (max-width: 480px) {
          input[type="text"], .inline-ghost-layer {
            font-size: 18px;
            line-height: 40px;
          }
          .inline-engine-chip { height: 28px; font-size: 11px; }
        }
      `;
  }

  imports() {
    return [
      this.resources.fonts.roboto,
      this.resources.icons.material
    ];
  }

  template() {
    return `
        <div id="search">
          <div>
            <div class="search-input-container">
              <div class="inline-autocomplete-container">
                <div class="chip-ghost-wrapper">
                  <div class="inline-chip-layer"></div>
                  <div class="inline-ghost-layer"></div>
                  <input type="text" spellcheck="false" placeholder="search" aria-autocomplete="inline" role="combobox" aria-expanded="false">
                </div>
                <button class="close"><i class="material-icons">&#xE5CD;</i></button>
              </div>
            </div>
            <div class="engine-tiles"></div>
            <ul class="search-engines"></ul>
          </div>
        </div>
    `;
  }

  loadEngines() {
    // Load text-based engine indicators (keep for backward compatibility)
    for (let key in this.engines)
      this.refs.engines.innerHTML += `<li><p title="${this.engines[key][1]}">!${key}</p></li>`;

    // Load clickable engine tiles
    this.refs.engineTiles.innerHTML = '';
    for (let key in this.engines) {
      const engine = this.engines[key];
      const isActive = key === this.selectedEngine;

      const tile = document.createElement('div');
      tile.className = `engine-tile ${isActive ? 'active' : ''}`;
      tile.dataset.engine = key;
      tile.innerHTML = `
          <img class="engine-tile-icon" src="${this.getEngineIcon(key)}" alt="${engine[1]} icon" onerror="this.style.display='none'">
          <span>${engine[1]}</span>
        `;
      tile.onclick = () => this.selectEngine(key);
      this.refs.engineTiles.appendChild(tile);
    }
  }

  getEngineIcon(engineKey) {
    const engineUrl = this.engines[engineKey]?.[0];
    if (!engineUrl) return '';

    try {
      const url = new URL(engineUrl.startsWith('http') ? engineUrl : 'https://' + engineUrl);
      // Use Google's favicon service which doesn't have CORS issues
      return `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=16`;
    } catch (e) {
      return '';
    }
  }

  selectEngine(engineKey) {
    // Clear existing chips first
    this.chipManager.clearChips();

    // Show chip for the selected engine
    this.chipManager.addChip(engineKey, this.engines[engineKey]);

    // Update selected engine
    this.selectedEngine = engineKey;

    // Update visual indicators
    this.updateActiveTiles();
    this.updateTextEngineIndicators(engineKey);
  }

  // Engine Chip Management
  removeInlineChip(engineKey) {
    this.chipManager.removeChip(engineKey);
    // Reset to default engine if no chips remain
    if (this.chipManager.getChips().length === 0) {
      this.selectedEngine = 'g';
      this.updateActiveTiles();
    }
  }

  clearEngineChips() {
    this.chipManager.clearChips();
    this.selectedEngine = 'g';
    this.updateActiveTiles();
  }

  updateInputPadding() {
    // No longer needed since chips are positioned inside the wrapper using flexbox
  }

  updateActiveTiles() {
    const tiles = this.refs.engineTiles.querySelectorAll('.engine-tile');
    tiles.forEach(tile => {
      const isActive = tile.dataset.engine === this.selectedEngine;
      tile.classList.toggle('active', isActive);
    });
  }

  updateTextEngineIndicators(selectedEngineKey) {
    // Update text-based engine indicators to highlight the selected engine
    this.refs.engines.childNodes.forEach(engineEl => {
      const engineText = engineEl.firstChild?.innerHTML;
      if (engineText === `!${selectedEngineKey}`) {
        engineEl.classList.add('active');
      } else {
        engineEl.classList.remove('active');
      }
    });
  }

  activate() {
    console.log('Activating search');
    this.startProxyServer();
    this.refs.search.classList.add('active');
    this.refs.input.scrollIntoView();
    setTimeout(() => {
      this.refs.input.focus();
      console.log('Search activated and focused');
    }, 100);
  }

  deactivate() {
    this.stopProxyServer();
    this.refs.search.classList.remove('active');
  }

  handleSearch(event) {
    const { target, key } = event;
    const fullValue = target.value;
    const query = fullValue.trim();

    // Handle engine prefix detection and chip creation
    this.handleEnginePrefix(fullValue, key);

    let args = query.split(' ');
    let prefix = args[0];
    let engine = this.engines[this.selectedEngine][0]; // Use selected engine from tiles

    // Update text-based engine indicators for backward compatibility
    this.refs.engines.childNodes.forEach(engineEl => {
      if (prefix === engineEl.firstChild.innerHTML)
        engineEl.classList.add('active');
      else
        engineEl.classList.remove('active');
    });

    // Only handle Enter for search (autocomplete controller handles Tab/ArrowRight)
    if (key === 'Enter') {
      const currentSuggestion = this.ghostRenderer.getCurrentSuggestion();
      if (currentSuggestion) {
        this.performSearch(currentSuggestion);
      } else {
        this.performSearch(query);
      }
    }

    if (key === 'Escape') {
      this.clearEngineChips();
      this.ghostRenderer.clearSuggestion();
      this.deactivate();
    }
  }

  handleBackdropClick(event) {
    // Close search if clicking on the backdrop (outside the input container)
    if (event.target === this.refs.search) {
      this.deactivate();
    }
  }

  handleEnginePrefix(value, key) {
    // Look for pattern like "!g " or "!da " at the beginning
    const engineMatch = value.match(/^!([a-zA-Z]+)\s/);
    if (engineMatch) {
      const engineKey = engineMatch[1].toLowerCase();
      if (this.engines[engineKey] && this.chipManager.getChips().find(chip => chip.key === engineKey) === undefined) {
        // Create chip for this engine
        this.chipManager.addChip(engineKey, this.engines[engineKey]);
        this.selectedEngine = engineKey;
        this.updateActiveTiles();
        // Remove the prefix from input
        this.refs.input.value = value.replace(/^!([a-zA-Z]+)\s/, '');
      }
    }

    // If backspace is pressed and input is empty, remove the last chip
    if (key === 'Backspace' && value === '' && this.chipManager.getChips().length > 0) {
      const lastChip = this.chipManager.getChips()[this.chipManager.getChips().length - 1];
      if (lastChip) {
        const engineKey = lastChip.key;
        this.removeInlineChip(engineKey);
      }
    }
  }



  performSearch(query) {
    const engineUrl = this.engines[this.selectedEngine][0];
    this.saveSearchToHistory(query);
    const finalUrl = engineUrl.replace('%s', encodeURIComponent(query));
    this.stopProxyServer();
    window.location = finalUrl;
  }

  setEvents() {
    // AutocompleteController handles input events, we just need keyboard events for search
    this.refs.search.onkeyup = (e) => this.handleSearch(e);
    this.refs.search.onclick = (e) => this.handleBackdropClick(e);
    this.refs.close.onclick = () => this.deactivate();
  }

  // Search History Management
  loadSearchHistory() {
    try {
      const saved = localStorage.getItem('tartarus-search-history');
      let history = saved ? JSON.parse(saved) : [];

      // Always include test data for demonstration (merge with existing history)
      const testData = [
        { query: 'github', timestamp: Date.now() - 1000 },
        { query: 'google', timestamp: Date.now() - 2000 },
        { query: 'stackoverflow', timestamp: Date.now() - 3000 },
        { query: 'javascript', timestamp: Date.now() - 4000 },
        { query: 'react', timestamp: Date.now() - 5000 },
        { query: 'python', timestamp: Date.now() - 6000 },
        { query: 'web development', timestamp: Date.now() - 7000 },
        { query: 'css', timestamp: Date.now() - 8000 }
      ];

      // Remove any existing test data to avoid duplicates
      history = history.filter(item => !testData.some(test => test.query === item.query));

      // Prepend test data to ensure it's available for demonstration
      history = [...testData, ...history];

      // Save the merged history
      localStorage.setItem('tartarus-search-history', JSON.stringify(history));

      return history;
    } catch (e) {
      console.warn('Failed to load search history:', e);
      return [];
    }
  }

  saveSearchToHistory(query) {
    if (!query.trim()) return;

    // Remove if already exists
    this.searchHistory = this.searchHistory.filter(item => item.query !== query);

    // Add to beginning
    this.searchHistory.unshift({
      query: query,
      timestamp: Date.now()
    });

    // Keep only last 50 searches
    this.searchHistory = this.searchHistory.slice(0, 50);

    try {
      localStorage.setItem('tartarus-search-history', JSON.stringify(this.searchHistory));
      // Update autocomplete engine with new data
      this.autocompleteController.updateDataSource(this.searchHistory);
    } catch (e) {
      console.warn('Failed to save search history:', e);
    }
  }



  /**
   * Check if proxy server is running
   * @returns {Promise<boolean>} - True if server is running
   */
  async isProxyServerRunning() {
    try {
      const response = await fetch('http://localhost:3001/api/health', {
        method: 'GET',
        signal: AbortSignal.timeout(2000) // 2 second timeout
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Start the proxy server if not already running
   */
  async startProxyServer() {
    const isRunning = await this.isProxyServerRunning();
    if (isRunning) {
      console.log('Proxy server is already running');
      return;
    }

    console.log('Proxy server is not running. Attempting to start it...');

    try {
      // Attempt to start the proxy server
      // Since we can't directly execute Node.js from browser, we'll try a workaround
      // This will attempt to start the server in the background
      const response = await fetch('http://localhost:3001/api/start-server', {
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });

      if (response.ok) {
        console.log('Proxy server started successfully');
      } else {
        throw new Error('Failed to start server via API');
      }
    } catch (error) {
      console.warn('Could not start proxy server automatically:', error);
      console.log('Please start the proxy server manually with: node proxy-server.js');

      // Show a user-friendly message
      this.showServerStartMessage();
    }
  }

  /**
   * Stop the proxy server
   */
  async stopProxyServer() {
    const isRunning = await this.isProxyServerRunning();
    if (!isRunning) {
      console.log('Proxy server is not running');
      return;
    }

    console.log('Search completed. You can stop the proxy server manually if needed.');
    // Note: In a browser environment, we cannot directly stop Node.js processes
    // The user needs to stop the proxy server externally
  }

  /**
   * Show a user-friendly message when proxy server fails to start
   */
  showServerStartMessage() {
    // Create a temporary notification overlay
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(40, 40, 40, 0.95);
      border: 1px solid #d4be98;
      border-radius: 8px;
      padding: 16px;
      color: #d4be98;
      font-family: 'Roboto', sans-serif;
      font-size: 14px;
      z-index: 1000;
      max-width: 300px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    `;

    notification.innerHTML = `
      <div style="font-weight: 500; margin-bottom: 8px;">Proxy Server Not Running</div>
      <div style="font-size: 12px; opacity: 0.8; margin-bottom: 12px;">
        Search suggestions require the proxy server. Starting it now...
      </div>
      <div style="font-size: 12px; font-family: monospace; background: rgba(0,0,0,0.3); padding: 8px; border-radius: 4px;">
        node proxy-server.js
      </div>
    `;

    document.body.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 5000);
  }

  connectedCallback() {
    // Make component globally accessible for inline event handlers
    window.searchComponent = this;

    this.render().then(() => {
      this.loadEngines();
      this.setEvents();

      // Initialize API client based on configuration
      const suggestionsConfig = CONFIG.search.suggestions || { provider: 'google', enabled: true };
      console.log('Search suggestions config:', suggestionsConfig);
      let apiClient = null;

      if (suggestionsConfig.enabled) {
        if (suggestionsConfig.provider === 'duckduckgo') {
          apiClient = new DuckDuckGoSuggestionsAPI();
          console.log('Using DuckDuckGo API client');
        } else {
          apiClient = new GoogleSuggestionsAPI(); // Default to Google
          console.log('Using Google API client');
        }
      } else {
        console.log('Search suggestions disabled');
      }

      // Initialize inline autocomplete modules after component is rendered
      this.autocompleteEngine = new InlineAutocompleteEngine(apiClient);
      this.chipManager = new InlineChipManager(this.refs);
      this.ghostRenderer = new InlineGhostRenderer(this.refs, this.chipManager);
      this.autocompleteController = new InlineAutocompleteController(this, this.autocompleteEngine, this.chipManager, this.ghostRenderer);
      console.log('Search component initialized');
    });
  }
}

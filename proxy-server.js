const express = require('express');
const cors = require('cors');
const https = require('https');

// Simple XML parser for Google suggestions
function parseGoogleXML(xmlString) {
  const suggestions = [];
  // Extract suggestions from XML format like:
  // <toplevel><CompleteSuggestion><suggestion data="suggestion text"/></CompleteSuggestion></toplevel>
  const suggestionMatches = xmlString.match(/data="([^"]*)"/g);
  if (suggestionMatches) {
    suggestionMatches.forEach(match => {
      const suggestion = match.match(/data="([^"]*)"/)[1];
      if (suggestion) suggestions.push(suggestion);
    });
  }
  return suggestions;
}

const app = express();
const PORT = 3001;

// Enable CORS for all routes
app.use(cors({
  origin: true, // Allow all origins for testing
  credentials: true
}));

// Google Suggest API proxy
app.get('/api/google-suggest', (req, res) => {
  const query = req.query.q || '';
  const url = `https://suggestqueries.google.com/complete/search?client=toolbar&hl=en&q=${encodeURIComponent(query)}`;

  console.log('Proxying Google request:', url);

  https.get(url, (apiRes) => {
    let data = '';

    apiRes.on('data', (chunk) => {
      data += chunk;
    });

    apiRes.on('end', () => {
      try {
        console.log('Google raw response:', data.substring(0, 200) + '...');

        // Try JSON first (some Google endpoints return JSON)
        try {
          const parsedData = JSON.parse(data);
          console.log('Google JSON response:', parsedData);

          // Google returns: ["query", ["suggestion1", "suggestion2", ...], [...], [...], {...}]
          const suggestions = Array.isArray(parsedData) && Array.isArray(parsedData[1]) ? parsedData[1] : [];

          res.json({
            success: true,
            suggestions: suggestions,
            provider: 'google'
          });
        } catch (jsonError) {
          // If JSON parsing fails, try XML parsing
          console.log('JSON parsing failed, trying XML parsing');
          const suggestions = parseGoogleXML(data);
          console.log('Google XML parsed suggestions:', suggestions);

          res.json({
            success: true,
            suggestions: suggestions,
            provider: 'google'
          });
        }
      } catch (error) {
        console.error('Error parsing Google response:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to parse Google response',
          suggestions: []
        });
      }
    });
  }).on('error', (error) => {
    console.error('Google API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch Google suggestions',
      suggestions: []
    });
  });
});

// DuckDuckGo API proxy
app.get('/api/duckduckgo-suggest', (req, res) => {
  const query = req.query.q || '';
  const url = `https://duckduckgo.com/ac/?q=${encodeURIComponent(query)}&type=list`;

  console.log('Proxying DuckDuckGo request:', url);

  https.get(url, (apiRes) => {
    let data = '';

    apiRes.on('data', (chunk) => {
      data += chunk;
    });

    apiRes.on('end', () => {
      try {
        const parsedData = JSON.parse(data);
        console.log('DuckDuckGo response:', parsedData);

        // DuckDuckGo returns: [{"phrase": "suggestion1"}, {"phrase": "suggestion2"}, ...]
        const suggestions = Array.isArray(parsedData) ? parsedData.map(item => item.phrase).filter(Boolean) : [];

        res.json({
          success: true,
          suggestions: suggestions,
          provider: 'duckduckgo'
        });
      } catch (error) {
        console.error('Error parsing DuckDuckGo response:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to parse DuckDuckGo response',
          suggestions: []
        });
      }
    });
  }).on('error', (error) => {
    console.error('DuckDuckGo API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch DuckDuckGo suggestions',
      suggestions: []
    });
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Search suggestions proxy server is running',
    timestamp: new Date().toISOString()
  });
});

// Auto-start endpoint for browser integration
app.get('/api/start-server', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Server is already running - this endpoint is for future auto-start functionality',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Search Suggestions Proxy Server running on http://localhost:${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔍 Google endpoint: http://localhost:${PORT}/api/google-suggest?q=yourquery`);
  console.log(`🦆 DuckDuckGo endpoint: http://localhost:${PORT}/api/duckduckgo-suggest?q=yourquery`);
});

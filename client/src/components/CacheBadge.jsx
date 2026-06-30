import React from 'react';
import Badge from './Badge';

// Surfaces the cache-vs-live-vs-mock signal from the server's response meta.
// This is intentionally visible — it's the whole engineering lesson of CricLive.
const CacheBadge = ({ meta }) => {
  if (!meta) return null;
  const { source, mockMode, fallback } = meta;

  if (mockMode || source === 'mock') {
    return (
      <Badge tone="gold" title="No API key — serving deterministic mock data.">
        {fallback ? 'Mock (fallback)' : 'Mock mode'}
      </Badge>
    );
  }
  if (source === 'cache') {
    return (
      <Badge tone="pitch" title="Served instantly from the in-process cache.">
        Cache hit
      </Badge>
    );
  }
  if (source === 'live') {
    return (
      <Badge tone="brand" title="Fresh upstream fetch — cached for next time.">
        Live fetch
      </Badge>
    );
  }
  return null;
};

export default CacheBadge;

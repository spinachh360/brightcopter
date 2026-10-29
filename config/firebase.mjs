// Firebase serves the prerendered route directories directly. A wildcard SPA
// rewrite would turn unknown product URLs into misleading successful responses.
export function firebaseHostingConfig(security, site) {
  return {
    hosting: {
      ...(site ? {site} : {}),
      public: 'dist',
      ignore: ['firebase.json', '**/.*', '**/node_modules/**', '_headers', '_redirects'],
      cleanUrls: true,
      trailingSlash: false,
      predeploy: ['node scripts/firebase.mjs verify'],
      redirects: [
        {source: '/policies/terms', destination: '/terms-and-conditions', type: 301},
        {source: '/policies/returns', destination: '/return-policy', type: 301},
      ],
      headers: [
        {source: '**', headers: Object.entries({...security, 'Cache-Control': 'no-cache'}).map(([key, value]) => ({key, value}))},
        {source: '/assets/**', headers: [{key: 'Cache-Control', value: 'public, max-age=31536000, immutable'}]},
      ],
    },
    emulators: {hosting: {host: '127.0.0.1', port: 5000}, ui: {enabled: false}},
  };
}

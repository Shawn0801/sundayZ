import { defineConfig } from 'vite';

export default defineConfig({
  optimizeDeps: {
    exclude: [
      'primeng',
      'primeicons',
      '@primeuix/themes'
    ],
    include: [
      'd3',
      'leaflet',
      'topojson-client',
      'chart.js',
      'chart.js/auto'
    ]
  },
  server: {
    fs: {
      strict: false
    }
  },
  cacheDir: '.angular/cache/vite'
});

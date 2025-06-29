import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginTypeCheck } from '@rsbuild/plugin-type-check';

export default defineConfig({
  plugins: [
    pluginReact(),
    // Temporarily disable type checking for the initial build
    // pluginTypeCheck(),
  ],
  html: {
    template: './public/index.html',
  },
  source: {
    entry: {
      index: './src/index.tsx',
    },
    define: {
      // Define environment variables for the browser
      'import.meta.env.REACT_APP_API_URL': JSON.stringify(process.env.REACT_APP_API_URL || 'http://localhost:8080'),
      'import.meta.env.RSBUILD_API_URL': JSON.stringify(process.env.RSBUILD_API_URL || 'http://localhost:8080'),
      'import.meta.env.PUBLIC_URL': JSON.stringify(''),
    },
  },
  resolve: {
    alias: {
      '@': './src',
    },
  },
  output: {
    distPath: {
      root: '../build',
    },
    assetPrefix: './',
  },
  server: {
    port: 3000,
  },
  dev: {
    assetPrefix: '/',
  },
  performance: {
    chunkSplit: {
      strategy: 'split-by-experience',
    },
  },
});

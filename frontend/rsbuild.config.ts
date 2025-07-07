import { defineConfig } from '@rsbuild/core';

export default defineConfig({
  html: {
    template: './public/index.html',
  },
  source: {
    entry: {
      index: './src/index.tsx',
    },
    define: {
      // Define environment variables for the browser
      'import.meta.env.APP_API_URL': JSON.stringify(process.env.APP_API_URL || 'http://localhost:8080'),
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
  tools: {
    rspack: {
      resolve: {
        conditionNames: ['solid', 'browser', 'import', 'module', 'default'],
      },
      module: {
        rules: [
          {
            test: /\.(jsx|tsx)$/,
            exclude: /node_modules\/(?!@suid)/,
            use: [
              {
                loader: 'babel-loader',
                options: {
                  presets: [
                    ['solid', { generate: 'dom', hydratable: false }],
                    '@babel/preset-typescript'
                  ]
                }
              }
            ]
          }
        ]
      }
    }
  },
});

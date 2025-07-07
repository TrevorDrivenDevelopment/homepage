#!/usr/bin/env bun
/**
 * Frontend development with backend integration
 * Assumes backend is running on localhost:8080
 */

import { spawn } from 'child_process';

const FRONTEND_PORT = 3000;
const BACKEND_PORT = 8080;

console.log('🎨 Starting frontend development server with backend integration...\n');

// Start frontend development server with backend API configured
const frontend = spawn('bun', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    APP_API_URL: `http://localhost:${BACKEND_PORT}`,
    RSBUILD_API_URL: `http://localhost:${BACKEND_PORT}`,
  },
});

// Handle cleanup on exit
const cleanup = () => {
  console.log('\n🛑 Shutting down frontend server...');
  frontend.kill();
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

console.log(`\n🌐 Frontend available at: http://localhost:${FRONTEND_PORT}`);
console.log(`📡 Backend expected at: http://localhost:${BACKEND_PORT}`);
console.log('\n💡 Press Ctrl+C to stop the frontend server\n');

#!/usr/bin/env bun
/**
 * Full-stack development setup script
 * Runs both frontend (RSBuild) and backend (Bun) in development mode
 */

import { spawn } from 'child_process';
import path from 'path';

const FRONTEND_PORT = 3000;
const BACKEND_PORT = 8080;

console.log('🚀 Starting full-stack development environment...\n');

// Start backend development server
console.log('📡 Starting backend API server...');
const backend = spawn('bun', ['run', 'dev'], {
  cwd: path.join(process.cwd(), 'backend'),
  stdio: 'inherit',
  shell: true,
});

// Wait a moment for backend to start
setTimeout(() => {
  // Start frontend development server
  console.log('🎨 Starting frontend development server...');
  const frontend = spawn('bun', ['run', 'dev'], {
    cwd: path.join(process.cwd(), 'frontend'),
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
    console.log('\n🛑 Shutting down development servers...');
    backend.kill();
    frontend.kill();
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  frontend.on('close', (code) => {
    if (code !== null) {
      console.log(`Frontend exited with code ${code}`);
      backend.kill();
    }
  });

  backend.on('close', (code) => {
    if (code !== null) {
      console.log(`Backend exited with code ${code}`);
      frontend.kill();
    }
  });
}, 2000);

console.log(`\n🌐 Frontend will be available at: http://localhost:${FRONTEND_PORT}`);
console.log(`📡 Backend API available at: http://localhost:${BACKEND_PORT}`);
console.log('\n💡 Press Ctrl+C to stop both servers\n');

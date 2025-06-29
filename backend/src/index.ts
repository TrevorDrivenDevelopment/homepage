#!/usr/bin/env bun

/**
 * Development server entry point for backend API
 * This allows local development with Bun while maintaining AWS Lambda compatibility
 */

import { createServer } from 'http';
import { handler as healthHandler } from './handlers/health';
import { handler as optionsHandler } from './handlers/options';
import { handler as calculatorHandler } from './handlers/calculator';
import { handler as portfolioHandler } from './handlers/portfolio';

const PORT = process.env.PORT || 8080;

// Simple router for local development
const routes = {
  '/api/health': healthHandler,
  '/api/options/stock': optionsHandler,
  '/api/options/chain': optionsHandler,
  '/api/calculator/options': calculatorHandler,
  '/api/portfolio/analyze': portfolioHandler,
  '/api/portfolio/risk-metrics': portfolioHandler,
};

// Mock API Gateway event for local development
function createMockEvent(req: any): any {
  const url = new URL(req.url || '', `http://localhost:${PORT}`);
  
  return {
    httpMethod: req.method,
    path: url.pathname,
    pathParameters: extractPathParameters(url.pathname),
    queryStringParameters: Object.fromEntries(url.searchParams),
    headers: req.headers,
    body: null,
    isBase64Encoded: false,
    requestContext: {
      requestId: Date.now().toString(),
      httpMethod: req.method,
      path: url.pathname,
    },
  };
}

function extractPathParameters(path: string): Record<string, string> | null {
  // Extract {symbol} from paths like /api/options/stock/AAPL
  const stockMatch = path.match(/\/api\/options\/stock\/(.+)/);
  if (stockMatch && stockMatch[1]) {
    return { symbol: stockMatch[1] };
  }
  
  const chainMatch = path.match(/\/api\/options\/chain\/(.+)/);
  if (chainMatch && chainMatch[1]) {
    return { symbol: chainMatch[1] };
  }
  
  return null;
}

const server = createServer(async (req, res) => {
  // Enable CORS for local development
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = new URL(req.url || '', `http://localhost:${PORT}`);
  let handler = null;
  
  // Find matching route
  for (const [route, routeHandler] of Object.entries(routes)) {
    if (url.pathname.startsWith(route)) {
      handler = routeHandler;
      break;
    }
  }
  
  if (!handler) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
    return;
  }
  
  try {
    // Read request body for POST requests
    let body = '';
    if (req.method === 'POST') {
      for await (const chunk of req) {
        body += chunk;
      }
    }
    
    const mockEvent = createMockEvent(req);
    if (body) {
      mockEvent.body = body;
    }
    
    const result = await handler(mockEvent);
    
    res.writeHead(result.statusCode, {
      'Content-Type': 'application/json',
      ...result.headers,
    });
    res.end(result.body);
  } catch (error) {
    console.error('Handler error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal Server Error' }));
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Backend development server running on http://localhost:${PORT}`);
  console.log('📡 Available endpoints:');
  console.log('  - GET  /api/health');
  console.log('  - GET  /api/options/stock/{symbol}');
  console.log('  - GET  /api/options/chain/{symbol}');
  console.log('  - POST /api/calculator/options');
  console.log('  - POST /api/portfolio/analyze');
  console.log('  - GET  /api/portfolio/risk-metrics');
  console.log('\n💡 Use Ctrl+C to stop the server');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down development server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

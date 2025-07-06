/**
 * Environment configuration for local development
 * Only loads .env files when running locally, not in AWS Lambda
 */

import { config } from 'dotenv';

// Only load dotenv in local development (not in AWS Lambda environment)
if (!process.env.AWS_LAMBDA_FUNCTION_NAME && !process.env.AWS_EXECUTION_ENV) {
  try {
    // Load .env.local first (for user-specific overrides)
    config({ path: '.env.local' });
    
    // Then load .env (for defaults)
    config({ path: '.env' });
    
    console.log('🔧 Loaded environment variables from .env files');
    console.log('🔑 Environment variables configured:');
    console.log(`   - ALPHA_VANTAGE_API_KEY: ${process.env.ALPHA_VANTAGE_API_KEY ? '✅ Set' : '❌ Missing'}`);
    console.log(`   - NODE_ENV: ${process.env.NODE_ENV || 'undefined'}`);
    console.log(`   - PORT: ${process.env.PORT || 'undefined'}`);
    console.log(`   - CORS_ORIGIN: ${process.env.CORS_ORIGIN || 'undefined'}`);
  } catch (error) {
    console.warn('⚠️  Could not load dotenv:', error);
  }
} else {
  console.log('☁️  Running in AWS Lambda - using environment variables from AWS');
}

export {};

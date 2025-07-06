# Backend Environment Configuration

## Local Development Setup

For local development, the backend uses environment variables loaded from `.env` files. This allows you to configure API keys and other settings without modifying the source code.

### Quick Setup

1. **Copy the environment template:**
   ```bash
   cp .env .env.local
   ```

2. **Edit `.env.local` with your actual API keys:**
   ```bash
   # Alpha Vantage API Key for stock market data
   ALPHA_VANTAGE_API_KEY=your_actual_api_key_here
   
   # Other optional API keys
   # POLYGON_API_KEY=your_polygon_key
   # IEX_CLOUD_API_KEY=your_iex_key
   # MARKET_DATA_API_KEY=your_market_data_key
   ```

3. **Start the development server:**
   ```bash
   bun run dev
   ```

### Environment Files

- **`.env`** - Default values and documentation (committed to git)
- **`.env.local`** - Your personal API keys and overrides (ignored by git)

The `.env.local` file takes precedence over `.env`, so you can override any default values.

### Required Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `ALPHA_VANTAGE_API_KEY` | Alpha Vantage API key for stock data | Yes |
| `NODE_ENV` | Environment mode (development/production) | No |
| `PORT` | Local development server port | No (default: 8080) |
| `CORS_ORIGIN` | CORS origin for local dev | No (default: *) |

### Getting API Keys

1. **Alpha Vantage** (Free tier available):
   - Visit: https://www.alphavantage.co/support/#api-key
   - Sign up for a free account
   - Copy your API key to `.env.local`

### Production Deployment

**Important:** Environment variables are **NOT** loaded from `.env` files in production/AWS Lambda. They are configured through AWS environment variables in the CDK stack.

The environment loading only happens during local development when:
- `AWS_LAMBDA_FUNCTION_NAME` is not set
- `AWS_EXECUTION_ENV` is not set

This ensures your `.env` files are only used locally and don't interfere with AWS Lambda execution.

### Troubleshooting

If you see environment variable errors:

1. **Check your `.env.local` file exists and has the correct values**
2. **Verify the API key format** (no extra spaces or quotes)
3. **Restart the development server** after changing environment variables
4. **Check the console output** for environment variable status when starting the server

The development server will show you which environment variables are configured when it starts:

```
🔧 Loaded environment variables from .env files
🔑 Environment variables configured:
   - ALPHA_VANTAGE_API_KEY: ✅ Set
   - NODE_ENV: development
   - PORT: 8080
   - CORS_ORIGIN: *
```

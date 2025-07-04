import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Alert,
} from '@mui/material';

interface ApiDocumentationProps {
  showApiConfig: boolean;
  useManualData: boolean;
}

export const ApiDocumentation: React.FC<ApiDocumentationProps> = ({
  showApiConfig,
  useManualData,
}) => {
  const shouldShow = !useManualData && showApiConfig;
  
  if (!shouldShow) return null;

  return (
    <Card id="api-help" sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          OpenAPI 3.0 Specification
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          Your API endpoints must comply with the following OpenAPI 3.0 specification:
        </Typography>

        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', fontSize: '0.8rem' }}>
{`openapi: 3.0.3
info:
  title: Options Calculator API
  version: 1.0.0
  description: API endpoints required for live options data
servers:
  - url: https://your-api.com/api
security:
  - ApiKeyAuth: []
paths:
  /options/stock/{symbol}:
    get:
      summary: Get stock quote
      security:
        - ApiKeyAuth: []
      parameters:
        - name: symbol
          in: path
          required: true
          schema:
            type: string
            example: AAPL
      responses:
        '200':
          description: Current stock quote wrapped in API response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/StockQuoteResponse'
  /options/chain/{symbol}:
    get:
      summary: Get options chain
      security:
        - ApiKeyAuth: []
      parameters:
        - name: symbol
          in: path
          required: true
          schema:
            type: string
            example: AAPL
      responses:
        '200':
          description: Options chain data wrapped in API response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/OptionsChainResponse'
components:
  securitySchemes:
    ApiKeyAuth:
      type: apiKey
      in: header
      name: X-API-Key
  schemas:
    StockQuoteResponse:
      type: object
      required:
        - success
        - timestamp
      properties:
        success:
          type: boolean
          example: true
        data:
          $ref: '#/components/schemas/StockQuote'
        error:
          type: string
          description: Error message if success is false
        timestamp:
          type: string
          format: date-time
          example: "2025-07-04T17:14:44.620Z"
    OptionsChainResponse:
      type: object
      required:
        - success
        - timestamp
      properties:
        success:
          type: boolean
          example: true
        data:
          $ref: '#/components/schemas/OptionsChainData'
        error:
          type: string
          description: Error message if success is false
        timestamp:
          type: string
          format: date-time
          example: "2025-07-04T17:14:44.620Z"
    StockQuote:
      type: object
      required:
        - symbol
        - price
      properties:
        symbol:
          type: string
          example: AAPL
        price:
          type: number
          format: float
          example: 213.55
        change:
          type: number
          format: float
          example: 2.30
          description: Optional - price change from previous close
        changePercent:
          type: string
          example: "1.33%"
          description: Optional - percentage change as formatted string
        lastUpdated:
          type: string
          format: date-time
          example: "2025-07-04T17:14:44.620Z"
          description: Optional - when the quote was last updated
        currency:
          type: string
          example: "USD"
          description: Optional - currency code
    OptionsChainData:
      type: object
      required:
        - symbol
        - stockPrice
        - calls
        - puts
        - expirationDates
      properties:
        symbol:
          type: string
          example: AAPL
        stockPrice:
          type: number
          format: float
          example: 213.55
        calls:
          type: array
          items:
            $ref: '#/components/schemas/OptionQuote'
        puts:
          type: array
          items:
            $ref: '#/components/schemas/OptionQuote'
        expirationDates:
          type: array
          items:
            type: string
            format: date
            example: "2025-07-11"
    OptionQuote:
      type: object
      required:
        - symbol
        - strike
        - expiration
        - bid
        - ask
        - volume
        - openInterest
        - type
      properties:
        symbol:
          type: string
          example: AAPL20250711C21500
        strike:
          type: number
          format: float
          example: 215.00
        expiration:
          type: string
          format: date
          example: "2025-07-11"
        bid:
          type: number
          format: float
          example: 7.08
        ask:
          type: number
          format: float
          example: 7.79
        volume:
          type: integer
          example: 573
        openInterest:
          type: integer
          example: 3884
        type:
          type: string
          enum: [call, put]
          example: call
        impliedVolatility:
          type: number
          format: float
          example: 0.278
          description: Optional - decimal form (0.278 = 27.8%)`}
          </Typography>
        </Alert>

        <Typography variant="subtitle2" gutterBottom>
          Implementation Notes:
        </Typography>
        <Alert severity="success" sx={{ mb: 2 }}>
          <Typography variant="body2">
            • Replace <code>{'{symbol}'}</code> in your endpoint URLs with the actual stock symbol<br/>
            • All responses are wrapped in an ApiResponse object with success, data, error, and timestamp fields<br/>
            • Stock quotes return the data directly in the data field<br/>
            • Options chains return an object with calls, puts, and other metadata (not a flat array)<br/>
            • Ensure proper CORS headers are included<br/>
            • Use HTTPS for production deployments<br/>
            • API key authentication is required via X-API-Key header<br/>
            • The type field is required for options (call or put)<br/>
            • The impliedVolatility field is optional but recommended
          </Typography>
        </Alert>

        <Typography variant="subtitle2" gutterBottom>
          Sample Implementation (AWS Lambda + API Gateway):
        </Typography>
        <Alert severity="warning">
          <Typography variant="body2">
            A complete example with AWS CDK, github actions, and lambda function are available at: 
            <code>https://github.com/TrevorDrivenDevelopment/homepage/tree/main/backend</code>
          </Typography>
        </Alert>
      </CardContent>
    </Card>
  );
};

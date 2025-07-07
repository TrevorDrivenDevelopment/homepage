import { createSignal, Show } from 'solid-js';

interface ApiDocumentationProps {
  showApiConfig: boolean;
  useManualData: boolean;
  onToggle?: () => void;
}

export const ApiDocumentation = (props: ApiDocumentationProps) => {
  const [isExpanded, setIsExpanded] = createSignal(false);
  
  return (
    <Show when={!props.useManualData && props.showApiConfig}>
      <div id="api-help" style={{ 
        "margin-bottom": "24px",
        border: "1px solid #4A6E8D",
        "border-radius": "4px",
        "box-shadow": "0 1px 3px rgba(0,0,0,0.12)",
        "background-color": "#4A6E8D"
      }}>
        <div style={{ padding: "16px" }}>
          <div style={{ 
            display: "flex", 
            "align-items": "center", 
            "justify-content": "space-between", 
            "margin-bottom": "16px" 
          }}>
            <h3 style={{ 
              margin: "0",
              "font-size": "1.25rem",
              "font-weight": "500",
              color: "#ffffff"
            }}>
              API Documentation
            </h3>
            <button
              onClick={() => setIsExpanded(!isExpanded())}
              style={{
                background: "none",
                border: "1px solid #7CE2FF",
                color: "#7CE2FF",
                padding: "6px 16px",
                "border-radius": "4px",
                cursor: "pointer",
                "font-size": "0.875rem",
                display: "flex",
                "align-items": "center",
                gap: "8px"
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0L19.2 12l-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
              </svg>
              {isExpanded() ? 'Hide' : 'Show'} OpenAPI Spec
            </button>
          </div>
          
          <div style={{ 
            "background-color": "#e3f2fd",
            border: "1px solid #2196f3",
            "border-radius": "4px",
            padding: "12px",
            "margin-bottom": "16px"
          }}>
            <p style={{ 
              margin: "0",
              "font-size": "0.875rem",
              color: "#1565c0"
            }}>
              Your API endpoints must comply with the OpenAPI 3.0 specification below. 
              The backend will call these endpoints to fetch real market data.
            </p>
          </div>

          <div style={{
            border: "1px solid #e0e0e0",
            "border-radius": "4px"
          }}>
            <button
              onClick={() => setIsExpanded(!isExpanded())}
              style={{
                width: "100%",
                background: "none",
                border: "none",
                padding: "16px",
                cursor: "pointer",
                "text-align": "left",
                display: "flex",
                "justify-content": "space-between",
                "align-items": "center"
              }}
            >
              <h4 style={{ 
                margin: "0",
                "font-size": "1rem",
                "font-weight": "500"
              }}>
                OpenAPI 3.0 Specification
              </h4>
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="currentColor"
                style={{
                  transform: isExpanded() ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s"
                }}
              >
                <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/>
              </svg>
            </button>
            
            <Show when={isExpanded()}>
              <div style={{ padding: "0 16px 16px 16px" }}>
                <div style={{ 
                  "background-color": "#e3f2fd",
                  border: "1px solid #2196f3",
                  "border-radius": "4px",
                  padding: "12px",
                  "margin-bottom": "16px"
                }}>
                  <pre style={{ 
                    margin: "0",
                    "font-family": "monospace", 
                    "white-space": "pre-wrap", 
                    "font-size": "0.8rem",
                    color: "#1565c0"
                  }}>
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
      summary: Get stock quote with 52-week range
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
      summary: Get options chain (filtered to exclude expired options)
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
          description: Options chain data wrapped in API response (expired options filtered out)
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
          example: "2026-01-07T17:14:44.620Z"
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
          example: "2026-01-07T17:14:44.620Z"
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
          example: "2026-01-07T17:14:44.620Z"
          description: Optional - when the quote was last updated
        currency:
          type: string
          example: "USD"
          description: Optional - currency code
        week52High:
          type: number
          format: float
          example: 237.49
          description: Optional - 52-week high price
        week52Low:
          type: number
          format: float
          example: 164.08
          description: Optional - 52-week low price
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
            example: "2026-01-17"
          description: Array of available expiration dates (expired dates filtered out)
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
          example: AAPL20260117C21500
        strike:
          type: number
          format: float
          example: 215.00
        expiration:
          type: string
          format: date
          example: "2026-01-17"
          description: Must be a future date (expired options filtered out)
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
                  </pre>
                </div>

                <h5 style={{ 
                  margin: "16px 0 8px 0",
                  "font-size": "0.875rem",
                  "font-weight": "500"
                }}>
                  Implementation Notes:
                </h5>
                <div style={{ 
                  "background-color": "#e8f5e8",
                  border: "1px solid #4caf50",
                  "border-radius": "4px",
                  padding: "12px",
                  "margin-bottom": "16px"
                }}>
                  <p style={{ 
                    margin: "0",
                    "font-size": "0.875rem",
                    color: "#2e7d32",
                    "line-height": "1.6"
                  }}>
                    • Replace <code style={{ "background-color": "#f5f5f5", padding: "2px 4px", "border-radius": "2px" }}>{'{symbol}'}</code> in your endpoint URLs with the actual stock symbol<br/>
                    • All responses are wrapped in an ApiResponse object with success, data, error, and timestamp fields<br/>
                    • Stock quotes now include week52High and week52Low fields for 52-week range display<br/>
                    • Options chains return an object with calls, puts, and other metadata (not a flat array)<br/>
                    • Options are automatically filtered to exclude expired contracts<br/>
                    • Ensure proper CORS headers are included<br/>
                    • Use HTTPS for production deployments<br/>
                    • API key authentication is required via X-API-Key header<br/>
                    • The type field is required for options (call or put)<br/>
                    • The impliedVolatility field is optional but recommended
                  </p>
                </div>

                <h5 style={{ 
                  margin: "16px 0 8px 0",
                  "font-size": "0.875rem",
                  "font-weight": "500"
                }}>
                  Sample Implementation (AWS Lambda + API Gateway):
                </h5>
                <div style={{ 
                  "background-color": "#fff3e0",
                  border: "1px solid #ff9800",
                  "border-radius": "4px",
                  padding: "12px"
                }}>
                  <p style={{ 
                    margin: "0",
                    "font-size": "0.875rem",
                    color: "#e65100"
                  }}>
                    A complete example with AWS CDK, github actions, and lambda function are available at: 
                    <code style={{ "background-color": "#f5f5f5", padding: "2px 4px", "border-radius": "2px" }}>
                      https://github.com/TrevorDrivenDevelopment/homepage/tree/main/backend
                    </code>
                  </p>
                </div>
              </div>
            </Show>
          </div>
        </div>
      </div>
    </Show>
  );
};

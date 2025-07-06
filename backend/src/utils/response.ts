import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

export const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Content-Type': 'application/json',
};

export function createResponse(
  statusCode: number,
  body: unknown,
  additionalHeaders?: Record<string, string>
): APIGatewayProxyResult {
  return {
    statusCode,
    headers: {
      ...corsHeaders,
      ...additionalHeaders,
    },
    body: JSON.stringify(body),
  };
}

export function createErrorResponse(
  statusCode: number,
  message: string,
  error?: unknown
): APIGatewayProxyResult {
  console.error('API Error:', { statusCode, message, error });
  
  interface ErrorResponseBody {
    success: false;
    error: string;
    timestamp: string;
    details?: string;
  }

  const responseBody: ErrorResponseBody = {
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
  };

  if (process.env.NODE_ENV === 'dev' && error) {
    responseBody.details = error instanceof Error ? error.message : String(error);
  }

  return createResponse(statusCode, responseBody);
}

export function createSuccessResponse<T>(
  data: T,
  additionalHeaders?: Record<string, string>
): APIGatewayProxyResult {
  return createResponse(200, {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  }, additionalHeaders);
}

export function getPathParameter(
  event: APIGatewayProxyEvent,
  paramName: string
): string | null {
  return event.pathParameters?.[paramName] || null;
}

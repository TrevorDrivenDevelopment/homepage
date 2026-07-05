import { describe, expect, test } from 'bun:test';
import { handler } from './calculator';
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

function makeEvent(overrides: Partial<APIGatewayProxyEvent> = {}): APIGatewayProxyEvent {
  return {
    httpMethod: 'POST',
    path: '/api/calculator/calculate',
    body: null,
    headers: {},
    multiValueHeaders: {},
    isBase64Encoded: false,
    pathParameters: null,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {} as APIGatewayProxyEvent['requestContext'],
    resource: '',
    ...overrides,
  } as APIGatewayProxyEvent;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseBody(result: APIGatewayProxyResult): Record<string, any> {
  return JSON.parse(result.body);
}

describe('calculator handler', () => {
  test('handles CORS preflight', async () => {
    const result = await handler(makeEvent({ httpMethod: 'OPTIONS' }));
    expect(result.statusCode).toBe(200);
  });

  test('returns 404 for unknown endpoint', async () => {
    const result = await handler(makeEvent({ path: '/api/calculator/unknown' }));
    expect(result.statusCode).toBe(404);
  });

  test('returns 400 when body is missing', async () => {
    const result = await handler(makeEvent({ body: null }));
    expect(result.statusCode).toBe(400);
  });

  test('validates required fields', async () => {
    const result = await handler(
      makeEvent({
        body: JSON.stringify({
          securityPrice: 0,
          investmentAmount: 1000,
          options: [{ strike: 100, bid: 1, ask: 1.2 }],
          percentageIncrements: [10],
        }),
      })
    );
    expect(result.statusCode).toBe(400);
    const body = parseBody(result);
    expect(body.error).toMatch(/Security price/);
  });

  test('calculates option returns correctly for a simple profitable scenario', async () => {
    const result = await handler(
      makeEvent({
        body: JSON.stringify({
          securityPrice: 100,
          investmentAmount: 1000,
          options: [{ strike: 100, bid: 1.0, ask: 1.0 }],
          percentageIncrements: [10],
        }),
      })
    );

    expect(result.statusCode).toBe(200);
    const body = parseBody(result);
    expect(body.success).toBe(true);

    // sellPrice = 100 * 1.10 = 110
    expect(body.data.sellPrices).toEqual([110]);

    const resultsAt110 = body.data.resultsByPrice['110'];
    expect(resultsAt110).toBeDefined();
    expect(resultsAt110.length).toBe(1);

    const optionResult = resultsAt110[0];
    // optionPrice = midpoint of 1.0/1.0 = 1.0, cost per contract = 100
    // contracts = floor(1000 / 100) = 10, shares = 1000, actualInvestment = 1000
    expect(optionResult.contracts).toBe(10);
    expect(optionResult.shares).toBe(1000);
    expect(optionResult.actualInvestment).toBe(1000);
    // gainLoss = (110 - 100) * 1000 - 1000 = 9000
    expect(optionResult.gainLoss).toBe(9000);
    expect(optionResult.percentageGainLoss).toBe(900);

    expect(body.data.bestOptions.best.gainLoss).toBe(9000);
  });

  test('treats sell price at or below strike as a total loss', async () => {
    const result = await handler(
      makeEvent({
        body: JSON.stringify({
          securityPrice: 100,
          investmentAmount: 500,
          options: [{ strike: 150, bid: 1.0, ask: 1.0 }],
          percentageIncrements: [10], // sellPrice = 110, below strike of 150
        }),
      })
    );

    const body = parseBody(result);
    const resultsAt110 = body.data.resultsByPrice['110'];
    expect(resultsAt110[0].gainLoss).toBe(-resultsAt110[0].actualInvestment);
    expect(resultsAt110[0].percentageGainLoss).toBe(-100);
  });

  test('skips options where investment cannot cover a single contract', async () => {
    const result = await handler(
      makeEvent({
        body: JSON.stringify({
          securityPrice: 100,
          investmentAmount: 10, // too small to afford even 1 contract at $1 (=$100/contract)
          options: [{ strike: 100, bid: 1.0, ask: 1.0 }],
          percentageIncrements: [10],
        }),
      })
    );

    const body = parseBody(result);
    expect(body.data.resultsByPrice['110']).toBeUndefined();
    expect(body.data.bestOptions.best).toBeNull();
  });

  test('returns 400 for invalid JSON body', async () => {
    const result = await handler(makeEvent({ body: '{not valid json' }));
    expect(result.statusCode).toBe(400);
  });
});

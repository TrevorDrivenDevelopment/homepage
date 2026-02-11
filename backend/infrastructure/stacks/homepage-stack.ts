import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import * as path from 'path';

export interface HomepageStackProps extends cdk.StackProps {
  environment?: string;
  corsOrigin?: string;
  alphaVantageApiKey?: string;
  marketDataApiKey?: string;
}

export class HomepageStack extends cdk.Stack {
  public readonly apiUrl: string;
  public readonly apiId: string;

  constructor(scope: Construct, id: string, props?: HomepageStackProps) {
    super(scope, id, props);

    const environment = props?.environment || this.node.tryGetContext('environment') || 'prod';
    const corsOrigin = props?.corsOrigin || this.node.tryGetContext('corsOrigin') || '*';
    const alphaVantageApiKey = props?.alphaVantageApiKey || this.node.tryGetContext('alphaVantageApiKey') || '';
    const marketDataApiKey = props?.marketDataApiKey || this.node.tryGetContext('marketDataApiKey') || '';

    const distPath = path.join(__dirname, '../../dist');

    // Common Lambda function props
    const commonLambdaProps = {
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      environment: {
        CORS_ORIGIN: corsOrigin,
        NODE_ENV: environment,
      },
    };

    // ── Helpers ──────────────────────────────────────────────────────────

    /** Create a Lambda with standard naming and config. */
    const createLambda = (
      constructId: string,
      handlerName: string,
      extraEnv?: Record<string, string>,
    ): lambda.Function => {
      return new lambda.Function(this, constructId, {
        ...commonLambdaProps,
        functionName: `homepage-${handlerName}-${environment}`,
        code: lambda.Code.fromAsset(distPath),
        handler: `handlers/${handlerName}.handler`,
        ...(extraEnv && {
          environment: { ...commonLambdaProps.environment, ...extraEnv },
        }),
      });
    };

    /** Create an SSM parameter if the value is non-empty; returns undefined otherwise. */
    const createSsmParam = (
      constructId: string,
      paramName: string,
      value: string,
      description: string,
    ): ssm.StringParameter | undefined => {
      if (!value) return undefined;
      return new ssm.StringParameter(this, constructId, {
        parameterName: `/homepage/${environment}/${paramName}`,
        stringValue: value,
        description,
      });
    };

    /** Grant SSM read access from a parameter to one or more Lambdas. */
    const grantSsmAccess = (
      param: ssm.StringParameter | undefined,
      ...functions: lambda.Function[]
    ): void => {
      if (!param) return;
      functions.forEach(fn => param.grantRead(fn));
    };

    /** Wire a Lambda to an API Gateway path and return the leaf resource. */
    const addApiRoute = (
      parent: apigateway.IResource,
      pathParts: string[],
      method: string,
      handler: lambda.Function,
      options?: { apiKeyRequired?: boolean },
    ): apigateway.Resource => {
      let resource: apigateway.IResource = parent;
      for (const part of pathParts) {
        resource = resource.addResource(part);
      }
      resource.addMethod(method, new apigateway.LambdaIntegration(handler), options);
      return resource as apigateway.Resource;
    };

    // ── API Gateway ─────────────────────────────────────────────────────

    const api = new apigateway.RestApi(this, 'HomepageApi', {
      restApiName: `homepage-api-${environment}`,
      description: 'Homepage Backend API',
      defaultCorsPreflightOptions: {
        allowOrigins: [corsOrigin],
        allowMethods: ['GET', 'POST', 'OPTIONS'],
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'X-Amz-Security-Token',
        ],
      },
      endpointConfiguration: {
        types: [apigateway.EndpointType.REGIONAL],
      },
    });

    // API Key + Usage Plan
    const apiKey = new apigateway.ApiKey(this, 'HomepageApiKey', {
      apiKeyName: `homepage-api-key-${environment}`,
      description: 'API Key for Homepage API endpoints',
    });

    const usagePlan = new apigateway.UsagePlan(this, 'HomepageUsagePlan', {
      name: `homepage-usage-plan-${environment}`,
      description: 'Usage plan for Homepage API',
      throttle: { rateLimit: 5, burstLimit: 10 },
      quota: { limit: 1000, period: apigateway.Period.MONTH },
      apiStages: [{ api, stage: api.deploymentStage }],
    });
    usagePlan.addApiKey(apiKey);

    // ── SSM Parameters ──────────────────────────────────────────────────

    createSsmParam('HomepageApiKeyParam', 'api-key', apiKey.keyId, 'Homepage API Key ID');

    const alphaVantageParam = createSsmParam(
      'AlphaVantageApiKey', 'alpha-vantage-api-key', alphaVantageApiKey, 'Alpha Vantage API key for stock data',
    );
    const marketDataParam = createSsmParam(
      'MarketDataApiKey', 'market-data-api-key', marketDataApiKey, 'Market Data API key',
    );

    // ── Lambda Functions ────────────────────────────────────────────────

    const healthFunction     = createLambda('HealthFunction',     'health');
    const optionsFunction    = createLambda('OptionsFunction',    'options', { ALPHA_VANTAGE_API_KEY: alphaVantageApiKey });
    const calculatorFunction = createLambda('CalculatorFunction', 'calculator');

    // SSM access grants
    grantSsmAccess(alphaVantageParam, optionsFunction);
    grantSsmAccess(marketDataParam,   optionsFunction, calculatorFunction);

    // ── Route Wiring ────────────────────────────────────────────────────

    const apiRoot = api.root.addResource('api');
    const secured = { apiKeyRequired: true };

    // Health (public)
    addApiRoute(apiRoot, ['health'], 'GET', healthFunction);

    // Options (secured)
    const optionsResource = apiRoot.addResource('options');
    addApiRoute(optionsResource, ['stock', '{symbol}'], 'GET', optionsFunction, secured);
    addApiRoute(optionsResource, ['chain', '{symbol}'], 'GET', optionsFunction, secured);

    // Calculator (secured)
    addApiRoute(apiRoot, ['calculator', 'options'], 'POST', calculatorFunction, secured);

    // ── Outputs ─────────────────────────────────────────────────────────

    this.apiUrl = api.url;
    this.apiId = api.restApiId;

    new cdk.CfnOutput(this, 'ApiGatewayUrl', {
      value: api.url,
      description: 'API Gateway endpoint URL',
      exportName: `${id}-ApiUrl`,
    });

    new cdk.CfnOutput(this, 'ApiGatewayId', {
      value: api.restApiId,
      description: 'API Gateway API ID',
      exportName: `${id}-ApiId`,
    });

    new cdk.CfnOutput(this, 'ApiKeyId', {
      value: apiKey.keyId,
      description: 'API Gateway API Key ID',
      exportName: `${id}-ApiKeyId`,
    });

    new cdk.CfnOutput(this, 'Environment', {
      value: environment,
      description: 'Deployment environment',
    });

    cdk.Tags.of(this).add('Project', 'Homepage');
    cdk.Tags.of(this).add('Environment', environment);
    cdk.Tags.of(this).add('ManagedBy', 'CDK');
  }
}

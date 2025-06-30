import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as iam from 'aws-cdk-lib/aws-iam';
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

    // Backend source path (relative to backend directory)
    const backendPath = path.join(__dirname, '../../src');

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

    // Create API Gateway
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

    // Create API Key for securing endpoints
    const apiKey = new apigateway.ApiKey(this, 'HomepageApiKey', {
      apiKeyName: `homepage-api-key-${environment}`,
      description: 'API Key for Homepage API endpoints',
    });

    // Create Usage Plan
    const usagePlan = new apigateway.UsagePlan(this, 'HomepageUsagePlan', {
      name: `homepage-usage-plan-${environment}`,
      description: 'Usage plan for Homepage API',
      throttle: {
        rateLimit: 5,    // requests per second
        burstLimit: 10,   // max concurrent requests
      },
      quota: {
        limit: 1000,      // requests per month
        period: apigateway.Period.MONTH,
      },
      apiStages: [{
        api: api,
        stage: api.deploymentStage,
      }],
    });

    // Associate API Key with Usage Plan
    usagePlan.addApiKey(apiKey);

    // Store the API key in SSM Parameter Store
    new ssm.StringParameter(this, 'HomepageApiKeyParam', {
      parameterName: `/homepage/${environment}/api-key`,
      stringValue: apiKey.keyId,
      description: 'Homepage API Key ID',
    });

    // Store API keys in SSM Parameter Store (if provided)
    let alphaVantageParam: ssm.StringParameter | undefined;
    if (alphaVantageApiKey) {
      alphaVantageParam = new ssm.StringParameter(this, 'AlphaVantageApiKey', {
        parameterName: `/homepage/${environment}/alpha-vantage-api-key`,
        stringValue: alphaVantageApiKey,
        description: 'Alpha Vantage API key for stock data',
      });
    }

    let marketDataParam: ssm.StringParameter | undefined;
    if (marketDataApiKey) {
      marketDataParam = new ssm.StringParameter(this, 'MarketDataApiKey', {
        parameterName: `/homepage/${environment}/market-data-api-key`,
        stringValue: marketDataApiKey,
        description: 'Market Data API key',
      });
    }

    // Health Check Lambda
    const healthFunction = new lambda.Function(this, 'HealthFunction', {
      ...commonLambdaProps,
      functionName: `homepage-health-${environment}`,
      code: lambda.Code.fromAsset(path.join(backendPath, '../dist')),
      handler: 'handlers/health.handler',
    });

    // Options Data Lambda
    const optionsFunction = new lambda.Function(this, 'OptionsFunction', {
      ...commonLambdaProps,
      functionName: `homepage-options-${environment}`,
      code: lambda.Code.fromAsset(path.join(backendPath, '../dist')),
      handler: 'handlers/options.handler',
      environment: {
        ...commonLambdaProps.environment,
        ALPHA_VANTAGE_API_KEY: alphaVantageApiKey,
      },
    });

    // Calculator Lambda (create file if it doesn't exist)
    const calculatorFunction = new lambda.Function(this, 'CalculatorFunction', {
      ...commonLambdaProps,
      functionName: `homepage-calculator-${environment}`,
      code: lambda.Code.fromAsset(path.join(backendPath, '../dist')),
      handler: 'handlers/calculator.handler',
    });

    // Grant SSM parameter access to functions that need it
    if (alphaVantageParam) {
      alphaVantageParam.grantRead(optionsFunction);
    }
    if (marketDataParam) {
      marketDataParam.grantRead(optionsFunction);
      marketDataParam.grantRead(calculatorFunction);
    }

    // API Gateway integrations
    const apiIntegration = api.root.addResource('api');

    // Health endpoint (no API key required)
    const healthIntegration = new apigateway.LambdaIntegration(healthFunction);
    apiIntegration.addResource('health').addMethod('GET', healthIntegration);

    // Options endpoints (API key required)
    const optionsResource = apiIntegration.addResource('options');
    const optionsIntegration = new apigateway.LambdaIntegration(optionsFunction);
    
    const stockResource = optionsResource
      .addResource('stock')
      .addResource('{symbol}');
    stockResource.addMethod('GET', optionsIntegration, {
      apiKeyRequired: true,
    });
    
    const chainResource = optionsResource
      .addResource('chain')
      .addResource('{symbol}');
    chainResource.addMethod('GET', optionsIntegration, {
      apiKeyRequired: true,
    });

    // Calculator endpoints (API key required)
    const calculatorResource = apiIntegration.addResource('calculator');
    const calculatorIntegration = new apigateway.LambdaIntegration(calculatorFunction);
    calculatorResource
      .addResource('options')
      .addMethod('POST', calculatorIntegration, {
        apiKeyRequired: true,
      });

    // Store outputs
    this.apiUrl = api.url;
    this.apiId = api.restApiId;

    // CloudFormation outputs
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

    // Add tags to all resources
    cdk.Tags.of(this).add('Project', 'Homepage');
    cdk.Tags.of(this).add('Environment', environment);
    cdk.Tags.of(this).add('ManagedBy', 'CDK');
  }
}

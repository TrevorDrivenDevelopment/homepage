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

    // Store API keys in SSM Parameter Store (if provided)
    let alphaVantageParam: ssm.StringParameter | undefined;
    if (alphaVantageApiKey) {
      alphaVantageParam = new ssm.StringParameter(this, 'AlphaVantageApiKey', {
        parameterName: `/homepage/${environment}/alpha-vantage-api-key`,
        stringValue: alphaVantageApiKey,
        description: 'Alpha Vantage API key for stock data',
        type: ssm.ParameterType.SECURE_STRING,
      });
    }

    let marketDataParam: ssm.StringParameter | undefined;
    if (marketDataApiKey) {
      marketDataParam = new ssm.StringParameter(this, 'MarketDataApiKey', {
        parameterName: `/homepage/${environment}/market-data-api-key`,
        stringValue: marketDataApiKey,
        description: 'Market Data API key',
        type: ssm.ParameterType.SECURE_STRING,
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

    // Health endpoint
    const healthIntegration = new apigateway.LambdaIntegration(healthFunction);
    apiIntegration.addResource('health').addMethod('GET', healthIntegration);

    // Options endpoints
    const optionsResource = apiIntegration.addResource('options');
    const optionsIntegration = new apigateway.LambdaIntegration(optionsFunction);
    
    optionsResource
      .addResource('stock')
      .addResource('{symbol}')
      .addMethod('GET', optionsIntegration);
    
    optionsResource
      .addResource('chain')
      .addResource('{symbol}')
      .addMethod('GET', optionsIntegration);

    // Calculator endpoints
    const calculatorResource = apiIntegration.addResource('calculator');
    const calculatorIntegration = new apigateway.LambdaIntegration(calculatorFunction);
    calculatorResource
      .addResource('options')
      .addMethod('POST', calculatorIntegration);

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

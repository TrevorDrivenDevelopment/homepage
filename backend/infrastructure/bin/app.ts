#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { HomepageStack } from '../stacks/homepage-stack';

const app = new cdk.App();

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
};

new HomepageStack(app, 'HomepageStack', {
  env,
  description: 'Homepage Backend API Services (CDK)',
  tags: {
    Project: 'Homepage',
    Environment: app.node.tryGetContext('environment') || 'prod',
    ManagedBy: 'CDK',
  },
});

app.synth();

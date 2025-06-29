# Deployment Guide

This repository uses a modern monorepo structure with a single, comprehensive GitHub Actions workflow for production deployment with approval gates.

## Architecture Overview

- **Frontend**: React app (built with Rsbuild) deployed to AWS S3 + CloudFront
- **Backend**: TypeScript Lambda functions with API Gateway
- **Infrastructure**: AWS CDK for infrastructure as code
- **CI/CD**: Single GitHub Actions workflow with approval gates
- **Package Manager**: Bun for fast, reliable builds

## Prerequisites

1. AWS S3 bucket configured for static website hosting
2. AWS IAM user with appropriate permissions for CDK, S3, Lambda, and API Gateway
3. (Optional) CloudFront distribution for CDN  
4. (Optional) Alpha Vantage API key for options calculator data

## Setup Instructions

### 1. Create AWS IAM User

Create an IAM user with the following permissions policy for CDK deployment:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject", 
                "s3:DeleteObject",
                "s3:ListBucket",
                "s3:GetBucketLocation",
                "s3:CreateBucket"
            ],
            "Resource": [
                "arn:aws:s3:::YOUR_BUCKET_NAME",
                "arn:aws:s3:::YOUR_BUCKET_NAME/*",
                "arn:aws:s3:::cdk-*",
                "arn:aws:s3:::cdk-*/*"
            ]
        },
        {
            "Effect": "Allow", 
            "Action": [
                "cloudfront:CreateInvalidation",
                "cloudfront:GetDistribution"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "cloudformation:*"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "lambda:*"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "apigateway:*"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "iam:*"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "ssm:*"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "sts:AssumeRole"
            ],
            "Resource": "*"
        }
    ]
}
```

### 2. Configure GitHub Environments and Secrets

The deployment workflow uses three GitHub environments with approval gates:

#### Step 2a: Create GitHub Environments
1. Go to your GitHub repository → **Settings** → **Environments**
2. Create these three environments:
   - `aws-verification`
   - `frontend-deploy` 
   - `backend-deploy`

#### Step 2b: Configure Environment Protection Rules
For each environment:
1. Enable **Required reviewers** and add yourself (or team members)
2. (Optional) Set **Wait timer** for additional safety
3. (Optional) Restrict to **main branch** only

#### Step 2c: Add Repository Secrets
Go to **Settings** → **Secrets and variables** → **Actions** → **Repository secrets**:

**Required Secrets:**
- `AWS_ACCESS_KEY_ID`: Your IAM user's access key ID
- `AWS_SECRET_ACCESS_KEY`: Your IAM user's secret access key
- `S3_BUCKET_NAME`: Your S3 bucket name for frontend hosting

**Optional Secrets:**
- `ALPHA_VANTAGE_API_KEY`: For live stock data in options calculator
- `MARKET_DATA_API_KEY`: Alternative market data source

#### Step 2d: Add Repository Variables
Go to **Settings** → **Secrets and variables** → **Actions** → **Variables**:

**Optional Variables:**
- `CLOUDFRONT_DISTRIBUTION_ID`: Your CloudFront distribution ID (enables cache invalidation)
- `CLOUDFRONT_DOMAIN`: Your CloudFront domain (for deployment summary)
- `CORS_ORIGIN`: Frontend domain for backend CORS configuration
- `AWS_REGION`: AWS region (defaults to us-east-1)

### 3. S3 Bucket Configuration

Ensure your S3 bucket is configured for static website hosting:

1. **Static Website Hosting**:
   - Go to S3 bucket → **Properties** → **Static website hosting**
   - Enable static website hosting
   - Index document: `index.html`
   - Error document: `index.html` (for React Router support)

2. **Bucket Policy** (for public access):
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
        }
    ]
}
```

### 4. CDK Bootstrap (Optional)

The workflow will automatically bootstrap CDK if needed, but you can do it manually:

```bash
cd backend
bun install
bun run cdk bootstrap
```

## Deployment Workflow

### Workflow File
**File:** `.github/workflows/deploy-production.yml`

### Trigger Conditions
- Push to `main` branch
- Manual dispatch from GitHub Actions tab

### Deployment Process

1. **🔐 AWS Credentials Verification** (requires approval)
   - Verifies AWS identity and permissions
   - Tests S3, CloudFormation, Lambda, API Gateway access
   - Checks CDK bootstrap status

2. **🏗️ Build & Test** (automatic)
   - Frontend: TypeScript check + build verification
   - Backend: TypeScript check + CDK synthesis test

3. **🎨 Frontend Deploy** (requires approval)
   - Builds React app with Rsbuild
   - Deploys to S3 with `--delete` flag
   - Invalidates CloudFront cache (if configured)

4. **📡 Backend Deploy** (requires approval)
   - Builds TypeScript Lambda functions
   - Deploys infrastructure with CDK
   - Runs API health check verification

5. **📋 Deployment Summary**
   - Reports deployment status and URLs
   - Lists available API endpoints

### Approval Process

Each deployment step requires manual approval:
1. Reviewer receives notification
2. Reviewer can inspect build artifacts and logs
3. Reviewer approves or rejects deployment
4. Deployment proceeds automatically after approval

## Testing the Deployment

### 1. Test AWS Credentials
Push any change to `main` branch - the workflow will verify credentials first.

### 2. Test Individual Components
You can approve only frontend or backend deployment to test each component independently.

### 3. Full Stack Testing
After successful deployment:
- **Frontend**: Visit your S3 website URL or CloudFront domain
- **Backend**: Test API endpoints shown in deployment summary
- **Integration**: Test options calculator with live data

## Local Development

See the main [README.md](./README.md) for local development setup with:
```bash
bun install      # Install all dependencies
bun run dev      # Start both frontend and backend
```

## Troubleshooting

### Common Issues

1. **CDK Bootstrap Required**: Workflow will handle this automatically
2. **IAM Permissions**: Ensure your IAM user has all required permissions above
3. **S3 Bucket Access**: Check bucket name in secrets and bucket policy
4. **CloudFront Cache**: Invalidations may take 5-15 minutes to propagate
5. **API Health Check Fails**: Backend deployment includes retry logic

### Workflow Logs

Each step provides detailed logs:
- AWS credential verification results
- Build and test outputs
- Deployment status and errors
- API health check results

### Manual Recovery

If deployment fails:
1. Check workflow logs for specific error
2. Fix the issue locally and test
3. Push fix to `main` branch to retry
4. Or use manual workflow dispatch to retry specific components

## Security

- All sensitive data stored in GitHub Secrets
- Approval gates prevent unauthorized deployments  
- IAM permissions follow principle of least privilege
- CDK provides infrastructure as code with version control
- API includes CORS protection and input validation

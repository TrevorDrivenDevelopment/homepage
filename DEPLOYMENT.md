# Deployment Setup

This repository includes a GitHub Actions workflow that automatically deploys your React app to AWS S3 when you push to the main branch.

## Prerequisites

1. An AWS S3 bucket configured for static website hosting
2. AWS IAM user with appropriate permissions
3. (Optional) CloudFront distribution for CDN

## Setup Instructions

### 1. Create AWS IAM User

Create an IAM user with the following permissions policy:

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
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::YOUR_BUCKET_NAME",
                "arn:aws:s3:::YOUR_BUCKET_NAME/*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "cloudfront:CreateInvalidation"
            ],
            "Resource": "*"
        }
    ]
}
```

### 2. Configure GitHub Secrets and Variables

Go to your GitHub repository → Settings → Secrets and variables → Actions:

**Add these Secrets:**
- `AWS_ACCESS_KEY_ID`: Your IAM user's access key ID
- `AWS_SECRET_ACCESS_KEY`: Your IAM user's secret access key
- `AWS_REGION`: Your AWS region (e.g., `us-east-1`)
- `S3_BUCKET_NAME`: Your S3 bucket name

**Add these Variables (optional for CloudFront):**
- `CLOUDFRONT_DISTRIBUTION_ID`: Your CloudFront distribution ID

### 3. S3 Bucket Configuration

Ensure your S3 bucket is configured for static website hosting:

1. Go to your S3 bucket → Properties → Static website hosting
2. Enable static website hosting
3. Set Index document to `index.html`
4. Set Error document to `index.html` (for React Router support)

### 4. Bucket Policy (if needed)

If you want your bucket to be publicly accessible, add this bucket policy:

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

## How It Works

The workflow triggers on:
- Push to main branch
- Manual trigger (workflow_dispatch)

The deployment process:
1. Checks out your code
2. Sets up Node.js 22.12.0 (matching your volta config)
3. Installs dependencies with Yarn
4. Builds the React app
5. Configures AWS credentials
6. Syncs the build folder to S3 (with --delete flag to remove old files)
7. (Optional) Invalidates CloudFront cache

## Customization

You can modify the workflow file (`.github/workflows/deploy.yml`) to:
- Change the trigger conditions
- Add additional build steps
- Modify the deployment command
- Add notifications or other post-deployment actions

## Testing

### Quick AWS Credentials Verification

Before deploying, you can verify your AWS credentials are working correctly:

1. Configure your GitHub secrets (see step 2 above)
2. Push any change to the `main` or `develop` branch
3. The "Verify AWS Credentials" workflow will run automatically and test:
   - AWS credentials are valid
   - S3 bucket exists and is accessible  
   - CloudFront distribution is accessible (if configured)
4. Check the Actions tab to see if verification passed

### Full Deployment Testing

To test the full deployment:
1. Make sure all secrets are configured
2. Push a change to the main branch
3. Check the Actions tab in your GitHub repository to see the deployment progress
4. Visit your S3 website URL to verify the deployment

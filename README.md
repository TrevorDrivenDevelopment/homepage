# Trevor Driven Development Homepage

A modern full-stack monorepo built with **React**, **RSBuild**, **Bun**, and **AWS CDK**. Features a personal portfolio with interactive applications including an MBTI personality test and options calculator.

## 🚀 Quick Start

### Prerequisites
- [Bun](https://bun.sh) (v1.2.17+) - Fast JavaScript runtime and package manager
- [mise](https://mise.run) - Tool version management (recommended)
- [AWS CDK CLI](https://docs.aws.amazon.com/cdk/latest/guide/getting_started.html) - For backend deployment (optional)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/homepage.git
cd homepage
```

### 2. Install Bun and mise

#### Option A: Automated Setup with mise (Recommended)

```bash
# Install mise for automatic tool version management
curl https://mise.run | sh

# Add to your shell (e.g., ~/.zshrc or ~/.bashrc)
echo 'eval "$(mise activate zsh)"' >> ~/.zshrc
source ~/.zshrc

# Navigate to project - mise will auto-install Bun v1.2.17
cd homepage
mise install
```

#### Option B: Manual Bun Installation

```bash
# Install Bun directly
curl -fsSL https://bun.sh/install | bash

# Verify correct version (should be 1.2.17)
bun --version
```

### 3. Install Dependencies

```bash
# Install all workspace dependencies
bun install
```

### 4. Local Development

#### Full-Stack Development (Recommended)
```bash
# Start both frontend and backend servers
bun run dev:full
```
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080

#### Individual Services
```bash
# Frontend only (React app)
bun run dev

# Backend only (Lambda functions locally)
bun run dev:backend
```

## 🛠 Technology Stack

### Frontend
- **React 19** with TypeScript
- **RSBuild** - Fast build tool (Webpack/Vite alternative)
- **Material-UI** - React component library
- **React Router** - Client-side routing

### Backend
- **Bun** - Fast JavaScript runtime (development)
- **AWS Lambda** - Serverless functions (production)
- **AWS API Gateway** - REST API management
- **AWS CDK** - Infrastructure as Code
- **TypeScript** - Type-safe backend development

### DevOps
- **GitHub Actions** - CI/CD pipeline with approval gates
- **AWS S3** - Static website hosting
- **AWS CloudFront** - CDN
- **mise** - Tool version management

## 📁 Project Structure

This monorepo is organized with clear separation between frontend and backend:

```
homepage/
├── frontend/              # React application
│   ├── src/
│   │   ├── apps/         # Feature applications
│   │   │   ├── PersonalApplications.tsx
│   │   │   ├── options-calculator/     # Stock options tool
│   │   │   └── personality-test/       # MBTI personality test
│   │   ├── types/        # TypeScript definitions
│   │   └── utils/        # Shared utilities
│   ├── public/           # Static assets
│   ├── package.json      # Frontend dependencies & scripts
│   ├── rsbuild.config.ts # Build configuration
│   └── tsconfig.json     # TypeScript config
│
├── backend/               # Serverless API
│   ├── src/
│   │   ├── handlers/     # Lambda function handlers
│   │   ├── services/     # Business logic
│   │   ├── types/        # TypeScript definitions
│   │   └── utils/        # Backend utilities
│   ├── infrastructure/   # AWS CDK infrastructure
│   │   ├── bin/app.ts    # CDK app entry point
│   │   ├── stacks/       # CDK stack definitions
│   │   └── tsconfig.json # Infrastructure TypeScript config
│   ├── package.json      # Backend dependencies & scripts
│   └── cdk.json          # CDK configuration
│
├── .github/workflows/     # CI/CD pipelines
├── build/                # Frontend build output
├── dev.ts                # Full-stack development script
├── package.json          # Workspace manager & shared scripts
├── .mise.toml            # Tool version management
└── bunfig.toml           # Bun configuration
```

## 🔧 Available Scripts

All scripts can be run from the root directory using Bun's workspace management:

### Development
```bash
bun run dev           # Start frontend development server
bun run dev:backend   # Start backend development server  
bun run dev:full      # Start both frontend and backend
```

### Building
```bash
bun run build         # Build frontend for production
bun run build:backend # Build backend for deployment
```

### Testing & Quality
```bash
bun run test           # Run all tests
bun run test:frontend  # Run frontend tests only
bun run test:backend   # Run backend tests only
bun run type-check     # TypeScript checking across monorepo
bun run mbti-quality   # Run MBTI test quality analysis
```

### Deployment
```bash
bun run deploy:backend # Deploy backend to AWS
```

## 🌐 Featured Applications

### Personal Portfolio
- Professional showcase with resume and contact information
- Links to GitHub, LinkedIn, and YouTube
- Responsive design with modern UI

### MBTI Personality Test
- Interactive 16-personality type assessment
- Dynamic question system with cognitive function analysis
- Real-time type calculation and detailed results
- Quality assurance tools for question consistency

### Options Calculator
- Stock options analysis and valuation
- Support for both manual input and live market data
- Integration with Alpha Vantage API
- Interactive charts and calculations

## 🚀 Deployment

The project uses **GitHub Actions** for automated deployment with approval gates for production safety.

### Required GitHub Secrets

Configure these secrets in your GitHub repository (Settings → Secrets and variables → Actions):

#### Required Secrets
```bash
AWS_ACCESS_KEY_ID          # AWS IAM access key
AWS_SECRET_ACCESS_KEY      # AWS IAM secret key  
S3_BUCKET_NAME            # S3 bucket for frontend hosting
```

#### Optional Secrets (for enhanced features)
```bash
ALPHA_VANTAGE_API_KEY     # For live stock data in options calculator
CLOUDFRONT_DISTRIBUTION_ID # For CDN cache invalidation
```

#### Environment Variables (if different from defaults)
```bash
AWS_REGION=us-east-1      # Default region (optional)
CORS_ORIGIN              # Frontend domain for CORS (optional)
```

### Deployment Workflow

#### Production Deployment (Single Source of Truth)
**File:** `.github/workflows/deploy-production.yml`

**Sequential approval-based workflow:**
1. 🔐 **AWS Credentials Verification** (requires approval)
   - Verifies AWS identity and IAM permissions
   - Tests S3, CloudFormation, Lambda, API Gateway access
   - Checks CDK bootstrap status
2. 🏗️ **Build & Test** (automatic after verification)
   - Frontend: TypeScript check + build verification
   - Backend: TypeScript check + CDK synthesis test
3. 🎨 **Frontend Deploy** (requires approval)
   - Deploys to S3 + CloudFront cache invalidation
4. 📡 **Backend Deploy** (requires approval) 
   - CDK deployment of Lambda functions + API Gateway
   - Health check verification
5. 📋 **Deployment Summary**
   - Complete deployment status and URLs

**To trigger:**
- Push to `main` branch
- Manual dispatch from GitHub Actions tab

### GitHub Environment Setup

For production deployments with approvals, set up these GitHub environments:

1. **Repository Settings** → **Environments** → **New environment**
2. Create these environments:
   - `aws-verification` - Requires approval before AWS access
   - `frontend-deploy` - Requires approval before frontend deployment
   - `backend-deploy` - Requires approval before backend deployment

3. **For each environment:**
   - Enable "Required reviewers" 
   - Add yourself/team members as reviewers
   - Optionally restrict to `main` branch only

### AWS Setup

#### 1. Create IAM User with Required Permissions
```bash
# Minimum required policies:
- AmazonS3FullAccess (for frontend deployment)
- CloudFormationFullAccess (for CDK)
- IAMFullAccess (for CDK to create roles)
- AWSLambda_FullAccess (for backend functions)
- AmazonAPIGatewayAdministrator (for API deployment)
```

#### 2. Create S3 Bucket
```bash
# Replace 'your-unique-bucket-name' with your actual bucket name
aws s3 mb s3://your-unique-bucket-name --region us-east-1
aws s3 website s3://your-unique-bucket-name --index-document index.html
```

#### 3. Bootstrap CDK (One-time setup)
```bash
cd backend
bun install
bun run bootstrap
```

### Manual Deployment

#### Frontend
```bash
cd frontend
bun run build
aws s3 sync ../build s3://your-bucket-name --delete
```

#### Backend
```bash
cd backend  
bun run deploy
```

### Monitoring Deployments

- **GitHub Actions**: Monitor workflow runs in the Actions tab
- **AWS CloudFormation**: View stack deployments in AWS Console
- **Frontend URL**: `https://your-bucket-name.s3-website-us-east-1.amazonaws.com`
- **Backend URL**: Check CDK output or API Gateway console for endpoint

## 🧪 Testing

```bash
# Run all tests across monorepo
bun run test

# Run tests for specific workspace
bun run test:frontend
bun run test:backend

# Run specific test file
cd frontend && bun test src/components/MyComponent.test.tsx

# Type checking across entire project
bun run type-check

# MBTI test quality analysis
bun run mbti-quality
```

## 🛠 Development Tips

### Monorepo Workflow
- All dependencies are managed through the root `package.json` workspace
- Use `bun install` from root to install all workspace dependencies
- Scripts can be run from root (e.g., `bun run dev:full`) or from individual workspaces

### Hot Reloading
- Frontend has hot module replacement enabled
- Backend restarts automatically on file changes
- Full-stack mode (`dev:full`) runs both with live reloading

### Environment Variables
```bash
# Frontend (.env in frontend/)
REACT_APP_API_URL=http://localhost:8080

# Backend (.env in backend/)
## These are for the options calculator. If you don't want it, you don't need it. 
ALPHA_VANTAGE_API_KEY=your_api_key
CORS_ORIGIN=http://localhost:3000
```

## 📚 Additional Documentation

- **[Migration Guide](./MIGRATION.md)** - RSBuild + Bun migration from CRA
- **[Testing Summary](./TESTING_SUMMARY.md)** - Test coverage and strategies
- **[Quality Assurance](./QUALITY_ASSURANCE.md)** - QA processes and standards
- **[Deployment Guide](./DEPLOYMENT.md)** - Detailed deployment instructions
- **[Backend API](./backend/README.md)** - API documentation and endpoints

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Run tests and type checking**
   ```bash
   bun run test
   bun run type-check
   ```
5. **Commit with descriptive message**
   ```bash
   git commit -m "feat: add amazing feature"
   ```
6. **Push and create pull request**

### Code Style
- TypeScript is enforced across the monorepo
- ESLint configuration via `@rsbuild/eslint-config/react`
- Prettier for code formatting
- Husky for git hooks (if configured)

## 🔄 Migration History

This project has been migrated through several iterations:
- **CRA → RSBuild**: Improved build performance and modern tooling
- **npm → Bun**: Faster package management and runtime
- **AWS SAM → CDK**: More flexible infrastructure as code
- **Monolith → Monorepo**: Clear separation of concerns

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📧 Contact

**Trevor Tiernan**
- GitHub: [@trevortiernan](https://github.com/trevortiernan)
- LinkedIn: [Trevor Tiernan](https://linkedin.com/in/trevortiernan)
- Website: [Live Demo](https://trevordrivendevelopment.com)

---

**Built with ❤️ using React, TypeScript, Bun, and AWS**

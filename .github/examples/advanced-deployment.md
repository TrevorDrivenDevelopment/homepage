# Environment Configuration Examples

## Multiple Environments

If you want to deploy to different environments (staging, production), you can create multiple workflow files or use environment-specific secrets.

### Option 1: Separate Workflows

Create separate workflow files for each environment:
- `.github/workflows/deploy-staging.yml` (triggers on `develop` branch)
- `.github/workflows/deploy-production.yml` (triggers on `main` branch)

### Option 2: Environment-Specific Secrets

Use GitHub Environments to manage secrets per environment:

1. Go to Settings → Environments
2. Create environments (e.g., "staging", "production")
3. Add environment-specific secrets
4. Modify the workflow to use environments

Example workflow modification:
```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production  # or staging
    steps:
      # ... rest of your steps
```

## Custom Build Commands

If you need custom build commands for different environments:

```yaml
- name: Build project
  run: |
    if [ "${{ github.ref }}" == "refs/heads/main" ]; then
      REACT_APP_ENV=production yarn build
    else
      REACT_APP_ENV=staging yarn build
    fi
```

## Notifications

Add Slack or Discord notifications on deployment success/failure:

```yaml
- name: Notify on success
  if: success()
  run: |
    curl -X POST -H 'Content-type: application/json' \
    --data '{"text":"✅ Deployment to S3 successful!"}' \
    ${{ secrets.SLACK_WEBHOOK_URL }}

- name: Notify on failure
  if: failure()
  run: |
    curl -X POST -H 'Content-type: application/json' \
    --data '{"text":"❌ Deployment to S3 failed!"}' \
    ${{ secrets.SLACK_WEBHOOK_URL }}
```

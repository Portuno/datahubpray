# Environment Variables for Vercel Deployment

## Required Environment Variables

Configure these environment variables in your Vercel dashboard:

### 1. Google Cloud Project Configuration
```
GCP_PROJECT_ID=dataton25-prayfordata
```

### 2. Google Cloud Credentials
```
GOOGLE_APPLICATION_CREDENTIALS=<base64-encoded-credentials-json>
```

**How to get the credentials:**
1. Go to your Google Cloud Console
2. Navigate to IAM & Admin > Service Accounts
3. Find or create a service account with BigQuery and Datastore permissions
4. Download the JSON key file
5. Convert to base64: `base64 -i path/to/credentials.json`
6. Use the base64 string as the environment variable value

### 3. Optional Environment Variables
```
NODE_ENV=production
DEBUG_MODE=false
LOG_LEVEL=info
```

## Setting Environment Variables in Vercel

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project**: datapray
3. **Go to Settings**: Click on "Settings" tab
4. **Environment Variables**: Click on "Environment Variables" in the sidebar
5. **Add Variables**: Click "Add" and enter each variable:
   - Name: `GCP_PROJECT_ID`
   - Value: `dataton25-prayfordata`
   - Environment: Production, Preview, Development (select all)
   
   - Name: `GOOGLE_APPLICATION_CREDENTIALS`
   - Value: `<your-base64-encoded-credentials>`
   - Environment: Production, Preview, Development (select all)

## Verification

After setting the environment variables:

1. **Redeploy**: Go to Deployments and click "Redeploy" on the latest deployment
2. **Test API**: Visit `https://datapray.vercel.app/api/health` to verify the backend is working
3. **Check Logs**: Monitor the Vercel function logs for any authentication errors

## Troubleshooting

### Common Issues:

1. **Authentication Error**: 
   - Verify `GOOGLE_APPLICATION_CREDENTIALS` is properly base64 encoded
   - Check that the service account has the required permissions

2. **BigQuery Access Denied**:
   - Ensure the service account has `BigQuery Data Viewer` and `BigQuery Job User` roles
   - Verify the project ID is correct

3. **Datastore Access Denied**:
   - Ensure the service account has `Cloud Datastore User` role
   - Check that the project ID matches your Datastore project

### Required Google Cloud Permissions:

The service account needs these roles:
- `BigQuery Data Viewer`
- `BigQuery Job User` 
- `Cloud Datastore User`
- `Cloud Datastore Owner` (if creating new entities)

## Development vs Production

- **Development**: Uses local credentials file from `backend/credentials/`
- **Production**: Uses environment variables set in Vercel dashboard

The serverless functions will automatically use the environment variables when deployed to Vercel.

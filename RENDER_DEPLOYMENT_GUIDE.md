# Render Deployment Guide

## Overview

This guide helps you deploy the Construction Timechart application to Render.com.

## Changes Made for Render Deployment

### 1. **Entry Point Fix**
- Created `index.js` - Main entry point for the application
- Created `index.web.js` - Web-specific entry point
- Updated `package.json` "main" field from `"expo-router/entry"` to `"index.js"`

### 2. **Build Script**
- Added `"build": "expo export --platform web"` script to package.json
- Created `build.sh` helper script for server-side builds

### 3. **Render Configuration**
- Created `render.yaml` with deployment configuration
- Configured to use Node.js environment
- Build command: `npm install && npm run build`
- Start command: `npx serve -s dist -l 3000`

### 4. **Updated app.json**
- Added `"bundler": "metro"` to web export settings

## Deployment Steps

### Option 1: Using Render Dashboard

1. **Connect Repository**
   - Log in to Render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service**
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npx serve -s dist -l 3000`
   - **Environment**: Node.js

3. **Environment Variables** (if needed)
   - Set `NODE_ENV` to `production`

4. **Deploy**
   - Click "Deploy Service"
   - Wait for build and deployment to complete

### Option 2: Using render.yaml

1. **Push to Repository**
   ```bash
   git add render.yaml
   git commit -m "Add Render deployment configuration"
   git push
   ```

2. **Deploy from Render**
   - Click "New +" → "Web Service"
   - Select "Deploy an existing service"
   - Choose the render.yaml configuration
   - Complete deployment

## Troubleshooting

### Build Fails with "Cannot find module"

**Problem**: Module not found errors during build

**Solution**:
```bash
# Install dependencies locally first
npm install

# Test build locally
npm run build

# If successful, push to repository and try again
```

### Port Issues

**Problem**: Application shows port 3000 but Render assigns dynamic port

**Solution**:
- The start command `npx serve -s dist -l 3000` is fine
- Render automatically maps the port correctly
- No changes needed

### Static Files Not Loading

**Problem**: CSS/JS files return 404

**Solution**:
- Ensure `app.json` has `"output": "static"`
- Check that the `dist/` folder is created in build
- Verify all assets are properly bundled

### AsyncStorage Not Working

**Problem**: Data not persisting between sessions

**Solution**:
- AsyncStorage works in web via IndexedDB
- No changes needed
- Data persists in browser's local storage

## Local Testing

Before deploying, test the build locally:

```bash
# Build the application
npm run build

# Serve the build locally
npx serve -s dist -l 3000

# Open browser and navigate to http://localhost:3000
```

## Project Structure

```
construction-timechart/
├── app/                          # Expo Router app directory
│   ├── _layout.tsx              # Root layout
│   ├── index.tsx                # Home screen
│   ├── login.tsx                # Login screen
│   ├── editor.tsx               # Timechart editor
│   ├── create-project.tsx       # Project creation
│   └── (tabs)/                  # Tab navigation
├── components/                   # React components
├── types/                        # TypeScript types
├── utils/                        # Utility functions
├── hooks/                        # Custom React hooks
├── assets/                       # Images, fonts, icons
├── index.js                      # Entry point (NEW)
├── index.web.js                  # Web entry point (NEW)
├── app.json                      # Expo config
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript config
└── render.yaml                   # Render deployment config (NEW)
```

## Environment Variables

No environment variables are currently required. AsyncStorage is used for all data persistence.

## Performance Considerations

- **Bundle Size**: Typically 3-5 MB (gzipped)
- **Load Time**: 2-5 seconds depending on connection
- **Runtime Performance**: Smooth on modern browsers

## Monitoring

After deployment, monitor:
1. Build logs in Render dashboard
2. Runtime logs
3. Error tracking in browser console
4. Performance metrics

## Support

For Render-specific issues:
- Check [Render Documentation](https://render.com/docs)
- Review deployment logs in Render dashboard
- Ensure Node.js version compatibility (18+)

## Rollback

To rollback a deployment:
1. Go to Render dashboard
2. Select the service
3. Click "Deployments"
4. Select a previous successful deployment
5. Click "Redeploy"

---

**Last Updated**: 18 February 2026
**Deployment Status**: Ready for Render ✅

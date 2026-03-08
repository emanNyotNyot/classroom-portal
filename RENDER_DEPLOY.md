# Render Deployment Guide

## Problem
The application was exiting early because:
1. The server was hardcoded to port 3000 instead of using the PORT environment variable that Render provides
2. Missing proper production build configuration

## Fixes Applied
1. Updated `server.ts` to use `process.env.PORT` environment variable
2. Added production static file serving configuration with SPA routing
3. Updated `package.json` with proper build scripts

## How to Deploy to Render

### Option 1: Using Git (Recommended)

1. **Push your code to GitHub** if you haven't already

2. **Create a new Web Service on Render**:
   - Go to https://dashboard.render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure the following settings:
     - **Build Command**: `npm run build && npm run build:server`
     - **Start Command**: `npm run start`
     - **Environment**: `Node`
     - **Node Version**: `20` (or your preferred version)

3. **Add Environment Variables** in Render dashboard:
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
   - `JWT_SECRET`: A secure random string for JWT signing
   - `NODE_ENV`: `production`

4. **Deploy**: Click "Create Web Service"

### Option 2: Using render.yaml

Create a `render.yaml` file in your repository:

```yaml
services:
  - type: web
    name: classroom-portal
    env: node
    buildCommand: npm run build && npm run build:server
    startCommand: npm run start
    envVars:
      - key: NODE_ENV
        value: production
      - key: SUPABASE_URL
        sync: false
      - key: SUPABASE_SERVICE_ROLE_KEY
        sync: false
      - key: JWT_SECRET
        sync: false
```

## Important Notes

1. **Build Process**: The deployment will:
   - First run `npm run build` to build the React frontend (creates `dist` folder)
   - Then run `npm run build:server` to compile the TypeScript server (creates `dist-server` folder)

2. **Cookie Settings**: For production, you may need to update the cookie settings in `server.ts` if your frontend and backend are on different domains:
   ```typescript
   res.cookie('token', token, { 
     httpOnly: true, 
     secure: true, 
     sameSite: 'none', // or 'lax' if on same domain
     domain: '.yourdomain.com' // if needed
   });
   ```

3. **CORS**: If you have CORS issues in production, you may need to add CORS middleware to Express.


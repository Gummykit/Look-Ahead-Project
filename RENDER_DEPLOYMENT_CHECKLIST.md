# Render Deployment Checklist ✅

## Pre-Deployment

- [ ] All changes committed to git
- [ ] `git push` to repository
- [ ] `index.js` exists in project root
- [ ] `index.web.js` exists in project root
- [ ] `package.json` main field is `"index.js"`
- [ ] `render.yaml` exists in project root
- [ ] Local build test passed: `npm run build`

## Render Dashboard Setup

- [ ] Logged into render.com
- [ ] GitHub repository connected
- [ ] Created new Web Service
- [ ] Selected correct GitHub repository
- [ ] Branch set to `main` (or your deployment branch)

## Service Configuration

- [ ] **Build Command**: `npm install && npm run build`
- [ ] **Start Command**: `npx serve -s dist -l 3000`
- [ ] **Environment**: Node
- [ ] **Node Version**: 18+ (default is fine)
- [ ] **Region**: Selected (default is fine)
- [ ] **Auto-Deploy**: Enabled (optional)

## Environment Variables (if applicable)

- [ ] `NODE_ENV` = `production` (optional, recommended)
- [ ] Any other custom variables added (if needed)

## Deployment

- [ ] Clicked "Deploy Service" or "Deploy" button
- [ ] Waiting for build to start
- [ ] Monitoring build logs in real-time

## Build Completion

- [ ] Build completed successfully (Green checkmark)
- [ ] No build errors in logs
- [ ] No module not found errors
- [ ] Service is running (status shows "Live")

## Post-Deployment Testing

- [ ] Service URL is provided
- [ ] Clicked service URL to open app
- [ ] App loads in browser (no blank screen)
- [ ] Login page appears correctly
- [ ] Can log in with test credentials
- [ ] Projects list loads correctly
- [ ] Can navigate between screens
- [ ] No console errors (F12 → Console)

## Verification Checklist

### Functionality Tests
- [ ] Login/Logout works
- [ ] Projects can be viewed
- [ ] Projects can be created
- [ ] Projects can be deleted
- [ ] Timechart editor opens
- [ ] Activities can be dragged
- [ ] Daily logs can be added
- [ ] Data persists after refresh

### Performance Tests
- [ ] App loads in reasonable time
- [ ] UI is responsive
- [ ] Drag operations are smooth
- [ ] No memory leaks in console

### Browser Compatibility
- [ ] Works on Chrome
- [ ] Works on Firefox
- [ ] Works on Safari
- [ ] Works on Edge

## Common Issues & Fixes

### Issue: Build Fails with Module Not Found
```
❌ Solution:
1. Check local build: npm run build
2. Verify all files exist
3. Check package.json dependencies
4. Clear node_modules: rm -rf node_modules && npm install
5. Push changes and redeploy
```

### Issue: App Shows Blank Page
```
❌ Solution:
1. Check browser console (F12)
2. Check Render logs for runtime errors
3. Verify entry point is correct
4. Ensure dist/ folder has content
```

### Issue: AsyncStorage Shows Error
```
❌ Solution:
1. This is normal on first load (initializing IndexedDB)
2. Refresh the page
3. Check browser's Application → Storage → Local Storage
4. Data should persist between sessions
```

### Issue: Port Already in Use
```
❌ Solution:
1. This is handled automatically by Render
2. Render maps ports dynamically
3. No action needed
```

## Monitoring & Maintenance

### Daily Checks
- [ ] Service status is "Live"
- [ ] No errors in recent logs
- [ ] App is accessible and responsive

### Weekly Checks
- [ ] Review build logs
- [ ] Check for any error patterns
- [ ] Verify data integrity

### Monthly Checks
- [ ] Test full user workflow
- [ ] Verify all features work
- [ ] Check app performance
- [ ] Review disk usage

## Rollback Plan

If deployment has issues:

1. Go to Render Dashboard
2. Select your service
3. Click "Deployments"
4. Find the last successful deployment
5. Click the three-dots menu
6. Select "Redeploy"
7. Service will revert to previous version

**Time to Rollback**: ~2-3 minutes

## Getting Help

| Issue | Where to Look |
|-------|----------------|
| Build errors | Render Dashboard → Build Logs |
| Runtime errors | Render Dashboard → Logs OR Browser Console (F12) |
| Expo issues | [Expo Documentation](https://docs.expo.dev) |
| Render issues | [Render Documentation](https://render.com/docs) |
| App logic errors | Browser DevTools (F12 → Console) |

## Success Criteria ✅

Your deployment is successful when:
- ✅ Render shows "Live" status
- ✅ Service URL is accessible
- ✅ App loads without errors
- ✅ Login works correctly
- ✅ Projects list displays
- ✅ Can interact with timecharts
- ✅ Browser console has no errors

---

**Deployment Date**: _________________
**Render Service URL**: _________________
**Status**: ⬜ Pending / 🟡 In Progress / 🟢 Live

**Notes**:
_________________________________________________________________

_________________________________________________________________

---

*This checklist ensures a smooth deployment process. Keep this document for reference during and after deployment.*

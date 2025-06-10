# Supabase Connection Troubleshooting Guide

## Common Issues and Solutions

### 1. Missing Environment Variables
The most common cause is missing or incorrect environment variables.

**Check your `.env` file:**
- Make sure you have `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Ensure there are no extra spaces or quotes around the values
- Verify the URL format is correct (should start with `https://`)

### 2. Incorrect Supabase Configuration
**Verify your Supabase project settings:**
- Project URL should be in format: `https://your-project-id.supabase.co`
- Anon key should be a long JWT token starting with `eyJ`

### 3. Network/CORS Issues
**Check for network connectivity:**
- Ensure you can access your Supabase dashboard
- Check if your project is paused (free tier projects pause after inactivity)

### 4. Browser Console Errors
**Open browser developer tools (F12) and check:**
- Console tab for JavaScript errors
- Network tab for failed requests

## Quick Fixes to Try

1. **Restart your development server**
2. **Clear browser cache and cookies**
3. **Check Supabase project status** in your dashboard
4. **Verify environment variables** are loaded correctly

## Next Steps
If the issue persists, please share:
- Browser console errors
- Terminal output
- Your Supabase project status
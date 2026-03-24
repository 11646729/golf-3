# Google Maps API Configuration

## Overview

The Golf Courses feature uses Google Maps to display golf course locations. If you encounter authorization errors when viewing the Golf Courses page, follow this guide to properly configure your Google Maps API.

## Common Issues & Solutions

### 1. **Authorization Error (403 Forbidden)**

This occurs when the Google Maps API key doesn't have the required permissions.

**Solution:**

- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Select your project
- Ensure these APIs are **enabled**:
  - Maps JavaScript API
  - Maps SDK for JavaScript

**Steps:**

1. In the Cloud Console, go to **APIs & Services** → **Enabled APIs & services**
2. Click **+ ENABLE APIS AND SERVICES**
3. Search for "Maps JavaScript API" and enable it
4. Search for "Maps SDK for JavaScript" and enable it

### 2. **Invalid API Key Error**

The API key might not be properly configured or is missing.

**Solution:**

- Ensure `VITE_GOOGLE_MAPS_API_KEY` is set in `/frontend/.env`
- The API key should look like: `AIzaSy...` (starts with AIzaSy)
- Never commit the API key to version control

**Setup:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Create a new API Key (if you don't have one):
   - Click **+ CREATE CREDENTIALS**
   - Select **API Key**
   - Copy the generated key
4. Add to `/frontend/.env`:
   ```
   VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

### 3. **Intermittent Errors (Sometimes works, sometimes fails)**

This typically indicates:

- **API Quota Exceeded**: Your API has hit rate limits
- **Billing Not Enabled**: The API requires a billing account
- **HTTP Referrer Restrictions**: The API key is restricted to specific domains

**Solution:**

**For Development (localhost):**

1. Go to **APIs & Services** → **Credentials**
2. Click on your API Key
3. Under **API restrictions**, select **Restrict key** (if using HTTP Referrer restrictions)
4. Add these referrers:
   - `http://localhost/*`
   - `http://127.0.0.1/*`
5. Click **Save**

**For Production:**

1. Create a separate API Key with HTTP Referrer restrictions
2. Add your production domain(s):
   - `https://yourdomain.com/*`
   - `https://*.yourdomain.com/*`

### 4. **Enable Billing**

Google Maps API requires a valid billing account. Even with the free tier, you need to enable billing.

**Steps:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the **Billing** menu
3. Click **Link Billing Account**
4. Follow the prompts to enable billing

### 5. **Check Browser Console for Errors**

When the map fails to load, detailed error messages appear in the browser console.

**How to check:**

1. Open your browser's Developer Tools (F12 or right-click → Inspect)
2. Go to the **Console** tab
3. Look for error messages starting with "Google Maps API Error" or similar
4. These messages will help diagnose the exact issue

## Error Handling

The application now includes:

1. **Error Boundary**: Catches and displays any errors during map rendering
2. **Fallback UI**: Shows a user-friendly error message when the map fails
3. **Console Logging**: Detailed error information for debugging

If you see "Unable to Load Map" message:

- Check the browser console (F12) for specific error details
- Verify your API key is correctly set in `.env`
- Ensure the required Google Maps APIs are enabled
- Check that billing is enabled on your GCP project

## Testing the Configuration

To verify your setup is working:

1. Start the frontend development server
2. Navigate to the **Golf Courses** page
3. The map should load without errors
4. Check the browser console for the message: "Google Maps API loaded successfully"

## Security Notes

⚠️ **Important:**

- Never commit API keys to version control
- Use `.env` files (which are in `.gitignore`)
- For production, use environment variables or secret management services
- Implement API key rotation periodically
- Consider using API Key restrictions to limit what each key can access

## Additional Resources

- [Google Maps JavaScript API Documentation](https://developers.google.com/maps/documentation/javascript)
- [Google Cloud Console](https://console.cloud.google.com/)
- [API Key Best Practices](https://developers.google.com/maps/api-key-best-practices)

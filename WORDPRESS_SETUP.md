# WordPress.com API Setup Guide

This guide will help you set up the necessary authentication for your WordPress.com site to work with the article scraper and publisher.

## Getting a WordPress.com Access Token

WordPress.com uses OAuth2 for authentication. Here's how to get an access token:

### Method 1: Using the WordPress.com Developer Console

1. Go to the [WordPress.com Developer Resources](https://developer.wordpress.com/apps/) page
2. Click "Create New Application"
3. Fill in the application details:
   - Name: "Unmanned Newsroom"
   - Description: "Automated article scraper and publisher"
   - Website URL: Your website URL or GitHub repository URL
   - Redirect URL: `http://localhost:3000/callback` (you can change this later)
   - JavaScript Origins: Leave blank
   - Type: "Web"
4. Click "Create"
5. Note your Client ID and Client Secret
6. Use the OAuth2 flow to get an access token:

```bash
# Step 1: Get authorization code
# Open this URL in your browser (replace CLIENT_ID with your actual client ID)
https://public-api.wordpress.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=http://localhost:3000/callback&response_type=code

# Step 2: After authorizing, you'll be redirected to your callback URL with a code parameter
# Example: http://localhost:3000/callback?code=AUTHORIZATION_CODE

# Step 3: Exchange the authorization code for an access token
curl -X POST https://public-api.wordpress.com/oauth2/token \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "code=AUTHORIZATION_CODE" \
  -d "grant_type=authorization_code" \
  -d "redirect_uri=http://localhost:3000/callback"
```

The response will include an `access_token` that you can use for API requests.

### Method 2: Using a Personal Access Token

For simpler setup, you can use a personal access token:

1. Go to [WordPress.com Application Passwords](https://wordpress.com/me/security/two-step)
2. Scroll down to "Application Passwords" section
3. Click "Create Application Password"
4. Enter a name like "Unmanned Newsroom"
5. Click "Create"
6. Copy the generated password - this is your access token

## Updating Your .env File

Once you have your access token, update your `.env` file:

```
WORDPRESS_API_URL=https://public-api.wordpress.com/wp/v2/sites/your-site.wordpress.com
WORDPRESS_ACCESS_TOKEN=your_access_token
```

Replace `your-site.wordpress.com` with your actual WordPress.com site URL (e.g., `fumixo5.wordpress.com`).

## Testing Your Configuration

Run the test script to verify your WordPress.com connection:

```bash
node scripts/test-full-process.js
```

If everything is set up correctly, you should see articles being successfully posted to your WordPress.com site.

## Troubleshooting

If you encounter a 401 Unauthorized error:
- Double-check your access token
- Make sure your WordPress.com site URL is correct
- Verify that your account has permission to create posts

For more information, see the [WordPress.com REST API Documentation](https://developer.wordpress.com/docs/api/).

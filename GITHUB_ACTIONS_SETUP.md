# GitHub Actions Setup Guide

This guide explains how to set up GitHub Actions to run the article scraper and publisher automatically.

## Required Secrets

You need to add the following secrets to your GitHub repository to make the workflow run successfully:

1. **WordPress.com API Configuration**:
   - `WORDPRESS_API_URL`: Your WordPress.com API URL (e.g., `https://public-api.wordpress.com/wp/v2/sites/fumixo5.wordpress.com`)
   - `WORDPRESS_CLIENT_ID`: Your WordPress.com OAuth client ID
   - `WORDPRESS_CLIENT_SECRET`: Your WordPress.com OAuth client secret
   - `WORDPRESS_USERNAME`: Your WordPress.com username
   - `WORDPRESS_PASSWORD`: Your WordPress.com password

2. **OpenRouter API Configuration**:
   - `OPENROUTER_API_KEY`: Your OpenRouter API key

3. **Site URL**:
   - `NEXT_PUBLIC_SITE_URL`: Your site URL (e.g., `https://lead-media.vercel.app`)

## How to Add Secrets to GitHub

1. Go to your GitHub repository
2. Click on "Settings" tab
3. In the left sidebar, click on "Secrets and variables" > "Actions"
4. Click on "New repository secret"
5. Add each of the secrets listed above with their respective values
6. Click "Add secret" for each one

## Testing the Workflow

After adding all the secrets, you can manually trigger the workflow:

1. Go to the "Actions" tab in your repository
2. Select the "Daily Article Scraper" workflow
3. Click "Run workflow" > "Run workflow"

This will run the workflow immediately, allowing you to verify that everything is working correctly.

## Workflow Schedule

The workflow is configured to run automatically every day at 7:00 AM UTC. You can modify the schedule by editing the cron expression in the `.github/workflows/daily-article-scraper.yml` file.

## Troubleshooting

If the workflow fails, check the following:

1. Verify that all secrets are correctly set up
2. Check the workflow logs for error messages
3. Test the script locally with the same environment variables
4. Make sure your API keys are valid and have not expired

For more information on GitHub Actions, see the [GitHub Actions documentation](https://docs.github.com/en/actions).

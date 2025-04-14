#!/usr/bin/env node

/**
 * This script helps set up Vercel deployment by retrieving the necessary tokens
 * and IDs needed for GitHub Actions.
 * 
 * Usage:
 * 1. Install Vercel CLI: npm i -g vercel
 * 2. Login to Vercel: vercel login
 * 3. Link your project: vercel link
 * 4. Run this script: node scripts/setup-vercel.js
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('Setting up Vercel deployment...');

try {
  // Get project info
  console.log('Retrieving project information...');
  const projectInfo = JSON.parse(execSync('vercel project ls --json').toString());
  
  if (!projectInfo || !projectInfo.length) {
    console.error('No projects found. Make sure you have linked your project with "vercel link"');
    process.exit(1);
  }
  
  // Get the current project
  const currentProject = projectInfo.find(p => p.link && p.link.type === 'github');
  
  if (!currentProject) {
    console.error('No GitHub-linked project found. Make sure you have linked your project with "vercel link"');
    process.exit(1);
  }
  
  // Get token
  console.log('Retrieving Vercel token...');
  const tokenInfo = JSON.parse(execSync('vercel whoami --token').toString());
  
  // Output the information
  console.log('\n=== VERCEL DEPLOYMENT INFORMATION ===');
  console.log('Add these as secrets to your GitHub repository:');
  console.log(`VERCEL_TOKEN: ${tokenInfo.token}`);
  console.log(`VERCEL_ORG_ID: ${currentProject.orgId}`);
  console.log(`VERCEL_PROJECT_ID: ${currentProject.id}`);
  console.log('=======================================\n');
  
  // Save to a file for reference
  const secretsInfo = {
    VERCEL_TOKEN: tokenInfo.token,
    VERCEL_ORG_ID: currentProject.orgId,
    VERCEL_PROJECT_ID: currentProject.id
  };
  
  fs.writeFileSync('vercel-secrets.json', JSON.stringify(secretsInfo, null, 2));
  console.log('Information saved to vercel-secrets.json (DO NOT COMMIT THIS FILE)');
  console.log('Add this file to .gitignore');
  
  // Add to .gitignore if it doesn't already contain it
  if (fs.existsSync('.gitignore')) {
    const gitignore = fs.readFileSync('.gitignore', 'utf8');
    if (!gitignore.includes('vercel-secrets.json')) {
      fs.appendFileSync('.gitignore', '\n# Vercel secrets\nvercel-secrets.json\n');
      console.log('Added vercel-secrets.json to .gitignore');
    }
  } else {
    fs.writeFileSync('.gitignore', '# Vercel secrets\nvercel-secrets.json\n');
    console.log('Created .gitignore with vercel-secrets.json');
  }
  
} catch (error) {
  console.error('Error setting up Vercel deployment:', error.message);
  console.error('Make sure you have installed and logged into the Vercel CLI:');
  console.error('  npm i -g vercel');
  console.error('  vercel login');
  console.error('  vercel link');
  process.exit(1);
}

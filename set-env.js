const fs = require('fs');
const path = require('path');

// Pull the secret from the environment (set this in Render Dashboard)
const spotifyClientSecret = process.env.SPOTIFY_CLIENT_SECRET;

// Ensure the directory exists
const envDir = path.join(__dirname, 'src', 'environments');
if (!fs.existsSync(envDir)) {
  fs.mkdirSync(envDir, { recursive: true });
}

const targetPath = path.join(envDir, 'environment.prod.ts');

const envConfigFile = `
export const environment = {
  production: true,
  spotifyClientId: '59eaaca39450479c9d97fd2da47ac4c5',
  spotifyClientSecret: '${spotifyClientSecret || ""}'
};
`;

console.log('--- BUILD INFO ---');
console.log('Generating production environment file...');
console.log('Using spotifyClientId: 59eaaca39450479c9d97fd2da47ac4c5');
if (!spotifyClientSecret) {
  console.warn('⚠️ WARNING: SPOTIFY_CLIENT_SECRET environment variable is not set!');
} else {
  console.log('✅ Found SPOTIFY_CLIENT_SECRET in environment.');
}

fs.writeFileSync(targetPath, envConfigFile);
console.log('--- FINISHED ---');

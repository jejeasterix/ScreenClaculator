const { execSync } = require('child_process');

try {
  // Installation explicite de react-scripts
  console.log('Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  console.log('Installing react-scripts...');
  execSync('npm install react-scripts --save-dev', { stdio: 'inherit' });
  
  // Exécution du build
  console.log('Building the project...');
  execSync('node ./node_modules/.bin/react-scripts build', { stdio: 'inherit' });
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}

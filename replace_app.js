const fs = require('fs');
const path = require('path');

const oldFile = path.join(__dirname, 'src', 'App.tsx');
const newFile = path.join(__dirname, 'src', 'App_new.tsx');

try {
  // Read the new file
  const content = fs.readFileSync(newFile, 'utf8');
  
  // Write to the original file
  fs.writeFileSync(oldFile, content, 'utf8');
  
  // Delete the temporary file
  fs.unlinkSync(newFile);
  
  console.log('Successfully replaced App.tsx');
} catch (error) {
  console.error('Error:', error.message);
}

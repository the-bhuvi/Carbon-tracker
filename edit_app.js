const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Step 1: Remove the History route
content = content.replace(
  /\s*<Route path="\/history" element={<History \/> } \/>\n/,
  ''
);

// Step 2: Add the RefreshDashboard route after Dashboard
content = content.replace(
  /(<Route path="\/dashboard" element={<Dashboard \/> } \/>)/,
  '$1\n                       <Route path="/refresh-dashboard" element={<AdminRoute><RefreshDashboard /></AdminRoute>} />'
);

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('File updated successfully');

const fs = require('fs');
const { execSync } = require('child_process');

const schema = fs.readFileSync('schema_full.sql', 'utf8');

// Split into statements
const statements = schema.split(';').map(s => s.trim()).filter(s => s.length > 0);

for (let i = 0; i < statements.length; i++) {
  const stmt = statements[i];
  if (stmt.startsWith('--') && !stmt.includes('\n')) continue; // Skip pure comments
  
  console.log(`Executing statement ${i+1}/${statements.length}...`);
  try {
    // Write statement to a temp file
    fs.writeFileSync('temp_stmt.sql', stmt + ';');
    
    // Execute temp file using PowerShell Get-Content
    // Wait, Get-Content inside execSync might still hit the limit if it expands into the command line?
    // No, if we do `npx @insforge/cli db query "$(cat temp_stmt.sql)"` it expands.
    // BUT since each statement is short, it won't exceed 8191 chars!
    execSync('powershell.exe -Command "npx @insforge/cli db query (Get-Content temp_stmt.sql -Raw)"', { stdio: 'inherit' });
  } catch (e) {
    console.error(`Failed at statement ${i+1}:`, e.message);
    process.exit(1);
  }
}
console.log("Success!");

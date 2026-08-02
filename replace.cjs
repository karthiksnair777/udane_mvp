const fs = require('fs');
const path = require('path');

const files = [
    'Customers.tsx', 'Dashboard.tsx', 'Expenses.tsx', 
    'Inventory.tsx', 'OnlineOrders.tsx', 'POS.tsx', 
    'SalesHistory.tsx', 'Settings.tsx', 'Suppliers.tsx', 'Profile.tsx'
];

for (const f of files) {
    const p = path.join(__dirname, 'src', 'pages', f);
    if (!fs.existsSync(p)) continue;
    
    let content = fs.readFileSync(p, 'utf8');
    
    // Add useShop import if it doesn't exist
    if (!content.includes('useShop')) {
        content = content.replace(
            /import { (useUser|useAuth).* } from '\.\.\/contexts\/AuthContext';/,
            "import { $1, useShop } from '../contexts/AuthContext';"
        );
    }

    // Replace usages
    content = content.replace(/const shopId = user\?\.profile\?\.shop_id as string \| undefined;/g, "const { shopId } = useShop();");
    content = content.replace(/const shopId = user\?\.profile\?\.shop_id;/g, "const { shopId } = useShop();");
    
    fs.writeFileSync(p, content);
}
console.log('done');

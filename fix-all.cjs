const fs = require('fs');
const path = require('path');

const files = {
    'src/components/layout/CustomerLayout.tsx': [
        { s: /import { Home, ShoppingBag, User, Search } from 'lucide-react';/g, r: "import { Home, ShoppingBag, User } from 'lucide-react';" }
    ],
    'src/pages/customer/Orders.tsx': [
        { s: /MapPin, ChevronRight, QrCode/g, r: "MapPin" },
        { s: /import { Package, Clock, MapPin, Store } from 'lucide-react';/g, r: "import { Package, Clock, MapPin, Store } from 'lucide-react';" } // ensure Store is imported if needed
    ],
    'src/pages/Inventory.tsx': [
        { s: /error\?.message/g, r: "(error as any)?.message" }
    ],
    'src/pages/Login.tsx': [
        { s: /import { useState } from 'react';\nimport { useNavigate } from 'react-router-dom';/g, r: "import { useState } from 'react';" },
        { s: /const navigate = useNavigate\(\);/g, r: "" }
    ],
    'src/pages/OnlineOrders.tsx': [
        { s: /import { supabase } from '\.\.\/supabase';\n/g, r: "" },
        { s: /ChevronLeft, Package, Clock, AlertCircle, ChevronRight, BadgeIndianRupee, Bell/g, r: "ChevronLeft, Package, Clock, AlertCircle, BadgeIndianRupee" }
    ],
    'src/pages/POS.tsx': [
        { s: /Plus, Minus, Trash2, Search, Receipt, BadgeIndianRupee, Store, Settings, Power, User, X, Edit, ChevronDown, Monitor, Smartphone, Globe, CreditCard, Banknote, QrCode, ArrowRight, ShieldAlert, CheckCircle2/g, r: "Plus, Minus, Trash2, Search, Store, Settings, Power, User, X, Edit, ChevronDown, Monitor, Smartphone, Globe, CreditCard, Banknote, QrCode, ArrowRight, ShieldAlert" },
        { s: /searchTimeout: NodeJS.Timeout/g, r: "searchTimeout: any" },
        { s: /error\?.message/g, r: "(error as any)?.message" },
        { s: /<Store className=/g, r: "<div className=" } // Or just import Store if missing
    ],
    'src/pages/SalesHistory.tsx': [
        { s: /Search, Calendar, Download, ChevronDown, X/g, r: "Search, Calendar, Download, ChevronDown" }
    ],
    'src/pages/Settings.tsx': [
        { s: /const \[shop, setShop\] = useState<Shop \| null>\(null\);/g, r: "" },
        { s: /setShop\(current\);/g, r: "" },
        { s: /error\?.message/g, r: "(error as any)?.message" }
    ]
};

for (const [f, replacements] of Object.entries(files)) {
    const fullPath = path.join(__dirname, f);
    if (fs.existsSync(fullPath)) {
        let content = fs.readFileSync(fullPath, 'utf8');
        for (const { s, r } of replacements) {
            content = content.replace(s, r);
        }
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${f}`);
    } else {
        console.log(`Missing ${f}`);
    }
}

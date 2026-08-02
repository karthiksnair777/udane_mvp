import fs from 'fs';
import path from 'path';

function fixFile(filePath, replacements) {
    let content = fs.readFileSync(filePath, 'utf8');
    for (const r of replacements) {
        content = content.replace(r.search, r.replace);
    }
    fs.writeFileSync(filePath, content);
}

const fixMap = {
    'src/components/layout/CustomerLayout.tsx': [
        { search: 'Search, ShoppingBag', replace: 'ShoppingBag' }
    ],
    'src/lib/api/auth.ts': [
        { search: "import { supabase } from '../supabase';\n", replace: '' },
        { search: 'password?: string', replace: '_password?: string' },
        { search: 'userId: string', replace: '_userId: string' },
        { search: 'callback: (event: string, session: any) => void', replace: '_callback: (event: string, session: any) => void' }
    ],
    'src/pages/AdminDashboard.tsx': [
        { search: 'ShopService, SaleService, AuthService', replace: 'ShopService, SaleService' },
        { search: 'error?.message', replace: '(error as any)?.message' }
    ],
    'src/pages/customer/Checkout.tsx': [
        { search: 'ProductService, OrderService', replace: 'OrderService' },
        { search: 'MapPin, QrCode', replace: 'MapPin' }
    ],
    'src/pages/customer/Orders.tsx': [
        { search: 'MapPin, ChevronRight, Store', replace: 'MapPin, Store' },
        { search: "MapPin, ChevronRight, Store, Search, QrCode", replace: 'MapPin, Store' },
        { search: "MapPin, ChevronRight, QrCode", replace: 'MapPin, Store' }
    ],
    'src/pages/Customers.tsx': [
        { search: "const { user, useShop }", replace: "const { useShop }" },
        { search: "import { useUser, useShop }", replace: "import { useShop }" },
        { search: "const { user } = useUser();", replace: "" }
    ],
    'src/pages/Expenses.tsx': [
        { search: "import { useUser, useShop }", replace: "import { useShop }" },
        { search: "const { user } = useUser();", replace: "" }
    ],
    'src/pages/Inventory.tsx': [
        { search: "import { useUser, useShop }", replace: "import { useShop }" },
        { search: "const { user } = useUser();", replace: "" },
        { search: /error\?.message/g, replace: '(error as any)?.message' }
    ],
    'src/pages/Login.tsx': [
        { search: "const navigate = useNavigate();", replace: "" }
    ],
    'src/pages/OnlineOrders.tsx': [
        { search: "import { supabase } from '../supabase';\n", replace: "" },
        { search: "ChevronLeft, Package, Clock, AlertCircle, ChevronRight, BadgeIndianRupee, Bell", replace: "ChevronLeft, Package, Clock, AlertCircle, BadgeIndianRupee" },
        { search: "import { useUser, useShop }", replace: "import { useShop }" },
        { search: "const { user } = useUser();", replace: "" }
    ],
    'src/pages/POS.tsx': [
        { search: "Plus, Minus, Trash2, Search, Receipt, BadgeIndianRupee, Store, Settings, Power, User, X, Edit, ChevronDown, Monitor, Smartphone, Globe, CreditCard, Banknote, QrCode, ArrowRight, ShieldAlert, CheckCircle2", replace: "Plus, Minus, Trash2, Search, Store, Settings, Power, User, X, Edit, ChevronDown, Monitor, Smartphone, Globe, CreditCard, Banknote, QrCode, ArrowRight, ShieldAlert" },
        { search: "searchTimeout: NodeJS.Timeout", replace: "searchTimeout: any" },
        { search: "error?.message", replace: '(error as any)?.message' }
    ],
    'src/pages/SalesHistory.tsx': [
        { search: "Search, Calendar, Download, ChevronDown, X", replace: "Search, Calendar, Download, ChevronDown" }
    ],
    'src/pages/Settings.tsx': [
        { search: "import { useUser, useShop }", replace: "import { useShop }" },
        { search: "const { user } = useUser();", replace: "" },
        { search: "const [shop, setShop] = useState<Shop | null>(null);", replace: "" },
        { search: "error?.message", replace: '(error as any)?.message' }
    ],
    'src/pages/Suppliers.tsx': [
        { search: "import { useUser, useShop }", replace: "import { useShop }" },
        { search: "const { user } = useUser();", replace: "" }
    ]
};

for (const [file, replacements] of Object.entries(fixMap)) {
    const fullPath = path.join(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
        fixFile(fullPath, replacements);
        console.log(`Fixed ${file}`);
    } else {
        console.log(`File not found: ${file}`);
    }
}

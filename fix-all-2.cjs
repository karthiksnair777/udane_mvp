const fs = require('fs');
const path = require('path');

const replaceInFile = (filePath, searchValue, replaceValue) => {
    const fullPath = path.join(__dirname, filePath);
    if (!fs.existsSync(fullPath)) return;
    let content = fs.readFileSync(fullPath, 'utf8');
    content = content.replace(searchValue, replaceValue);
    fs.writeFileSync(fullPath, content);
};

// src/lib/api/auth.ts
replaceInFile('src/lib/api/auth.ts', /async signUp\(email: string, _password\?: string, name\?: string\) {/, 'async signUp(email: string, _password?: string, _name?: string) {');

// src/pages/customer/Orders.tsx
replaceInFile('src/pages/customer/Orders.tsx', /MapPin, ChevronRight, QrCode/, 'MapPin, Store');
replaceInFile('src/pages/customer/Orders.tsx', /MapPin, ChevronRight, Store, Search, QrCode/, 'MapPin, Store');
replaceInFile('src/pages/customer/Orders.tsx', /MapPin, ChevronRight, Store/, 'MapPin, Store');

// src/pages/Inventory.tsx
replaceInFile('src/pages/Inventory.tsx', /error\?.message/g, '(error as any)?.message');

// src/pages/Login.tsx
replaceInFile('src/pages/Login.tsx', /import { useNavigate } from 'react-router-dom';/, '');
replaceInFile('src/pages/Login.tsx', /import { useState } from 'react';\n/, "import { useState } from 'react';\n");

// src/pages/OnlineOrders.tsx
replaceInFile('src/pages/OnlineOrders.tsx', /import { supabase } from '\.\.\/supabase';\n/, '');
replaceInFile('src/pages/OnlineOrders.tsx', /ChevronLeft, Package, Clock, AlertCircle, ChevronRight, BadgeIndianRupee, Bell/, 'ChevronLeft, Package, Clock, AlertCircle, BadgeIndianRupee');

// src/pages/POS.tsx
replaceInFile('src/pages/POS.tsx', /Plus, Minus, Trash2, Search, Receipt, BadgeIndianRupee, Store, Settings, Power, User, X, Edit, ChevronDown, Monitor, Smartphone, Globe, CreditCard, Banknote, QrCode, ArrowRight, ShieldAlert, CheckCircle2/, 'Plus, Minus, Trash2, Search, Store, Settings, Power, User, X, Edit, ChevronDown, Monitor, Smartphone, Globe, CreditCard, Banknote, QrCode, ArrowRight, ShieldAlert');
replaceInFile('src/pages/POS.tsx', /searchTimeout: NodeJS\.Timeout/, 'searchTimeout: any');
replaceInFile('src/pages/POS.tsx', /error\?.message/g, '(error as any)?.message');

// src/pages/SalesHistory.tsx
replaceInFile('src/pages/SalesHistory.tsx', /Search, Calendar, Download, ChevronDown, X/, 'Search, Calendar, Download, ChevronDown');

// src/pages/Settings.tsx
replaceInFile('src/pages/Settings.tsx', /error\?.message/g, '(error as any)?.message');

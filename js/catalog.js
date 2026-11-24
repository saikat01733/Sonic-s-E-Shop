/**
 * Sonic's E-Shop - Multi-Game Catalog Data
 * Khela Store Architecture Specification
 */

const GAME_CATALOG = [
    {
        id: "efootball",
        slug: "efootball-coin",
        name: "eFootball™ Coins",
        name_bn: "ই-ফুটবল কয়েন",
        category: "efootball",
        category_name: "eFootball",
        badge: "HOT DEAL",
        badge_color: "#ef4444",
        poster: "assets/efootball.jpg",
        icon: "⚽",
        product_type: "login_purchase", // Requires Konami ID & Password
        delivery_time: "১-১০ মিনিট",
        trust_tag: "১০০% নিরাপদ ও অফিশিয়াল",
        description: "Official Konami eFootball 2026 Coins top-up for Android and iOS devices. Safe, fast, and delivered within 1 to 10 minutes.",
        rules: [
            "সঠিক Konami Mail এবং Password প্রদান করুন।",
            "ডেলিভারির সময় আপনার একাউন্টে ২-স্টেপ ভেরিফিকেশন অন থাকলে হোয়াটসঅ্যাপে একটিভ থাকুন।",
            "টপ-আপ সম্পন্ন হওয়ার পর নিরাপদে কনমি পাসওয়ার্ড পরিবর্তন করে নিতে পারবেন।"
        ],
        custom_fields: [
            {
                id: "device",
                type: "device_selector",
                label: "Select Device Platform",
                label_bn: "ডিভাইস সিলেক্ট করুন",
                options: [
                    { id: "Android", name: "Android", sub: "Google / Play Store", icon: "android", color: "#3ddc84" },
                    { id: "iOS", name: "iOS", sub: "iPhone / Apple ID", icon: "apple", color: "#ffffff" }
                ],
                default: "Android"
            },
            {
                id: "gmail",
                type: "email",
                label: "Konami Mail / ID",
                label_bn: "কোনামি মেইল দিন",
                placeholder: "example@gmail.com",
                required: true
            },
            {
                id: "pass",
                type: "password",
                label: "Konami Password",
                label_bn: "কোনামি পাসওয়ার্ড দিন",
                placeholder: "••••••••",
                required: true
            },
            {
                id: "whatsapp",
                type: "tel",
                label: "WhatsApp Number (For Order Status)",
                label_bn: "আপনার হোয়াটসঅ্যাপ নাম্বার দিন",
                placeholder: "017XXXXXXXX",
                required: true
            }
        ],
        packages: [
            { id: "ef-130", name: "130 Coins", price: 170, stock: true, icon: "🪙" },
            { id: "ef-260", name: "260 Coins", price: null, stock: false, icon: "🪙" },
            { id: "ef-300", name: "300 Coins", price: 350, stock: true, icon: "🪙" },
            { id: "ef-550", name: "550 Coins", price: 630, stock: true, icon: "🪙" },
            { id: "ef-750", name: "750 Coins", price: 840, stock: true, icon: "🪙" },
            { id: "ef-840", name: "840 Coins", price: null, stock: false, icon: "🪙" },
            { id: "ef-1040", name: "1040 Coins", price: 1170, stock: true, icon: "🪙" },
            { id: "ef-1630", name: "1630 Coins", price: null, stock: false, icon: "🪙" },
            { id: "ef-2130", name: "2130 Coins", price: 2300, stock: true, icon: "🪙" },
            { id: "ef-3250", name: "3250 Coins", price: 3420, stock: true, icon: "🪙" },
            { id: "ef-5700", name: "5700 Coins", price: 5600, stock: true, icon: "🪙" },
            { id: "ef-12800", name: "12800 Coins", price: 12350, stock: true, icon: "🪙" },
            { id: "ef-suarez", name: "50 Coin + Luis Suárez", price: 110, stock: true, icon: "🔥", badge: "Special Deal" },
            { id: "ef-casillas", name: "100 Coin + IKER CASILLAS", price: 300, stock: true, icon: "⭐", badge: "Special Deal" }
        ]
    },
    {
        id: "pubg",
        slug: "pubg-mobile-uc",
        name: "PUBG Mobile UC",
        name_bn: "পাবজি মোবাইল ইউসি",
        category: "pubg",
        category_name: "PUBG Mobile",
        badge: "INSTANT UID",
        badge_color: "#f59e0b",
        poster: "assets/pubg.jpg",
        icon: "🔫",
        product_type: "in_game_id", // UID top-up, no password needed!
        delivery_time: "১-৫ মিনিট",
        trust_tag: "সরাসরি Player ID টপ-আপ",
        description: "Official PUBG Mobile Unknown Cash (UC) top-up via Player ID. 100% automated instant delivery to your character.",
        rules: [
            "শুধুমাত্র আপনার সঠিক PUBG Mobile Character ID (UID) দিন।",
            "কোনো পাসওয়ার্ড প্রয়োজন নেই।",
            "অর্ডার করার ১ থেকে ৫ মিনিটের মধ্যে UC একাউন্টে চলে আসবে।"
        ],
        custom_fields: [
            {
                id: "player_id",
                type: "text",
                label: "PUBG Player ID (UID)",
                label_bn: "আপনার প্লেয়ার আইডি (UID) দিন",
                placeholder: "e.g. 5123456789",
                required: true
            },
            {
                id: "character_name",
                type: "text",
                label: "Character Name (Optional)",
                label_bn: "গেমের নাম দিন (ঐচ্ছিক)",
                placeholder: "e.g. SonicGamer",
                required: false
            },
            {
                id: "whatsapp",
                type: "tel",
                label: "WhatsApp Number (For Notification)",
                label_bn: "হোয়াটসঅ্যাপ নাম্বার দিন",
                placeholder: "017XXXXXXXX",
                required: true
            }
        ],
        packages: [
            { id: "pubg-60", name: "60 UC", price: 95, stock: true, icon: "💵" },
            { id: "pubg-325", name: "325 UC", price: 450, stock: true, icon: "💵" },
            { id: "pubg-660", name: "660 UC", price: 890, stock: true, icon: "💵" },
            { id: "pubg-1800", name: "1800 UC", price: 2350, stock: true, icon: "💵" },
            { id: "pubg-3850", name: "3850 UC", price: 4650, stock: true, icon: "💵" },
            { id: "pubg-8100", name: "8100 UC", price: 9500, stock: true, icon: "💵" }
        ]
    },
    {
        id: "roblox",
        slug: "roblox-robux",
        name: "Roblox Robux",
        name_bn: "রোব্লক্স রোবক্স",
        category: "roblox",
        category_name: "Roblox",
        badge: "POPULAR",
        badge_color: "#06b6d4",
        poster: "assets/roblox.jpg",
        icon: "🧱",
        product_type: "in_game_id",
        delivery_time: "৫-১৫ মিনিট",
        trust_tag: "ইউজারনেম টপ-আপ",
        description: "Official Roblox Robux top-up for your avatar, skins, and game passes. Enter your Roblox username to receive Robux.",
        rules: [
            "সঠিক Roblox Username প্রদান করুন (পাসওয়ার্ড লাগবে না)।",
            "প্রয়োজনে গেমপাস লিংক বা ভিআইপি সার্ভার মেথড ফলো করতে হতে পারে।"
        ],
        custom_fields: [
            {
                id: "roblox_username",
                type: "text",
                label: "Roblox Username",
                label_bn: "রোব্লক্স ইউজারনেম দিন",
                placeholder: "e.g. SonicRobloxBD",
                required: true
            },
            {
                id: "whatsapp",
                type: "tel",
                label: "WhatsApp Number",
                label_bn: "হোয়াটসঅ্যাপ নাম্বার দিন",
                placeholder: "017XXXXXXXX",
                required: true
            }
        ],
        packages: [
            { id: "rbx-80", name: "80 Robux", price: 120, stock: true, icon: "🪙" },
            { id: "rbx-400", name: "400 Robux", price: 550, stock: true, icon: "🪙" },
            { id: "rbx-800", name: "800 Robux", price: 1050, stock: true, icon: "🪙" },
            { id: "rbx-1700", name: "1700 Robux", price: 2100, stock: true, icon: "🪙" },
            { id: "rbx-4500", name: "4500 Robux", price: 5200, stock: true, icon: "🪙" }
        ]
    }
];

if (typeof window !== 'undefined') {
    window.GAME_CATALOG = GAME_CATALOG;
}

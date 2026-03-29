"use client"

import React, { useState } from "react"
import Image from "next/image"
import {
  Home,
  UtensilsCrossed,
  ShoppingCart,
  Receipt,
  User,
  Search,
  SlidersHorizontal,
  MapPin,
  Bell,
  Star,
  Clock,
  ChevronDown,
  Plus,
  Minus,
  Trash2,
  ArrowLeft,
  Heart,
  ChevronRight,
  Grid3X3,
  Flame,
  Coffee,
  Sandwich,
} from "lucide-react"

// Theme colors
const colors = {
  primary: "#FF6B35",
  primaryLight: "#FF8C5A",
  background: "#FFF9F5",
  surface: "#FFF5EE",
  white: "#FFFFFF",
  text: "#1A1A2E",
  textSecondary: "#6B7280",
  success: "#10B981",
  error: "#EF4444",
  border: "#F3E8E2",
}

// Mock Data
const canteens = [
  {
    id: "1",
    name: "Main Canteen",
    image: "https://images.unsplash.com/photo-1567521464027-f127ff144326?w=400",
    rating: 4.5,
    deliveryTime: "15-20 min",
    isOpen: true,
    location: "Ground Floor, Main Building",
  },
  {
    id: "2",
    name: "Tech Cafe",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400",
    rating: 4.8,
    deliveryTime: "10-15 min",
    isOpen: true,
    location: "IT Faculty Building",
  },
  {
    id: "3",
    name: "Green Garden",
    image: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=400",
    rating: 4.2,
    deliveryTime: "20-25 min",
    isOpen: true,
    location: "Near Library",
  },
]

const foodItems = [
  {
    id: "1",
    name: "Chicken Fried Rice",
    description: "Delicious fried rice with tender chicken pieces",
    price: 450,
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400",
    category: "Rice",
    rating: 4.7,
  },
  {
    id: "2",
    name: "Kottu Roti",
    description: "Sri Lankan style chopped roti with vegetables",
    price: 380,
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400",
    category: "Kottu",
    rating: 4.9,
  },
  {
    id: "3",
    name: "Submarine",
    description: "Classic submarine sandwich with grilled chicken",
    price: 320,
    image: "https://images.unsplash.com/photo-1509722747041-616f39b57569?w=400",
    category: "Snacks",
    rating: 4.4,
  },
  {
    id: "4",
    name: "Fresh Juice",
    description: "Freshly squeezed fruit juice",
    price: 150,
    image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400",
    category: "Beverages",
    rating: 4.6,
  },
]

const categories = [
  { id: "all", name: "All", icon: Grid3X3 },
  { id: "rice", name: "Rice", icon: UtensilsCrossed },
  { id: "kottu", name: "Kottu", icon: Flame },
  { id: "snacks", name: "Snacks", icon: Sandwich },
  { id: "beverages", name: "Drinks", icon: Coffee },
]

type ScreenType = "home" | "canteens" | "menu" | "cart" | "orders"

export default function SLIITEatsPreview() {
  const [activeScreen, setActiveScreen] = useState<ScreenType>("home")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [cartItems, setCartItems] = useState([
    { ...foodItems[0], quantity: 2 },
    { ...foodItems[3], quantity: 1 },
  ])

  const updateQuantity = (id: string, change: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = Math.max(0, item.quantity + change)
            return { ...item, quantity: newQty }
          }
          return item
        })
        .filter((item) => item.quantity > 0)
    )
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-4 md:p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">SLIIT Eats</h1>
        <p className="text-gray-600">React Native Mobile App Screens Preview</p>
        <p className="text-sm text-gray-500 mt-1">Click screens below to preview different views</p>
      </div>

      {/* Screen Selector */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {(["home", "canteens", "menu", "cart", "orders"] as ScreenType[]).map((screen) => (
          <button
            key={screen}
            onClick={() => setActiveScreen(screen)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeScreen === screen
                ? "bg-[#FF6B35] text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-orange-100"
            }`}
          >
            {screen.charAt(0).toUpperCase() + screen.slice(1)}
          </button>
        ))}
      </div>

      {/* Phone Mockup */}
      <div className="max-w-[380px] mx-auto">
        <div className="bg-gray-900 rounded-[3rem] p-3 shadow-2xl">
          <div className="bg-black rounded-[2.5rem] overflow-hidden relative">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-black rounded-b-2xl z-50" />

            {/* Screen Content */}
            <div
              className="h-[700px] overflow-y-auto"
              style={{ backgroundColor: colors.background }}
            >
              {activeScreen === "home" && <HomeScreen />}
              {activeScreen === "canteens" && <CanteensScreen />}
              {activeScreen === "menu" && <MenuScreen selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />}
              {activeScreen === "cart" && (
                <CartScreen cartItems={cartItems} updateQuantity={updateQuantity} subtotal={subtotal} />
              )}
              {activeScreen === "orders" && <OrdersScreen />}
            </div>

            {/* Bottom Navigation */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-white rounded-2xl shadow-xl flex items-center justify-around py-2 px-2">
                <NavItem icon={Home} label="Home" active={activeScreen === "home"} onClick={() => setActiveScreen("home")} />
                <NavItem
                  icon={UtensilsCrossed}
                  label="Canteens"
                  active={activeScreen === "canteens"}
                  onClick={() => setActiveScreen("canteens")}
                />
                <button
                  onClick={() => setActiveScreen("cart")}
                  className="relative -mt-8 w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: colors.primary }}
                >
                  <ShoppingCart className="w-6 h-6 text-white" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center border-2 border-white">
                    {cartItems.length}
                  </span>
                </button>
                <NavItem icon={Receipt} label="Orders" active={activeScreen === "orders"} onClick={() => setActiveScreen("orders")} />
                <NavItem icon={User} label="Profile" active={false} onClick={() => {}} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="max-w-3xl mx-auto mt-12 grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-2">Files Included</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>- HomeScreen.tsx</li>
            <li>- CanteensScreen.tsx</li>
            <li>- FoodMenuScreen.tsx</li>
            <li>- CartScreen.tsx</li>
            <li>- OrdersScreen.tsx</li>
            <li>- BottomNavigation.tsx</li>
            <li>- AppNavigator.tsx</li>
            <li>- theme.ts & mockData.ts</li>
          </ul>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-2">How to Use</h3>
          <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
            <li>Copy react-native-screens folder</li>
            <li>Install navigation dependencies</li>
            <li>Update App.tsx with AppNavigator</li>
            <li>Replace mock data with API calls</li>
            <li>Customize theme colors as needed</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

function NavItem({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ElementType
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button onClick={onClick} className="flex flex-col items-center px-2 py-1">
      <Icon className={`w-5 h-5 ${active ? "text-[#FF6B35]" : "text-gray-400"}`} />
      <span className={`text-[10px] mt-1 ${active ? "text-[#FF6B35] font-medium" : "text-gray-400"}`}>
        {label}
      </span>
    </button>
  )
}

function HomeScreen() {
  return (
    <div className="pb-24">
      {/* Header */}
      <div className="px-4 pt-10 pb-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <MapPin className="w-4 h-4 text-[#FF6B35]" />
              <span>Deliver to</span>
            </div>
            <button className="flex items-center gap-1 font-semibold text-gray-900">
              SLIIT Campus
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
          <button className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center relative">
            <Bell className="w-5 h-5 text-gray-700" />
            <span className="absolute top-2 right-2 w-4 h-4 bg-[#FF6B35] rounded-full text-[10px] text-white flex items-center justify-center">
              2
            </span>
          </button>
        </div>
      </div>

      {/* Greeting */}
      <div className="px-4 mb-4">
        <span className="text-2xl text-gray-900">Good Morning </span>
        <span className="text-2xl font-bold text-[#FF6B35]">John!</span>
      </div>

      {/* Search */}
      <div className="px-4 mb-4">
        <div className="bg-white rounded-xl shadow-sm flex items-center px-4 py-3">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search for food..."
            className="flex-1 ml-3 text-sm outline-none bg-transparent"
          />
          <button className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: colors.primary }}>
            <SlidersHorizontal className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Promo Banner */}
      <div className="px-4 mb-6">
        <div className="rounded-2xl p-4 flex overflow-hidden" style={{ backgroundColor: colors.primary }}>
          <div className="flex-1">
            <p className="text-white/80 text-xs">Special Offer</p>
            <p className="text-white text-3xl font-bold my-1">20% OFF</p>
            <p className="text-white/80 text-xs mb-3">On all lunch items today</p>
            <button className="bg-white text-[#FF6B35] px-4 py-2 rounded-lg text-sm font-semibold">
              Order Now
            </button>
          </div>
          <div className="w-24 h-24 rounded-xl overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200"
              alt="Food"
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="px-4 mb-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-bold text-gray-900">Categories</h2>
          <button className="text-sm text-[#FF6B35]">See All</button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat, i) => (
            <div key={cat.id} className="flex flex-col items-center">
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-sm ${
                  i === 0 ? "bg-[#FF6B35]" : "bg-white"
                }`}
              >
                <cat.icon className={`w-6 h-6 ${i === 0 ? "text-white" : "text-[#FF6B35]"}`} />
              </div>
              <span className={`text-xs mt-1 ${i === 0 ? "text-[#FF6B35] font-medium" : "text-gray-500"}`}>
                {cat.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Open Canteens */}
      <div className="px-4 mb-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-bold text-gray-900">Open Canteens</h2>
          <button className="text-sm text-[#FF6B35]">See All</button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {canteens.slice(0, 2).map((canteen) => (
            <div key={canteen.id} className="w-48 bg-white rounded-xl shadow-sm overflow-hidden flex-shrink-0">
              <div className="h-24 overflow-hidden">
                <Image
                  src={canteen.image}
                  alt={canteen.name}
                  width={192}
                  height={96}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-2">
                <h3 className="font-semibold text-sm text-gray-900">{canteen.name}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs text-gray-700">{canteen.rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">{canteen.deliveryTime}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Popular Items */}
      <div className="px-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-bold text-gray-900">Popular Items</h2>
          <button className="text-sm text-[#FF6B35]">See All</button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {foodItems.slice(0, 4).map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="h-24 overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.name}
                  width={200}
                  height={96}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-2">
                <h3 className="font-semibold text-sm text-gray-900 truncate">{item.name}</h3>
                <p className="text-[10px] text-gray-500 line-clamp-2">{item.description}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="font-bold text-sm text-[#FF6B35]">Rs. {item.price}</span>
                  <button className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: colors.primary }}>
                    <Plus className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function CanteensScreen() {
  return (
    <div className="pb-24">
      {/* Header */}
      <div className="px-4 pt-10 pb-4 flex items-center justify-between">
        <button className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="font-bold text-lg text-gray-900">Canteens</h1>
        <div className="w-10" />
      </div>

      {/* Search */}
      <div className="px-4 mb-4">
        <div className="bg-white rounded-xl shadow-sm flex items-center px-4 py-3">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search canteens..."
            className="flex-1 ml-3 text-sm outline-none bg-transparent"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 mb-4 flex gap-2">
        {["All", "Open", "Closed"].map((tab, i) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              i === 1 ? "bg-[#FF6B35] text-white" : "bg-white text-gray-600"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Canteen Cards */}
      <div className="px-4 space-y-4">
        {canteens.map((canteen) => (
          <div key={canteen.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="h-36 relative overflow-hidden">
              <Image
                src={canteen.image}
                alt={canteen.name}
                width={400}
                height={144}
                className="w-full h-full object-cover"
              />
              <span
                className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold text-white ${
                  canteen.isOpen ? "bg-green-500" : "bg-red-500"
                }`}
              >
                {canteen.isOpen ? "Open" : "Closed"}
              </span>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-bold text-gray-900">{canteen.name}</h3>
                <div className="flex items-center gap-1 bg-[#FFF5EE] px-2 py-1 rounded-lg">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-semibold text-gray-900">{canteen.rating}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
                <MapPin className="w-4 h-4" />
                <span>{canteen.location}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1 text-[#FF6B35]">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">{canteen.deliveryTime}</span>
                </div>
                {canteen.isOpen && (
                  <button className="flex items-center gap-1 bg-[#FF6B35] text-white px-4 py-2 rounded-lg text-sm font-semibold">
                    Order Now
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function MenuScreen({
  selectedCategory,
  setSelectedCategory,
}: {
  selectedCategory: string
  setSelectedCategory: (c: string) => void
}) {
  return (
    <div className="pb-24">
      {/* Header Image */}
      <div className="h-48 relative">
        <Image
          src={canteens[0].image}
          alt="Main Canteen"
          width={400}
          height={192}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute top-10 left-4 right-4 flex justify-between">
          <button className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <button className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center">
            <Heart className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Info Card */}
      <div className="mx-4 -mt-10 relative z-10 bg-white rounded-2xl shadow-md p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Main Canteen</h1>
            <div className="flex items-center gap-1 text-gray-500 text-sm">
              <MapPin className="w-4 h-4" />
              <span>Ground Floor, Main Building</span>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-[#FFF5EE] px-3 py-2 rounded-lg">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="font-bold text-gray-900">4.5</span>
          </div>
        </div>
        <div className="flex justify-around pt-3 border-t border-gray-100">
          <div className="text-center">
            <Clock className="w-5 h-5 text-[#FF6B35] mx-auto" />
            <p className="font-bold text-sm text-gray-900 mt-1">15-20 min</p>
            <p className="text-[10px] text-gray-500">Delivery</p>
          </div>
          <div className="text-center">
            <UtensilsCrossed className="w-5 h-5 text-[#FF6B35] mx-auto" />
            <p className="font-bold text-sm text-gray-900 mt-1">8</p>
            <p className="text-[10px] text-gray-500">Items</p>
          </div>
          <div className="text-center">
            <Receipt className="w-5 h-5 text-[#FF6B35] mx-auto" />
            <p className="font-bold text-sm text-gray-900 mt-1">Free</p>
            <p className="text-[10px] text-gray-500">Delivery</p>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="px-4 mt-4">
        <h2 className="font-bold text-gray-900 mb-3">Menu</h2>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                selectedCategory === cat.id ? "bg-[#FF6B35] text-white" : "bg-white text-gray-700 shadow-sm"
              }`}
            >
              <cat.icon className="w-4 h-4" />
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Food Items */}
      <div className="px-4 mt-4 space-y-3">
        {foodItems.map((item) => (
          <div key={item.id} className="bg-white rounded-xl shadow-sm flex overflow-hidden">
            <div className="w-28 h-28 overflow-hidden">
              <Image src={item.image} alt={item.name} width={112} height={112} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 p-3 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-gray-900">{item.name}</h3>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs text-gray-700">{item.rating}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2">{item.description}</p>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-[#FF6B35]">Rs. {item.price}</span>
                <button className="flex items-center gap-1 bg-[#FF6B35] text-white px-3 py-1 rounded-lg text-sm font-semibold">
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Cart */}
      <div className="fixed bottom-24 left-4 right-4 max-w-[348px] mx-auto">
        <div className="bg-[#FF6B35] rounded-2xl px-4 py-3 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-white" />
            <span className="text-white font-semibold">View Cart</span>
          </div>
          <span className="text-white font-bold">Rs. 850</span>
        </div>
      </div>
    </div>
  )
}

function CartScreen({
  cartItems,
  updateQuantity,
  subtotal,
}: {
  cartItems: Array<{ id: string; name: string; price: number; image: string; category: string; quantity: number }>
  updateQuantity: (id: string, change: number) => void
  subtotal: number
}) {
  return (
    <div className="pb-36">
      {/* Header */}
      <div className="px-4 pt-10 pb-4 flex items-center justify-between">
        <button className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="font-bold text-lg text-gray-900">My Cart</h1>
        <button className="text-red-500 text-sm font-medium">Clear</button>
      </div>

      {/* Delivery Address */}
      <div className="px-4 mb-4">
        <div className="bg-white rounded-xl shadow-sm p-3 flex items-center">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: colors.surface }}>
            <MapPin className="w-5 h-5 text-[#FF6B35]" />
          </div>
          <div className="flex-1 ml-3">
            <p className="text-xs text-gray-500">Deliver to</p>
            <p className="font-medium text-gray-900 text-sm">SLIIT Campus - Main Building</p>
          </div>
          <button className="text-[#FF6B35] text-sm font-semibold">Change</button>
        </div>
      </div>

      {/* Cart Items */}
      <div className="px-4 mb-4">
        <h2 className="font-bold text-gray-900 mb-3">Order Items</h2>
        <div className="space-y-3">
          {cartItems.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm flex overflow-hidden">
              <div className="w-24 h-24 overflow-hidden">
                <Image src={item.image} alt={item.name} width={96} height={96} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 p-3 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">{item.name}</h3>
                    <p className="text-xs text-gray-500">{item.category}</p>
                  </div>
                  <button className="p-1">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#FF6B35]">Rs. {item.price}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: colors.surface }}
                    >
                      <Minus className="w-4 h-4 text-[#FF6B35]" />
                    </button>
                    <span className="font-semibold text-gray-900 w-4 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: colors.primary }}
                    >
                      <Plus className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="px-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h2 className="font-bold text-gray-900 mb-3">Order Summary</h2>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-500">Subtotal</span>
            <span className="text-gray-900">Rs. {subtotal}</span>
          </div>
          <div className="flex justify-between text-sm mb-3">
            <span className="text-gray-500">Delivery Fee</span>
            <span className="text-green-500 font-semibold">FREE</span>
          </div>
          <div className="border-t border-gray-100 pt-3 flex justify-between">
            <span className="font-bold text-gray-900">Total</span>
            <span className="font-bold text-xl text-[#FF6B35]">Rs. {subtotal}</span>
          </div>
        </div>
      </div>

      {/* Checkout Button */}
      <div className="fixed bottom-24 left-4 right-4 max-w-[348px] mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Total Payment</p>
            <p className="font-bold text-lg text-gray-900">Rs. {subtotal}</p>
          </div>
          <button className="flex items-center gap-2 bg-[#FF6B35] text-white px-6 py-3 rounded-xl font-semibold">
            Checkout
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

function OrdersScreen() {
  return (
    <div className="pb-24">
      {/* Header */}
      <div className="px-4 pt-10 pb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        <button className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
          <Bell className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {/* Tabs */}
      <div className="px-4 mb-4">
        <div className="bg-white rounded-xl shadow-sm p-1 flex">
          <button className="flex-1 py-2 rounded-lg text-sm font-semibold bg-[#FF6B35] text-white">
            Active
            <span className="ml-1 bg-white text-[#FF6B35] text-xs px-2 py-0.5 rounded-full">2</span>
          </button>
          <button className="flex-1 py-2 rounded-lg text-sm font-semibold text-gray-500">History</button>
        </div>
      </div>

      {/* Orders */}
      <div className="px-4 space-y-4">
        {/* Active Order 1 */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-bold text-gray-900">Order #ORD001</h3>
              <p className="text-xs text-gray-500">Jan 15, 2024 at 10:30 AM</p>
            </div>
            <span className="flex items-center gap-1 bg-orange-50 text-[#FF6B35] px-2 py-1 rounded-full text-xs font-semibold">
              <Flame className="w-3 h-3" />
              Preparing
            </span>
          </div>

          <div className="flex items-center mb-3">
            <div className="flex -space-x-3">
              <Image
                src={foodItems[0].image}
                alt="Food"
                width={40}
                height={40}
                className="w-10 h-10 rounded-lg border-2 border-white object-cover"
              />
              <Image
                src={foodItems[3].image}
                alt="Food"
                width={40}
                height={40}
                className="w-10 h-10 rounded-lg border-2 border-white object-cover"
              />
            </div>
            <div className="ml-3">
              <p className="font-medium text-sm text-gray-900">3 items</p>
              <p className="text-xs text-gray-500">Main Canteen</p>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-3">
            <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full w-2/3 bg-[#FF6B35] rounded-full" />
            </div>
            <div className="flex justify-between mt-1 text-[10px]">
              <span className="text-gray-400">Ordered</span>
              <span className="text-gray-900 font-medium">Preparing</span>
              <span className="text-gray-400">Ready</span>
            </div>
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-500">Total</p>
              <p className="font-bold text-[#FF6B35]">Rs. 1,050</p>
            </div>
            <div className="flex items-center gap-1 bg-[#FFF5EE] px-3 py-2 rounded-lg">
              <Clock className="w-4 h-4 text-[#FF6B35]" />
              <span className="text-sm font-semibold text-[#FF6B35]">15 min</span>
            </div>
          </div>
        </div>

        {/* Active Order 2 - Ready */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-bold text-gray-900">Order #ORD002</h3>
              <p className="text-xs text-gray-500">Jan 15, 2024 at 09:45 AM</p>
            </div>
            <span className="flex items-center gap-1 bg-green-50 text-green-600 px-2 py-1 rounded-full text-xs font-semibold">
              <Clock className="w-3 h-3" />
              Ready for Pickup
            </span>
          </div>

          <div className="flex items-center mb-3">
            <div className="flex -space-x-3">
              <Image
                src={foodItems[1].image}
                alt="Food"
                width={40}
                height={40}
                className="w-10 h-10 rounded-lg border-2 border-white object-cover"
              />
            </div>
            <div className="ml-3">
              <p className="font-medium text-sm text-gray-900">1 item</p>
              <p className="text-xs text-gray-500">Main Canteen</p>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-3">
            <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full w-full bg-green-500 rounded-full" />
            </div>
            <div className="flex justify-between mt-1 text-[10px]">
              <span className="text-gray-400">Ordered</span>
              <span className="text-gray-400">Preparing</span>
              <span className="text-green-600 font-medium">Ready</span>
            </div>
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-500">Total</p>
              <p className="font-bold text-[#FF6B35]">Rs. 380</p>
            </div>
            <div className="flex items-center gap-1 bg-green-50 px-3 py-2 rounded-lg">
              <span className="text-sm font-semibold text-green-600">Ready!</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Monitor,
  Search,
  Plus,
  Minus,
  X,
  ShoppingCart,
  CreditCard,
  Wrench,
  Flame,
  Droplet,
} from "lucide-react";

const numberFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 0,
});

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

type ProductCategory = "lubricants" | "gas" | "engine-oil";

type Product = {
  id: string;
  name: string;
  category: ProductCategory;
  brand?: string;
  unit: string;
  currentStock: number;
  minThreshold: number;
  pricePerUnit: number;
  status: "in-stock" | "low-stock" | "out-of-stock";
  lastUpdated: string;
};

type CartItem = {
  product: Product;
  quantity: number;
};

// Mock data - รวมสินค้าทั้งหมด
const mockProducts: Product[] = [
  // น้ำมันหล่อลื่น
  {
    id: "LUB-001",
    name: "น้ำมันเครื่อง 10W-40",
    category: "lubricants",
    brand: "PTT",
    unit: "ลิตร",
    currentStock: 45,
    minThreshold: 20,
    pricePerUnit: 250,
    status: "in-stock",
    lastUpdated: "2024-12-15 10:30",
  },
  {
    id: "LUB-002",
    name: "น้ำมันเครื่อง 5W-30",
    category: "lubricants",
    brand: "PTT",
    unit: "ลิตร",
    currentStock: 32,
    minThreshold: 20,
    pricePerUnit: 280,
    status: "in-stock",
    lastUpdated: "2024-12-15 10:30",
  },
  {
    id: "LUB-003",
    name: "น้ำมันเกียร์",
    category: "lubricants",
    brand: "PTT",
    unit: "ลิตร",
    currentStock: 15,
    minThreshold: 10,
    pricePerUnit: 320,
    status: "low-stock",
    lastUpdated: "2024-12-14 15:20",
  },
  {
    id: "LUB-004",
    name: "น้ำมันเบรก",
    category: "lubricants",
    brand: "PTT",
    unit: "ลิตร",
    currentStock: 8,
    minThreshold: 10,
    pricePerUnit: 180,
    status: "low-stock",
    lastUpdated: "2024-12-14 15:20",
  },
  // แก๊ส
  {
    id: "GAS-001",
    name: "แก๊ส LPG",
    category: "gas",
    brand: "PTT",
    unit: "ถัง",
    currentStock: 120,
    minThreshold: 50,
    pricePerUnit: 350,
    status: "in-stock",
    lastUpdated: "2024-12-15 09:00",
  },
  {
    id: "GAS-002",
    name: "แก๊ส NGV",
    category: "gas",
    brand: "PTT",
    unit: "ถัง",
    currentStock: 85,
    minThreshold: 50,
    pricePerUnit: 420,
    status: "in-stock",
    lastUpdated: "2024-12-15 09:00",
  },
  {
    id: "GAS-003",
    name: "แก๊สหุงต้ม",
    category: "gas",
    brand: "PTT",
    unit: "ถัง",
    currentStock: 35,
    minThreshold: 30,
    pricePerUnit: 380,
    status: "low-stock",
    lastUpdated: "2024-12-14 16:45",
  },
  // น้ำมันเครื่อง
  {
    id: "ENG-001",
    name: "น้ำมันเครื่อง 15W-40",
    category: "engine-oil",
    brand: "PTT",
    unit: "ลิตร",
    currentStock: 60,
    minThreshold: 30,
    pricePerUnit: 220,
    status: "in-stock",
    lastUpdated: "2024-12-15 11:00",
  },
  {
    id: "ENG-002",
    name: "น้ำมันเครื่อง 20W-50",
    category: "engine-oil",
    brand: "PTT",
    unit: "ลิตร",
    currentStock: 48,
    minThreshold: 30,
    pricePerUnit: 200,
    status: "in-stock",
    lastUpdated: "2024-12-15 11:00",
  },
  {
    id: "ENG-003",
    name: "น้ำมันเครื่อง 0W-20",
    category: "engine-oil",
    brand: "PTT",
    unit: "ลิตร",
    currentStock: 25,
    minThreshold: 30,
    pricePerUnit: 300,
    status: "low-stock",
    lastUpdated: "2024-12-14 14:30",
  },
];

export default function POS() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [posSearchTerm, setPosSearchTerm] = useState("");
  const [posCategory, setPosCategory] = useState<ProductCategory | "all">("all");

  // POS Functions
  const posFilteredProducts = products.filter((product) => {
    const matchesCategory = posCategory === "all" || product.category === posCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(posSearchTerm.toLowerCase()) ||
      product.brand?.toLowerCase().includes(posSearchTerm.toLowerCase()) ||
      product.id.toLowerCase().includes(posSearchTerm.toLowerCase());
    const hasStock = product.currentStock > 0;
    return matchesCategory && matchesSearch && hasStock;
  });

  const addToCart = (product: Product) => {
    if (product.currentStock <= 0) {
      alert("สินค้านี้หมดสต็อก");
      return;
    }

    setCart((prev) => {
      const existingItem = prev.find((item) => item.product.id === product.id);
      if (existingItem) {
        if (existingItem.quantity + 1 > product.currentStock) {
          alert(`จำนวนในตะกร้าเกินสต็อกที่มี (สต็อกปัจจุบัน: ${product.currentStock} ${product.unit})`);
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prev) => {
      const item = prev.find((item) => item.product.id === productId);
      if (item && quantity > item.product.currentStock) {
        alert(`จำนวนเกินสต็อกที่มี (สต็อกปัจจุบัน: ${item.product.currentStock} ${item.product.unit})`);
        return prev;
      }
      return prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      );
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.quantity * item.product.pricePerUnit, 0);

  const updateProductStatus = (stock: number, minThreshold: number): Product["status"] => {
    if (stock <= 0) return "out-of-stock";
    if (stock < minThreshold) return "low-stock";
    return "in-stock";
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert("กรุณาเลือกสินค้าก่อนชำระเงิน");
      return;
    }

    // อัพเดตสต็อกสินค้า
    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    const dateString = `${now.toISOString().split("T")[0]} ${timeString}`;

    setProducts((prev) =>
      prev.map((p) => {
        const cartItem = cart.find((item) => item.product.id === p.id);
        if (cartItem) {
          const newStock = p.currentStock - cartItem.quantity;
          return {
            ...p,
            currentStock: newStock,
            status: updateProductStatus(newStock, p.minThreshold),
            lastUpdated: dateString,
          };
        }
        return p;
      })
    );

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    alert(
      `ชำระเงินสำเร็จ!\n\nจำนวนรายการ: ${totalItems} รายการ\nยอดรวม: ${currencyFormatter.format(cartTotal)}\n\nขอบคุณที่ใช้บริการ`
    );

    clearCart();
  };

  const getCategoryLabel = (category: ProductCategory) => {
    if (category === "lubricants") return "น้ำมันหล่อลื่น";
    if (category === "gas") return "แก๊ส";
    return "น้ำมันเครื่อง";
  };

  const getCategoryIcon = (category: ProductCategory) => {
    if (category === "lubricants") return Wrench;
    if (category === "gas") return Flame;
    return Droplet;
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* POS Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
            <Monitor className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">ระบบ POS - ขายสินค้า</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">ปั๊มไฮโซ</p>
          </div>
        </div>
        <button
          onClick={() => navigate("/app/gas-station/station-products")}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors font-semibold flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          ออกจาก POS
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Product Grid - Left Side */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search and Category Filter */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="ค้นหาสินค้า..."
                value={posSearchTerm}
                onChange={(e) => setPosSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white text-lg"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setPosCategory("all")}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  posCategory === "all"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}
              >
                ทั้งหมด
              </button>
              <button
                onClick={() => setPosCategory("lubricants")}
                className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                  posCategory === "lubricants"
                    ? "bg-purple-500 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}
              >
                <Wrench className="w-4 h-4" />
                น้ำมันหล่อลื่น
              </button>
              <button
                onClick={() => setPosCategory("gas")}
                className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                  posCategory === "gas"
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}
              >
                <Flame className="w-4 h-4" />
                แก๊ส
              </button>
              <button
                onClick={() => setPosCategory("engine-oil")}
                className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                  posCategory === "engine-oil"
                    ? "bg-emerald-500 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}
              >
                <Droplet className="w-4 h-4" />
                น้ำมันเครื่อง
              </button>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {posFilteredProducts.map((product) => {
                const CategoryIcon = getCategoryIcon(product.category);
                const cartItem = cart.find((item) => item.product.id === product.id);
                return (
                  <motion.button
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => addToCart(product)}
                    disabled={product.currentStock <= 0}
                    className={`p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all text-left ${
                      product.currentStock <= 0
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:scale-105 active:scale-95"
                    } ${cartItem ? "ring-2 ring-blue-500" : ""}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <CategoryIcon className="w-4 h-4 text-gray-500" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {getCategoryLabel(product.category)}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-800 dark:text-white mb-1 text-sm line-clamp-2">
                      {product.name}
                    </h3>
                    {product.brand && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{product.brand}</p>
                    )}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {currencyFormatter.format(product.pricePerUnit)}
                      </span>
                      {cartItem && (
                        <span className="px-2 py-1 bg-blue-500 text-white rounded-full text-xs font-semibold">
                          {cartItem.quantity}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      สต็อก: {numberFormatter.format(product.currentStock)} {product.unit}
                    </p>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Cart - Right Side */}
        <div className="w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              ตะกร้าสินค้า
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">ยังไม่มีสินค้าในตะกร้า</p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.product.id}
                  className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 dark:text-white text-sm">
                        {item.product.name}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {currencyFormatter.format(item.product.pricePerUnit)} / {item.product.unit}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center font-semibold text-gray-800 dark:text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="font-bold text-gray-800 dark:text-white">
                      {currencyFormatter.format(item.quantity * item.product.pricePerUnit)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Summary */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-4">
            <div className="flex items-center justify-between text-lg">
              <span className="font-semibold text-gray-700 dark:text-gray-300">ยอดรวม</span>
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {currencyFormatter.format(cartTotal)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={clearCart}
                disabled={cart.length === 0}
                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ล้างตะกร้า
              </button>
              <button
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-lg transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <CreditCard className="w-5 h-5" />
                ชำระเงิน
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


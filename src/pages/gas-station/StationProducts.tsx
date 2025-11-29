import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Wrench,
  Flame,
  Droplet,
  Search,
  Plus,
  Edit,
  Trash2,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  X,
  Save,
  ArrowUp,
  Monitor,
  Minus,
  CreditCard,
  History,
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
  unit: string; // หน่วย เช่น "ลิตร", "ถัง", "กระป๋อง"
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

// Mock data
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

export default function StationProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isPOSMode, setIsPOSMode] = useState(false);
  
  // POS Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [posSearchTerm, setPosSearchTerm] = useState("");
  const [posCategory, setPosCategory] = useState<ProductCategory | "all">("all");
  
  // Modal states
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [isStockInModalOpen, setIsStockInModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [saleQuantity, setSaleQuantity] = useState("");
  const [stockInQuantity, setStockInQuantity] = useState("");

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const summary = {
    totalProducts: products.length,
    totalStock: products.reduce((sum, p) => sum + p.currentStock, 0),
    totalValue: products.reduce((sum, p) => sum + p.currentStock * p.pricePerUnit, 0),
    lowStockCount: products.filter((p) => p.status === "low-stock" || p.status === "out-of-stock").length,
    lubricantsCount: products.filter((p) => p.category === "lubricants").length,
    gasCount: products.filter((p) => p.category === "gas").length,
    engineOilCount: products.filter((p) => p.category === "engine-oil").length,
  };

  // ฟังก์ชันอัพเดตสถานะสต็อก
  const updateProductStatus = (stock: number, minThreshold: number): Product["status"] => {
    if (stock <= 0) return "out-of-stock";
    if (stock < minThreshold) return "low-stock";
    return "in-stock";
  };

  // เปิด Modal ขายสินค้า
  const handleOpenSaleModal = (product: Product) => {
    setSelectedProduct(product);
    setSaleQuantity("");
    setIsSaleModalOpen(true);
  };

  // เปิด Modal เพิ่มสต็อก
  const handleOpenStockInModal = (product: Product) => {
    setSelectedProduct(product);
    setStockInQuantity("");
    setIsStockInModalOpen(true);
  };

  // บันทึกการขายสินค้า
  const handleSale = () => {
    if (!selectedProduct || !saleQuantity) return;
    
    const quantity = parseFloat(saleQuantity);
    if (isNaN(quantity) || quantity <= 0) {
      alert("กรุณากรอกจำนวนที่ถูกต้อง");
      return;
    }
    
    if (quantity > selectedProduct.currentStock) {
      alert(`จำนวนที่ขายเกินสต็อกที่มี (สต็อกปัจจุบัน: ${selectedProduct.currentStock} ${selectedProduct.unit})`);
      return;
    }

    const newStock = selectedProduct.currentStock - quantity;
    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    const dateString = `${now.toISOString().split("T")[0]} ${timeString}`;

    setProducts((prev) =>
      prev.map((p) =>
        p.id === selectedProduct.id
          ? {
              ...p,
              currentStock: newStock,
              status: updateProductStatus(newStock, p.minThreshold),
              lastUpdated: dateString,
            }
          : p
      )
    );

    alert(`บันทึกการขายสำเร็จ!\n\nสินค้า: ${selectedProduct.name}\nจำนวน: ${quantity} ${selectedProduct.unit}\nยอดรวม: ${currencyFormatter.format(quantity * selectedProduct.pricePerUnit)}`);
    
    setIsSaleModalOpen(false);
    setSelectedProduct(null);
    setSaleQuantity("");
  };

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

  // บันทึกการเพิ่มสต็อก
  const handleStockIn = () => {
    if (!selectedProduct || !stockInQuantity) return;
    
    const quantity = parseFloat(stockInQuantity);
    if (isNaN(quantity) || quantity <= 0) {
      alert("กรุณากรอกจำนวนที่ถูกต้อง");
      return;
    }

    const newStock = selectedProduct.currentStock + quantity;
    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    const dateString = `${now.toISOString().split("T")[0]} ${timeString}`;

    setProducts((prev) =>
      prev.map((p) =>
        p.id === selectedProduct.id
          ? {
              ...p,
              currentStock: newStock,
              status: updateProductStatus(newStock, p.minThreshold),
              lastUpdated: dateString,
            }
          : p
      )
    );

    alert(`บันทึกการเพิ่มสต็อกสำเร็จ!\n\nสินค้า: ${selectedProduct.name}\nจำนวนที่เพิ่ม: ${quantity} ${selectedProduct.unit}\nสต็อกใหม่: ${newStock} ${selectedProduct.unit}`);
    
    setIsStockInModalOpen(false);
    setSelectedProduct(null);
    setStockInQuantity("");
  };

  const getStatusBadgeClasses = (status: Product["status"]) => {
    if (status === "in-stock") {
      return "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800";
    }
    if (status === "low-stock") {
      return "bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800";
    }
    return "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800";
  };

  const getStatusIcon = (status: Product["status"]) => {
    if (status === "in-stock") return CheckCircle;
    if (status === "low-stock") return AlertTriangle;
    return AlertTriangle;
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

  // POS View
  if (isPOSMode) {
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
            onClick={() => {
              setIsPOSMode(false);
              clearCart();
            }}
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

  // Normal View
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-3">
              <Package className="w-8 h-8 text-blue-500" />
              สินค้าภายในปั้ม
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              จัดการสต็อกและขายสินค้าภายในปั้ม: น้ำมันหล่อลื่น แก๊ส และน้ำมันเครื่อง
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/app/gas-station/product-sales-history")}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 whitespace-nowrap"
            >
              <History className="w-5 h-5" />
              ประวัติการขายสินค้า
            </button>
            <button
              onClick={() => setIsPOSMode(true)}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 whitespace-nowrap"
            >
              <Monitor className="w-5 h-5" />
              เปิดระบบ POS
            </button>
          </div>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            title: "สินค้าทั้งหมด",
            value: summary.totalProducts,
            subtitle: "รายการ",
            icon: Package,
            iconColor: "bg-gradient-to-br from-blue-500 to-blue-600",
          },
          {
            title: "สต็อกรวม",
            value: numberFormatter.format(summary.totalStock),
            subtitle: "หน่วย",
            icon: TrendingUp,
            iconColor: "bg-gradient-to-br from-purple-500 to-purple-600",
          },
          {
            title: "มูลค่าสต็อก",
            value: currencyFormatter.format(summary.totalValue),
            subtitle: "บาท",
            icon: ShoppingCart,
            iconColor: "bg-gradient-to-br from-emerald-500 to-emerald-600",
          },
          {
            title: "สต็อกต่ำ / หมด",
            value: summary.lowStockCount,
            subtitle: "รายการ",
            icon: AlertTriangle,
            iconColor: "bg-gradient-to-br from-red-500 to-red-600",
            alert: summary.lowStockCount > 0,
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            <div className="p-4">
              <div className="flex items-center">
                <div className={`w-16 h-16 ${stat.iconColor} rounded-lg flex items-center justify-center shadow-lg mr-4`}>
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h6 className="text-gray-600 dark:text-gray-400 text-sm font-semibold mb-1">{stat.title}</h6>
                  <h6 className="text-gray-800 dark:text-white text-2xl font-extrabold mb-0">{stat.value}</h6>
                  <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">{stat.subtitle}</p>
                </div>
              </div>
              {stat.alert && (
                <div className="mt-3 flex items-center justify-end">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Category Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6"
      >
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
              selectedCategory === "all"
                ? "bg-blue-500 text-white shadow-lg"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            <Package className="w-4 h-4" />
            ทั้งหมด ({summary.totalProducts})
          </button>
          <button
            onClick={() => setSelectedCategory("lubricants")}
            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
              selectedCategory === "lubricants"
                ? "bg-purple-500 text-white shadow-lg"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            <Wrench className="w-4 h-4" />
            น้ำมันหล่อลื่น ({summary.lubricantsCount})
          </button>
          <button
            onClick={() => setSelectedCategory("gas")}
            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
              selectedCategory === "gas"
                ? "bg-orange-500 text-white shadow-lg"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            <Flame className="w-4 h-4" />
            แก๊ส ({summary.gasCount})
          </button>
          <button
            onClick={() => setSelectedCategory("engine-oil")}
            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
              selectedCategory === "engine-oil"
                ? "bg-emerald-500 text-white shadow-lg"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            <Droplet className="w-4 h-4" />
            น้ำมันเครื่อง ({summary.engineOilCount})
          </button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 flex flex-col md:flex-row gap-4 mb-6"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="ค้นหาชื่อสินค้า, ยี่ห้อ, รหัส..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white transition-all duration-200"
          />
        </div>
        <button
          className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          เพิ่มสินค้า
        </button>
      </motion.div>

      {/* Products Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-1">รายการสินค้า</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            สินค้าภายในปั้ม: น้ำมันหล่อลื่น แก๊ส และน้ำมันเครื่อง
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  ประเภท
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  ชื่อสินค้า
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  ยี่ห้อ
                </th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  สต็อกปัจจุบัน
                </th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  เกณฑ์ต่ำสุด
                </th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  ราคาต่อหน่วย
                </th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  มูลค่า
                </th>
                <th className="text-center py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  สถานะ
                </th>
                <th className="text-center py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-8 px-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    ไม่พบข้อมูลสินค้าที่ตรงกับเงื่อนไขค้นหา
                  </td>
                </tr>
              )}
              {filteredProducts.map((product, index) => {
                const StatusIcon = getStatusIcon(product.status);
                const CategoryIcon = getCategoryIcon(product.category);
                return (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                      product.status === "low-stock" || product.status === "out-of-stock"
                        ? "bg-orange-50/30 dark:bg-orange-900/10"
                        : ""
                    }`}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <CategoryIcon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {getCategoryLabel(product.category)}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm font-semibold text-gray-800 dark:text-white">
                      {product.name}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">{product.brand || "-"}</td>
                    <td className="py-4 px-6 text-sm text-right font-semibold text-gray-800 dark:text-white">
                      {numberFormatter.format(product.currentStock)} {product.unit}
                    </td>
                    <td className="py-4 px-6 text-sm text-right text-gray-600 dark:text-gray-400">
                      {numberFormatter.format(product.minThreshold)} {product.unit}
                    </td>
                    <td className="py-4 px-6 text-sm text-right text-gray-600 dark:text-gray-400">
                      {currencyFormatter.format(product.pricePerUnit)}
                    </td>
                    <td className="py-4 px-6 text-sm text-right font-semibold text-gray-800 dark:text-white">
                      {currencyFormatter.format(product.currentStock * product.pricePerUnit)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${getStatusBadgeClasses(
                          product.status
                        )}`}
                      >
                        <StatusIcon className="w-3.5 h-3.5" />
                        {product.status === "in-stock" && "มีสต็อก"}
                        {product.status === "low-stock" && "สต็อกต่ำ"}
                        {product.status === "out-of-stock" && "หมดสต็อก"}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenSaleModal(product)}
                          disabled={product.currentStock <= 0}
                          className="p-2 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="ขายสินค้า"
                        >
                          <ShoppingCart className="w-4 h-4 text-emerald-500 hover:text-emerald-600" />
                        </button>
                        <button
                          onClick={() => handleOpenStockInModal(product)}
                          className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl transition-colors"
                          title="เพิ่มสต็อก"
                        >
                          <ArrowUp className="w-4 h-4 text-blue-500 hover:text-blue-600" />
                        </button>
                        <button
                          className="p-2 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-xl transition-colors"
                          title="แก้ไข"
                        >
                          <Edit className="w-4 h-4 text-purple-500 hover:text-purple-600" />
                        </button>
                        <button
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl transition-colors"
                          title="ลบ"
                        >
                          <Trash2 className="w-4 h-4 text-red-500 hover:text-red-600" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Alert Section */}
      {summary.lowStockCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 dark:border-orange-600 rounded-xl p-6 shadow-md"
        >
          <div className="flex items-start gap-4">
            <div className="p-2 bg-orange-500/20 rounded-xl flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-orange-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-orange-900 dark:text-orange-100 mb-1">
                แจ้งเตือนสต็อกต่ำ
              </h3>
              <p className="text-sm text-orange-800 dark:text-orange-200 mb-3">
                มีสินค้าที่สต็อกต่ำหรือหมดสต็อก กรุณาตรวจสอบและสั่งซื้อเพิ่มเติม
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {products
                  .filter((p) => p.status === "low-stock" || p.status === "out-of-stock")
                  .map((product) => (
                    <div
                      key={product.id}
                      className="p-3 bg-white dark:bg-gray-800 border border-orange-200 dark:border-orange-800 rounded-lg flex items-center justify-between gap-3 hover:border-orange-300 dark:hover:border-orange-700 transition-colors"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-orange-900 dark:text-orange-100 text-sm truncate">
                            {product.name}
                          </div>
                          <div className="text-xs text-orange-700 dark:text-orange-300">
                            เหลือ {numberFormatter.format(product.currentStock)} {product.unit}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleOpenStockInModal(product)}
                        className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap"
                        title={`เพิ่มสต็อก${product.name}`}
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                        เพิ่มสต็อก
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Sale Modal */}
      {isSaleModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <ShoppingCart className="w-6 h-6 text-emerald-500" />
                ขายสินค้า
              </h2>
              <button
                onClick={() => {
                  setIsSaleModalOpen(false);
                  setSelectedProduct(null);
                  setSaleQuantity("");
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">ชื่อสินค้า</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-white">{selectedProduct.name}</p>
                {selectedProduct.brand && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">ยี่ห้อ: {selectedProduct.brand}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">สต็อกปัจจุบัน</p>
                  <p className="text-lg font-semibold text-gray-800 dark:text-white">
                    {numberFormatter.format(selectedProduct.currentStock)} {selectedProduct.unit}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">ราคาต่อหน่วย</p>
                  <p className="text-lg font-semibold text-gray-800 dark:text-white">
                    {currencyFormatter.format(selectedProduct.pricePerUnit)}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  จำนวนที่ขาย ({selectedProduct.unit}) *
                </label>
                <input
                  type="number"
                  min="0.01"
                  max={selectedProduct.currentStock}
                  step="0.01"
                  value={saleQuantity}
                  onChange={(e) => setSaleQuantity(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 text-gray-800 dark:text-white"
                  autoFocus
                />
              </div>

              {saleQuantity && !isNaN(parseFloat(saleQuantity)) && parseFloat(saleQuantity) > 0 && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">ยอดรวม</span>
                    <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                      {currencyFormatter.format(parseFloat(saleQuantity) * selectedProduct.pricePerUnit)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">สต็อกหลังขาย</span>
                    <span className="text-lg font-semibold text-gray-800 dark:text-white">
                      {numberFormatter.format(selectedProduct.currentStock - parseFloat(saleQuantity))}{" "}
                      {selectedProduct.unit}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={() => {
                    setIsSaleModalOpen(false);
                    setSelectedProduct(null);
                    setSaleQuantity("");
                  }}
                  className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors font-semibold"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleSale}
                  disabled={!saleQuantity || isNaN(parseFloat(saleQuantity)) || parseFloat(saleQuantity) <= 0}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-lg transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  บันทึกการขาย
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Stock In Modal */}
      {isStockInModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <ArrowUp className="w-6 h-6 text-blue-500" />
                เพิ่มสต็อก
              </h2>
              <button
                onClick={() => {
                  setIsStockInModalOpen(false);
                  setSelectedProduct(null);
                  setStockInQuantity("");
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">ชื่อสินค้า</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-white">{selectedProduct.name}</p>
                {selectedProduct.brand && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">ยี่ห้อ: {selectedProduct.brand}</p>
                )}
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">สต็อกปัจจุบัน</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-white">
                  {numberFormatter.format(selectedProduct.currentStock)} {selectedProduct.unit}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  จำนวนที่เพิ่ม ({selectedProduct.unit}) *
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={stockInQuantity}
                  onChange={(e) => setStockInQuantity(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white"
                  autoFocus
                />
              </div>

              {stockInQuantity && !isNaN(parseFloat(stockInQuantity)) && parseFloat(stockInQuantity) > 0 && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">สต็อกหลังเพิ่ม</span>
                    <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      {numberFormatter.format(selectedProduct.currentStock + parseFloat(stockInQuantity))}{" "}
                      {selectedProduct.unit}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={() => {
                    setIsStockInModalOpen(false);
                    setSelectedProduct(null);
                    setStockInQuantity("");
                  }}
                  className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors font-semibold"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleStockIn}
                  disabled={!stockInQuantity || isNaN(parseFloat(stockInQuantity)) || parseFloat(stockInQuantity) <= 0}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  บันทึกการเพิ่มสต็อก
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}


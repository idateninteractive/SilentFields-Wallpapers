import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { BookOpen, Image as ImageIcon, Info, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

import { Wallpaper, TabType, CartItem } from './types';
import { INITIAL_WALLPAPERS } from './data/wallpapers';

import Header from './components/Header';
import HomeSection from './components/HomeSection';
import WallpaperDetailModal from './components/WallpaperDetailModal';
import Cart from './components/Cart';
import LibraryModal from './components/LibraryModal';
import AdminPanel from './components/AdminPanel';

interface ToastState {
  message: string;
  type: 'success' | 'info' | 'error';
}

// Safe wrapper for localStorage to prevent SecurityError in sandbox/iframes
const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem(key);
      }
    } catch (e) {
      console.warn('localStorage.getItem is not available:', e);
    }
    return null;
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(key, value);
      }
    } catch (e) {
      console.warn('localStorage.setItem is not available:', e);
    }
  },
  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(key);
      }
    } catch (e) {
      console.warn('localStorage.removeItem is not available:', e);
    }
  }
};

export default function App() {
  // State: Core Catalog
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>(() => {
    const saved = safeStorage.getItem('wallpaper_catalog');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing catalog:', e);
      }
    }
    return INITIAL_WALLPAPERS;
  });

  // State: Cart Items (synced with localStorage)
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = safeStorage.getItem('wallpaper_cart');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing cart:', e);
      }
    }
    return [];
  });

  // State: Owned Wallpaper IDs (synced with localStorage, pre-populated with one free item)
  const [ownedWallpapers, setOwnedWallpapers] = useState<string[]>(() => {
    const saved = safeStorage.getItem('wallpaper_owned');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing owned library:', e);
      }
    }
    return ['ethereal-cosmic-nebula'];
  });

  // UI Control states
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [selectedWallpaper, setSelectedWallpaper] = useState<Wallpaper | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = safeStorage.getItem('wallpaper_theme');
    // Default to true (dark) as this is a "Last Hope Night" themed gallery aesthetic
    return saved === 'dark' || !saved;
  });

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      safeStorage.setItem('wallpaper_theme', next ? 'dark' : 'light');
      return next;
    });
  };

  // Sync state modifications back to local storages
  useEffect(() => {
    safeStorage.setItem('wallpaper_catalog', JSON.stringify(wallpapers));
  }, [wallpapers]);

  useEffect(() => {
    safeStorage.setItem('wallpaper_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    safeStorage.setItem('wallpaper_owned', JSON.stringify(ownedWallpapers));
  }, [ownedWallpapers]);

  // Toast Notification trigger
  const showNotification = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast]);

  // Cart actions
  const handleAddToCart = (wallpaper: Wallpaper, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation(); // Avoid opening detail modal
    }

    // Check if owned already
    if (ownedWallpapers.includes(wallpaper.id)) {
      showNotification('You already own this premium wallpaper in your Collection!', 'info');
      return;
    }

    // Check if in cart already
    const isAlreadyInCart = cart.some(item => item.wallpaperId === wallpaper.id);
    if (isAlreadyInCart) {
      setIsCartOpen(true);
      return;
    }

    // Add to cart
    const finalPrice = wallpaper.discount ? wallpaper.price * (1 - wallpaper.discount / 100) : wallpaper.price;
    setCart(prev => [...prev, { wallpaperId: wallpaper.id, price: finalPrice }]);
    setIsCartOpen(true);
    showNotification(`Added "${wallpaper.title}" to your Shopping Cart.`, 'success');
  };

  // Direct checkout/buy action
  const handleDirectBuy = (wallpaper: Wallpaper, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }

    if (ownedWallpapers.includes(wallpaper.id)) {
      showNotification('You already own this wallpaper in your Collection!', 'info');
      setIsLibraryOpen(true);
      return;
    }

    // Add to cart for session completeness
    if (!cart.some(item => item.wallpaperId === wallpaper.id)) {
      const finalPrice = wallpaper.discount ? wallpaper.price * (1 - wallpaper.discount / 100) : wallpaper.price;
      setCart(prev => [...prev, { wallpaperId: wallpaper.id, price: finalPrice }]);
    }

    showNotification('Thank you! Redirecting to the secure payment portal...', 'success');

    // Simulate standard purchase addition
    setOwnedWallpapers(prev => {
      const combined = [...prev, wallpaper.id];
      return Array.from(new Set(combined));
    });

    // Clear cart item since we bought it
    setCart(prev => prev.filter(item => item.wallpaperId !== wallpaper.id));

    // If this is NOT a native link click (e.g., custom button or some other caller),
    // then open it as a fallback synchronously to avoid popup blocks:
    if (!e || !(e.currentTarget instanceof HTMLAnchorElement)) {
      try {
        const win = window.open('https://rzp.io/rzp/TAoh3hiu', '_blank');
        if (!win || win.closed || typeof win.closed === 'undefined') {
          window.location.href = 'https://rzp.io/rzp/TAoh3hiu';
        }
      } catch (err) {
        window.location.href = 'https://rzp.io/rzp/TAoh3hiu';
      }
    }
  };

  const handleRemoveFromCart = (wallpaperId: string) => {
    setCart(prev => prev.filter(item => item.wallpaperId !== wallpaperId));
    showNotification('Item removed from your cart.', 'info');
  };

  const handleRemoveOwned = (wallpaperId: string) => {
    setOwnedWallpapers(prev => prev.filter(id => id !== wallpaperId));
    showNotification('Wallpaper removed from your collection.', 'info');
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;

    // Simulate buying
    const wallpaperIdsPurchased = cart.map(item => item.wallpaperId);
    
    // Add unique purchased items to owned collection
    setOwnedWallpapers(prev => {
      const combined = [...prev, ...wallpaperIdsPurchased];
      return Array.from(new Set(combined));
    });

    // Clear cart
    setCart([]);
    setIsCartOpen(false);
    
    // Open library immediately so they can see and download their wallpapers
    setIsLibraryOpen(true);
    showNotification('Thank you! Redirecting to the secure payment portal...', 'success');

    // Open checkout link (Razorpay) with a fallback redirect if popup is blocked
    try {
      const win = window.open('https://rzp.io/rzp/TAoh3hiu', '_blank');
      if (!win || win.closed || typeof win.closed === 'undefined') {
        window.location.href = 'https://rzp.io/rzp/TAoh3hiu';
      }
    } catch (e) {
      window.location.href = 'https://rzp.io/rzp/TAoh3hiu';
    }
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between selection:bg-[#ff3333] selection:text-white transition-colors duration-300 ${
      isDarkMode ? 'bg-[#0a0a0c] text-zinc-100' : 'bg-white text-zinc-900'
    }`}>
      {/* 1. Header component */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={cart.length}
        onCartClick={() => setIsCartOpen(true)}
        ownedCount={ownedWallpapers.length}
        onLibraryClick={() => setIsLibraryOpen(true)}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
      />

      {/* 2. Main Body Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {activeTab === 'admin' ? (
          <AdminPanel
            wallpapers={wallpapers}
            setWallpapers={setWallpapers}
            isDarkMode={isDarkMode}
            setActiveTab={setActiveTab}
            showNotification={showNotification}
          />
        ) : (
          <HomeSection
            wallpapers={wallpapers}
            onWallpaperClick={setSelectedWallpaper}
            onAddToCart={handleDirectBuy}
            isWallpaperInCart={(id) => cart.some(item => item.wallpaperId === id)}
            isWallpaperOwned={(id) => ownedWallpapers.includes(id)}
            isDarkMode={isDarkMode}
          />
        )}
      </main>

      {/* 3. Footer */}
      <footer className={`border-t py-16 text-xs transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-zinc-950 border-zinc-900/60 text-zinc-500' 
          : 'bg-zinc-50 border-zinc-200 text-zinc-500'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className={`flex flex-col md:flex-row items-center justify-between gap-6 border-b pb-10 transition-colors duration-300 ${
            isDarkMode ? 'border-zinc-900/60' : 'border-zinc-200'
          }`}>
            <div className="flex items-center space-x-3">
              <div className="bg-[#ff3333] p-1.5 rounded">
                <ImageIcon className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-black text-xl tracking-tighter text-[#ff3333] italic uppercase">
                Last Hope Night
              </span>
            </div>
            
            <div className={`flex flex-wrap justify-center gap-6 font-bold uppercase tracking-wider text-[10px] transition-colors duration-300 ${
              isDarkMode ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-650 hover:text-zinc-900'
            }`}>
              <span className="hover:text-[#ff3333] cursor-pointer transition-colors">4K Ultra HD Formats</span>
              <span className="hover:text-[#ff3333] cursor-pointer transition-colors">Live Mockups</span>
              <span className="hover:text-[#ff3333] cursor-pointer transition-colors">Direct Checkout Secure</span>
              <span className="hover:text-[#ff3333] cursor-pointer transition-colors">Personal DRM-free Use</span>
              <span onClick={() => setActiveTab('admin')} className="hover:text-[#ff3333] text-[#ff3333] font-black cursor-pointer transition-colors">★ Admin Portal</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left leading-relaxed text-zinc-500">
            <p>
              © 2026 Last Hope Night. Designed as a high-performance modern interactive React SPA.<br />
              All visual placeholders and wallpapers are curated for personal workspace customization.
            </p>
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full border transition-colors duration-300 ${
              isDarkMode 
                ? 'bg-zinc-900/50 border-zinc-800 text-zinc-400' 
                : 'bg-zinc-100 border-zinc-200 text-zinc-600'
            }`}>
              <Info className="w-3.5 h-3.5 text-[#ff3333] flex-shrink-0" />
              <span className="font-semibold uppercase tracking-wide text-[10px]">Over 30,000+ happy desk setups customized worldwide</span>
            </div>
          </div>
        </div>
      </footer>

      {/* 4. Global Modals & Overlays */}
      <AnimatePresence>
        {/* Shopping Cart Drawer */}
        {isCartOpen && (
          <Cart
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            cartItems={cart}
            wallpapers={wallpapers}
            onRemoveFromCart={handleRemoveFromCart}
            onCheckout={handleCheckout}
          />
        )}

        {/* Wallpaper Detail & Live Device Preview Modal */}
        {selectedWallpaper && (
          <WallpaperDetailModal
            wallpaper={selectedWallpaper}
            onClose={() => setSelectedWallpaper(null)}
            onAddToCart={(w, e) => handleDirectBuy(w, e)}
            isWallpaperInCart={cart.some(item => item.wallpaperId === selectedWallpaper.id)}
            isWallpaperOwned={ownedWallpapers.includes(selectedWallpaper.id)}
          />
        )}

        {/* Saved Wallpapers Library/Collection View */}
        {isLibraryOpen && (
          <LibraryModal
            isOpen={isLibraryOpen}
            onClose={() => setIsLibraryOpen(false)}
            ownedIds={ownedWallpapers}
            wallpapers={wallpapers}
            onRemoveOwned={handleRemoveOwned}
          />
        )}

        {/* Notification Toast Alert Banner */}
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 left-6 z-50 flex items-center space-x-3 bg-zinc-950 border border-zinc-900 border-l-4 border-l-[#ff3333] text-white p-4 rounded-r-xl shadow-2xl glow-red min-w-[280px]"
            id="toast-notification"
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-[#ff3333] flex-shrink-0" />
            )}
            <div className="flex-1">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider font-mono">
                {toast.type === 'success' ? 'SUCCESS' : 'ALERT'}
              </p>
              <p className="text-sm text-zinc-200 mt-0.5 font-medium">{toast.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

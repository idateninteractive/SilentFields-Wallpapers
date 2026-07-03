import { motion } from 'motion/react';
import { X, Trash2, ShoppingBag, ShieldCheck, CreditCard } from 'lucide-react';
import { Wallpaper, CartItem } from '../types';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  wallpapers: Wallpaper[];
  onRemoveFromCart: (wallpaperId: string) => void;
  onCheckout: () => void;
}

export default function Cart({
  isOpen,
  onClose,
  cartItems,
  wallpapers,
  onRemoveFromCart,
  onCheckout,
}: CartProps) {
  if (!isOpen) return null;

  // Find wallpaper specifications for items in cart
  const cartWallpapers = cartItems.map(item => {
    const wallpaper = wallpapers.find(w => w.id === item.wallpaperId);
    return {
      wallpaper,
      cartItem: item
    };
  }).filter(item => !!item.wallpaper);

  // Computations
  const originalSubtotal = cartWallpapers.reduce((acc, item) => acc + (item.wallpaper?.price || 0), 0);
  
  const finalTotal = cartWallpapers.reduce((acc, item) => {
    const wallpaper = item.wallpaper;
    if (!wallpaper) return acc;
    const price = wallpaper.discount ? wallpaper.price * (1 - wallpaper.discount / 100) : wallpaper.price;
    return acc + price;
  }, 0);

  const discountSavings = originalSubtotal - finalTotal;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-xs">
      {/* Click outside backdrop to close */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />

      {/* Flyout panel body */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full max-w-md h-full bg-white border-l border-zinc-200 shadow-2xl flex flex-col justify-between"
        id="shopping-cart-drawer"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <div className="flex items-center space-x-2.5">
            <ShoppingBag className="w-5 h-5 text-[#ff3333]" />
            <h2 className="font-display font-black text-lg text-zinc-850 uppercase tracking-wider">
              My Shopping Cart
            </h2>
            <span className="bg-[#ff3333] text-white font-mono text-xs font-bold px-2 py-0.5 rounded-full">
              {cartItems.length}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-500 hover:text-zinc-800 transition"
            aria-label="Close cart"
            id="close-cart-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart items list */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-white">
          {cartWallpapers.length > 0 ? (
            cartWallpapers.map(({ wallpaper }) => {
              if (!wallpaper) return null;
              const hasDiscount = !!wallpaper.discount;
              const finalPrice = hasDiscount ? wallpaper.price * (1 - wallpaper.discount! / 100) : wallpaper.price;

              return (
                <div
                  key={wallpaper.id}
                  id={`cart-item-${wallpaper.id}`}
                  className="flex items-center space-x-4 bg-zinc-50 p-3 rounded-xl border border-zinc-200 group hover:border-zinc-300 transition-all"
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-zinc-200">
                    <img
                      src={wallpaper.coverImage}
                      alt={wallpaper.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Title & Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-zinc-850 text-sm truncate group-hover:text-[#ff3333] transition-colors">
                      {wallpaper.title}
                    </h4>
                    <p className="text-zinc-400 text-xxs font-black mt-0.5 uppercase tracking-wide font-mono">
                      By {wallpaper.creator}
                    </p>
                    <span className="inline-block bg-white text-emerald-600 text-[9px] font-bold font-mono px-2 py-0.5 rounded border border-zinc-200 mt-1 uppercase tracking-wider">
                      Personal License
                    </span>
                  </div>

                  {/* Price and Delete trigger */}
                  <div className="flex flex-col items-end space-y-2">
                    <div className="text-right">
                      {hasDiscount ? (
                        <div className="flex flex-col">
                          <span className="text-zinc-450 line-through text-xxs font-mono">
                            ${wallpaper.price.toFixed(2)}
                          </span>
                          <span className="text-zinc-800 font-mono font-bold text-sm">
                            ${finalPrice.toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-zinc-800 font-mono font-bold text-sm">
                          ${wallpaper.price.toFixed(2)}
                        </span>
                      )}
                    </div>

                    <button
                      id={`remove-item-${wallpaper.id}`}
                      onClick={() => onRemoveFromCart(wallpaper.id)}
                      className="text-zinc-400 hover:text-[#ff3333] transition-colors p-1"
                      title="Remove wallpaper"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-4">
              <div className="p-4 bg-zinc-50 rounded-full border border-dashed border-zinc-200 text-zinc-400">
                <ShoppingBag className="w-12 h-12" />
              </div>
              <h3 className="font-display font-bold text-zinc-700 uppercase tracking-wide text-base">Your cart is empty</h3>
              <p className="text-zinc-600 text-xs max-w-xs leading-relaxed font-medium">
                Add premium artist collections or individual paid backgrounds to your cart to complete purchase.
              </p>
            </div>
          )}
        </div>

        {/* Bottom checkout summaries section */}
        {cartWallpapers.length > 0 && (
          <div className="p-5 border-t border-zinc-200 bg-zinc-50 space-y-4">
            {/* Summary */}
            <div className="space-y-2 text-sm text-zinc-700">
              <div className="flex justify-between">
                <span className="font-semibold text-zinc-500">Subtotal</span>
                <span className="font-mono">${originalSubtotal.toFixed(2)}</span>
              </div>
              {discountSavings > 0 && (
                <div className="flex justify-between text-brand-red font-semibold">
                  <span>Special Discount</span>
                  <span className="font-mono">-${discountSavings.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-zinc-200 pt-2 text-base font-bold text-zinc-800 uppercase tracking-wide">
                <span>Grand Total</span>
                <span className="font-mono text-lg text-brand-red">${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Check guarantees */}
            <div className="bg-white rounded-xl p-3 border border-zinc-200 flex items-center space-x-2.5 text-xxs text-zinc-500">
              <ShieldCheck className="w-4.5 h-4.5 text-[#ff3333] flex-shrink-0" />
              <span>Full high-res original source formats (PNG/JPEG) are instantly unlocked on purchase.</span>
            </div>

            {/* Primary Trigger button */}
            <button
              id="checkout-trigger-btn"
              onClick={onCheckout}
              className="w-full flex items-center justify-center space-x-2 bg-[#ff3333] hover:bg-red-700 text-white py-4 px-4 rounded-xl font-bold transition-all duration-300 shadow-xl hover:shadow-red-950/10 active:scale-98 cursor-pointer text-xs uppercase tracking-wider"
            >
              <CreditCard className="w-4.5 h-4.5" />
              <span>Secure Checkout — ${finalTotal.toFixed(2)}</span>
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

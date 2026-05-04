import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([]);
    const [appliedPromotion, setAppliedPromotion] = useState(null);
    const [discountAmount, setDiscountAmount] = useState(0);

    const addToCart = (foodItem, qty = 1, showAlert = true) => {
        setCartItems(prev => {
            // Check if cart is empty or item is from same canteen
            if (prev.length > 0 && !foodItem.isCustomOrder) {
                const firstCanteenId = prev[0]?.canteenId;
                const itemCanteenId = foodItem.canteenId;
                
                if (firstCanteenId && itemCanteenId && firstCanteenId !== itemCanteenId) {
                    if (showAlert) {
                        // This would be handled by the component that calls addToCart
                        // Return prev items to prevent adding
                        return prev;
                    }
                    return prev;
                }
            }

            // For custom orders, don't allow duplicates - each custom order is unique
            if (foodItem.isCustomOrder) {
                // Check if this custom order already exists
                const existingCustom = prev.find(i => i.isCustomOrder && i.customOrderData?.description === foodItem.customOrderData?.description);
                if (existingCustom) {
                    return prev; // Don't add duplicate custom orders
                }
                return [...prev, { ...foodItem, quantity: qty }];
            }
            
            // For regular food items, check for existing and update quantity
            const existing = prev.find(i => i._id === foodItem._id || i.foodItemId === foodItem.foodItemId);
            if (existing) {
                return prev.map(i =>
                    (i._id === foodItem._id || i.foodItemId === foodItem.foodItemId)
                        ? { ...i, quantity: i.quantity + qty }
                        : i
                );
            }
            return [...prev, { ...foodItem, quantity: qty }];
        });
    };

    const removeFromCart = (itemId) => {
        setCartItems(prev => prev.filter(i => i._id !== itemId && i.foodItemId !== itemId));
    };

    const updateQty = (itemId, qty) => {
        if (qty <= 0) {
            removeFromCart(itemId);
            return;
        }
        setCartItems(prev =>
            prev.map(i =>
                (i._id === itemId || i.foodItemId === itemId) ? { ...i, quantity: qty } : i
            )
        );
    };

    const updateItemNote = (itemId, note) => {
        setCartItems(prev =>
            prev.map(i =>
                (i._id === itemId || i.foodItemId === itemId) ? { ...i, note: note } : i
            )
        );
    };

    const clearCart = () => {
        setCartItems([]);
        setAppliedPromotion(null);
        setDiscountAmount(0);
    };

    const applyPromotion = (promotion, discount) => {
        setAppliedPromotion(promotion);
        setDiscountAmount(discount);
    };

    const removePromotion = () => {
        setAppliedPromotion(null);
        setDiscountAmount(0);
    };

    const cartTotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const finalTotal = parseFloat((cartTotal - discountAmount).toFixed(2));
    const itemCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQty,
            updateItemNote,
            clearCart,
            cartTotal,
            finalTotal,
            itemCount,
            appliedPromotion,
            discountAmount,
            applyPromotion,
            removePromotion
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}

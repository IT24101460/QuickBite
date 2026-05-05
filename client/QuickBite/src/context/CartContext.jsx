import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([]);
    const [appliedPromotion, setAppliedPromotion] = useState(null);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [promotionRemovedMessage, setPromotionRemovedMessage] = useState(null);

    useEffect(() => {
        if (!appliedPromotion) {
            setDiscountAmount(0);
            return;
        }

        if (appliedPromotion.applicableTo === 'specific') {
            const promotionItems = appliedPromotion.foodItems || [];
            const applicableIds = promotionItems.map(item => String(item._id || item.foodItemId));
            
            const hasApplicableItem = cartItems.some(item => {
                const itemId = String(item.foodItemId || item._id);
                return applicableIds.includes(itemId);
            });
            
            if (!hasApplicableItem) {
                setAppliedPromotion(null);
                setDiscountAmount(0);
                setPromotionRemovedMessage('Promotion removed: No applicable items left in cart');
                return;
            }
            
            const applicableSubtotal = cartItems.reduce((sum, item) => {
                const itemId = String(item.foodItemId || item._id);
                if (applicableIds.includes(itemId)) {
                    return sum + (item.price * item.quantity);
                }
                return sum;
            }, 0);
            
            if (appliedPromotion.discountType === 'percentage') {
                setDiscountAmount(applicableSubtotal * (appliedPromotion.discountValue / 100));
            } else if (appliedPromotion.discountType === 'fixed') {
                setDiscountAmount(Math.min(appliedPromotion.discountValue, applicableSubtotal));
            }
        } else if (appliedPromotion.applicableTo === 'all') {
            if (cartItems.length === 0) {
                setAppliedPromotion(null);
                setDiscountAmount(0);
                setPromotionRemovedMessage('Promotion removed: Cart is empty');
                return;
            }
            
            const newCartTotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
            
            if (appliedPromotion.discountType === 'percentage') {
                setDiscountAmount(newCartTotal * (appliedPromotion.discountValue / 100));
            } else if (appliedPromotion.discountType === 'fixed') {
                setDiscountAmount(Math.min(appliedPromotion.discountValue, newCartTotal));
            }
        }
    }, [cartItems, appliedPromotion]);

    const addToCart = (foodItem, qty = 1) => {
        console.log('=== CART DEBUG ===');
        console.log('Adding item:', foodItem.name, 'ID:', foodItem._id || foodItem.foodItemId);
        
        setCartItems(prev => {
            console.log('Current cart length:', prev.length);
            console.log('Current cart items:', prev.map(i => ({ name: i.name, _id: i._id, foodItemId: i.foodItemId })));
            
            // For custom orders, don't allow duplicates - each custom order is unique
            if (foodItem.isCustomOrder) {
                // Check if this custom order already exists
                const existingCustom = prev.find(i => i.isCustomOrder && i.customOrderData?.description === foodItem.customOrderData?.description);
                if (existingCustom) {
                    console.log('Custom order already exists, not adding');
                    return prev; // Don't add duplicate custom orders
                }
                console.log('Adding new custom order');
                const newCart = [...prev, { ...foodItem, quantity: qty }];
                console.log('New cart length:', newCart.length);
                return newCart;
            }
            
            // For regular food items, check for existing and update quantity
            // Use promotionUniqueId if available, otherwise use regular IDs
            const existing = prev.find(i => {
                if (foodItem.promotionUniqueId && i.promotionUniqueId) {
                    return i.promotionUniqueId === foodItem.promotionUniqueId;
                }
                return i._id === foodItem._id || i.foodItemId === foodItem.foodItemId;
            });
            console.log('Found existing item:', existing ? existing.name : 'none');
            
            if (existing) {
                console.log('Updating quantity for existing item');
                const newCart = prev.map(i => {
                    const isSameItem = foodItem.promotionUniqueId && i.promotionUniqueId 
                        ? i.promotionUniqueId === foodItem.promotionUniqueId
                        : (i._id === foodItem._id || i.foodItemId === foodItem.foodItemId);
                    
                    return isSameItem ? { ...i, quantity: i.quantity + qty } : i;
                });
                console.log('Cart after update length:', newCart.length);
                return newCart;
            }
            
            console.log('Adding new item to cart');
            const newCart = [...prev, { ...foodItem, quantity: qty }];
            console.log('New cart length:', newCart.length);
            console.log('New cart items:', newCart.map(i => ({ name: i.name, _id: i._id, foodItemId: i.foodItemId })));
            console.log('=== END CART DEBUG ===');
            return newCart;
        });
    };

    const removeFromCart = (itemId) => {
        console.log('=== REMOVE FROM CART DEBUG ===');
        console.log('Removing item with ID:', itemId);
        
        setCartItems(prev => {
            console.log('Current cart before removal:', prev.map(i => ({ name: i.name, _id: i._id, foodItemId: i.foodItemId, promotionUniqueId: i.promotionUniqueId })));
            
            const newCart = prev.filter(i => {
                const shouldRemove = i._id === itemId || i.foodItemId === itemId || i.promotionUniqueId === itemId;
                console.log(`Item ${i.name}: ${shouldRemove ? 'REMOVING' : 'KEEPING'}`);
                return !shouldRemove;
            });
            
            return newCart;
        });
    };

    const updateQty = (itemId, qty) => {
        if (qty <= 0) {
            removeFromCart(itemId);
            return;
        }
        setCartItems(prev => {
            const newCart = prev.map(i =>
                (i._id === itemId || i.foodItemId === itemId || i.promotionUniqueId === itemId) ? { ...i, quantity: qty } : i
            );
            
            return newCart;
        });
    };

    const updateItemNote = (itemId, note) => {
        setCartItems(prev =>
            prev.map(i =>
                (i._id === itemId || i.foodItemId === itemId || i.promotionUniqueId === itemId) ? { ...i, note: note } : i
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

    const clearPromotionRemovedMessage = () => {
        setPromotionRemovedMessage(null);
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
            removePromotion,
            promotionRemovedMessage,
            clearPromotionRemovedMessage
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}

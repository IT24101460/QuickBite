import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    TextInput, Alert, ActivityIndicator, Image, Modal, FlatList,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS, SIZES } from '../styles/adminTheme';

// Pricing Configuration
const SIZES_DATA = [
    { label: '500g', price: 1500, description: 'Perfect for small celebrations' },
    { label: '1kg', price: 3000, description: 'Great for birthdays & events' },
];
const ICING_PRICE = 300;

export default function CakeOrderScreen({ navigation }) {
    const { user } = useAuth();
    const { addToCart, clearCart } = useCart();

    // Form State
    const [canteens, setCanteens] = useState([]);
    const [selectedCanteen, setSelectedCanteen] = useState(null);
    const [selectedSize, setSelectedSize] = useState(SIZES_DATA[0]);
    const [hasIcing, setHasIcing] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [note, setNote] = useState('');
    const [designImage, setDesignImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [canteenModalVisible, setCanteenModalVisible] = useState(false);

    // VALIDATION: Error state per field
    const [errors, setErrors] = useState({});

    // CRUD: READ - Fetch canteens so user can assign the cake order to one
    useEffect(() => {
        API.get('/canteens')
            .then(res => setCanteens(res.data?.canteens || []))
            .catch(() => { });
    }, []);

    // Live price calculation
    const unitPrice = selectedSize.price + (hasIcing ? ICING_PRICE : 0);
    const totalPrice = unitPrice * quantity;

    const incrementQty = () => setQuantity(q => q + 1);
    const decrementQty = () => {
        if (quantity > 1) setQuantity(q => q - 1);
    };

    const pickDesignImage = () => {
        launchImageLibrary(
            { mediaType: 'photo', quality: 0.8, selectionLimit: 1 },
            (res) => {
                if (!res.didCancel && res.assets?.length) {
                    const asset = res.assets[0];
                    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
                    if (!allowedTypes.includes(asset.type)) {
                        return Alert.alert('Invalid File', 'Only JPG, JPEG, or PNG images are allowed.');
                    }
                    setDesignImage(asset);
                    setErrors(prev => ({ ...prev, designImage: '' }));
                }
            }
        );
    };

    // VALIDATION: Validate all required fields before placing order
    const validate = () => {
        const newErrors = {};
        if (!selectedCanteen) newErrors.canteen = 'Please select a canteen to fulfill your order.';
        if (!designImage) newErrors.designImage = 'Please upload a reference image of your cake design.';
        if (quantity < 1) newErrors.quantity = 'Quantity must be at least 1.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle Add to Cart & Navigate to Checkout
    const handleAddToCart = () => {
        if (!validate()) {
            return Alert.alert('Missing Information', 'Please fill in all required fields before proceeding.');
        }

        // Build the custom cake item
        const cakeItem = {
            foodItemId: `cake_${selectedSize.label}_${Date.now()}`,
            name: `Custom Cake (${selectedSize.label}${hasIcing ? ' + Icing' : ''})`,
            category: 'Cake',
            price: unitPrice,
            canteenId: selectedCanteen._id,
            note: note.trim(),
            // Pass the design image info through
            designImage: designImage ? {
                uri: designImage.uri,
                name: designImage.fileName || 'cake_design.jpg',
                type: designImage.type || 'image/jpeg',
            } : null
        };

        // Clear existing cart to prevent mixed-canteen issues, then add cake
        clearCart();
        addToCart(cakeItem, quantity);

        // Navigate to checkout
        navigation.navigate('Checkout');
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Order a Custom Cake</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                {/* Canteen Selector */}
                <View style={[styles.card, SHADOWS.sm]}>
                    <Text style={styles.cardTitle}>Select Canteen *</Text>
                    <Text style={styles.cardSub}>Choose which canteen will make your cake</Text>
                    <TouchableOpacity
                        style={[styles.selectorBtn, errors.canteen && styles.inputError]}
                        onPress={() => setCanteenModalVisible(true)}
                    >
                        <Text style={selectedCanteen ? styles.selectorValueText : styles.selectorPlaceholderText}>
                            {selectedCanteen ? selectedCanteen.canteenName : 'Tap to select a canteen…'}
                        </Text>
                        <Text style={styles.selectorArrow}>▼</Text>
                    </TouchableOpacity>
                    {errors.canteen && <Text style={styles.errorText}>⚠️ {errors.canteen}</Text>}
                </View>

                {/* Size Picker */}
                <View style={[styles.card, SHADOWS.sm]}>
                    <Text style={styles.cardTitle}>Choose Cake Size *</Text>
                    <Text style={styles.cardSub}>Price is calculated by weight</Text>
                    <View style={styles.sizeRow}>
                        {SIZES_DATA.map(size => (
                            <TouchableOpacity
                                key={size.label}
                                style={[styles.sizeCard, selectedSize.label === size.label && styles.sizeCardActive]}
                                onPress={() => setSelectedSize(size)}
                            >
                                <Text style={[styles.sizeLabel, selectedSize.label === size.label && styles.sizeLabelActive]}>
                                    {size.label}
                                </Text>
                                <Text style={[styles.sizePrice, selectedSize.label === size.label && styles.sizePriceActive]}>
                                    LKR {size.price.toLocaleString()}
                                </Text>
                                <Text style={styles.sizeDesc}>{size.description}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Icing Option */}
                <View style={[styles.card, SHADOWS.sm]}>
                    <Text style={styles.cardTitle}>Icing Add-on</Text>
                    <Text style={styles.cardSub}>Add decorative icing to your cake (+LKR 300)</Text>
                    <View style={styles.icingRow}>
                        <TouchableOpacity
                            style={[styles.icingBtn, hasIcing && styles.icingBtnActive]}
                            onPress={() => setHasIcing(true)}
                        >
                            <Text style={[styles.icingBtnText, hasIcing && styles.icingBtnTextActive]}>
                                Yes, add icing (+LKR 300)
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.icingBtn, !hasIcing && styles.icingBtnActive]}
                            onPress={() => setHasIcing(false)}
                        >
                            <Text style={[styles.icingBtnText, !hasIcing && styles.icingBtnTextActive]}>
                                No icing
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Quantity */}
                <View style={[styles.card, SHADOWS.sm]}>
                    <Text style={styles.cardTitle}>Quantity</Text>
                    <View style={styles.qtyRow}>
                        <TouchableOpacity style={styles.qtyBtn} onPress={decrementQty}>
                            <Text style={styles.qtyBtnText}>−</Text>
                        </TouchableOpacity>
                        <Text style={styles.qtyValue}>{quantity}</Text>
                        <TouchableOpacity style={styles.qtyBtn} onPress={incrementQty}>
                            <Text style={styles.qtyBtnText}>+</Text>
                        </TouchableOpacity>
                    </View>
                    {errors.quantity && <Text style={styles.errorText}>⚠️ {errors.quantity}</Text>}
                </View>

                {/* Design Image Upload */}
                <View style={[styles.card, SHADOWS.sm]}>
                    <Text style={styles.cardTitle}>Cake Design Reference *</Text>
                    <Text style={styles.cardSub}>Upload a photo of the cake style you want</Text>
                    <TouchableOpacity
                        style={[styles.imagePicker, errors.designImage && styles.inputError]}
                        onPress={pickDesignImage}
                    >
                        {designImage ? (
                            <View style={styles.imagePreviewWrapper}>
                                <Image source={{ uri: designImage.uri }} style={styles.imagePreview} resizeMode="cover" />
                                <TouchableOpacity style={styles.changeImgBtn} onPress={pickDesignImage}>
                                    <Text style={styles.changeImgText}>Change</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.imagePickerPlaceholder}>
                                <Text style={styles.imagePickerText}>Tap to upload your cake design photo</Text>
                                <Text style={styles.imagePickerSub}>JPG, JPEG or PNG</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                    {errors.designImage && <Text style={styles.errorText}>⚠️ {errors.designImage}</Text>}
                </View>

                {/* Note */}
                <View style={[styles.card, SHADOWS.sm]}>
                    <Text style={styles.cardTitle}>Special Instructions (Optional)</Text>
                    <Text style={styles.cardSub}>Add flavour, colour preferences or any notes</Text>
                    <TextInput
                        style={styles.noteInput}
                        placeholder="Add a note for the baker…"
                        placeholderTextColor="#aaa"
                        value={note}
                        onChangeText={setNote}
                        multiline
                        numberOfLines={3}
                        maxLength={300}
                    />
                    <Text style={styles.charCount}>{note.length}/300</Text>
                </View>

                {/* Price Summary */}
                <View style={[styles.priceCard, SHADOWS.sm]}>
                    <Text style={styles.priceCardTitle}>Price Summary</Text>
                    <View style={styles.priceRow}>
                        <Text style={styles.priceRowLabel}>Cake ({selectedSize.label})</Text>
                        <Text style={styles.priceRowValue}>LKR {selectedSize.price.toLocaleString()}</Text>
                    </View>
                    {hasIcing && (
                        <View style={styles.priceRow}>
                            <Text style={styles.priceRowLabel}>Icing add-on</Text>
                            <Text style={styles.priceRowValue}>LKR {ICING_PRICE}</Text>
                        </View>
                    )}
                    <View style={styles.priceRow}>
                        <Text style={styles.priceRowLabel}>Quantity</Text>
                        <Text style={styles.priceRowValue}>× {quantity}</Text>
                    </View>
                    <View style={styles.priceDivider} />
                    <View style={styles.priceRow}>
                        <Text style={styles.priceTotalLabel}>Total</Text>
                        <Text style={styles.priceTotalValue}>LKR {totalPrice.toLocaleString()}</Text>
                    </View>
                </View>

            </ScrollView>

            {/* Place Order Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.orderBtn}
                    onPress={handleAddToCart}
                >
                    <Text style={styles.orderBtnText}>Next: Checkout — LKR {totalPrice.toLocaleString()}</Text>
                </TouchableOpacity>
            </View>

            {/* Canteen Picker Modal */}
            <Modal visible={canteenModalVisible} animationType="slide" onRequestClose={() => setCanteenModalVisible(false)}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Select a Canteen</Text>
                        <TouchableOpacity onPress={() => setCanteenModalVisible(false)}>
                            <Text style={styles.modalClose}>✕</Text>
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={canteens}
                        keyExtractor={i => i._id}
                        contentContainerStyle={{ padding: 16 }}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[styles.canteenItem, selectedCanteen?._id === item._id && styles.canteenItemActive]}
                                onPress={() => {
                                    setSelectedCanteen(item);
                                    setErrors(prev => ({ ...prev, canteen: '' }));
                                    setCanteenModalVisible(false);
                                }}
                            >
                                <Text style={[styles.canteenItemName, selectedCanteen?._id === item._id && styles.canteenItemNameActive]}>
                                    {item.canteenName}
                                </Text>
                                <Text style={styles.canteenItemLocation}>📍 {item.location}</Text>
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={<Text style={styles.emptyCanteen}>No canteens available</Text>}
                    />
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },

    header: {
        backgroundColor: COLORS.primary,
        paddingTop: 52,
        paddingBottom: 18,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        ...SHADOWS.md,
    },
    backBtn: { paddingRight: 16 },
    backText: { color: COLORS.textWhite, fontSize: 24, fontWeight: 'bold' },
    headerTitle: { color: COLORS.textWhite, fontSize: TYPOGRAPHY.h3.fontSize, fontWeight: TYPOGRAPHY.h3.fontWeight, flex: 1 },

    scroll: { padding: SPACING.lg, paddingBottom: 30 },

    card: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.lg,
        marginBottom: SPACING.md,
    },
    cardTitle: { fontSize: 15, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 4 },
    cardSub: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 12 },

    // Canteen selector
    selectorBtn: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        borderWidth: 1.5, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.md,
        padding: 14, backgroundColor: COLORS.surfaceVariant,
    },
    selectorValueText: { fontSize: 15, color: COLORS.textPrimary, fontWeight: '600', flex: 1 },
    selectorPlaceholderText: { fontSize: 14, color: COLORS.textTertiary, flex: 1 },
    selectorArrow: { fontSize: 12, color: COLORS.textSecondary },

    // Size picker
    sizeRow: { flexDirection: 'row', gap: 12 },
    sizeCard: {
        flex: 1, borderWidth: 2, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.lg,
        padding: 14, alignItems: 'center', backgroundColor: COLORS.surfaceVariant,
    },
    sizeCardActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryUltraLight },
    sizeLabel: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 4 },
    sizeLabelActive: { color: COLORS.primary },
    sizePrice: { fontSize: 14, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 6 },
    sizePriceActive: { color: COLORS.primary },
    sizeDesc: { fontSize: 11, color: COLORS.textTertiary, textAlign: 'center' },

    // Icing
    icingRow: { gap: 10 },
    icingBtn: {
        borderWidth: 1.5, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.md,
        padding: 14, alignItems: 'center', backgroundColor: COLORS.surfaceVariant,
    },
    icingBtnActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryUltraLight },
    icingBtnText: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '600' },
    icingBtnTextActive: { color: COLORS.primary },

    // Quantity
    qtyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20 },
    qtyBtn: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center',
    },
    qtyBtnText: { color: COLORS.textWhite, fontSize: 24, fontWeight: 'bold', lineHeight: 28 },
    qtyValue: { fontSize: 26, fontWeight: 'bold', color: COLORS.textPrimary, minWidth: 40, textAlign: 'center' },

    // Image picker
    imagePicker: {
        borderWidth: 2, borderColor: COLORS.border, borderStyle: 'dashed',
        borderRadius: BORDER_RADIUS.lg, overflow: 'hidden', minHeight: 130,
        backgroundColor: COLORS.surfaceVariant, justifyContent: 'center', alignItems: 'center',
    },
    imagePickerPlaceholder: { alignItems: 'center', padding: 20 },
    imagePickerIcon: { fontSize: 36, marginBottom: 8 },
    imagePickerText: { fontSize: 14, color: COLORS.textPrimary, fontWeight: '600', textAlign: 'center' },
    imagePickerSub: { fontSize: 12, color: COLORS.textTertiary, marginTop: 4 },
    imagePreviewWrapper: { width: '100%', position: 'relative' },
    imagePreview: { width: '100%', height: 180 },
    changeImgBtn: {
        position: 'absolute', bottom: 10, right: 10,
        backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6,
    },
    changeImgText: { color: COLORS.textWhite, fontSize: 12, fontWeight: 'bold' },

    // Note
    noteInput: {
        borderWidth: 1.5, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.md,
        padding: 12, fontSize: 14, color: COLORS.textPrimary, backgroundColor: COLORS.surfaceVariant,
        minHeight: 80, textAlignVertical: 'top',
    },
    charCount: { fontSize: 11, color: COLORS.textTertiary, textAlign: 'right', marginTop: 4 },

    // Price card (Updated to light theme)
    priceCard: {
        backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.lg, padding: 18, marginBottom: 14,
        borderWidth: 1, borderColor: COLORS.borderLight,
    },
    priceCardTitle: { fontSize: 15, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 14 },
    priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    priceRowLabel: { fontSize: 14, color: COLORS.textSecondary },
    priceRowValue: { fontSize: 14, color: COLORS.textPrimary, fontWeight: '600' },
    priceDivider: { height: 1, backgroundColor: COLORS.borderLight, marginVertical: 10 },
    priceTotalLabel: { fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary },
    priceTotalValue: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary },

    // Validation
    inputError: { borderColor: COLORS.danger, borderWidth: 2 },
    errorText: { fontSize: 12, color: COLORS.danger, marginTop: 6 },

    // Footer
    footer: { backgroundColor: COLORS.surface, padding: 16, borderTopWidth: 1, borderTopColor: COLORS.borderLight },
    orderBtn: {
        backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.lg, paddingVertical: 16,
        alignItems: 'center',
        ...SHADOWS.md,
    },
    orderBtnText: { color: COLORS.textWhite, fontSize: 15, fontWeight: 'bold' },

    // Canteen modal
    modalContainer: { flex: 1, backgroundColor: COLORS.surface },
    modalHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: 52, paddingBottom: 16, paddingHorizontal: 20,
        backgroundColor: COLORS.primary,
        ...SHADOWS.md,
    },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textWhite },
    modalClose: { fontSize: 22, color: COLORS.textWhite, fontWeight: 'bold' },
    canteenItem: {
        backgroundColor: COLORS.surfaceVariant, borderRadius: BORDER_RADIUS.lg, padding: 16,
        marginBottom: 10, borderWidth: 1.5, borderColor: COLORS.border,
    },
    canteenItemActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryUltraLight },
    canteenItemName: { fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 4 },
    canteenItemNameActive: { color: COLORS.primary },
    canteenItemLocation: { fontSize: 13, color: COLORS.textSecondary },
    emptyCanteen: { textAlign: 'center', color: COLORS.textTertiary, marginTop: 40, fontSize: 14 },
});

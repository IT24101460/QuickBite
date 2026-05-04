import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    TextInput, Alert, Image, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import API from '../services/api';
import { useCart } from '../context/CartContext';
import TopNavBar from '../components/TopNavBar';
import { getImageUrl } from '../utils/imageUtils';

const ORANGE = '#FF6B35';

export default function CustomOrderScreen({ navigation, route }) {
    const { canteenId, canteenName } = route.params || {};
    const { addToCart } = useCart();
    
    const [orderType, setOrderType] = useState('');
    const [description, setDescription] = useState('');
    const [specialInstructions, setSpecialInstructions] = useState('');
    const [budget, setBudget] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [pickupDate, setPickupDate] = useState('');
    const [referenceImages, setReferenceImages] = useState([]);
    const [loading, setLoading] = useState(false);

    const CUSTOM_ORDER_TYPES = [
        { id: 'birthday_cake', name: 'Birthday Cake', icon: '🎂', basePrice: 2500 },
        { id: 'wedding_cake', name: 'Wedding Cake', icon: '👰', basePrice: 5000 },
        { id: 'custom_dessert', name: 'Custom Dessert', icon: '🍰', basePrice: 1500 },
        { id: 'special_meal', name: 'Special Meal', icon: '🍱', basePrice: 2000 },
        { id: 'party_platter', name: 'Party Platter', icon: '🥳', basePrice: 3000 },
        { id: 'other', name: 'Other Custom Order', icon: '🎁', basePrice: 1000 }
    ];

    const pickImages = () => {
        launchImageLibrary({ 
            mediaType: 'photo', 
            quality: 0.8,
            selectionLimit: 3
        }, (response) => {
            if (!response.didCancel && response.assets?.length > 0) {
                const newImages = response.assets.map(asset => ({
                    uri: asset.uri,
                    type: asset.type || 'image/jpeg',
                    name: asset.fileName || `custom_order_${Date.now()}.jpg`
                }));
                setReferenceImages([...referenceImages, ...newImages]);
            }
        });
    };

    const removeImage = (index) => {
        setReferenceImages(referenceImages.filter((_, i) => i !== index));
    };

    const calculateEstimatedPrice = () => {
        const selectedType = CUSTOM_ORDER_TYPES.find(type => type.id === orderType);
        if (!selectedType || !budget) return selectedType?.basePrice || 0;
        
        const basePrice = selectedType.basePrice;
        const budgetAmount = parseFloat(budget) || 0;
        
        // Add 20% premium for custom orders
        const customPremium = basePrice * 0.2;
        let totalPrice = basePrice + customPremium;
        
        // Adjust based on budget (complexity indicator)
        if (budgetAmount > basePrice * 2) {
            totalPrice = budgetAmount * 0.8; // 80% of budget for high-budget orders
        } else if (budgetAmount > basePrice) {
            totalPrice = basePrice + ((budgetAmount - basePrice) * 0.5); // 50% of additional budget
        }
        
        return Math.round(totalPrice * quantity);
    };

    const handleSubmit = async () => {
        if (!orderType) {
            return Alert.alert('Error', 'Please select an order type');
        }
        
        if (!description.trim()) {
            return Alert.alert('Error', 'Please describe your custom order requirements');
        }
        
        if (referenceImages.length === 0) {
            return Alert.alert('Error', 'Please upload at least one reference image');
        }
        
        if (!budget || parseFloat(budget) <= 0) {
            return Alert.alert('Error', 'Please provide a valid budget');
        }
        
        if (!pickupDate) {
            return Alert.alert('Error', 'Please select a pickup date');
        }

        setLoading(true);
        
        try {
            // Upload reference images first
            const uploadedImages = [];
            for (const image of referenceImages) {
                const formData = new FormData();
                formData.append('image', {
                    uri: image.uri,
                    type: image.type,
                    name: image.name
                });
                
                try {
                    const response = await API.post('/upload', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                    if (response.data?.imageUrl) {
                        uploadedImages.push(response.data.imageUrl);
                    }
                } catch (err) {
                    console.error('Image upload failed:', err);
                }
            }

            // Create custom order object
            const customOrderData = {
                orderType,
                description: description.trim(),
                specialInstructions: specialInstructions.trim(),
                budget: parseFloat(budget),
                quantity,
                pickupDate,
                referenceImages: uploadedImages,
                estimatedPrice: calculateEstimatedPrice(),
                canteenId,
                canteenName,
                status: 'pending_confirmation'
            };

            // Create custom order item for direct payment
            const customItem = {
                _id: `custom_${Date.now()}`,
                name: `Custom ${CUSTOM_ORDER_TYPES.find(t => t.id === orderType)?.name || 'Order'}`,
                price: calculateEstimatedPrice(),
                description: description.trim(),
                isCustomOrder: true,
                customOrderData,
                canteenId,
                quantity
            };

            // Navigate directly to payment screen with custom order
            Alert.alert(
                '✅ Custom Order Ready!',
                'Your custom order details are ready. Proceed to payment to complete your order.',
                [
                    { text: 'Continue Shopping', style: 'cancel' },
                    { 
                        text: 'Proceed to Payment', 
                        onPress: () => {
                            // Add to cart temporarily for payment processing
                            addToCart(customItem, quantity);
                            // Navigate to checkout with pickup time
                            navigation.navigate('Checkout', { 
                                customOrder: true,
                                pickupTime: 'Custom Order' 
                            });
                        }
                    }
                ]
            );
            
            // Reset form
            setOrderType('');
            setDescription('');
            setSpecialInstructions('');
            setBudget('');
            setQuantity(1);
            setPickupDate('');
            setReferenceImages([]);
            
        } catch (error) {
            console.error('Custom order submission error:', error);
            Alert.alert('Error', 'Failed to submit custom order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getMinPickupDate = () => {
        const today = new Date();
        const minDate = new Date(today);
        minDate.setDate(today.getDate() + 3); // 3 days minimum for custom orders
        return minDate.toISOString().split('T')[0];
    };

    return (
        <View style={styles.container}>
            <TopNavBar navigation={navigation} placeholder="Custom Order" />
            
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.headerSection}>
                        <Text style={styles.headerTitle}>Create Custom Order</Text>
                        <Text style={styles.headerSubtitle}>Tell us what you'd like to create!</Text>
                        <Text style={styles.canteenInfo}>📍 {canteenName || 'Selected Canteen'}</Text>
                    </View>

                    {/* Order Type Selection */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>🎯 Order Type</Text>
                        <View style={styles.orderTypesGrid}>
                            {CUSTOM_ORDER_TYPES.map((type) => (
                                <TouchableOpacity
                                    key={type.id}
                                    style={[
                                        styles.orderTypeCard,
                                        orderType === type.id && styles.orderTypeCardSelected
                                    ]}
                                    onPress={() => setOrderType(type.id)}
                                >
                                    <Text style={styles.orderTypeIcon}>{type.icon}</Text>
                                    <Text style={[
                                        styles.orderTypeName,
                                        orderType === type.id && styles.orderTypeNameSelected
                                    ]}>
                                        {type.name}
                                    </Text>
                                    <Text style={styles.orderTypePrice}>
                                        From LKR {type.basePrice}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Description */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>📝 Order Description</Text>
                        <TextInput
                            style={styles.textArea}
                            placeholder="Describe your custom order in detail (size, flavors, colors, theme, etc.)"
                            placeholderTextColor="#999"
                            multiline
                            numberOfLines={4}
                            value={description}
                            onChangeText={setDescription}
                            textAlignVertical="top"
                        />
                    </View>

                    {/* Special Instructions */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>💭 Special Instructions</Text>
                        <TextInput
                            style={styles.textArea}
                            placeholder="Any dietary restrictions, allergies, or special requirements?"
                            placeholderTextColor="#999"
                            multiline
                            numberOfLines={3}
                            value={specialInstructions}
                            onChangeText={setSpecialInstructions}
                            textAlignVertical="top"
                        />
                    </View>

                    {/* Budget and Quantity */}
                    <View style={styles.section}>
                        <View style={styles.row}>
                            <View style={styles.halfWidth}>
                                <Text style={styles.sectionTitle}>💰 Budget (LKR)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. 5000"
                                    placeholderTextColor="#999"
                                    value={budget}
                                    onChangeText={setBudget}
                                    keyboardType="numeric"
                                />
                            </View>
                            <View style={styles.halfWidth}>
                                <Text style={styles.sectionTitle}>🔢 Quantity</Text>
                                <View style={styles.quantityControl}>
                                    <TouchableOpacity
                                        style={styles.quantityBtn}
                                        onPress={() => setQuantity(Math.max(1, quantity - 1))}
                                    >
                                        <Text style={styles.quantityBtnText}>−</Text>
                                    </TouchableOpacity>
                                    <Text style={styles.quantityText}>{quantity}</Text>
                                    <TouchableOpacity
                                        style={styles.quantityBtn}
                                        onPress={() => setQuantity(quantity + 1)}
                                    >
                                        <Text style={styles.quantityBtnText}>+</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                        
                        {orderType && (
                            <View style={styles.priceEstimate}>
                                <Text style={styles.estimateLabel}>Estimated Price:</Text>
                                <Text style={styles.estimatePrice}>LKR {calculateEstimatedPrice()}</Text>
                            </View>
                        )}
                    </View>

                    {/* Pickup Date */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>📅 Pickup Date</Text>
                        <TextInput
                            style={styles.input}
                            placeholder={getMinPickupDate()}
                            placeholderTextColor="#999"
                            value={pickupDate}
                            onChangeText={setPickupDate}
                            keyboardType="default"
                        />
                        <Text style={styles.helperText}>
                            Minimum 3 days advance notice required for custom orders
                        </Text>
                    </View>

                    {/* Reference Images */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>🖼️ Reference Images</Text>
                        <TouchableOpacity style={styles.imageUploadBtn} onPress={pickImages}>
                            <Text style={styles.imageUploadText}>+ Add Reference Images (Max 3)</Text>
                        </TouchableOpacity>
                        
                        {referenceImages.length > 0 && (
                            <View style={styles.imageGrid}>
                                {referenceImages.map((image, index) => (
                                    <View key={index} style={styles.imageContainer}>
                                        <Image source={{ uri: image.uri }} style={styles.referenceImage} />
                                        <TouchableOpacity
                                            style={styles.removeImageBtn}
                                            onPress={() => removeImage(index)}
                                        >
                                            <Text style={styles.removeImageText}>✕</Text>
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        )}
                        <Text style={styles.helperText}>
                            Upload reference images to help us understand your requirements
                        </Text>
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[styles.submitBtn, loading && { opacity: 0.6 }]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.submitBtnText}>Add Custom Order to Cart</Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF7F2' },
    scrollContent: { padding: 16, paddingBottom: 30 },
    
    headerSection: { marginBottom: 24 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#222', marginBottom: 4 },
    headerSubtitle: { fontSize: 14, color: '#666', marginBottom: 8 },
    canteenInfo: { fontSize: 12, color: ORANGE, fontWeight: '600' },
    
    section: { marginBottom: 20 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 12 },
    
    orderTypesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    orderTypeCard: {
        width: '48%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#E8E8E8',
        elevation: 2
    },
    orderTypeCardSelected: {
        borderColor: ORANGE,
        backgroundColor: '#FFF0E8'
    },
    orderTypeIcon: { fontSize: 32, marginBottom: 8 },
    orderTypeName: { fontSize: 14, fontWeight: '600', color: '#333', textAlign: 'center', marginBottom: 4 },
    orderTypeNameSelected: { color: ORANGE },
    orderTypePrice: { fontSize: 12, color: '#666', textAlign: 'center' },
    
    textArea: {
        borderWidth: 1.5,
        borderColor: '#E8E8E8',
        borderRadius: 12,
        padding: 12,
        fontSize: 14,
        color: '#333',
        backgroundColor: '#fff',
        minHeight: 80
    },
    
    row: { flexDirection: 'row', gap: 12 },
    halfWidth: { flex: 1 },
    
    input: {
        borderWidth: 1.5,
        borderColor: '#E8E8E8',
        borderRadius: 12,
        padding: 12,
        fontSize: 14,
        color: '#333',
        backgroundColor: '#fff'
    },
    
    quantityControl: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#E8E8E8',
        borderRadius: 12,
        backgroundColor: '#fff'
    },
    quantityBtn: {
        width: 40,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: ORANGE
    },
    quantityBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    quantityText: {
        flex: 1,
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '600',
        color: '#333'
    },
    
    priceEstimate: {
        marginTop: 12,
        padding: 12,
        backgroundColor: '#FFF0E8',
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    estimateLabel: { fontSize: 14, color: '#666' },
    estimatePrice: { fontSize: 18, fontWeight: 'bold', color: ORANGE },
    
    helperText: {
        fontSize: 12,
        color: '#888',
        marginTop: 4,
        fontStyle: 'italic'
    },
    
    imageUploadBtn: {
        borderWidth: 2,
        borderColor: ORANGE,
        borderStyle: 'dashed',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        backgroundColor: '#fff',
        marginBottom: 12
    },
    imageUploadText: {
        color: ORANGE,
        fontSize: 14,
        fontWeight: '600'
    },
    
    imageGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8
    },
    imageContainer: {
        width: 100,
        height: 100,
        position: 'relative'
    },
    referenceImage: {
        width: '100%',
        height: '100%',
        borderRadius: 8
    },
    removeImageBtn: {
        position: 'absolute',
        top: -8,
        right: -8,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#ff4444',
        justifyContent: 'center',
        alignItems: 'center'
    },
    removeImageText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold'
    },
    
    submitBtn: {
        backgroundColor: ORANGE,
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 8,
        elevation: 3,
        shadowColor: ORANGE,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8
    },
    submitBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold'
    }
});

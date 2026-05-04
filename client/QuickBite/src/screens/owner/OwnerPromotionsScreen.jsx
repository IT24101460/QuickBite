import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Image, ActivityIndicator, Alert, ScrollView, Switch, KeyboardAvoidingView, Platform } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import API from '../../services/api';
import { getImageUrl } from '../../utils/imageUtils';

const ORANGE = '#FF6B35';

export default function OwnerPromotionsScreen({ route, navigation }) {
    const passedCanteenId = route.params?.canteenId;
    const [promotions, setPromotions] = useState([]);
    const [canteenFoods, setCanteenFoods] = useState([]);
    const [myCanteenId, setMyCanteenId] = useState(null);
    const [loading, setLoading] = useState(true);

    const [modalVisible, setModalVisible] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editingPromotion, setEditingPromotion] = useState(null);

    // Form fields
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [discountType, setDiscountType] = useState('percentage'); // 'percentage' | 'fixed'
    const [discountValue, setDiscountValue] = useState('');
    const [applicableTo, setApplicableTo] = useState('all'); // 'all' | 'specific'
    const [selectedFoods, setSelectedFoods] = useState([]);
    
    // Date picker states
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [tempStartDate, setTempStartDate] = useState(new Date());
    const [tempEndDate, setTempEndDate] = useState(new Date());
    
    // Image states
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [bannerImage, setBannerImage] = useState(null);
    
    // Generate date options
    const generateDateOptions = () => {
        const days = Array.from({ length: 31 }, (_, i) => i + 1);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentYear = new Date().getFullYear();
        const years = Array.from({ length: 3 }, (_, i) => currentYear + i);
        return { days, months, years };
    };
    
    const { days, months, years } = generateDateOptions();
    
    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    
    const handleStartDateSelect = () => {
        setStartDate(tempStartDate);
        setShowStartDatePicker(false);
        // Reset end date if it's before start date
        if (endDate < tempStartDate) {
            const newEndDate = new Date(tempStartDate);
            newEndDate.setDate(newEndDate.getDate() + 7);
            setEndDate(newEndDate);
            setTempEndDate(newEndDate);
        }
    };
    
    const handleEndDateSelect = () => {
        setEndDate(tempEndDate);
        setShowEndDatePicker(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            let menuPromise;
            if (passedCanteenId) {
                setMyCanteenId(passedCanteenId);
                menuPromise = API.get(`/foods?canteenId=${passedCanteenId}`);
            } else {
                menuPromise = API.get('/canteens/my').then(res => {
                    const cId = res.data.canteen._id;
                    setMyCanteenId(cId);
                    return API.get(`/foods?canteenId=${cId}`);
                });
            }
            const promosPromise = API.get('/promotions');

            const [menuRes, promosRes] = await Promise.all([menuPromise, promosPromise]);
            setCanteenFoods(menuRes.data.foodItems || []);
            setPromotions(promosRes.data.promotions || []);
        } catch (error) {
            console.log("Error loading promotion data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePickBanner = async () => {
        const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
        if (!result.didCancel && result.assets?.length > 0) {
            setImageFile({
                uri: result.assets[0].uri,
                type: result.assets[0].type || 'image/jpeg',
                name: result.assets[0].fileName || 'promo.jpg',
            });
            setImagePreview(result.assets[0].uri);
        }
    };

    const openAddModal = () => {
        const today = new Date();
        const defaultEnd = new Date(today);
        defaultEnd.setDate(today.getDate() + 7);
        
        setTitle(''); setDescription(''); setDiscountType('percentage'); setDiscountValue('');
        setApplicableTo('all'); setSelectedFoods([]);
        setStartDate(today);
        setEndDate(defaultEnd);
        setTempStartDate(today);
        setTempEndDate(defaultEnd);
        setImagePreview(null); setImageFile(null);
        setBannerImage(null);
        setEditingPromotion(null);
        setModalVisible(true);
    };

    const editPromo = (promotion) => {
        // Pre-fill the form with existing promotion data
        setTitle(promotion.title);
        setDescription(promotion.description);
        setDiscountType(promotion.discountType || 'percentage');
        setDiscountValue(String(promotion.discountValue || ''));
        setApplicableTo(promotion.applicableTo || 'all');
        
        // Set food items if applicable to specific items
        if (promotion.applicableTo === 'specific' && promotion.foodItems) {
            setSelectedFoods(promotion.foodItems);
        } else {
            setSelectedFoods([]);
        }
        
        // Set dates
        setStartDate(new Date(promotion.startDate));
        setEndDate(new Date(promotion.endDate));
        setTempStartDate(new Date(promotion.startDate));
        setTempEndDate(new Date(promotion.endDate));
        
        // Set banner image
        if (promotion.bannerImage) {
            setImagePreview(getImageUrl(promotion.bannerImage));
            setBannerImage(promotion.bannerImage);
        } else {
            setImagePreview(null);
            setBannerImage(null);
        }
        
        // Set editing mode
        setEditingPromotion(promotion);
        setImageFile(null); // Reset image file for new uploads
        setModalVisible(true);
    };

    const toggleFoodSelection = (foodId) => {
        if (selectedFoods.includes(foodId)) {
            setSelectedFoods(selectedFoods.filter(id => id !== foodId));
        } else {
            setSelectedFoods([...selectedFoods, foodId]);
        }
    };

    const handleSave = async () => {
        if (!title || !description || !discountValue) {
            return Alert.alert('Error', 'Please fill out Title, Description, and Discount Value.');
        }

        if (startDate >= endDate) {
            return Alert.alert('Error', 'End date must be after start date.');
        }

        setSaving(true);

        try {
            const payload = {
                title, description, discountType, discountValue: Number(discountValue),
                canteenId: myCanteenId, startDate: startDate.toISOString(), endDate: endDate.toISOString(),
                applicableTo, foodItems: applicableTo === 'specific' ? selectedFoods : []
            };

            if (editingPromotion) {
                // Update existing promotion
                if (imageFile) {
                    const formData = new FormData();
                    Object.keys(payload).forEach(key => {
                        if (Array.isArray(payload[key])) {
                            payload[key].forEach(item => formData.append(`${key}[]`, item));
                        } else {
                            formData.append(key, payload[key]);
                        }
                    });
                    formData.append('bannerImage', imageFile);
                    await API.put(`/promotions/${editingPromotion._id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                } else {
                    await API.put(`/promotions/${editingPromotion._id}`, payload);
                }
                Alert.alert("Success", "Promotion updated successfully!");
            } else {
                // Create new promotion
                if (imageFile) {
                    const formData = new FormData();
                    Object.keys(payload).forEach(key => {
                        if (Array.isArray(payload[key])) {
                            payload[key].forEach(item => formData.append(`${key}[]`, item));
                        } else {
                            formData.append(key, payload[key]);
                        }
                    });
                    formData.append('bannerImage', imageFile);
                    await API.post('/promotions', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                } else {
                    await API.post('/promotions', payload);
                }
                Alert.alert("Success", "Magnificent dynamically targeted Promotion launched successfully!");
            }

            setModalVisible(false);
            setEditingPromotion(null);
            fetchData();
        } catch (error) {
            Alert.alert("Operation Failed", error.response?.data?.message || "There was an error communicating with the backend server!");
        } finally {
            setSaving(false);
        }
    };

    const toggleStatus = async (id) => {
        try {
            await API.patch(`/promotions/${id}/toggle`);
            fetchData();
        } catch (e) { Alert.alert("Error", "Could not toggle the promotion status"); }
    }

    const deletePromo = async (id) => {
        Alert.alert("Delete", "Erase this promotion permanently?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete", style: "destructive", onPress: async () => {
                    await API.delete(`/promotions/${id}`);
                    fetchData();
                }
            }
        ]);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Text style={styles.backArrow}>←</Text></TouchableOpacity>
                <Text style={styles.title}>UniEats Promotions</Text>
            </View>

            <View style={styles.actionRow}>
                <Text style={styles.subTitle}>Active Campaigns</Text>
                <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
                    <Text style={styles.addBtnText}>+ Create Promo</Text>
                </TouchableOpacity>
            </View>

            {loading ? <ActivityIndicator size="large" color={ORANGE} style={{ marginTop: 50 }} /> : (
                <FlatList
                    contentContainerStyle={{ padding: 20 }}
                    data={promotions}
                    keyExtractor={item => item._id}
                    renderItem={({ item }) => (
                        <View style={[styles.card, !item.isActive && { opacity: 0.6 }]}>
                            {item.bannerImage ? <Image source={{ uri: getImageUrl(item.bannerImage) }} style={styles.cardImage} /> : null}
                            <View style={styles.cardContent}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text style={styles.cardTitle}>{item.title}</Text>
                                    <View style={styles.discountBadge}>
                                        <Text style={styles.discountBadgeText}>{item.discountType === 'percentage' ? `${item.discountValue}%` : `Rs ${item.discountValue}`} OFF</Text>
                                    </View>
                                </View>
                                <Text style={styles.cardDesc}>{item.description}</Text>
                                <Text style={styles.endDate}>Expires: {new Date(item.endDate).toLocaleDateString()}</Text>

                                <View style={styles.buttonRow}>
                                    <TouchableOpacity onPress={() => toggleStatus(item._id)} style={[styles.smBtn, item.isActive ? styles.btnDanger : styles.btnSuccess]}>
                                        <Text style={styles.smBtnText}>{item.isActive ? "Pause Campaign" : "Resume Campaign"}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => editPromo(item)} style={[styles.smBtn, styles.btnPrimary]}>
                                        <Text style={styles.smBtnText}>Edit</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => deletePromo(item._id)} style={[styles.smBtn, styles.btnOutline]}>
                                        <Text style={[styles.smBtnText, { color: '#e74c3c' }]}>Delete</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    )}
                    ListEmptyComponent={<Text style={styles.empty}>Launch your first massive digital sale today!</Text>}
                />
            )}

            <Modal visible={modalVisible} animationType="slide" transparent>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalBg}>
                    <View style={styles.modalContent}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={styles.modalTitle}>{editingPromotion ? 'Edit Promotion' : 'Launch Mega Sale'}</Text>

                            <TouchableOpacity style={styles.imgPicker} onPress={handlePickBanner}>
                                {imagePreview ? <Image source={{ uri: imagePreview }} style={styles.imgPreview} /> : <Text style={{ color: '#888' }}>+ Add Gorgeous Sales Banner</Text>}
                            </TouchableOpacity>

                            <Text style={styles.label}>Campaign Name</Text>
                            <TextInput style={styles.input} placeholder="Flash Friday Deal!" value={title} onChangeText={setTitle} />

                            <Text style={styles.label}>Description</Text>
                            <TextInput style={styles.input} placeholder="Get massive cuts on all lunch items." value={description} onChangeText={setDescription} />

                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.label}>Discount Logic</Text>
                                    <TouchableOpacity style={styles.input} onPress={() => setDiscountType(discountType === 'percentage' ? 'fixed' : 'percentage')}>
                                        <Text style={{ color: '#333' }}>{discountType === 'percentage' ? '% Percent Off' : 'Rs Fixed Amount Off'}</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.label}>Amount</Text>
                                    <TextInput style={styles.input} placeholder="e.g. 15" value={discountValue} onChangeText={setDiscountValue} keyboardType="numeric" />
                                </View>
                            </View>

                            {/* Start Date Picker */}
                            <Text style={styles.label}>Start Date</Text>
                            <TouchableOpacity 
                                style={styles.datePickerBtn}
                                onPress={() => {
                                    setTempStartDate(new Date(startDate));
                                    setShowStartDatePicker(true);
                                }}
                            >
                                <Text style={styles.datePickerText}>
                                    {startDate.toLocaleDateString('en-US', { 
                                        weekday: 'short', 
                                        year: 'numeric', 
                                        month: 'short', 
                                        day: 'numeric' 
                                    })}
                                </Text>
                                <Text style={styles.datePickerIcon}>📅</Text>
                            </TouchableOpacity>
                            
                            {/* End Date Picker */}
                            <Text style={styles.label}>End Date</Text>
                            <TouchableOpacity 
                                style={styles.datePickerBtn}
                                onPress={() => {
                                    setTempEndDate(new Date(endDate));
                                    setShowEndDatePicker(true);
                                }}
                            >
                                <Text style={styles.datePickerText}>
                                    {endDate.toLocaleDateString('en-US', { 
                                        weekday: 'short', 
                                        year: 'numeric', 
                                        month: 'short', 
                                        day: 'numeric' 
                                    })}
                                </Text>
                                <Text style={styles.datePickerIcon}>📅</Text>
                            </TouchableOpacity>

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 10 }}>
                                <Text style={styles.label}>Apply exclusively to Specific Foods?</Text>
                                <Switch value={applicableTo === 'specific'} onValueChange={val => setApplicableTo(val ? 'specific' : 'all')} trackColor={{ true: ORANGE }} />
                            </View>

                            {applicableTo === 'specific' && (
                                <View style={styles.foodListContainer}>
                                    {canteenFoods.map(food => (
                                        <TouchableOpacity
                                            key={food.foodItemId}
                                            style={[styles.foodToggle, selectedFoods.includes(food._id) && styles.foodToggleActive]}
                                            onPress={() => toggleFoodSelection(food._id)}
                                        >
                                            <Text style={[styles.foodToggleText, selectedFoods.includes(food._id) && { color: ORANGE }]}>{food.name}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}

                            <View style={{ flexDirection: 'row', marginTop: 20, gap: 10 }}>
                                <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}><Text>Close</Text></TouchableOpacity>
                                <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
                                    {saving ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: 'bold' }}>Deploy Live!</Text>}
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                    
                    {/* Start Date Picker Modal */}
                    <Modal visible={showStartDatePicker} transparent animationType="fade">
                        <View style={styles.datePickerModal}>
                            <View style={styles.datePickerContent}>
                                <Text style={styles.datePickerTitle}>Select Start Date</Text>
                                
                                <View style={styles.dateSelectors}>
                                    <View style={styles.dateColumn}>
                                        <Text style={styles.dateColumnLabel}>Day</Text>
                                        <ScrollView style={styles.dateScroll} showsVerticalScrollIndicator={false}>
                                            {days.map(day => (
                                                <TouchableOpacity
                                                    key={day}
                                                    style={[styles.dateOption, tempStartDate.getDate() === day && styles.dateOptionSelected]}
                                                    onPress={() => setTempStartDate(new Date(tempStartDate.getFullYear(), tempStartDate.getMonth(), day))}
                                                >
                                                    <Text style={[styles.dateOptionText, tempStartDate.getDate() === day && styles.dateOptionTextSelected]}>{day}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    </View>
                                    
                                    <View style={styles.dateColumn}>
                                        <Text style={styles.dateColumnLabel}>Month</Text>
                                        <ScrollView style={styles.dateScroll} showsVerticalScrollIndicator={false}>
                                            {months.map((month, index) => (
                                                <TouchableOpacity
                                                    key={index}
                                                    style={[styles.dateOption, tempStartDate.getMonth() === index && styles.dateOptionSelected]}
                                                    onPress={() => setTempStartDate(new Date(tempStartDate.getFullYear(), index, tempStartDate.getDate()))}
                                                >
                                                    <Text style={[styles.dateOptionText, tempStartDate.getMonth() === index && styles.dateOptionTextSelected]}>{month}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    </View>
                                    
                                    <View style={styles.dateColumn}>
                                        <Text style={styles.dateColumnLabel}>Year</Text>
                                        <ScrollView style={styles.dateScroll} showsVerticalScrollIndicator={false}>
                                            {years.map(year => (
                                                <TouchableOpacity
                                                    key={year}
                                                    style={[styles.dateOption, tempStartDate.getFullYear() === year && styles.dateOptionSelected]}
                                                    onPress={() => setTempStartDate(new Date(year, tempStartDate.getMonth(), tempStartDate.getDate()))}
                                                >
                                                    <Text style={[styles.dateOptionText, tempStartDate.getFullYear() === year && styles.dateOptionTextSelected]}>{year}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    </View>
                                </View>
                                
                                <View style={styles.datePickerActions}>
                                    <TouchableOpacity style={styles.datePickerCancel} onPress={() => setShowStartDatePicker(false)}>
                                        <Text style={styles.datePickerCancelText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.datePickerConfirm} onPress={handleStartDateSelect}>
                                        <Text style={styles.datePickerConfirmText}>Confirm</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>
                    
                    {/* End Date Picker Modal */}
                    <Modal visible={showEndDatePicker} transparent animationType="fade">
                        <View style={styles.datePickerModal}>
                            <View style={styles.datePickerContent}>
                                <Text style={styles.datePickerTitle}>Select End Date</Text>
                                
                                <View style={styles.dateSelectors}>
                                    <View style={styles.dateColumn}>
                                        <Text style={styles.dateColumnLabel}>Day</Text>
                                        <ScrollView style={styles.dateScroll} showsVerticalScrollIndicator={false}>
                                            {days.map(day => (
                                                <TouchableOpacity
                                                    key={day}
                                                    style={[styles.dateOption, tempEndDate.getDate() === day && styles.dateOptionSelected]}
                                                    onPress={() => setTempEndDate(new Date(tempEndDate.getFullYear(), tempEndDate.getMonth(), day))}
                                                >
                                                    <Text style={[styles.dateOptionText, tempEndDate.getDate() === day && styles.dateOptionTextSelected]}>{day}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    </View>
                                    
                                    <View style={styles.dateColumn}>
                                        <Text style={styles.dateColumnLabel}>Month</Text>
                                        <ScrollView style={styles.dateScroll} showsVerticalScrollIndicator={false}>
                                            {months.map((month, index) => (
                                                <TouchableOpacity
                                                    key={index}
                                                    style={[styles.dateOption, tempEndDate.getMonth() === index && styles.dateOptionSelected]}
                                                    onPress={() => setTempEndDate(new Date(tempEndDate.getFullYear(), index, tempEndDate.getDate()))}
                                                >
                                                    <Text style={[styles.dateOptionText, tempEndDate.getMonth() === index && styles.dateOptionTextSelected]}>{month}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    </View>
                                    
                                    <View style={styles.dateColumn}>
                                        <Text style={styles.dateColumnLabel}>Year</Text>
                                        <ScrollView style={styles.dateScroll} showsVerticalScrollIndicator={false}>
                                            {years.map(year => (
                                                <TouchableOpacity
                                                    key={year}
                                                    style={[styles.dateOption, tempEndDate.getFullYear() === year && styles.dateOptionSelected]}
                                                    onPress={() => setTempEndDate(new Date(year, tempEndDate.getMonth(), tempEndDate.getDate()))}
                                                >
                                                    <Text style={[styles.dateOptionText, tempEndDate.getFullYear() === year && styles.dateOptionTextSelected]}>{year}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    </View>
                                </View>
                                
                                <View style={styles.datePickerActions}>
                                    <TouchableOpacity style={styles.datePickerCancel} onPress={() => setShowEndDatePicker(false)}>
                                        <Text style={styles.datePickerCancelText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.datePickerConfirm} onPress={handleEndDateSelect}>
                                        <Text style={styles.datePickerConfirmText}>Confirm</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    header: { backgroundColor: ORANGE, paddingTop: 52, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' },
    backBtn: { paddingRight: 15 },
    backArrow: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
    title: { color: '#fff', fontSize: 20, fontWeight: 'bold' },

    actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingBottom: 5 },
    subTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    addBtn: { backgroundColor: ORANGE, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
    addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },

    card: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 20, elevation: 3, overflow: 'hidden' },
    cardImage: { width: '100%', height: 170 },
    cardContent: { padding: 15 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#222' },
    cardDesc: { fontSize: 13, color: '#666', marginVertical: 6 },
    endDate: { fontSize: 12, color: '#e74c3c', fontWeight: 'bold', marginBottom: 12 },
    discountBadge: { backgroundColor: ORANGE, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    discountBadgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },

    buttonRow: { flexDirection: 'row', gap: 10, marginTop: 5 },
    smBtn: { paddingVertical: 8, flex: 1, borderRadius: 8, alignItems: 'center' },
    btnDanger: { backgroundColor: '#e74c3c' },
    btnSuccess: { backgroundColor: '#2ecc71' },
    btnPrimary: { backgroundColor: ORANGE },
    btnOutline: { borderWidth: 1, borderColor: '#e74c3c' },
    smBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
    empty: { textAlign: 'center', color: '#888', marginTop: 40 },

    modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 10, paddingTop: 60 },
    modalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 20, maxHeight: '95%' },
    modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#222', marginBottom: 15 },
    imgPicker: { width: '100%', height: 140, backgroundColor: '#EEE', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 15, overflow: 'hidden' },
    imgPreview: { width: '100%', height: '100%', resizeMode: 'cover' },
    label: { fontSize: 12, fontWeight: 'bold', color: '#555', marginBottom: 4 },
    input: { backgroundColor: '#F8F9FA', borderWidth: 1, borderColor: '#E8E8E8', borderRadius: 10, padding: 12, fontSize: 14, marginBottom: 12, color: '#333' },

    foodListContainer: { backgroundColor: '#f5f5f5', borderRadius: 10, padding: 10, marginBottom: 15 },
    foodToggle: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#ebebeb' },
    foodToggleActive: { backgroundColor: '#FFE0D2', borderBottomWidth: 0, borderRadius: 6 },
    foodToggleText: { fontSize: 14, color: '#555' },

    cancelBtn: { flex: 1, backgroundColor: '#eee', padding: 15, borderRadius: 10, alignItems: 'center' },
    saveBtn: { flex: 2, backgroundColor: ORANGE, padding: 15, borderRadius: 10, alignItems: 'center' },
    
    // Date picker styles
    datePickerBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#E8E8E8', borderRadius: 10, padding: 12, backgroundColor: '#F8F9FA', marginBottom: 12 },
    datePickerText: { fontSize: 14, color: '#333', flex: 1 },
    datePickerIcon: { fontSize: 16, marginLeft: 8 },
    
    datePickerModal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    datePickerContent: { backgroundColor: '#fff', borderRadius: 16, padding: 20, width: '100%', maxWidth: 320 },
    datePickerTitle: { fontSize: 18, fontWeight: 'bold', color: '#222', textAlign: 'center', marginBottom: 20 },
    
    dateSelectors: { flexDirection: 'row', height: 200, marginBottom: 20 },
    dateColumn: { flex: 1, marginHorizontal: 4 },
    dateColumnLabel: { fontSize: 12, fontWeight: '600', color: '#666', textAlign: 'center', marginBottom: 8 },
    dateScroll: { flex: 1 },
    
    dateOption: { paddingVertical: 12, alignItems: 'center', borderRadius: 8, marginVertical: 1 },
    dateOptionSelected: { backgroundColor: ORANGE },
    dateOptionText: { fontSize: 14, color: '#333' },
    dateOptionTextSelected: { color: '#fff', fontWeight: '600' },
    
    datePickerActions: { flexDirection: 'row', gap: 10 },
    datePickerCancel: { flex: 1, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: '#E8E8E8', alignItems: 'center' },
    datePickerCancelText: { fontSize: 14, color: '#666', fontWeight: '600' },
    datePickerConfirm: { flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: ORANGE, alignItems: 'center' },
    datePickerConfirmText: { fontSize: 14, color: '#fff', fontWeight: '600' },
});

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

    // Form fields
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [discountType, setDiscountType] = useState('percentage'); // 'percentage' | 'fixed'
    const [discountValue, setDiscountValue] = useState('');
    const [durationDays, setDurationDays] = useState('7');
    const [applicableTo, setApplicableTo] = useState('all'); // 'all' | 'specific'
    const [selectedFoods, setSelectedFoods] = useState([]);

    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);

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
        setTitle(''); setDescription(''); setDiscountType('percentage'); setDiscountValue('');
        setDurationDays('7'); setApplicableTo('all'); setSelectedFoods([]);
        setImagePreview(null); setImageFile(null);
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

        setSaving(true);
        // Calculate dates natively
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + parseInt(durationDays || 7));

        try {
            if (imageFile) {
                const formData = new FormData();
                formData.append('title', title);
                formData.append('description', description);
                formData.append('discountType', discountType);
                formData.append('discountValue', discountValue);
                formData.append('canteenId', myCanteenId);
                formData.append('startDate', startDate.toISOString());
                formData.append('endDate', endDate.toISOString());
                formData.append('applicableTo', applicableTo);
                formData.append('bannerImage', imageFile);

                if (applicableTo === 'specific') {
                    selectedFoods.forEach(id => formData.append('foodItems[]', id));
                }

                await API.post('/promotions', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            } else {
                const payload = {
                    title, description, discountType, discountValue: Number(discountValue),
                    canteenId: myCanteenId, startDate: startDate.toISOString(), endDate: endDate.toISOString(),
                    applicableTo, foodItems: applicableTo === 'specific' ? selectedFoods : []
                };
                await API.post('/promotions', payload);
            }

            Alert.alert("Success", "Magnificent dynamically targeted Promotion launched successfully!");
            setModalVisible(false);
            fetchData();
        } catch (error) {
            Alert.alert("Launch Failed", error.response?.data?.message || "There was an error communicating with the backend server!");
        } finally {
            setSaving(false);
        }
    };

    const toggleStatus = async (id) => {
        try {
            await API.put(`/promotions/${id}/toggle`);
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
                <Text style={styles.title}>Promotions HQ</Text>
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
                            <Text style={styles.modalTitle}>Launch Mega Sale</Text>

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

                            <Text style={styles.label}>Duration Automatically (Days)</Text>
                            <TextInput style={styles.input} placeholder="7" value={durationDays} onChangeText={setDurationDays} keyboardType="numeric" />

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
    cardImage: { width: '100%', height: 120 },
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
    saveBtn: { flex: 2, backgroundColor: ORANGE, padding: 15, borderRadius: 10, alignItems: 'center' }
});

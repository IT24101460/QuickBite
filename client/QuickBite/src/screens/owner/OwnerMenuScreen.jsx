import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Image, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import API from '../../services/api';

const ORANGE = '#FF6B35';

export default function OwnerMenuScreen({ navigation }) {
    const [canteenId, setCanteenId] = useState(null);
    const [foods, setFoods] = useState([]);
    const [loading, setLoading] = useState(true);

    const [modalVisible, setModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form states
    const [foodId, setFoodId] = useState('');
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Rice');
    const [imagePreview, setImagePreview] = useState(null); // url string
    const [imageFile, setImageFile] = useState(null); // local URI object

    useEffect(() => {
        fetchMyCanteenMenu();
    }, []);

    const fetchMyCanteenMenu = async () => {
        try {
            setLoading(true);
            const myCanteenRes = await API.get('/canteens/my');
            const myId = myCanteenRes.data.canteen._id;
            setCanteenId(myId);

            const foodsRes = await API.get(`/food-items?canteenId=${myId}`);
            setFoods(foodsRes.data.foodItems);
        } catch (error) {
            console.log("Error loading menu:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePickImage = async () => {
        const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
        if (!result.didCancel && result.assets?.length > 0) {
            setImageFile({
                uri: result.assets[0].uri,
                type: result.assets[0].type || 'image/jpeg',
                name: result.assets[0].fileName || 'food.jpg',
            });
            setImagePreview(result.assets[0].uri);
        }
    };

    const openAddModal = () => {
        setIsEditing(false);
        setFoodId(Math.random().toString(36).substr(2, 9)); // Generate random foodItemId string
        setName(''); setPrice(''); setDescription(''); setCategory('Rice');
        setImagePreview(null); setImageFile(null);
        setModalVisible(true);
    };

    const openEditModal = (food) => {
        setIsEditing(true);
        setFoodId(food.foodItemId);
        setName(food.name);
        setPrice(food.price.toString());
        setDescription(food.description || '');
        setCategory(food.category);
        setImagePreview(food.image ? `http://10.0.2.2:3000${food.image}` : null);
        setImageFile(null);
        setModalVisible(true);
    };

    const handleSave = async () => {
        if (!name || !price || !category) return Alert.alert("Error", "Name, Price, and Category are required!");

        setSaving(true);
        try {
            if (imageFile) {
                const formData = new FormData();
                formData.append('foodItemId', foodId);
                formData.append('name', name);
                formData.append('price', price);
                formData.append('description', description);
                formData.append('category', category);
                formData.append('image', imageFile);

                if (isEditing) {
                    await API.put(`/food-items/${foodId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                } else {
                    await API.post(`/food-items`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                }
            } else {
                const payload = { foodItemId: foodId, name, price, description, category };
                if (isEditing) await API.put(`/food-items/${foodId}`, payload);
                else await API.post(`/food-items`, payload);
            }

            Alert.alert('Success', `Food Item ${isEditing ? 'Updated' : 'Added'}!`);
            setModalVisible(false);
            fetchMyCanteenMenu();
        } catch (error) {
            Alert.alert("Failed", error.response?.data?.message || "Something went wrong sending data.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        Alert.alert("Delete Item", "Are you sure you want to completely remove this food item?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete", style: "destructive", onPress: async () => {
                    await API.delete(`/food-items/${id}`);
                    fetchMyCanteenMenu();
                }
            }
        ]);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Text style={styles.backArrow}>←</Text></TouchableOpacity>
                <Text style={styles.title}>Menu Editor</Text>
            </View>

            <View style={styles.actionRow}>
                <Text style={styles.subTitle}>Your Menu Items</Text>
                <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
                    <Text style={styles.addBtnText}>+ Add New</Text>
                </TouchableOpacity>
            </View>

            {loading ? <ActivityIndicator size="large" color={ORANGE} style={{ marginTop: 50 }} /> : (
                <FlatList
                    contentContainerStyle={{ padding: 20 }}
                    data={foods}
                    keyExtractor={item => item.foodItemId}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <Image style={styles.cardImg} source={{ uri: item.image ? `http://10.0.2.2:3000${item.image}` : 'https://via.placeholder.com/100' }} />
                            <View style={styles.cardContent}>
                                <Text style={styles.cardTitle}>{item.name}</Text>
                                <Text style={styles.cardPrice}>Rs {item.price}</Text>
                                <View style={styles.badge}><Text style={styles.badgeText}>{item.category}</Text></View>
                            </View>
                            <View style={styles.cardActions}>
                                <TouchableOpacity onPress={() => openEditModal(item)} style={styles.iconBtn}><Text>✏️</Text></TouchableOpacity>
                                <TouchableOpacity onPress={() => handleDelete(item.foodItemId)} style={[styles.iconBtn, { backgroundColor: '#FFE5E5' }]}><Text>🗑️</Text></TouchableOpacity>
                            </View>
                        </View>
                    )}
                    ListEmptyComponent={<Text style={styles.empty}>No foods mapped to your canteen.</Text>}
                />
            )}

            <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalBg}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{isEditing ? 'Edit Food Item' : 'Add New Food'}</Text>

                        <TouchableOpacity style={styles.imgPicker} onPress={handlePickImage}>
                            {imagePreview ? <Image source={{ uri: imagePreview }} style={styles.imgPreview} /> : <Text style={{ color: '#888' }}>Tap to upload Photo</Text>}
                        </TouchableOpacity>

                        <TextInput style={styles.input} placeholder="Food Name (e.g. Mixed Rice)" value={name} onChangeText={setName} />

                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <TextInput style={[styles.input, { flex: 1 }]} placeholder="Price (Rs)" value={price} onChangeText={setPrice} keyboardType="numeric" />
                            <TextInput style={[styles.input, { flex: 1 }]} placeholder="Category" value={category} onChangeText={setCategory} />
                        </View>

                        <TextInput style={[styles.input, { height: 60 }]} placeholder="Description (Optional)" multiline value={description} onChangeText={setDescription} />

                        <View style={{ flexDirection: 'row', marginTop: 15, justifyContent: 'space-between' }}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}><Text>Cancel</Text></TouchableOpacity>
                            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
                                {saving ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: 'bold' }}>Save Item</Text>}
                            </TouchableOpacity>
                        </View>
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

    actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingBottom: 0 },
    subTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    addBtn: { backgroundColor: '#333', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
    addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },

    card: { backgroundColor: '#fff', flexDirection: 'row', padding: 12, borderRadius: 12, marginBottom: 15, elevation: 2 },
    cardImg: { width: 70, height: 70, borderRadius: 8 },
    cardContent: { flex: 1, paddingHorizontal: 12, justifyContent: 'center' },
    cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#222' },
    cardPrice: { fontSize: 14, color: ORANGE, fontWeight: 'bold', marginTop: 4 },
    badge: { backgroundColor: '#F0F0F0', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginTop: 6 },
    badgeText: { fontSize: 10, color: '#666', fontWeight: 'bold' },

    cardActions: { justifyContent: 'space-around', alignItems: 'center', paddingLeft: 10, borderLeftWidth: 1, borderColor: '#EEE' },
    iconBtn: { padding: 8, backgroundColor: '#F0F0F0', borderRadius: 8 },
    empty: { textAlign: 'center', color: '#888', marginTop: 40 },

    modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalContent: { width: '100%', backgroundColor: '#fff', padding: 20, borderRadius: 16, elevation: 10 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#222', marginBottom: 20 },
    imgPicker: { width: '100%', height: 120, backgroundColor: '#EEE', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 15, overflow: 'hidden' },
    imgPreview: { width: '100%', height: '100%', resizeMode: 'cover' },
    input: { backgroundColor: '#F8F9FA', borderWidth: 1, borderColor: '#E8E8E8', borderRadius: 10, padding: 12, fontSize: 14, marginBottom: 12, color: '#333' },
    cancelBtn: { padding: 15, borderRadius: 10, backgroundColor: '#eee', flex: 1, alignItems: 'center', marginRight: 10 },
    saveBtn: { padding: 15, borderRadius: 10, backgroundColor: ORANGE, flex: 1, alignItems: 'center' }
});

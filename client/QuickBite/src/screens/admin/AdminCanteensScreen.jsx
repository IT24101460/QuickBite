import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator,
    Alert, TextInput, ScrollView, RefreshControl, Modal, Image,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import API from '../../services/api';

const ORANGE = '#FF6B35';

export default function AdminCanteensScreen({ navigation }) {
    const [canteens, setCanteens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modal, setModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [owners, setOwners] = useState([]);
    const [form, setForm] = useState({ canteenName: '', location: '', contactDetails: '', ownerDetails: '', openingTime: '', closingTime: '', createdBy: '' });
    const [image, setImage] = useState(null);
    const [saving, setSaving] = useState(false);
    const [nameError, setNameError] = useState('');

    const set = k => v => {
        setForm(f => ({ ...f, [k]: v }));
        
        // Real-time validation for canteen name
        if (k === 'canteenName' && v) {
            const duplicateName = canteens.find(c => 
                c.canteenName.toLowerCase() === v.toLowerCase() && 
                c._id !== editing?._id
            );
            setNameError(duplicateName ? 'A canteen with this name already exists' : '');
        } else if (k === 'canteenName' && !v) {
            setNameError('Canteen name is required');
        } else if (k === 'canteenName') {
            setNameError('');
        }
    };

    const fetch = async () => {
        try {
            const r = await API.get('/canteens');
            setCanteens(r.data?.canteens || []);
        } catch (e) { } finally { setLoading(false); setRefreshing(false); }
    };
    const fetchOwners = async () => {
        try {
            const r = await API.get('/users/owners');
            setOwners(r.data || []);
        } catch (e) { }
    };
    useEffect(() => { fetch(); fetchOwners(); }, []);

    const openAdd = () => { setEditing(null); setForm({ canteenName: '', location: '', contactDetails: '', ownerDetails: '', openingTime: '08:00 AM', closingTime: '05:00 PM', createdBy: '' }); setImage(null); setModal(true); };
    const openEdit = (c) => { setEditing(c); setForm({ canteenName: c.canteenName, location: c.location, contactDetails: c.contactDetails, ownerDetails: c.ownerDetails, openingTime: c.openingTime, closingTime: c.closingTime, createdBy: c.createdBy }); setImage(null); setModal(true); };

    const pickImg = () => launchImageLibrary({ 
        mediaType: 'photo', 
        quality: 0.7,
        includeBase64: false,
        maxHeight: 1024,
        maxWidth: 1024,
        selectionLimit: 1
    }, r => { 
        if (!r.didCancel && r.assets?.length) {
            // Check file type
            const asset = r.assets[0];
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
            if (allowedTypes.includes(asset.type)) {
                setImage(asset);
            } else {
                Alert.alert('Invalid File Type', 'Please select only JPG, JPEG, or PNG images');
            }
        }
    });

    const save = async () => {
        if (!form.canteenName || !form.location || !form.contactDetails || !form.ownerDetails || !form.createdBy) {
            return Alert.alert('Error', 'Fill all required fields including assigning an owner');
        }

        // Check for duplicate name in frontend (optimistic validation)
        const duplicateName = canteens.find(c => 
            c.canteenName.toLowerCase() === form.canteenName.toLowerCase() && 
            c._id !== editing?._id
        );
        
        if (duplicateName) {
            return Alert.alert('Duplicate Name', 'A canteen with this name already exists. Please choose a different name.');
        }

        setSaving(true);
        try {
            const fd = new FormData();
            Object.entries(form).forEach(([k, v]) => fd.append(k, v));
            if (image) fd.append('canteenImage', { uri: image.uri, name: image.fileName || 'img.jpg', type: image.type || 'image/jpeg' });
            
            let response;
            if (editing) {
                response = await API.put(`/canteens/${editing._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            } else {
                response = await API.post('/canteens', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            }
            
            setModal(false);
            fetch();
            Alert.alert('Success', editing ? 'Canteen updated successfully!' : 'Canteen created successfully!');
        } catch (e) {
            console.error('Save error:', e);
            const errorMessage = e.response?.data?.message || 'Failed to save canteen';
            const errorDetails = e.response?.data?.details;
            
            if (errorDetails && Array.isArray(errorDetails)) {
                Alert.alert('Validation Error', errorDetails.join('\n'));
            } else if (errorMessage.includes('already exists')) {
                Alert.alert('Duplicate Name', errorMessage);
            } else if (errorMessage.includes('image')) {
                Alert.alert('Image Upload Error', errorMessage);
            } else {
                Alert.alert('Error', errorMessage);
            }
        } finally { 
            setSaving(false); 
        }
    };

    const deleteCanteen = (id) => Alert.alert('Delete', 'Are you sure?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => { await API.delete(`/canteens/${id}`); fetch(); } },
    ]);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Text style={styles.back}>←</Text></TouchableOpacity>
                <Text style={styles.headerTitle}>🏪 Manage Canteens</Text>
                <TouchableOpacity style={styles.addBtn} onPress={openAdd}><Text style={styles.addBtnText}>+ Add</Text></TouchableOpacity>
            </View>

            {loading ? <ActivityIndicator size="large" color={ORANGE} style={{ marginTop: 40 }} /> : (
                <FlatList
                    data={canteens}
                    keyExtractor={i => i._id}
                    contentContainerStyle={{ padding: 12 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetch(); }} colors={[ORANGE]} />}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <View style={styles.cardInfo}>
                                <Text style={styles.cardName}>{item.canteenName}</Text>
                                <Text style={styles.cardSub}>📍 {item.location}</Text>
                                <Text style={styles.cardSub}>🕐 {item.openingTime} – {item.closingTime}</Text>
                            </View>
                            <View style={styles.cardActions}>
                                <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}><Text style={styles.editBtnText}>Edit</Text></TouchableOpacity>
                                <TouchableOpacity style={styles.delBtn} onPress={() => deleteCanteen(item._id)}><Text style={styles.delBtnText}>Del</Text></TouchableOpacity>
                            </View>
                        </View>
                    )}
                    ListEmptyComponent={<Text style={styles.empty}>No canteens yet</Text>}
                />
            )}

            <Modal visible={modal} animationType="slide" onRequestClose={() => setModal(false)}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setModal(false)}><Text style={styles.back}>✕</Text></TouchableOpacity>
                        <Text style={styles.modalTitle}>{editing ? 'Edit Canteen' : 'Add Canteen'}</Text>
                    </View>
                    <ScrollView contentContainerStyle={styles.modalScroll}>
                        {[
    ['Canteen Name *', 'canteenName'], 
    ['Location *', 'location'], 
    ['Contact Details *', 'contactDetails'], 
    ['Owner Details (Text) *', 'ownerDetails'], 
    ['Opening Time', 'openingTime'], 
    ['Closing Time', 'closingTime']
].map(([label, k]) => (
                            <View key={k} style={{ marginBottom: 12 }}>
                                <Text style={styles.label}>{label}</Text>
                                <TextInput 
                                    style={[styles.input, nameError && k === 'canteenName' && styles.inputError]} 
                                    value={form[k]} 
                                    onChangeText={set(k)} 
                                    placeholder={label} 
                                    placeholderTextColor="#aaa" 
                                />
                                {nameError && k === 'canteenName' && (
                                    <Text style={styles.errorText}>{nameError}</Text>
                                )}
                            </View>
                        ))}
                        
                        <Text style={styles.label}>Assign Owner Account *</Text>
                        <View style={styles.ownersList}>
                            {owners.map(o => (
                                <TouchableOpacity 
                                    key={o._id} 
                                    style={[styles.ownerItem, form.createdBy === o._id && styles.ownerItemSelected]}
                                    onPress={() => set('createdBy')(o._id)}
                                >
                                    <Text style={[styles.ownerItemText, form.createdBy === o._id && styles.ownerItemTextSelected]}>
                                        {o.firstName} {o.lastName} ({o.email})
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <Text style={styles.label}>Canteen Image</Text>
                        <TouchableOpacity style={styles.imgPicker} onPress={pickImg}>
                            {image ? (
                                <View>
                                    <Image source={{ uri: image.uri }} style={styles.imgPreview} resizeMode="cover" />
                                    <TouchableOpacity 
                                        style={styles.cancelImgBtn} 
                                        onPress={() => setImage(null)}
                                    >
                                        <Text style={styles.cancelImgBtnText}>✕</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <Text style={styles.imgPickerText}>📷 Select Image</Text>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={save} disabled={saving}>
                            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>{editing ? 'Update' : 'Create'} Canteen</Text>}
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    header: { backgroundColor: ORANGE, paddingTop: 52, paddingBottom: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' },
    backBtn: { marginRight: 10, padding: 4 },
    back: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
    headerTitle: { flex: 1, color: '#fff', fontSize: 18, fontWeight: 'bold' },
    addBtn: { backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
    addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
    card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, elevation: 2 },
    cardInfo: { flex: 1 },
    cardName: { fontSize: 15, fontWeight: 'bold', color: '#222', marginBottom: 4 },
    cardSub: { fontSize: 12, color: '#888', marginBottom: 2 },
    cardActions: { justifyContent: 'center', gap: 6 },
    editBtn: { backgroundColor: '#E3F2FD', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
    editBtnText: { color: '#1565C0', fontWeight: '600', fontSize: 12 },
    delBtn: { backgroundColor: '#FFEBEE', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
    delBtnText: { color: '#C62828', fontWeight: '600', fontSize: 12 },
    empty: { textAlign: 'center', color: '#aaa', paddingVertical: 40 },
    modalContainer: { flex: 1, backgroundColor: '#fff' },
    modalHeader: { backgroundColor: ORANGE, paddingTop: 52, paddingBottom: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
    modalTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    modalScroll: { padding: 20 },
    label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6 },
    input: { borderWidth: 1.5, borderColor: '#E8E8E8', borderRadius: 10, padding: 12, fontSize: 14, color: '#222', marginBottom: 2 },
    inputError: { borderColor: '#FF6B35' },
    errorText: { color: '#FF6B35', fontSize: 12, marginTop: 4 },
    imgPicker: { borderWidth: 2, borderColor: ORANGE, borderStyle: 'dashed', borderRadius: 12, height: 120, justifyContent: 'center', alignItems: 'center', marginBottom: 20, overflow: 'hidden' },
    imgPreview: { width: '100%', height: '100%' },
    imgPickerText: { color: ORANGE, fontWeight: '600', fontSize: 14 },
    cancelImgBtn: { position: 'absolute', top: 5, right: 5, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 12, width: 24, height: 24, justifyContent: 'center', alignItems: 'center' },
    cancelImgBtnText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
    saveBtn: { backgroundColor: ORANGE, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
    saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
    ownersList: { marginBottom: 20, gap: 8 },
    ownerItem: { padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#E8E8E8', backgroundColor: '#F8F9FA' },
    ownerItemSelected: { borderColor: ORANGE, backgroundColor: '#FFF3E0' },
    ownerItemText: { fontSize: 14, color: '#444' },
    ownerItemTextSelected: { color: ORANGE, fontWeight: 'bold' },
});

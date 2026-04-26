import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator,
    Alert, TextInput, ScrollView, RefreshControl, Modal,
} from 'react-native';
import API from '../../services/api';

const ORANGE = '#FF6B35';

export default function AdminOwnersScreen({ navigation }) {
    const [owners, setOwners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modal, setModal] = useState(false);
    const [editingOwner, setEditingOwner] = useState(null);
    const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phoneNumber: '', password: '', uniId: '' });
    const [saving, setSaving] = useState(false);

    const set = k => v => setForm(f => ({ ...f, [k]: v }));

    const fetch = async () => {
        try {
            const r = await API.get('/users/owners');
            setOwners(r.data || []);
        } catch (e) { } finally { setLoading(false); setRefreshing(false); }
    };
    useEffect(() => { fetch(); }, []);

    const openAdd = () => { 
        setEditingOwner(null);
        setForm({ firstName: '', lastName: '', email: '', phoneNumber: '', password: '', uniId: '' }); 
        setModal(true); 
    };

    const openEdit = (owner) => {
        setEditingOwner(owner);
        setForm({ 
            firstName: owner.firstName, 
            lastName: owner.lastName, 
            email: owner.email, 
            phoneNumber: owner.phoneNumber, 
            password: '', // Leave blank unless they want to change it
            uniId: owner.uniId || '' 
        });
        setModal(true);
    };

    const save = async () => {
        if (!form.firstName || !form.lastName || !form.email || !form.phoneNumber) {
            return Alert.alert('Error', 'Fill all required fields');
        }
        if (!editingOwner && !form.password) {
            return Alert.alert('Error', 'Password is required when creating a new owner');
        }
        setSaving(true);
        try {
            if (editingOwner) {
                // Remove password from payload if it wasn't entered
                const payload = { ...form };
                if (!payload.password) delete payload.password;
                
                await API.put(`/users/${editingOwner._id}`, payload);
            } else {
                await API.post('/users/create-owner', form);
            }
            setModal(false);
            fetch();
        } catch (e) { 
            Alert.alert('Error', e.response?.data?.message || e.response?.data?.error || 'Failed to save owner'); 
        } finally { 
            setSaving(false); 
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Text style={styles.back}>←</Text></TouchableOpacity>
                <Text style={styles.headerTitle}>👥 Manage Owners</Text>
                <TouchableOpacity style={styles.addBtn} onPress={openAdd}><Text style={styles.addBtnText}>+ Create</Text></TouchableOpacity>
            </View>

            {loading ? <ActivityIndicator size="large" color={ORANGE} style={{ marginTop: 40 }} /> : (
                <FlatList
                    data={owners}
                    keyExtractor={i => i._id}
                    contentContainerStyle={{ padding: 12 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetch(); }} colors={[ORANGE]} />}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <View style={styles.cardInfo}>
                                <Text style={styles.cardName}>{item.firstName} {item.lastName}</Text>
                                <Text style={styles.cardSub}>✉️ {item.email}</Text>
                                <Text style={styles.cardSub}>📞 {item.phoneNumber}</Text>
                            </View>
                            <View style={styles.cardActions}>
                                <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
                                    <Text style={styles.editBtnText}>Edit</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                    ListEmptyComponent={<Text style={styles.empty}>No owner accounts found</Text>}
                />
            )}

            <Modal visible={modal} animationType="slide" onRequestClose={() => setModal(false)}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setModal(false)}><Text style={styles.back}>✕</Text></TouchableOpacity>
                        <Text style={styles.modalTitle}>{editingOwner ? 'Edit Owner' : 'Create Owner'}</Text>
                    </View>
                    <ScrollView contentContainerStyle={styles.modalScroll}>
                        {[
                            ['First Name *', 'firstName'], 
                            ['Last Name *', 'lastName'], 
                            ['Email *', 'email'], 
                            ['Phone Number *', 'phoneNumber'], 
                            [editingOwner ? 'New Password (Optional)' : 'Password *', 'password'],
                            ['Owner ID / Registration (Optional)', 'uniId']
                        ].map(([label, k]) => (
                            <View key={k} style={{ marginBottom: 12 }}>
                                <Text style={styles.label}>{label}</Text>
                                <TextInput 
                                    style={styles.input} 
                                    value={form[k]} 
                                    onChangeText={set(k)} 
                                    placeholder={label} 
                                    placeholderTextColor="#aaa" 
                                    secureTextEntry={k === 'password'}
                                    autoCapitalize={k === 'email' ? 'none' : 'words'}
                                />
                            </View>
                        ))}
                        <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={save} disabled={saving}>
                            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>{editingOwner ? 'Update Owner' : 'Create Owner'}</Text>}
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
    card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, elevation: 2, alignItems: 'center' },
    cardInfo: { flex: 1 },
    cardName: { fontSize: 16, fontWeight: 'bold', color: '#222', marginBottom: 4 },
    cardSub: { fontSize: 13, color: '#666', marginBottom: 2 },
    cardActions: { justifyContent: 'center', alignItems: 'flex-end', paddingLeft: 10 },
    editBtn: { backgroundColor: '#E3F2FD', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
    editBtnText: { color: '#1565C0', fontSize: 13, fontWeight: 'bold' },
    empty: { textAlign: 'center', color: '#aaa', paddingVertical: 40 },
    modalContainer: { flex: 1, backgroundColor: '#fff' },
    modalHeader: { backgroundColor: ORANGE, paddingTop: 52, paddingBottom: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
    modalTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    modalScroll: { padding: 20 },
    label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6 },
    input: { borderWidth: 1.5, borderColor: '#E8E8E8', borderRadius: 10, padding: 12, fontSize: 14, color: '#222', marginBottom: 2 },
    saveBtn: { backgroundColor: ORANGE, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 20 },
    saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});

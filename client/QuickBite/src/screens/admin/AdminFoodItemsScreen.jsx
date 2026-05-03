import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator,
    Alert, TextInput, ScrollView, RefreshControl, Modal, Image, Switch,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import API from '../../services/api';
import { getImageUrl } from '../../utils/imageUtils';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS, SIZES } from '../../styles/adminTheme';

export default function AdminFoodItemsScreen({ navigation }) {
    const [items, setItems] = useState([]);
    const [canteens, setCanteens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modal, setModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ foodItemId: '', name: '', category: '', description: '', price: '', quantity: '' });
    const [image, setImage] = useState(null);
    const [saving, setSaving] = useState(false);

    const set = k => v => setForm(f => ({ ...f, [k]: v }));

    const fetch = async () => {
        try {
            const [fr, cr] = await Promise.all([API.get('/foods'), API.get('/canteens')]);
            setItems(fr.data?.foodItems || []);
            setCanteens(cr.data?.canteens || []);
        } catch (e) { } finally { setLoading(false); setRefreshing(false); }
    };
    useEffect(() => { fetch(); }, []);

    const openAdd = () => { setEditing(null); setForm({ foodItemId: Date.now().toString(), name: '', category: 'General', description: '', price: '', quantity: '999' }); setImage(null); setModal(true); };
    const openEdit = (i) => { setEditing(i); setForm({ foodItemId: i.foodItemId, name: i.name, category: i.category || '', description: i.description || '', price: String(i.price), quantity: String(i.quantity) }); setImage(null); setModal(true); };
    const pickImg = () => launchImageLibrary({ mediaType: 'photo', quality: 0.7 }, r => { if (!r.didCancel && r.assets?.length) setImage(r.assets[0]); });

    const save = async () => {
        if (!form.name || !form.price) return Alert.alert('Error', 'Name and price are required');
        setSaving(true);
        try {
            const fd = new FormData();
            Object.entries(form).forEach(([k, v]) => fd.append(k, v));
            if (image) fd.append('image', { uri: image.uri, name: image.fileName || 'img.jpg', type: image.type || 'image/jpeg' });
            if (editing) await API.patch(`/foods/${editing.foodItemId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            else await API.post('/foods', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            setModal(false);
            fetch();
        } catch (e) { Alert.alert('Error', e.response?.data?.message || 'Failed'); }
        finally { setSaving(false); }
    };

    const deleteItem = (id) => Alert.alert('Delete', 'Delete this food item?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => { await API.delete(`/foods/${id}`); fetch(); } },
    ]);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Text style={styles.back}>←</Text></TouchableOpacity>
                <Text style={styles.headerTitle}>🍽️ Food Items</Text>
                <TouchableOpacity style={styles.addBtn} onPress={openAdd}><Text style={styles.addBtnText}>+ Add</Text></TouchableOpacity>
            </View>

            {loading ? <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} /> : (
                <FlatList
                    data={items}
                    keyExtractor={i => i._id}
                    contentContainerStyle={{ padding: 12 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetch(); }} colors={[COLORS.primary]} />}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            {item.image
                                ? <Image source={{ uri: getImageUrl(item.image) }} style={styles.itemImg} resizeMode="cover" />
                                : <View style={styles.itemImgPlaceholder}><Text style={styles.placeholderIcon}>🍽️</Text></View>}
                            <View style={styles.cardInfo}>
                                <Text style={styles.cardName}>{item.name}</Text>
                                <Text style={styles.cardSub}>{item.category} · LKR {item.price}</Text>
                                <Text style={styles.cardSub}>Qty: {item.quantity}</Text>
                            </View>
                            <View style={styles.cardActions}>
                                <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}><Text style={styles.editBtnText}>Edit</Text></TouchableOpacity>
                                <TouchableOpacity style={styles.delBtn} onPress={() => deleteItem(item.foodItemId)}><Text style={styles.delBtnText}>Del</Text></TouchableOpacity>
                            </View>
                        </View>
                    )}
                    ListEmptyComponent={<Text style={styles.empty}>No food items yet</Text>}
                />
            )}

            <Modal visible={modal} animationType="slide" onRequestClose={() => setModal(false)}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setModal(false)}><Text style={styles.back}>✕</Text></TouchableOpacity>
                        <Text style={styles.modalTitle}>{editing ? 'Edit Food Item' : 'Add Food Item'}</Text>
                    </View>
                    <ScrollView contentContainerStyle={styles.modalScroll}>
                        {[['Name *', 'name'], ['Category', 'category'], ['Description', 'description'], ['Price (LKR) *', 'price'], ['Quantity', 'quantity']].map(([label, k]) => (
                            <View key={k} style={{ marginBottom: 12 }}>
                                <Text style={styles.label}>{label}</Text>
                                <TextInput style={styles.input} value={form[k]} onChangeText={set(k)} placeholder={label} placeholderTextColor="#aaa" keyboardType={['price', 'quantity'].includes(k) ? 'numeric' : 'default'} />
                            </View>
                        ))}
                        <Text style={styles.label}>Food Image</Text>
                        <TouchableOpacity style={styles.imgPicker} onPress={pickImg}>
                            {image ? <Image source={{ uri: image.uri }} style={styles.imgPreview} resizeMode="cover" /> : <Text style={styles.imgPickerText}>📷 Select Image</Text>}
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={save} disabled={saving}>
                            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>{editing ? 'Update' : 'Add'} Food Item</Text>}
                        </TouchableOpacity>
                    </ScrollView>
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
        paddingBottom: SPACING.lg,
        paddingHorizontal: SPACING.lg,
        flexDirection: 'row',
        alignItems: 'center',
        ...SHADOWS.md,
    },
    backBtn: { 
        marginRight: SPACING.sm,
        padding: SPACING.xs,
        borderRadius: BORDER_RADIUS.round,
        backgroundColor: 'rgba(255,255,255,0.1)'
    },
    back: { 
        color: COLORS.textWhite, 
        fontSize: 22, 
        fontWeight: '700' 
    },
    headerTitle: { 
        flex: 1, 
        color: COLORS.textWhite, 
        fontSize: TYPOGRAPHY.h3.fontSize, 
        fontWeight: TYPOGRAPHY.h3.fontWeight 
    },
    addBtn: { 
        backgroundColor: 'rgba(255,255,255,0.2)', 
        borderRadius: BORDER_RADIUS.md, 
        paddingHorizontal: SPACING.md, 
        paddingVertical: SPACING.sm 
    },
    addBtnText: { 
        color: COLORS.textWhite, 
        fontWeight: TYPOGRAPHY.button.fontWeight, 
        fontSize: TYPOGRAPHY.button.fontSize 
    },
    card: { 
        flexDirection: 'row', 
        backgroundColor: COLORS.surface, 
        borderRadius: BORDER_RADIUS.lg, 
        padding: SPACING.lg, 
        marginBottom: SPACING.md, 
        ...SHADOWS.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    },
    itemImg: { 
        width: 70, 
        height: 70, 
        borderRadius: BORDER_RADIUS.md, 
        marginRight: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    },
    itemImgPlaceholder: { 
        width: 70, 
        height: 70, 
        borderRadius: BORDER_RADIUS.md, 
        backgroundColor: COLORS.primaryUltraLight,
        justifyContent: 'center', 
        alignItems: 'center', 
        marginRight: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.primaryLight,
    },
    placeholderIcon: { fontSize: 24 },
    cardInfo: { flex: 1 },
    cardName: { 
        fontSize: TYPOGRAPHY.body1.fontSize,
        fontWeight: '600', 
        color: COLORS.textPrimary, 
        marginBottom: SPACING.xs 
    },
    cardSub: { 
        fontSize: TYPOGRAPHY.caption.fontSize, 
        color: COLORS.textSecondary 
    },
    cardActions: { justifyContent: 'center', gap: SPACING.sm },
    editBtn: { 
        backgroundColor: COLORS.info, 
        borderRadius: BORDER_RADIUS.md, 
        paddingHorizontal: SPACING.md, 
        paddingVertical: SPACING.sm 
    },
    editBtnText: { 
        color: COLORS.textWhite, 
        fontWeight: '600', 
        fontSize: TYPOGRAPHY.caption.fontSize 
    },
    delBtn: { 
        backgroundColor: COLORS.danger, 
        borderRadius: BORDER_RADIUS.md, 
        paddingHorizontal: SPACING.md, 
        paddingVertical: SPACING.sm 
    },
    delBtnText: { 
        color: COLORS.textWhite, 
        fontWeight: '600', 
        fontSize: TYPOGRAPHY.caption.fontSize 
    },
    empty: { 
        textAlign: 'center', 
        color: COLORS.textTertiary, 
        paddingVertical: SPACING.xxxl,
        fontSize: TYPOGRAPHY.body2.fontSize 
    },
    modalContainer: { flex: 1, backgroundColor: COLORS.surface },
    modalHeader: { 
        backgroundColor: COLORS.primary,
        paddingTop: 52,
        paddingBottom: SPACING.lg,
        paddingHorizontal: SPACING.lg,
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
        ...SHADOWS.md,
    },
    modalTitle: { 
        color: COLORS.textWhite, 
        fontSize: TYPOGRAPHY.h3.fontSize, 
        fontWeight: TYPOGRAPHY.h3.fontWeight 
    },
    modalScroll: { padding: SPACING.lg },
    label: { 
        fontSize: TYPOGRAPHY.label.fontSize, 
        fontWeight: TYPOGRAPHY.label.fontWeight, 
        color: COLORS.textSecondary, 
        marginBottom: SPACING.sm 
    },
    input: { 
        borderWidth: 1.5, 
        borderColor: COLORS.border, 
        borderRadius: BORDER_RADIUS.md, 
        padding: SPACING.md, 
        fontSize: TYPOGRAPHY.body2.fontSize, 
        color: COLORS.textPrimary, 
        marginBottom: SPACING.xs,
        backgroundColor: COLORS.surface,
        height: SIZES.inputHeight,
    },
    imgPicker: { 
        borderWidth: 2, 
        borderColor: COLORS.primary, 
        borderStyle: 'dashed', 
        borderRadius: BORDER_RADIUS.lg, 
        height: 120, 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginBottom: SPACING.lg, 
        overflow: 'hidden',
        backgroundColor: COLORS.primaryUltraLight,
    },
    imgPreview: { width: '100%', height: '100%' },
    imgPickerText: { 
        color: COLORS.primary, 
        fontWeight: '600', 
        fontSize: TYPOGRAPHY.body2.fontSize 
    },
    saveBtn: { 
        backgroundColor: COLORS.primary,
        borderRadius: BORDER_RADIUS.lg, 
        paddingVertical: SPACING.md, 
        alignItems: 'center', 
        marginTop: SPACING.md,
        height: SIZES.buttonHeight,
        justifyContent: 'center',
        ...SHADOWS.sm,
    },
    saveBtnText: { 
        color: COLORS.textWhite, 
        fontWeight: 'bold', 
        fontSize: TYPOGRAPHY.button.fontSize 
    },
});

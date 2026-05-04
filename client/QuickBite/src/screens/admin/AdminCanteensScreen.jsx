import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator,
    Alert, TextInput, ScrollView, RefreshControl, Modal, Image,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import API from '../../services/api';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS, SIZES } from '../../styles/adminTheme';

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
    const [phoneError, setPhoneError] = useState('');

    const set = k => v => {
        // 🛡️ VALIDATION: Limit contact/phone input to 10 numeric digits only
        if (k === 'contactDetails') {
            const digitsOnly = v.replace(/[^0-9]/g, '').slice(0, 10);
            setForm(f => ({ ...f, [k]: digitsOnly }));
            if (digitsOnly.length > 0 && digitsOnly.length < 10) {
                setPhoneError('Phone number must be exactly 10 digits');
            } else if (digitsOnly.length === 0) {
                setPhoneError('Phone number is required');
            } else {
                setPhoneError('');
            }
            return;
        }

        setForm(f => ({ ...f, [k]: v }));

        // 🛡️ VALIDATION: Frontend real-time check for duplicate canteen names while typing
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

    // ✨ CRUD: READ - Fetching the list of canteens from backend API
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

    const openAdd = () => {
        setEditing(null);
        setForm({ canteenName: '', location: '', contactDetails: '', ownerDetails: '', openingTime: '08:00 AM', closingTime: '05:00 PM', createdBy: '' });
        setNameError('');
        setPhoneError('');
        setImage(null);
        setModal(true);
    };

    const openEdit = (c) => {
        setEditing(c);
        setForm({ canteenName: c.canteenName, location: c.location, contactDetails: c.contactDetails, ownerDetails: c.ownerDetails, openingTime: c.openingTime, closingTime: c.closingTime, createdBy: c.createdBy });
        setNameError('');
        setPhoneError('');
        setImage(null);
        setModal(true);
    };

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

    // ✨ CRUD: CREATE & UPDATE - Determines whether to CREATE (add new) or UPDATE (edit existing) based on 'editing' state
    const save = async () => {
        // 🛡️ VALIDATION: Ensure all required fields are filled before saving
        if (!form.canteenName || !form.location || !form.contactDetails || !form.ownerDetails || !form.createdBy) {
            return Alert.alert('Error', 'Fill all required fields including assigning an owner');
        }

        // 🛡️ VALIDATION: Ensure phone number is exactly 10 digits before sending to server
        if (!/^[0-9]{10}$/.test(form.contactDetails)) {
            setPhoneError('Phone number must be exactly 10 digits');
            return Alert.alert('Invalid Phone Number', 'Contact number must be exactly 10 digits.');
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

            if (editing) {
                await API.put(`/canteens/${editing._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            } else {
                await API.post('/canteens', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
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

    // ✨ CRUD: DELETE - Sends delete request to backend and re-fetches the list
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

            {loading ? <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} /> : (
                <FlatList
                    data={canteens}
                    keyExtractor={i => i._id}
                    contentContainerStyle={{ padding: 12 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetch(); }} colors={[COLORS.primary]} />}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <View style={styles.cardImageContainer}>
                                {item.canteenImage ? (
                                    <Image source={{ uri: item.canteenImage }} style={styles.cardImage} resizeMode="cover" />
                                ) : (
                                    <View style={styles.cardImagePlaceholder}>
                                        <Text style={styles.cardImagePlaceholderText}>🏪</Text>
                                    </View>
                                )}
                            </View>
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
                            ['Contact Number * (10 digits)', 'contactDetails'],
                            ['Owner Details (Text) *', 'ownerDetails'],
                            ['Opening Time', 'openingTime'],
                            ['Closing Time', 'closingTime']
                        ].map(([label, k]) => (
                            <View key={k} style={{ marginBottom: 12 }}>
                                <Text style={styles.label}>{label}</Text>
                                <TextInput
                                    style={[styles.input,
                                    (nameError && k === 'canteenName') || (phoneError && k === 'contactDetails')
                                        ? styles.inputError : null
                                    ]}
                                    value={form[k]}
                                    onChangeText={set(k)}
                                    keyboardType={k === 'contactDetails' ? 'phone-pad' : 'default'}
                                    maxLength={k === 'contactDetails' ? 10 : undefined}
                                    placeholder={k === 'contactDetails' ? 'e.g. 0712345678' : label}
                                    placeholderTextColor="#aaa"
                                />
                                {nameError && k === 'canteenName' && (
                                    <Text style={styles.errorText}>{nameError}</Text>
                                )}
                                {phoneError && k === 'contactDetails' && (
                                    <Text style={styles.errorText}>{phoneError}</Text>
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
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        backgroundColor: COLORS.primary,
        paddingTop: 52,
        paddingBottom: 20,
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
    back: { color: COLORS.textWhite, fontSize: 22, fontWeight: '700' },
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
    cardImageContainer: { marginRight: SPACING.md },
    cardImage: {
        width: 70,
        height: 70,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: COLORS.surfaceVariant,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    },
    cardImagePlaceholder: {
        width: 70,
        height: 70,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: COLORS.primaryUltraLight,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.primaryLight,
    },
    cardImagePlaceholderText: { fontSize: 28, color: COLORS.primary },
    cardInfo: { flex: 1 },
    cardName: {
        fontSize: TYPOGRAPHY.body1.fontSize,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: SPACING.xs
    },
    cardSub: {
        fontSize: TYPOGRAPHY.caption.fontSize,
        color: COLORS.textSecondary,
        marginBottom: 2
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
    inputError: {
        borderColor: COLORS.danger,
        borderWidth: 2,
    },
    errorText: {
        color: COLORS.danger,
        fontSize: TYPOGRAPHY.caption.fontSize,
        marginTop: SPACING.xs
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
    cancelImgBtn: {
        position: 'absolute',
        top: SPACING.xs,
        right: SPACING.xs,
        backgroundColor: 'rgba(0,0,0,0.7)',
        borderRadius: BORDER_RADIUS.round,
        width: 28,
        height: 28,
        justifyContent: 'center',
        alignItems: 'center'
    },
    cancelImgBtnText: {
        color: COLORS.textWhite,
        fontSize: 14,
        fontWeight: 'bold'
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
    ownersList: { marginBottom: SPACING.lg, gap: SPACING.sm },
    ownerItem: {
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.surfaceVariant
    },
    ownerItemSelected: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primaryUltraLight,
        borderWidth: 2,
    },
    ownerItemText: {
        fontSize: TYPOGRAPHY.body2.fontSize,
        color: COLORS.textPrimary
    },
    ownerItemTextSelected: {
        color: COLORS.primary,
        fontWeight: 'bold'
    },
});

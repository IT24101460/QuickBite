import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator,
    Alert, TextInput, ScrollView, RefreshControl, Modal,
} from 'react-native';
import API from '../../services/api';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS, SIZES } from '../../styles/adminTheme';

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
        const { firstName, lastName, email, phoneNumber, password } = form;

        // Basic presence check
        if (!firstName || !lastName || !email || !phoneNumber) {
            return Alert.alert('Error', 'Fill all required fields');
        }

        // Name validations (letters and spaces only, min 2 chars)
        const nameRegex = /^[A-Za-z\s]{2,}$/;
        if (!nameRegex.test(firstName)) {
            return Alert.alert('Validation Error', 'First name must be at least 2 characters and contain only letters.');
        }
        if (!nameRegex.test(lastName)) {
            return Alert.alert('Validation Error', 'Last name must be at least 2 characters and contain only letters.');
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return Alert.alert('Validation Error', 'Please enter a valid email address.');
        }

        // Phone number validation (exactly 10 digits)
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(phoneNumber)) {
            return Alert.alert('Validation Error', 'Phone number must be exactly 10 digits.');
        }

        if (!editingOwner && !password) {
            return Alert.alert('Error', 'Password is required when creating a new owner');
        }

        if (password && password.length < 6) {
            return Alert.alert('Validation Error', 'Password must be at least 6 characters.');
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

    const deleteOwner = (owner) => {
        // Show a strong confirmation before deleting — accidental delete of an owner can break canteen assignments
        Alert.alert(
            '⚠️ Delete Owner',
            `Are you sure you want to delete "${owner.firstName} ${owner.lastName}"?\n\nThis action cannot be undone and may affect any canteen assigned to this owner.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await API.delete(`/users/${owner._id}`);
                            fetch();
                            Alert.alert('Deleted', `${owner.firstName} ${owner.lastName} has been removed.`);
                        } catch (e) {
                            Alert.alert('Error', e.response?.data?.message || 'Failed to delete owner');
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Text style={styles.back}>←</Text></TouchableOpacity>
                <Text style={styles.headerTitle}>👥 Manage Owners</Text>
                <TouchableOpacity style={styles.addBtn} onPress={openAdd}><Text style={styles.addBtnText}>+ Create</Text></TouchableOpacity>
            </View>

            {loading ? <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} /> : (
                <FlatList
                    data={owners}
                    keyExtractor={i => i._id}
                    contentContainerStyle={{ padding: 12 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetch(); }} colors={[COLORS.primary]} />}
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
                                <TouchableOpacity style={styles.delBtn} onPress={() => deleteOwner(item)}>
                                    <Text style={styles.delBtnText}>Delete</Text>
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
        marginBottom: SPACING.xs
    },
    cardActions: {
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingLeft: SPACING.md,
        gap: SPACING.sm,
    },
    editBtn: {
        backgroundColor: COLORS.info,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.md
    },
    editBtnText: {
        color: COLORS.textWhite,
        fontSize: TYPOGRAPHY.caption.fontSize,
        fontWeight: 'bold'
    },
    delBtn: {
        backgroundColor: COLORS.danger,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.md,
    },
    delBtnText: {
        color: COLORS.textWhite,
        fontSize: TYPOGRAPHY.caption.fontSize,
        fontWeight: 'bold'
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
    saveBtn: {
        backgroundColor: COLORS.primary,
        borderRadius: BORDER_RADIUS.lg,
        paddingVertical: SPACING.md,
        alignItems: 'center',
        marginTop: SPACING.lg,
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

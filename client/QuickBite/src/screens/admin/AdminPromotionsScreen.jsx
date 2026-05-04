import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator,
    Alert, TextInput, ScrollView, RefreshControl, Modal, Image, Switch,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import API from '../../services/api';
import { getImageUrl } from '../../utils/imageUtils';

const ORANGE = '#FF6B35';

export default function AdminPromotionsScreen({ navigation }) {
    const [promos, setPromos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modal, setModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ title: '', description: '', discountType: 'percentage', discountValue: '', startDate: '', endDate: '' });
    const [image, setImage] = useState(null);
    const [saving, setSaving] = useState(false);
    
    // Date picker states
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [tempStartDate, setTempStartDate] = useState(new Date());
    const [tempEndDate, setTempEndDate] = useState(new Date());
    
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
    
    const parseDate = (dateString) => {
        if (!dateString) return new Date();
        const [year, month, day] = dateString.split('-').map(Number);
        return new Date(year, month - 1, day);
    };
    
    const handleStartDateSelect = () => {
        setForm(f => ({ ...f, startDate: formatDate(tempStartDate) }));
        setShowStartDatePicker(false);
        // Reset end date if it's before start date
        if (form.endDate && new Date(form.endDate) < tempStartDate) {
            const newEndDate = new Date(tempStartDate);
            newEndDate.setDate(newEndDate.getDate() + 7);
            setForm(f => ({ ...f, endDate: formatDate(newEndDate) }));
            setTempEndDate(newEndDate);
        }
    };
    
    const handleEndDateSelect = () => {
        setForm(f => ({ ...f, endDate: formatDate(tempEndDate) }));
        setShowEndDatePicker(false);
    };

    const set = k => v => setForm(f => ({ ...f, [k]: v }));

    const fetch = async () => {
        try {
            const r = await API.get('/promotions');
            setPromos(r.data?.promotions || []);
        } catch (e) { } finally { setLoading(false); setRefreshing(false); }
    };
    useEffect(() => { fetch(); }, []);

    const openAdd = () => { 
        const today = new Date();
        const defaultEnd = new Date(today);
        defaultEnd.setDate(today.getDate() + 7);
        setEditing(null); 
        setForm({ 
            title: '', description: '', discountType: 'percentage', discountValue: '', 
            startDate: formatDate(today), 
            endDate: formatDate(defaultEnd)
        }); 
        setTempStartDate(today);
        setTempEndDate(defaultEnd);
        setImage(null); 
        setModal(true); 
    };
    
    const openEdit = (p) => { 
        setEditing(p); 
        const start = p.startDate ? parseDate(p.startDate.slice(0, 10)) : new Date();
        const end = p.endDate ? parseDate(p.endDate.slice(0, 10)) : new Date();
        setForm({ 
            title: p.title, description: p.description, discountType: p.discountType, 
            discountValue: String(p.discountValue), 
            startDate: p.startDate?.slice(0, 10) || '', 
            endDate: p.endDate?.slice(0, 10) || '' 
        });
        setTempStartDate(start);
        setTempEndDate(end);
        setImage(null); 
        setModal(true); 
    };
    const pickImg = () => launchImageLibrary({ mediaType: 'photo', quality: 0.7 }, r => { if (!r.didCancel && r.assets?.length) setImage(r.assets[0]); });

    const save = async () => {
        if (!form.title || !form.discountValue || !form.startDate || !form.endDate) return Alert.alert('Error', 'Fill all required fields');
        setSaving(true);
        try {
            const fd = new FormData();
            Object.entries(form).forEach(([k, v]) => fd.append(k, v));
            if (image) fd.append('bannerImage', { uri: image.uri, name: image.fileName || 'banner.jpg', type: image.type || 'image/jpeg' });
            if (editing) await API.put(`/promotions/${editing._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            else await API.post('/promotions', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            setModal(false);
            fetch();
        } catch (e) { Alert.alert('Error', e.response?.data?.message || 'Failed'); }
        finally { setSaving(false); }
    };

    const toggle = async (id) => {
        try { await API.patch(`/promotions/${id}/toggle`); fetch(); }
        catch (e) { Alert.alert('Error', 'Failed to toggle'); }
    };

    const deletePr = (id) => Alert.alert('Delete', 'Delete this promotion?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => { await API.delete(`/promotions/${id}`); fetch(); } },
    ]);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Text style={styles.back}>←</Text></TouchableOpacity>
                <Text style={styles.headerTitle}>🎁 Promotions</Text>
                <TouchableOpacity style={styles.addBtn} onPress={openAdd}><Text style={styles.addBtnText}>+ Add</Text></TouchableOpacity>
            </View>

            {loading ? <ActivityIndicator size="large" color={ORANGE} style={{ marginTop: 40 }} /> : (
                <FlatList
                    data={promos}
                    keyExtractor={i => i._id}
                    contentContainerStyle={{ padding: 12 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetch(); }} colors={[ORANGE]} />}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            {item.bannerImage
                                ? <Image source={{ uri: getImageUrl(item.bannerImage) }} style={styles.banner} resizeMode="cover" />
                                : <View style={styles.bannerPlaceholder}><Text style={styles.bannerPlaceholderIcon}>🎁</Text></View>}
                            <View style={styles.cardBody}>
                                <View style={styles.cardTop}>
                                    <Text style={styles.promoTitle} numberOfLines={1}>{item.title}</Text>
                                    <Switch
                                        value={item.isActive}
                                        onValueChange={() => toggle(item._id)}
                                        trackColor={{ false: '#ccc', true: '#C8E6C9' }}
                                        thumbColor={item.isActive ? '#4CAF50' : '#aaa'}
                                    />
                                </View>
                                <Text style={styles.discount}>
                                    {item.discountType === 'percentage' ? `${item.discountValue}% OFF` : `LKR ${item.discountValue} OFF`}
                                </Text>
                                <Text style={styles.dates}>{item.startDate?.slice(0, 10)} → {item.endDate?.slice(0, 10)}</Text>
                                <View style={styles.actions}>
                                    <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}><Text style={styles.editBtnText}>Edit</Text></TouchableOpacity>
                                    <TouchableOpacity style={styles.delBtn} onPress={() => deletePr(item._id)}><Text style={styles.delBtnText}>Delete</Text></TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    )}
                    ListEmptyComponent={<Text style={styles.empty}>No promotions yet</Text>}
                />
            )}

            <Modal visible={modal} animationType="slide" onRequestClose={() => setModal(false)}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setModal(false)}><Text style={styles.back}>✕</Text></TouchableOpacity>
                        <Text style={styles.modalTitle}>{editing ? 'Edit Promotion' : 'Add Promotion'}</Text>
                    </View>
                    <ScrollView contentContainerStyle={styles.modalScroll}>
                        {[['Title *', 'title'], ['Description *', 'description'], ['Discount Value *', 'discountValue']].map(([label, k]) => (
                            <View key={k} style={{ marginBottom: 12 }}>
                                <Text style={styles.label}>{label}</Text>
                                <TextInput style={styles.input} value={form[k]} onChangeText={set(k)} placeholder={label} placeholderTextColor="#aaa" keyboardType={k === 'discountValue' ? 'numeric' : 'default'} />
                            </View>
                        ))}
                        
                        {/* Start Date Picker */}
                        <View style={{ marginBottom: 12 }}>
                            <Text style={styles.label}>Start Date *</Text>
                            <TouchableOpacity 
                                style={styles.datePickerBtn}
                                onPress={() => {
                                    setTempStartDate(parseDate(form.startDate));
                                    setShowStartDatePicker(true);
                                }}
                            >
                                <Text style={styles.datePickerText}>
                                    {form.startDate ? new Date(form.startDate).toLocaleDateString('en-US', { 
                                        weekday: 'short', 
                                        year: 'numeric', 
                                        month: 'short', 
                                        day: 'numeric' 
                                    }) : 'Select Start Date'}
                                </Text>
                                <Text style={styles.datePickerIcon}>📅</Text>
                            </TouchableOpacity>
                        </View>
                        
                        {/* End Date Picker */}
                        <View style={{ marginBottom: 12 }}>
                            <Text style={styles.label}>End Date *</Text>
                            <TouchableOpacity 
                                style={styles.datePickerBtn}
                                onPress={() => {
                                    setTempEndDate(parseDate(form.endDate));
                                    setShowEndDatePicker(true);
                                }}
                            >
                                <Text style={styles.datePickerText}>
                                    {form.endDate ? new Date(form.endDate).toLocaleDateString('en-US', { 
                                        weekday: 'short', 
                                        year: 'numeric', 
                                        month: 'short', 
                                        day: 'numeric' 
                                    }) : 'Select End Date'}
                                </Text>
                                <Text style={styles.datePickerIcon}>📅</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.label}>Discount Type</Text>
                        <View style={styles.typeRow}>
                            {['percentage', 'fixed'].map(t => (
                                <TouchableOpacity key={t} style={[styles.typeChip, form.discountType === t && styles.typeChipActive]} onPress={() => set('discountType')(t)}>
                                    <Text style={[styles.typeText, form.discountType === t && styles.typeTextActive]}>{t}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <Text style={styles.label}>Banner Image</Text>
                        <TouchableOpacity style={styles.imgPicker} onPress={pickImg}>
                            {image ? <Image source={{ uri: image.uri }} style={styles.imgPreview} resizeMode="cover" /> : <Text style={styles.imgPickerText}>📷 Select Banner Image</Text>}
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={save} disabled={saving}>
                            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>{editing ? 'Update' : 'Create'} Promotion</Text>}
                        </TouchableOpacity>
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
    card: { backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden', marginBottom: 12, elevation: 2 },
    banner: { width: '100%', height: 100 },
    bannerPlaceholder: { width: '100%', height: 100, backgroundColor: '#FFF0E8', justifyContent: 'center', alignItems: 'center' },
    bannerPlaceholderIcon: { fontSize: 28 },
    cardBody: { padding: 12 },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    promoTitle: { fontSize: 15, fontWeight: 'bold', color: '#222', flex: 1, marginRight: 8 },
    discount: { fontSize: 14, fontWeight: 'bold', color: ORANGE, marginBottom: 4 },
    dates: { fontSize: 12, color: '#888', marginBottom: 8 },
    actions: { flexDirection: 'row', gap: 8 },
    editBtn: { flex: 1, backgroundColor: '#E3F2FD', borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
    editBtnText: { color: '#1565C0', fontWeight: '600', fontSize: 12 },
    delBtn: { flex: 1, backgroundColor: '#FFEBEE', borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
    delBtnText: { color: '#C62828', fontWeight: '600', fontSize: 12 },
    empty: { textAlign: 'center', color: '#aaa', paddingVertical: 40 },
    modalContainer: { flex: 1, backgroundColor: '#fff' },
    modalHeader: { backgroundColor: ORANGE, paddingTop: 52, paddingBottom: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
    modalTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    modalScroll: { padding: 20 },
    label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6 },
    input: { borderWidth: 1.5, borderColor: '#E8E8E8', borderRadius: 10, padding: 12, fontSize: 14, color: '#222', marginBottom: 2 },
    typeRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
    typeChip: { flex: 1, borderWidth: 1.5, borderColor: '#E8E8E8', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
    typeChipActive: { backgroundColor: ORANGE, borderColor: ORANGE },
    typeText: { fontSize: 13, color: '#666', fontWeight: '600' },
    typeTextActive: { color: '#fff' },
    imgPicker: { borderWidth: 2, borderColor: ORANGE, borderStyle: 'dashed', borderRadius: 12, height: 120, justifyContent: 'center', alignItems: 'center', marginBottom: 20, overflow: 'hidden' },
    imgPreview: { width: '100%', height: '100%' },
    imgPickerText: { color: ORANGE, fontWeight: '600', fontSize: 14 },
    saveBtn: { backgroundColor: ORANGE, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
    saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
    
    // Date picker styles
    datePickerBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1.5, borderColor: '#E8E8E8', borderRadius: 10, padding: 12, backgroundColor: '#fff' },
    datePickerText: { fontSize: 14, color: '#222', flex: 1 },
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

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import API from '../../services/api';

const ORANGE = '#FF6B35';

export default function OwnerSettingsScreen({ navigation }) {
    const [canteenId, setCanteenId] = useState(null);
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [contact, setContact] = useState('');
    const [opening, setOpening] = useState('');
    const [closing, setClosing] = useState('');
    const [bankLabel, setBankLabel] = useState('');
    const [canteenImage, setCanteenImage] = useState(null); // Loaded url
    const [newImageProfile, setNewImageProfile] = useState(null); // Local URI

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchMyCanteen();
    }, []);

    const fetchMyCanteen = async () => {
        try {
            // New Owner getMyCanteen router
            const res = await API.get('/canteens/my');
            const data = res.data.canteen;
            if (data) {
                setCanteenId(data._id);
                setName(data.canteenName);
                setLocation(data.location);
                setContact(data.contactDetails);
                setOpening(data.openingTime);
                setClosing(data.closingTime);
                setBankLabel(data.bankDetails || '');
                if (data.canteenImage) {
                    setCanteenImage(`http://10.0.2.2:3000${data.canteenImage}`);
                }
            }
        } catch (error) {
            console.log("No canteen configured", error.response?.data);
        } finally {
            setLoading(false);
        }
    };

    const pickImage = async () => {
        const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
        if (!result.didCancel && result.assets && result.assets.length > 0) {
            setNewImageProfile({
                uri: result.assets[0].uri,
                type: result.assets[0].type,
                name: result.assets[0].fileName || 'banner.jpg',
            });
        }
    };

    const handleSave = async () => {
        if (!canteenId) {
            Alert.alert("Error", "No Canteen mathematically linked to your Owner account yet.");
            return;
        }

        setSaving(true);
        const formData = new FormData();
        formData.append('canteenName', name);
        formData.append('location', location);
        formData.append('contactDetails', contact);
        formData.append('openingTime', opening);
        formData.append('closingTime', closing);
        formData.append('bankDetails', bankLabel);

        if (newImageProfile) {
            formData.append('canteenImage', newImageProfile);
        }

        try {
            if (newImageProfile) {
                await API.put(`/canteens/${canteenId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await API.put(`/canteens/${canteenId}`, {
                    canteenName: name,
                    location,
                    contactDetails: contact,
                    openingTime: opening,
                    closingTime: closing,
                    bankDetails: bankLabel
                });
            }

            Alert.alert('Success', 'Canteen configuration permanently saved!');
            setNewImageProfile(null);
            fetchMyCanteen(); // Auto Refresh banner visual
        } catch (error) {
            Alert.alert('Save Failed', error.response?.data?.message || error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={ORANGE} /></View>;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backArrow}>←</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Canteen Settings</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>
                <TouchableOpacity style={styles.bannerContainer} onPress={pickImage}>
                    {newImageProfile ? (
                        <Image source={{ uri: newImageProfile.uri }} style={styles.bannerImg} />
                    ) : canteenImage ? (
                        <Image source={{ uri: canteenImage }} style={styles.bannerImg} />
                    ) : (
                        <View style={styles.bannerPlaceholder}>
                            <Text style={styles.bannerIcon}>🏪</Text>
                            <Text style={styles.bannerTip}>Tap to Upload Canteen Banner</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Canteen Name</Text>
                    <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Express Canteen" />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Location / Building</Text>
                    <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="Block C - Computing" />
                </View>

                <View style={styles.row}>
                    <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                        <Text style={styles.label}>Opening Time</Text>
                        <TextInput style={styles.input} value={opening} onChangeText={setOpening} placeholder="08:00 AM" />
                    </View>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                        <Text style={styles.label}>Closing Time</Text>
                        <TextInput style={styles.input} value={closing} onChangeText={setClosing} placeholder="05:30 PM" />
                    </View>
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Support Phone Number</Text>
                    <TextInput style={styles.input} value={contact} onChangeText={setContact} keyboardType="phone-pad" />
                </View>

                <View style={[styles.formGroup, { marginBottom: 30 }]}>
                    <Text style={styles.label}>Connected Bank Account (For Student Transfer Payments)</Text>
                    <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]} value={bankLabel} onChangeText={setBankLabel} multiline placeholder="BOC Colombo Branch&#10;Acc: 123456789&#10;Name: John Doe" />
                </View>

            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.7 }]} onPress={handleSave} disabled={saving}>
                    {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Settings</Text>}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { backgroundColor: ORANGE, paddingTop: 52, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' },
    backBtn: { paddingRight: 15 },
    backArrow: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
    title: { color: '#fff', fontSize: 20, fontWeight: 'bold' },

    scroll: { padding: 20 },
    bannerContainer: { width: '100%', height: 180, backgroundColor: '#E0E0E0', borderRadius: 16, overflow: 'hidden', marginBottom: 25 },
    bannerImg: { width: '100%', height: '100%' },
    bannerPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed', borderWidth: 2, borderColor: '#ccc', borderRadius: 16 },
    bannerIcon: { fontSize: 40, marginBottom: 8 },
    bannerTip: { color: '#666', fontWeight: 'bold' },

    formGroup: { marginBottom: 15 },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    label: { fontSize: 13, fontWeight: 'bold', color: '#555', marginBottom: 6 },
    input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#DDD', borderRadius: 10, padding: 12, fontSize: 15, color: '#222' },

    footer: { backgroundColor: '#fff', padding: 20, borderTopWidth: 1, borderTopColor: '#EEE' },
    saveBtn: { backgroundColor: ORANGE, padding: 16, borderRadius: 12, alignItems: 'center' },
    saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator,
    Alert, TextInput, ScrollView,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import API from '../../services/api';
import { getImageUrl } from '../../utils/imageUtils';
import { useBranding } from '../../context/BrandingContext';

const ORANGE = '#FF6B35';

export default function AdminBrandingScreen({ navigation }) {
    const { branding, refreshBranding } = useBranding();
    const [appName, setAppName] = useState('QuickBite');
    const [image, setImage] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setAppName(branding?.appName || 'QuickBite');
    }, [branding]);

    const pickLogo = () => {
        launchImageLibrary({ mediaType: 'photo', quality: 0.9 }, result => {
            if (!result.didCancel && result.assets?.length) {
                setImage(result.assets[0]);
            }
        });
    };

    const saveBranding = async () => {
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('appName', appName || 'QuickBite');

            if (image) {
                formData.append('logo', {
                    uri: image.uri,
                    name: image.fileName || 'app-logo.png',
                    type: image.type || 'image/png',
                });
            }

            await API.put('/settings/branding', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            await refreshBranding();
            setImage(null);
            Alert.alert('Saved', 'App logo updated successfully.');
        } catch (error) {
            const status = error.response?.status;
            const backendMessage = error.response?.data?.message || error.response?.data;
            Alert.alert(
                'Error',
                status
                    ? `Could not update app logo.\nStatus: ${status}\n${backendMessage || ''}`
                    : 'Could not update app logo. Please check your network connection.'
            );
        } finally {
            setSaving(false);
        }
    };

    const logoSource = image
        ? { uri: image.uri }
        : branding?.logoUrl
            ? { uri: getImageUrl(branding.logoUrl) }
            : require('../../assets/my-logo.png');

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.back}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>App Branding</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.previewBox}>
                    <Image source={logoSource} style={styles.logoPreview} resizeMode="contain" />
                    <Text style={styles.previewName}>{appName || 'QuickBite'}</Text>
                </View>

                <Text style={styles.label}>App Name</Text>
                <TextInput
                    value={appName}
                    onChangeText={setAppName}
                    placeholder="QuickBite"
                    placeholderTextColor="#999"
                    style={styles.input}
                />

                <TouchableOpacity style={styles.uploadBtn} onPress={pickLogo}>
                    <Text style={styles.uploadText}>{image ? 'Change Selected Logo' : 'Upload Logo'}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.saveBtn, saving && styles.disabledBtn]}
                    onPress={saveBranding}
                    disabled={saving}
                >
                    {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Save Branding</Text>}
                </TouchableOpacity>

                <Text style={styles.note}>
                    This changes the logo shown inside the installed app. Android launcher icons still require a new APK build.
                </Text>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    header: { backgroundColor: ORANGE, paddingTop: 52, paddingBottom: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' },
    backBtn: { marginRight: 10, padding: 4 },
    back: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    content: { padding: 18 },
    previewBox: { backgroundColor: '#fff', borderRadius: 14, padding: 24, alignItems: 'center', marginBottom: 18, elevation: 2 },
    logoPreview: { width: 130, height: 130, marginBottom: 12 },
    previewName: { fontSize: 24, fontWeight: 'bold', color: '#222' },
    label: { fontSize: 13, fontWeight: '700', color: '#555', marginBottom: 8 },
    input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 10, padding: 13, fontSize: 15, color: '#222', marginBottom: 14 },
    uploadBtn: { backgroundColor: '#FFF0E8', borderWidth: 1.5, borderColor: ORANGE, borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 12 },
    uploadText: { color: ORANGE, fontSize: 14, fontWeight: 'bold' },
    saveBtn: { backgroundColor: ORANGE, borderRadius: 12, padding: 15, alignItems: 'center' },
    disabledBtn: { opacity: 0.6 },
    saveText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
    note: { marginTop: 16, fontSize: 12, color: '#888', lineHeight: 18, textAlign: 'center' },
});

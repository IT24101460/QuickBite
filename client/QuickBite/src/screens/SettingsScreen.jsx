import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

const ORANGE = '#FF6B35';

export default function SettingsScreen({ navigation }) {
    const { user, token, login: updateUserContext } = useAuth();
    
    const [role, setRole] = useState(user?.role || 'student');
    const [firstName, setFirstName] = useState(user?.firstName || '');
    const [lastName, setLastName] = useState(user?.lastName || '');
    const [uniId, setUniId] = useState(user?.uniId || '');
    const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber?.toString() || '');
    const [email, setEmail] = useState(user?.email || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!firstName || !lastName || !phoneNumber || !email || (role === 'student' && !uniId)) {
            return Alert.alert('Validation Error', 'Please fill in all required fields.');
        }

        if (newPassword.trim().length > 0 && !currentPassword.trim()) {
            return Alert.alert('Validation Error', 'You must enter your current password to change it.');
        }

        setLoading(true);
        try {
            const updates = {
                firstName,
                lastName,
                uniId: role === 'student' ? uniId : '', 
                phoneNumber,
                email,
                role
            };
            
            if (newPassword.trim().length > 0) {
                updates.currentPassword = currentPassword;
                updates.newPassword = newPassword;
            }

            const response = await API.put(`/users/${user._id}`, updates);
            
            // Update the auth context so the rest of the app gets the new details
            await updateUserContext(token, { ...user, ...response.data.user });
            
            Alert.alert('Success', 'Your settings have been updated successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error('Update Error:', error.response?.data || error);
            const backendError = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to update settings';
            Alert.alert('Update Failed', `Could not save changes.\n\nReason: ${backendError}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Text style={styles.backTxt}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Account Settings</Text>
            </View>

            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionTitle}>Personal Information</Text>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>First Name</Text>
                    <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} placeholder="e.g. John" />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Last Name</Text>
                    <TextInput style={styles.input} value={lastName} onChangeText={setLastName} placeholder="e.g. Doe" />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Account Role</Text>
                    <View style={styles.roleContainer}>
                        {['student', 'lecturer', 'staff'].map((r) => (
                            <TouchableOpacity 
                                key={r} 
                                style={[styles.roleBtn, role === r && styles.roleBtnActive]}
                                onPress={() => setRole(r)}
                            >
                                <Text style={[styles.roleTxt, role === r && styles.roleTxtActive]}>
                                    {r.charAt(0).toUpperCase() + r.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {role === 'student' && (
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Registration Number</Text>
                        <TextInput style={styles.input} value={uniId} onChangeText={setUniId} placeholder="e.g. IT12345678" autoCapitalize="characters" />
                    </View>
                )}

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Phone Number</Text>
                    <TextInput style={styles.input} value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" placeholder="e.g. 0771234567" />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email Address</Text>
                    <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="e.g. student@gmail.com" />
                </View>

                <Text style={styles.sectionTitle}>Security</Text>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Current Password</Text>
                    <TextInput 
                        style={styles.input} 
                        value={currentPassword} 
                        onChangeText={setCurrentPassword} 
                        secureTextEntry 
                        placeholder="Required if changing password" 
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>New Password (Optional)</Text>
                    <TextInput 
                        style={styles.input} 
                        value={newPassword} 
                        onChangeText={setNewPassword} 
                        secureTextEntry 
                        placeholder="Enter new password" 
                    />
                    <Text style={styles.hint}>Leave blank if you don't want to change your password.</Text>
                </View>

                <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.saveBtnText}>Save Changes</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F8F9FA' },
    header: { backgroundColor: ORANGE, flexDirection: 'row', alignItems: 'center', padding: 16, paddingTop: 50 },
    backBtn: { width: 40, height: 40, justifyContent: 'center' },
    backTxt: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
    headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
    container: { padding: 20, paddingBottom: 50 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15, marginTop: 10 },
    inputGroup: { marginBottom: 16 },
    label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6 },
    input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 15, color: '#333' },
    hint: { fontSize: 12, color: '#888', marginTop: 4 },
    saveBtn: { backgroundColor: ORANGE, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 30 },
    saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    roleContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
    roleBtn: { flex: 1, paddingVertical: 10, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, alignItems: 'center', backgroundColor: '#fff' },
    roleBtnActive: { borderColor: ORANGE, backgroundColor: '#FFF0E5' },
    roleTxt: { fontSize: 14, color: '#666', fontWeight: '500' },
    roleTxtActive: { color: ORANGE, fontWeight: 'bold' }
});

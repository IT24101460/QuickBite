import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';

const ORANGE = '#FF6B35';

export default function OwnerSupportScreen({ navigation }) {
    const [message, setMessage] = useState('');

    const handleSend = () => {
        if (!message) return Alert.alert("Error", "Message cannot be empty.");
        Alert.alert("Sent Successfully", "An administrative officer will contact you regarding this urgent ticket shortly.");
        setMessage('');
        navigation.goBack();
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Text style={styles.backArrow}>←</Text></TouchableOpacity>
                <Text style={styles.title}>Contact Administration</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.heading}>Need Assistance?</Text>
                <Text style={styles.subText}>Our master administration team is available to help resolve any canteen-related software anomalies or disputes.</Text>

                <View style={styles.contactBox}>
                    <Text style={styles.contactItem}>📞 Phone: +94 11 234 5678</Text>
                    <Text style={styles.contactItem}>✉️ Email: admin@quickbite.sliit.lk</Text>
                    <Text style={styles.contactItem}>🏢 Office: Main Block, Level 3</Text>
                </View>

                <Text style={styles.label}>Direct Message to Admin</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Describe your issue or dispute in detail here..."
                    value={message}
                    onChangeText={setMessage}
                    multiline
                />

                <TouchableOpacity style={styles.btn} onPress={handleSend}>
                    <Text style={styles.btnText}>Open Support Ticket</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    header: { backgroundColor: ORANGE, paddingTop: 52, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' },
    backBtn: { paddingRight: 15 },
    backArrow: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
    title: { color: '#fff', fontSize: 20, fontWeight: 'bold' },

    content: { padding: 20 },
    heading: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 8 },
    subText: { fontSize: 14, color: '#666', lineHeight: 20, marginBottom: 20 },

    contactBox: { backgroundColor: '#fff', padding: 20, borderRadius: 12, elevation: 2, marginBottom: 30, borderLeftWidth: 4, borderLeftColor: ORANGE },
    contactItem: { fontSize: 15, color: '#444', fontWeight: 'bold', marginBottom: 10 },

    label: { fontSize: 14, fontWeight: 'bold', color: '#555', marginBottom: 10 },
    input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#eee', borderRadius: 12, padding: 15, height: 120, textAlignVertical: 'top', fontSize: 15, marginBottom: 20, elevation: 1 },

    btn: { backgroundColor: '#2c3e50', padding: 16, borderRadius: 12, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
    btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});

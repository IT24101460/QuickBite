import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, SafeAreaView, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';

const ORANGE = '#FF6B35';

export default function AddCardScreen({ navigation, route }) {
    const [cardName, setCardName] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [cardType, setCardType] = useState('Unknown');

    // Detect Card Type
    const getCardType = (number) => {
        const cleaned = number.replace(/\s+/g, '');
        if (/^4/.test(cleaned)) return 'Visa';
        if (/^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[01]|2720)/.test(cleaned)) return 'Mastercard';
        if (/^3[47]/.test(cleaned)) return 'Amex';
        return 'Unknown';
    };

    const handleNumberChange = (text) => {
        // Remove non-digits
        let numeric = text.replace(/\D/g, '');
        // Spacing every 4 digits format
        let formatted = numeric.replace(/(\d{4})/g, '$1 ').trim();
        setCardNumber(formatted);
        setCardType(getCardType(numeric));
    };

    const handleExpiryChange = (text) => {
        // Remove non-digits
        let numeric = text.replace(/\D/g, '');
        // Auto-add slash
        if (numeric.length >= 2) {
            numeric = numeric.substring(0, 2) + '/' + numeric.substring(2, 4);
        }
        setExpiry(numeric);
    };

    const validateExpiry = () => {
        if (!/^\d{2}\/\d{2}$/.test(expiry)) return false;
        const [month, year] = expiry.split('/').map(Number);
        if (month < 1 || month > 12) return false;

        const date = new Date();
        const currentMonth = date.getMonth() + 1;
        const currentYear = parseInt(date.getFullYear().toString().slice(-2));

        if (year < currentYear) return false;
        if (year === currentYear && month < currentMonth) return false;

        return true;
    };

    const handleNext = () => {
        Keyboard.dismiss();
        if (!cardName.trim() || cardNumber.replace(/\s+/g, '').length < 15 || !expiry || cvv.length < 3) {
            return Alert.alert('Invalid Details', 'Please fill in all card details correctly.');
        }

        if (!validateExpiry()) {
            return Alert.alert('Invalid Expiry', 'The expiration date must be a valid future date.');
        }

        const cleanedNumber = cardNumber.replace(/\s+/g, '');
        const [month, yearStr] = expiry.split('/');

        // Proceed to OTP Simulation Screen, passing the new card details
        const cardDetails = {
            id: 'card_' + Date.now(),
            type: cardType === 'Unknown' ? 'Card' : cardType,
            last4: cleanedNumber.slice(-4),
            // Full details for MongoDB:
            paymentType: 'card',
            cardholderName: cardName.trim(),
            cardNumber: cleanedNumber,
            expiryMonth: parseInt(month, 10),
            expiryYear: 2000 + parseInt(yearStr, 10)
        };

        navigation.navigate('OTPVerification', { 
            newCard: cardDetails,
            fromCheckout: route.params?.fromCheckout 
        });
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF7F2' }}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                        <Text style={styles.backTxt}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Add New Card</Text>
                </View>

                <View style={styles.container}>
                    {/* Visual Card Preview */}
                    <View style={[styles.cardPreview, cardType === 'Visa' ? styles.bgVisa : cardType === 'Mastercard' ? styles.bgMaster : cardType === 'Amex' ? styles.bgAmex : styles.bgDefault]}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardTypeTitle}>{cardType !== 'Unknown' ? cardType : 'Credit/Debit Card'}</Text>
                            <Text style={styles.cardTypeIcon}>{cardType === 'Visa' ? '💳' : cardType === 'Mastercard' ? '🔴🟡' : cardType === 'Amex' ? '💠' : '🏧'}</Text>
                        </View>
                        <Text style={styles.cardNumberText}>{cardNumber || '•••• •••• •••• ••••'}</Text>
                        <View style={styles.cardFooter}>
                            <View>
                                <Text style={styles.cardLabel}>CARDHOLDER</Text>
                                <Text style={styles.cardVal}>{cardName || 'YOUR NAME'}</Text>
                            </View>
                            <View>
                                <Text style={styles.cardLabel}>EXPIRES</Text>
                                <Text style={styles.cardVal}>{expiry || 'MM/YY'}</Text>
                            </View>
                        </View>
                    </View>

                    <Text style={styles.inputLabel}>Name on Card</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. John Doe"
                        placeholderTextColor="#aaa"
                        value={cardName}
                        onChangeText={setCardName}
                    />

                    <Text style={styles.inputLabel}>Card Number</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="0000 0000 0000 0000"
                        placeholderTextColor="#aaa"
                        keyboardType="numeric"
                        maxLength={19}
                        value={cardNumber}
                        onChangeText={handleNumberChange}
                    />

                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 10 }}>
                            <Text style={styles.inputLabel}>Expiry Date</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="MM/YY"
                                placeholderTextColor="#aaa"
                                keyboardType="numeric"
                                maxLength={5}
                                value={expiry}
                                onChangeText={handleExpiryChange}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.inputLabel}>CVV</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="123"
                                placeholderTextColor="#aaa"
                                keyboardType="numeric"
                                secureTextEntry
                                maxLength={4}
                                value={cvv}
                                onChangeText={setCvv}
                            />
                        </View>
                    </View>

                    <View style={styles.secureRow}>
                        <Text style={styles.secureIcon}>🔒</Text>
                        <Text style={styles.secureText}>This is a simulated Sandbox connection, real native processing is currently skipped.</Text>
                    </View>

                    <TouchableOpacity style={styles.btn} onPress={handleNext}>
                        <Text style={styles.btnText}>Simulate Verification</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: { backgroundColor: ORANGE, flexDirection: 'row', alignItems: 'center', padding: 16, paddingTop: 50 },
    backBtn: { marginRight: 10 },
    backTxt: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    container: { padding: 20, flex: 1 },

    cardPreview: { borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 6, marginBottom: 25 },
    bgDefault: { backgroundColor: '#34495e' },
    bgVisa: { backgroundColor: '#1a43a0' },
    bgMaster: { backgroundColor: '#c82333' },
    bgAmex: { backgroundColor: '#215da0' },

    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    cardTypeTitle: { color: '#fff', fontSize: 17, fontStyle: 'italic', fontWeight: 'bold' },
    cardTypeIcon: { fontSize: 20 },
    cardNumberText: { color: '#fff', fontSize: 22, letterSpacing: 2, fontWeight: '600', marginBottom: 25 },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between' },
    cardLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 10 },
    cardVal: { color: '#fff', fontSize: 14, fontWeight: '500', textTransform: 'uppercase' },

    inputLabel: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6 },
    input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 10, padding: 12, fontSize: 15, marginBottom: 16, color: '#333' },
    row: { flexDirection: 'row', justifyContent: 'space-between' },

    secureRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F8EC', padding: 12, borderRadius: 10, marginBottom: 25 },
    secureIcon: { fontSize: 16, marginRight: 8 },
    secureText: { fontSize: 12, color: '#2E7D32', flex: 1 },

    btn: { backgroundColor: ORANGE, padding: 15, borderRadius: 12, alignItems: 'center' },
    btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, SafeAreaView, Keyboard } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../services/api';

const ORANGE = '#FF6B35';

export default function OTPScreen({ route, navigation }) {
    const { newCard } = route.params || {};

    const [otp, setOtp] = useState(['', '', '', '']);
    const inputs = useRef([]);
    const [timeLeft, setTimeLeft] = useState(60);

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [timeLeft]);

    const handleOtpChange = (value, index) => {
        let newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 3) {
            inputs.current[index + 1].focus();
        }
    };

    const handleVerify = () => {
        Keyboard.dismiss();
        const code = otp.join('');
        if (code.length < 4) {
            return Alert.alert('Invalid Code', 'Please enter the 4-digit code sent via SMS.');
        }

        // Check for duplicate card before saving
        const checkAndSaveCard = async () => {
            try {
                const { fromCheckout } = route.params || {};
                const existingCards = await AsyncStorage.getItem('@saved_cards');
                let cards = existingCards ? JSON.parse(existingCards) : [];
                
                // Check if this card already exists (same last 4 digits and type)
                const isDuplicate = cards.some(card => 
                    card.last4 === newCard.last4 && card.type === newCard.type
                );
                

                
                if (isDuplicate) {
                    const buttons = [
                        {
                            text: 'Go Back',
                            onPress: () => navigation.goBack(),
                            style: 'cancel'
                        }
                    ];

                    if (fromCheckout) {
                        buttons.push({
                            text: 'Back to Checkout',
                            onPress: () => navigation.navigate('Checkout', { newlyAddedCard: cards.find(c => c.last4 === newCard.last4) })
                        });
                    } else {
                        buttons.push({
                            text: 'View Profile',
                            onPress: () => navigation.navigate('Profile')
                        });
                    }

                    return Alert.alert(
                        'Card Already Saved',
                        `A ${newCard.type} card ending in ${newCard.last4} is already saved in your payment options.`,
                        buttons
                    );
                }
                
                // Card is unique, save it locally
                cards.push(newCard);
                await AsyncStorage.setItem('@saved_cards', JSON.stringify(cards));

                // Save to MongoDB Database via API
                try {
                    console.log('=== MONGODB SAVE DEBUG ===');
                    console.log('Saving card to MongoDB:', {
                        paymentType: newCard.paymentType || 'card',
                        cardholderName: newCard.cardholderName || 'Cardholder',
                        cardNumber: newCard.cardNumber,
                        expiryMonth: newCard.expiryMonth,
                        expiryYear: newCard.expiryYear,
                        isDefault: cards.length === 1
                    });
                    
                    const response = await API.post('/user-payments', {
                        paymentType: newCard.paymentType || 'card',
                        cardholderName: newCard.cardholderName || 'Cardholder',
                        cardNumber: newCard.cardNumber,
                        expiryMonth: newCard.expiryMonth,
                        expiryYear: newCard.expiryYear,
                        isDefault: cards.length === 1
                    });
                    
                    console.log('MongoDB save successful:', response.data);
                    console.log('=== END MONGODB SAVE DEBUG ===');
                } catch (apiError) {
                    console.error('MongoDB save error:', apiError?.response?.data || apiError.message);
                    console.error('Full error:', apiError);
                    
                    // Show error to user
                    const errorMessage = apiError?.response?.data?.message || apiError.message || 'Failed to save card to server';
                    Alert.alert(
                        'Server Save Failed',
                        `Card saved locally but could not be saved to server: ${errorMessage}. Please try again later.`,
                        [
                            { text: 'OK', onPress: () => {
                                if (fromCheckout) {
                                    navigation.navigate('Checkout', { newlyAddedCard: newCard });
                                } else {
                                    navigation.navigate('Home');
                                }
                            }}
                        ]
                    );
                    return; // Stop execution here
                }
                

                
                if (fromCheckout) {
                    return Alert.alert('Verified!', 'Your card has been verified and saved. Redirecting to checkout...', [
                        {
                            text: 'Finish Order',
                            onPress: () => navigation.navigate('Checkout', { newlyAddedCard: newCard })
                        }
                    ]);
                }

                Alert.alert('Verified!', 'Your card has been verified and saved successfully.', [
                    {
                        text: 'Go Home',
                        onPress: () => navigation.navigate('Home')
                    },
                    {
                        text: 'View Profile',
                        onPress: () => navigation.navigate('Profile')
                    }
                ]);
            } catch (e) {
                console.error('Error saving card', e);
                Alert.alert('Error', 'Failed to save card. Please try again.');
            }
        };

        // Dummy Verification Success
        Alert.alert('Verified!', 'Your card has been verified successfully.', [
            {
                text: 'OK',
                onPress: checkAndSaveCard
            }
        ]);
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Text style={styles.backTxt}>←</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.container}>
                <View style={styles.iconCircle}>
                    <Text style={styles.iconTxt}>✉️</Text>
                </View>

                <Text style={styles.title}>Verification Code</Text>
                <Text style={styles.subtitle}>
                    We've sent a 4-digit secure bank SMS code to your registered mobile number for card verification.
                </Text>

                <View style={styles.otpRow}>
                    {otp.map((digit, index) => (
                        <TextInput
                            key={index}
                            style={styles.otpInput}
                            value={digit}
                            onChangeText={(val) => handleOtpChange(val, index)}
                            keyboardType="numeric"
                            maxLength={1}
                            ref={(input) => (inputs.current[index] = input)}
                        />
                    ))}
                </View>

                <TouchableOpacity style={styles.btn} onPress={handleVerify}>
                    <Text style={styles.btnText}>Verify & Add Card</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.resendBtn}
                    disabled={timeLeft > 0}
                    onPress={() => setTimeLeft(60)}
                >
                    <Text style={[styles.resendText, timeLeft > 0 && { color: '#aaa' }]}>
                        {timeLeft > 0 ? `Resend Code in ${timeLeft}s` : 'Resend Code Now'}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: { padding: 16, paddingTop: 50 },
    backBtn: { width: 40, height: 40, justifyContent: 'center' },
    backTxt: { fontSize: 24, fontWeight: 'bold', color: '#333' },
    container: { padding: 20, alignItems: 'center', paddingTop: 20 },
    iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFF0E8', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    iconTxt: { fontSize: 35 },
    title: { fontSize: 22, fontWeight: 'bold', color: '#222', marginBottom: 10 },
    subtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 40, paddingHorizontal: 15 },

    otpRow: { flexDirection: 'row', justifyContent: 'space-between', width: '80%', marginBottom: 40 },
    otpInput: { width: 55, height: 60, borderRadius: 12, borderWidth: 1.5, borderColor: '#e0e0e0', fontSize: 24, textAlign: 'center', color: '#333', backgroundColor: '#FAFAFA' },

    btn: { backgroundColor: ORANGE, width: '100%', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 20 },
    btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    resendText: { color: ORANGE, fontWeight: 'bold', fontSize: 14 }
});

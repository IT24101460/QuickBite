import React from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    ActivityIndicator, Image, Dimensions
} from 'react-native';
import TopNavBar from '../components/TopNavBar';

const { width, height } = Dimensions.get('window');

export default function ImagePreviewScreen({ navigation, route }) {
    const { imageUrl, title } = route.params;

    return (
        <View style={styles.container}>
            <TopNavBar navigation={navigation} placeholder={`📄 ${title || 'Image'}`} />
            
            <View style={styles.imageContainer}>
                <Image 
                    source={{ uri: imageUrl }} 
                    style={styles.fullImage}
                    resizeMode="contain"
                />
            </View>
            
            <View style={styles.actionsContainer}>
                <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.actionBtnText}>← Back</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#000',
    },
    imageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    fullImage: {
        width: width - 40,
        height: height - 200,
        borderRadius: 8
    },
    actionsContainer: {
        position: 'absolute',
        bottom: 40,
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'center'
    },
    actionBtn: {
        backgroundColor: '#FF6B35',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
        shadowColor: '#FF6B35',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4
    },
    actionBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold'
    }
});

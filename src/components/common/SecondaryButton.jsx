 
// src/components/common/SecondaryButton.jsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Colors from '../../styles/colors';

export default function SecondaryButton(props) {
    const { title, onPress, path } = props;
    const navigation = useNavigation();

    const handlePress = () => {
        onPress && onPress();
        path && navigation.navigate(path);
    };

    return (
        <TouchableOpacity style={styles.button} onPress={handlePress}>
            <Text style={styles.buttonText}>{title}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: Colors.secondary,
        marginTop: 40,
        padding: 15,
        width: '90%',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: "center",
        elevation: 8,
        shadowRadius: 10,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 15,
    },
});
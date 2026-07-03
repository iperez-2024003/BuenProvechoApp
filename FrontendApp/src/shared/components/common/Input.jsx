import React from 'react';
import { TextInput, StyleSheet, View, Text } from 'react-native';
import { COLORS, SPACING, FONT_SIZE, SHADOWS } from '../../constants/theme';

const Input = ({ label, error, ...props }) => {
  return (
    <View >
      {label && <Text>{label}</Text>}
      <TextInput            
        {...props}
      />
      {error && <Text>{error}</Text>}
    </View>
  );
};

export default Input;

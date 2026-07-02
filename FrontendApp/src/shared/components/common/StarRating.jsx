import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, FONT_SIZE, FONTS } from '../../constants/theme';

const StarRating = ({ value, onChange, size = 24, readonly = false }) => {
  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => !readonly && onChange(star)}
          disabled={readonly}
          activeOpacity={readonly ? 1 : 0.7}
          style={styles.starButton}
        >
          <Text
            style={[
              styles.star,
              { fontSize: size },
              value >= star && styles.starActive,
            ]}
          >
            ★
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  starButton: {
    padding: SPACING.xs,
  },
  star: {
    color: COLORS.textMuted,
  },
  starActive: {
    color: COLORS.primary,
  },
});

export default StarRating;

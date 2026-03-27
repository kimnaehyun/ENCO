import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Text, { FONT_FAMILY, COLORS } from '@/components/typography';

export default function PayButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>결제하기</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minWidth: 246,
    height: 54,
    borderRadius: 18,
    backgroundColor: '#1428A0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 24,
    color: COLORS.white,
    fontFamily: FONT_FAMILY.bold,
  },
});

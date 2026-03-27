import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Text, { FONT_FAMILY, COLORS } from '@/components/typography';

export default function GroupSelectItem({
  title,
  selectedGroupId,
  paymentType,
  amount,
  storeName,
  callbackUrl,
  orderId,
}: {
  title: string;
  selectedGroupId: number;
  paymentType: 'internet' | 'onsite';
  amount: number;
  storeName: string;
  callbackUrl: string;
  orderId: string;
}) {
  const navigation = useNavigation<any>();

  return (
    <Pressable
      style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
      onPress={() => {
        if (paymentType == 'internet') {
          navigation.navigate('CardChoiceScreen', {
            title,
            groupId: selectedGroupId,
            amount,
            storeName,
            callbackUrl,
            orderId,
          });
        } else {
          navigation.navigate('PaymentMethod', {
            title,
            groupId: selectedGroupId,
          });
        }
      }}
    >
      <View style={styles.titleBox}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 12,
    shadowColor: '#1428A0',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  itemPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  titleBox: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#D9E4FF',
  },
  title: {
    fontSize: 18,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.dark,
  },
});

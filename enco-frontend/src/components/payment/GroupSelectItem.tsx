import { Text, Pressable } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { NEXT_SCREEN } from '@/constants/payment';

export default function GroupSelectItem({
  title,
  selectedGroupId,
  paymentType,
}: {
  title: string;
  selectedGroupId: number;
  paymentType: 'internet' | 'onsite';
}) {
  const navigation = useNavigation<any>();
  return (
    <Pressable
      className="bg-white rounded-[20px] py-4 pl-4"
      onPress={() => {
        navigation.navigate(NEXT_SCREEN[paymentType], {
          title,
          groupId: selectedGroupId,
        });
      }}
    >
      <Text className="font-medium text-xl">{title}</Text>
    </Pressable>
  );
}

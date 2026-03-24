import { Text, Pressable } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';

export default function GroupSelectItem({
  title,
  selectedGroupId,
}: {
  title: string;
  selectedGroupId: number;
}) {
  const navigation = useNavigation<any>();
  return (
    <Pressable
      className="bg-white rounded-[20px] py-4 pl-4"
      onPress={() => {
        navigation.navigate('CardChoiceScreen', {
          title,
          groupId: selectedGroupId,
        });
      }}
    >
      <Text className="font-medium text-xl">{title}</Text>
    </Pressable>
  );
}

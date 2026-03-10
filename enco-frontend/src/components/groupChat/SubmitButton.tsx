import { Text, Pressable } from 'react-native';
import React from 'react';

export default function SubmitButton({
  className,
  onPress,
}: {
  className: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex justify-center items-center border border-solid border-black ${className}`}
    >
      <Text>전송</Text>
    </Pressable>
  );
}

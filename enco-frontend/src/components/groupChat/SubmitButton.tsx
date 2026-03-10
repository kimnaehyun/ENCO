import { View, Text, Pressable } from 'react-native';
import React from 'react';

export default function SubmitButton({ className }: { className: string }) {
  return (
    <Pressable
      className={`flex justify-center items-center border border-solid border-black ${className}`}
    >
      <Text>전송</Text>
    </Pressable>
  );
}

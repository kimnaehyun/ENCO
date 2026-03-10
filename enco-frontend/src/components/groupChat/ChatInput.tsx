import { TextInput } from 'react-native';
import React from 'react';

export default function ChatInput({ className }: { className: string }) {
  return (
    <TextInput
      className={`border border-solid border-black ${className}`}
      multiline
    />
  );
}

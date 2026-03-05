// src//components/ScreenLayout.tsx

import React from 'react';
import {View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
};

export default function ScreenLayout({children, style}: Props) {
  return (
    <SafeAreaView style={{ flex: 1}}>
      <View style={[{flex: 1, paddingHorizontal: 16, paddingTop: 12}, style]}>
        {children}
      </View>
    </SafeAreaView>
  );
}
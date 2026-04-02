import React from 'react';
import { View, Image, useWindowDimensions } from 'react-native';
import Text from '@/components/typography';

import { images } from '../types/images';

export default function SplashScreen() {
  const { width, height } = useWindowDimensions();
  return (
    <View className="flex-1 items-center justify-center bg-[#F0F4FF]">
      <Image
        source={images.logo}
        style={{ width: width * 0.8, height: height * 0.4 }}
        resizeMode="contain"
      />
      <Text variant="h2">투명하게 관리하는</Text>
      <Text variant="h2">우리의 모임통장</Text>
    </View>
  );
}

import { View } from 'react-native';
import React from 'react';
import { Image } from 'react-native';
import { images } from '../../types/images';
import { useNavigation } from '@react-navigation/native';
import PayButton from '../../components/internet/PayButton';

export default function PaymentStartScreen() {
  const navigation = useNavigation<any>();
  return (
    <View className="flex-1 pt-48 px-4 bg-[#F0F4FF]">
      <View className="flex gap-2 items-center">
        <View className="w-80 h-80 bg-[#F0F4FF]">
          <Image
            className="w-full h-full"
            source={images.internetPaymentHamco}
          />
        </View>
        <PayButton onPress={() => navigation.navigate('SelectGroupScreen')} />
      </View>
    </View>
  );
}

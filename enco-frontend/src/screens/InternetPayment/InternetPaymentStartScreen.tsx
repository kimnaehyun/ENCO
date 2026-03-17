import { View } from 'react-native';
import React from 'react';
import { Image } from 'react-native';
import { images } from '../../types/images';
import { useNavigation } from '@react-navigation/native';
import PayButton from '../../components/internet/PayButton';

export default function InternetPaymentStartScreen() {
  const navigation = useNavigation<any>();
  const goToSelectGroup = () => navigation.navigate('SelectGroupScreen');
  return (
    <View className="flex-1 pt-48 px-4">
      <View className="flex gap-2 items-center">
        <View className="w-80 h-80">
          <Image
            className="w-full h-full"
            source={images.internetPaymentHamco}
          />
        </View>
        <PayButton onPress={goToSelectGroup} />
      </View>
    </View>
  );
}

import { View, Image } from 'react-native';
import React from 'react';
import { images } from '../../../../types/images';

export default function Barcode() {
  return (
    <View>
      <Image source={images.barcode} />
    </View>
  );
}

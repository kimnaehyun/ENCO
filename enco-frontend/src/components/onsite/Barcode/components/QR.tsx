import { View, Image } from 'react-native';
import React from 'react';
import { images } from '../../../../types/images';

export default function QR({
  cardNumber,
  className,
}: {
  cardNumber: number;
  className: string;
}) {
  return (
    <Image
      className={className}
      source={images.qr[cardNumber]}
      resizeMode="contain"
    />
  );
}

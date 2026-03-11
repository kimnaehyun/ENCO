import { View, Image } from 'react-native';
import React from 'react';
import { images } from '../../../../types/images';

export default function Barcode({
  cardNumber,
  className,
}: {
  cardNumber: number;
  className: string;
}) {
  return <Image className={className} source={images.barcode[cardNumber]} />;
}

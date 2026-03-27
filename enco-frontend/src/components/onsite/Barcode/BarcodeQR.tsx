import React from 'react';
import QRCode from 'react-native-qrcode-svg';

export default function BarcodeQR({
  cardId,
  qrData,
}: {
  cardId: number;
  qrData: string;
}) {
  return <QRCode key={cardId} value={qrData} size={300} />;
}

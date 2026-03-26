import React from 'react';

import QRCode from 'react-native-qrcode-svg';

export default function BarcodeQR({ cardId }: { cardId: number }) {
  const data = {
    cardId,
    userId: 123,
    name: '홍길동',
    amount: 5000,
  };
  console.log('QR cardId:', cardId);
  return <QRCode key={cardId} value={JSON.stringify(data)} size={300} />;
}

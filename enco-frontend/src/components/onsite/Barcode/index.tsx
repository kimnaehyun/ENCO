import { View, Modal, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import Barcode from './components/Barcode';
import QR from './components/QR';
import { Text } from 'react-native-gesture-handler';
import CardRecommendation from './components/CardRecommendation';

export default function index() {
  const [cardNumber, setCardNumber] = useState<number>(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'barcode' | 'qr'>('barcode');

  const openModal = (type: 'barcode' | 'qr') => {
    setModalType(type);
    setModalVisible(true);
  };

  return (
    <View className="flex-1">
      <View className="flex-row w-full py-4 justify-around items-center">
        <TouchableOpacity onPress={() => openModal('barcode')}>
          <Barcode cardNumber={cardNumber} className="w-50 h-24" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => openModal('qr')}>
          <QR cardNumber={cardNumber} className="w-24 h-24" />
        </TouchableOpacity>
      </View>

      <View className="flex-1">
        <Text className="text-2xl font-bold text-center py-10">
          결제 추천 카드
        </Text>
        <View className="flex-1 pt-10">
          <CardRecommendation onSelectCard={setCardNumber} />
        </View>
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          className="flex-1 justify-center items-center bg-black/90"
          onPress={() => setModalVisible(false)}
        >
          <View
            className={`bg-white p-6 rounded-2xl ${modalType === 'barcode' ? 'rotate-90' : ''}`}
          >
            {modalType === 'barcode' ? (
              <Barcode className="" cardNumber={cardNumber} />
            ) : (
              <QR className="w-40 h-40" cardNumber={cardNumber} />
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

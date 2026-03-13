import { View, Modal, TouchableOpacity, Button, Pressable } from 'react-native';
import React, { useState } from 'react';

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
        <View className="flex-1 justify-center items-center bg-white">
          <View className={`bg-white flex items-end`}>
            <Pressable onPress={() => setModalVisible(false)}>
              <Text className="text-5xl">x</Text>
            </Pressable>

            <QR className="w-80 h-80" cardNumber={cardNumber} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

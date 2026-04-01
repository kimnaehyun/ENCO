import React from 'react';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import ReceiptOcrEditor from '../../components/common/ReceiptOcrEditor';
import { GroupStackParamList } from '@/types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type TransactionReceiptOcrRouteProp = RouteProp<
  GroupStackParamList,
  'TransactionReceiptOcr'
>;
type TransactionReceiptOcrNavigationProp = NativeStackNavigationProp<
  GroupStackParamList,
  'TransactionReceiptOcr'
>;

export default function TransactionReceiptOcrScreen() {
  const navigation = useNavigation<TransactionReceiptOcrNavigationProp>();
  const route = useRoute<TransactionReceiptOcrRouteProp>();
  const params = route.params ?? {};

  return (
    <ReceiptOcrEditor
      mode="transaction"
      navigation={navigation}
      params={params}
    />
  );
}

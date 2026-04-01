import React from 'react';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import ReceiptOcrEditor from '../../components/common/ReceiptOcrEditor';
import { GroupStackParamList } from '@/types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type SettlementReceiptOcrRouteProp = RouteProp<
  GroupStackParamList,
  'SettlementReceiptOcr'
>;
type SettlementReceiptOcrNavigationProp = NativeStackNavigationProp<
  GroupStackParamList,
  'SettlementReceiptOcr'
>;

export default function SettlementReceiptOcrScreen() {
  const navigation = useNavigation<SettlementReceiptOcrNavigationProp>();
  const route = useRoute<SettlementReceiptOcrRouteProp>();
  const params = route.params ?? {};

  return (
    <ReceiptOcrEditor
      mode="settlement"
      navigation={navigation}
      params={params}
    />
  );
}

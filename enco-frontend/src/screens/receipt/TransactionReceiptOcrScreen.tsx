import React from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import ReceiptOcrEditor, {
  type ReceiptOcrEditorParams,
} from '../../components/common/ReceiptOcrEditor';

export default function TransactionReceiptOcrScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = (route.params ?? {}) as ReceiptOcrEditorParams;

  return (
    <ReceiptOcrEditor
      mode="transaction"
      navigation={navigation}
      params={params}
    />
  );
}
import { View, Text, Image, Pressable } from 'react-native';
import {
  botAvatar,
  botCard,
  botRow,
  remindButton,
  remindButtonText,
  unpaidTitleCount,
  unpaidTitlePrefix,
  unpaidTitleRow,
} from '@/assets/styles/chatStyles';

type BotLedgerCardItem = {
  missingCount: number;
  transactionDate: string;
  transactionType: string;
  amount: number;
};

export default function BotLedgerCard({
  item,
  onPress,
}: {
  item: BotLedgerCardItem;
  onPress: () => void;
}) {
  const formatKRW = (n: number) =>
    `${n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}원`;
  return (
    <View className={botRow}>
      <Image
        source={require('../../assets/icons/nomal_hamco.png')}
        className={botAvatar}
        resizeMode="contain"
      />
      <View className={botCard}>
        <View className={unpaidTitleRow}>
          <Text
            className={unpaidTitlePrefix}
            style={{ fontFamily: 'GmarketSansTTFBold' }}
          >
            현재 누락된 증빙을{' '}
          </Text>
          <Text
            className={unpaidTitleCount}
            style={{ fontFamily: 'GmarketSansTTFBold' }}
          >
            {item.missingCount}건
          </Text>
          <Text
            className={unpaidTitlePrefix}
            style={{ fontFamily: 'GmarketSansTTFBold' }}
          >
            {' '}
            발견했어요!
          </Text>
        </View>
        <View className="border border-[#7A7A7A] rounded-[18px] px-3.5 py-3 bg-white">
          <Text
            className="text-base text-[#111111] mb-2.5"
            style={{ fontFamily: 'GmarketSansTTFBold' }}
          >
            {item.transactionDate}
          </Text>
          <View className="flex-row items-center justify-between">
            <Text
              className="text-base text-[#111111]"
              style={{ fontFamily: 'GmarketSansTTFBold' }}
            >
              {item.transactionType}
            </Text>
            <Text
              className="text-[22px] text-[#FF1A0F]"
              style={{ fontFamily: 'GmarketSansTTFBold' }}
            >
              {formatKRW(item.amount)}
            </Text>
          </View>
        </View>
        <Pressable onPress={onPress} className={remindButton}>
          <Text
            className={remindButtonText}
            style={{ fontFamily: 'GmarketSansTTFBold' }}
          >
            증빙 바로가기
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

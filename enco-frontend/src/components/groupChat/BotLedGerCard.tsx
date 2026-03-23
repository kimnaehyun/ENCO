import { View, Image, Pressable } from 'react-native'
import Text from '@/components/typography';;
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
          <Text weight="bold"
            className={unpaidTitlePrefix}
            
          >
            현재 누락된 증빙을{' '}
          </Text>
          <Text weight="bold"
            className={unpaidTitleCount}
            
          >
            {item.missingCount}건
          </Text>
          <Text weight="bold"
            className={unpaidTitlePrefix}
            
          >
            {' '}
            발견했어요!
          </Text>
        </View>
        <View className="border border-[#7A7A7A] rounded-[18px] px-3.5 py-3 bg-white">
          <Text weight="bold"
            className="text-base text-[#111111] mb-2.5"
            
          >
            {item.transactionDate}
          </Text>
          <View className="flex-row items-center justify-between">
            <Text weight="bold"
              className="text-base text-[#111111]"
              
            >
              {item.transactionType}
            </Text>
            <Text weight="bold"
              className="text-[22px] text-[#FF1A0F]"
              
            >
              {formatKRW(item.amount)}
            </Text>
          </View>
        </View>
        <Pressable onPress={onPress} className={remindButton}>
          <Text weight="bold"
            className={remindButtonText}
            
          >
            증빙 바로가기
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

import { View, Text, Image } from 'react-native';
import {
  botAvatar,
  botCard,
  botRow,
  botText,
} from '@/assets/styles/chatStyles';
import ActionButton from './ActionButton';
import { ChatAction } from '@/types/chat';

export default function BotActions({
  item,
  onPress,
}: {
  item: any;
  onPress: (action: ChatAction, label: string) => void;
}) {
  return (
    <View className={botRow}>
      <Image
        source={require('../../assets/icons/nomal_hamco.png')}
        className={botAvatar}
        resizeMode="contain"
      />
      <View className={botCard}>
        <Text className={botText} style={{ fontFamily: 'GmarketSansTTFBold' }}>
          {item.text}
        </Text>
        <View className="gap-3">
          {item.actions.map((action: { label: string; action: ChatAction }) => (
            <ActionButton
              key={`${item.id}-${action.label}`}
              label={action.label}
              onPress={() => onPress(action.action, action.label)}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

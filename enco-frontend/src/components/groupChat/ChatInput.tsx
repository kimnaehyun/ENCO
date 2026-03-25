import { View, TextInput, Pressable, Text } from 'react-native';

interface ChatInputProps {
  msg: string;
  onChangeMsg: (text: string) => void;
  onSend: () => void;
  placeholder?: string;
}

export default function ChatInput({
  msg,
  onChangeMsg,
  onSend,
  placeholder,
}: ChatInputProps) {
  return (
    <View className="mx-3.5 mb-3.5 bg-white rounded-[26px] min-h-[62px] pl-[18px] pr-2.5 flex-row items-center shadow-sm">
      <TextInput
        value={msg}
        onChangeText={onChangeMsg}
        placeholder={placeholder ?? '메시지를 입력하세요'}
        placeholderTextColor="#9CA3AF"
        className="flex-1 h-11 text-base text-[#111111]"
        style={{ paddingVertical: 0 }}
        multiline={false}
        blurOnSubmit={false}
        returnKeyType="send"
        autoCorrect={false}
        autoCapitalize="none"
        onSubmitEditing={onSend}
      />
      <Pressable
        onPress={onSend}
        className="w-[42px] h-[42px] rounded-full items-center justify-center"
      >
        <Text className="text-[#3B6EF6] text-2xl">➤</Text>
      </Pressable>
    </View>
  );
}
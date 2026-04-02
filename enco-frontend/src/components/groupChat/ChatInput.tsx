import { View, TextInput, Pressable, Text } from 'react-native';

interface ChatInputProps {
  msg: string;
  onChangeMsg: (text: string) => void;
  onSend: () => void;
  onSelectHamcoMention?: () => void;
  placeholder?: string;
}

export default function ChatInput({
  msg,
  onChangeMsg,
  onSend,
  onSelectHamcoMention,
  placeholder,
}: ChatInputProps) {
  const trimmed = msg.trimStart();
  const shouldShowHamcoMention =
    !!onSelectHamcoMention &&
    (trimmed === '@' ||
      (trimmed.startsWith('@') &&
        '@햄코'.includes(trimmed) &&
        trimmed !== '@햄코'));

  return (
    <View className="mx-3.5 mb-3.5">
      {shouldShowHamcoMention && (
        <Pressable
          onPress={onSelectHamcoMention}
          className="mb-2 self-start bg-white border border-[#E5E7EB] rounded-2xl px-3 py-2 shadow-sm"
        >
          <Text className="text-[#1428A0] font-bold">@햄코</Text>
        </Pressable>
      )}

      <View className="bg-white rounded-[26px] min-h-[62px] pl-[18px] pr-2.5 flex-row items-center shadow-sm">
        <TextInput
          value={msg}
          onChangeText={onChangeMsg}
          placeholder={placeholder ?? '메시지를 입력하세요'}
          placeholderTextColor="#9CA3AF"
          className="flex-1 h-11 text-base text-[#111111] py-0"
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
    </View>
  );
}

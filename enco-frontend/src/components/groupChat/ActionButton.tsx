import { Pressable, Text } from 'react-native';

export default function ActionButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="h-10 border border-[#8F8F8F] rounded-[20px] items-center justify-center bg-[#FFFFFF] py-5"
    >
      <Text
        className="text-[#111111] text-base"
        style={{ fontFamily: 'GmarketSansTTFBold' }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

import { Pressable } from 'react-native'
import Text from '@/components/typography';;

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
      className="h-10 border border-[#8F8F8F] rounded-[20px] items-center justify-center bg-[#FFFFFF]"
    >
      <Text weight="bold"
        className="text-[#111111] text-base"
        
      >
        {label}
      </Text>
    </Pressable>
  );
}

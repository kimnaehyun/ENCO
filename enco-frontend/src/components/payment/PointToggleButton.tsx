import { Pressable, Text, View } from 'react-native';

export default function PointToggleButton({
  pointUsage,
  pointUsageFn,
}: {
  pointUsage: boolean;
  pointUsageFn: (usage: boolean) => void;
}) {
  return (
    <View className="w-32 bg-white border border-[#636363] rounded-[20px] overflow-hidden relative flex-row">
      <View
        className={`absolute top-0 bottom-0 w-1/2 rounded-[20px] ${
          pointUsage ? 'left-0 bg-[#1428A0] ' : 'left-1/2 bg-[#D9D9D9]'
        }`}
      />

      <Pressable
        className="flex-1 py-2"
        onPress={() => {
          pointUsageFn(true);
        }}
      >
        <Text
          className={`text-center font-bold text-xl ${pointUsage && 'text-white'}`}
        >
          {pointUsage ? 'ON' : 'OFF'}
        </Text>
      </Pressable>

      <Pressable
        className="flex-1 py-2"
        onPress={() => {
          pointUsageFn(false);
        }}
      >
        <Text className="text-center text-lg">Point</Text>
      </Pressable>
    </View>
  );
}

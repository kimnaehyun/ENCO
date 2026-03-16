import { View } from "react-native";
import { PinDotsProps } from "../../types/pin";

export default function PinDots({ length, filledCount }: PinDotsProps) {
  return (
    <View className="flex-row gap-4 items-center">
      {Array.from({ length }, (_, i) => (
        <View
          key={i}
          className={`w-4 h-4 rounded-full ${
            i < filledCount ? "bg-[#1428A0]" : "bg-[#D1D5DB]"
          }`}
        />
      ))}
    </View>
  );
}
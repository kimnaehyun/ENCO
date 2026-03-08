import { View, Text } from "react-native";
import { PinDotsProps } from "../../types/pin";

export default function PinDots({
  length,
  filledCount,
}: PinDotsProps) {
  return (
    <View style={{ flexDirection: "row", gap: 10 }}>
      {Array.from({ length }, (_, i) => (
        <Text key={i} style={{ fontSize: 22 }}>
          {i < filledCount ? "●" : "○"}
        </Text>
      ))}
    </View>
  );
}
import React from "react";
import { View, Text } from "react-native";

export default function PinDots({
  length,
  filledCount,
}: {
  length: number;
  filledCount: number;
}) {
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
import React from "react";
import { View, Text } from "react-native";

export default function PinDots({ length, value }: { length: number; value: string }) {
  return (
    <View style={{ flexDirection: "row", gap: 10 }}>
      {Array.from({ length }, (_, i) => (
        <Text key={i} style={{ fontSize: 22 }}>
          {i < value.length ? "●" : "○"}
        </Text>
      ))}
    </View>
  );
}
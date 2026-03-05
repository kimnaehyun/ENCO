import React, { useMemo } from "react";
import { View, Text, Pressable } from "react-native";

function shuffle(arr: string[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function RandomKeypad({
  onDigit,
  onBackspace,
  onReset,
}: {
  onDigit: (d: string) => void;
  onBackspace: () => void;
  onReset: () => void;
}) {
  const digits = useMemo(() => shuffle(Array.from({ length: 10 }, (_, i) => String(i))), []);

  const keys = useMemo(() => {
    const first9 = digits.slice(0, 9).map((d) => ({ type: "digit" as const, v: d }));
    return [
      ...first9,
      { type: "reset" as const },
      { type: "digit" as const, v: digits[9] },
      { type: "backspace" as const },
    ];
  }, [digits]);

  return (
    <View style={{ gap: 10 }}>
      {Array.from({ length: 4 }, (_, row) => (
        <View key={row} style={{ flexDirection: "row", gap: 10 }}>
          {keys.slice(row * 3, row * 3 + 3).map((k, idx) => (
            <Pressable
              key={idx}
              onPress={() => {
                if (k.type === "digit") onDigit(k.v);
                if (k.type === "backspace") onBackspace();
                if (k.type === "reset") onReset();
              }}
              style={{
                flex: 1,
                height: 56,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: "#ddd",
                borderRadius: 10,
              }}
            >
              <Text style={{ fontSize: 18 }}>
                {k.type === "digit" ? k.v : k.type === "backspace" ? "⌫" : "전체삭제"}
              </Text>
            </Pressable>
          ))}
        </View>
      ))}
    </View>
  );
}
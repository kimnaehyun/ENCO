import { useMemo } from "react";
import { View, Text, Pressable } from "react-native";
import { shuffle } from "../../utils/shuffle";
import { RandomKeypadProps } from "../../types/pin";

export default function RandomKeypad({
  resetKey = 0,
  onDigit,
  onBackspace,
  onReset,
}: RandomKeypadProps) {
  const digits = useMemo(
    () => shuffle(Array.from({ length: 10 }, (_, i) => String(i))),
    [resetKey]
  );

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
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
    <View className="gap-2">
      {Array.from({ length: 4 }, (_, row) => (
        <View key={row} className="flex-row gap-2">
          {keys.slice(row * 3, row * 3 + 3).map((k, idx) => (
            <Pressable
              key={idx}
              onPress={() => {
                if (k.type === "digit") onDigit(k.v);
                if (k.type === "backspace") onBackspace();
                if (k.type === "reset") onReset();
              }}
              className="flex-1 h-14 items-center justify-center rounded-2xl bg-[#F0F4FF] active:bg-[#D1D5DB]"
            >
              <Text
                className={`text-[#111827] text-lg ${
                  k.type === "reset" ? "text-sm text-[#6B7280]" : ""
                }`}
                style={{ fontFamily: k.type === "digit" ? "GmarketSansTTFBold" : "GmarketSansTTFMedium" }}
              >
                {k.type === "digit" ? k.v : k.type === "backspace" ? "⌫" : "전체\n삭제"}
              </Text>
            </Pressable>
          ))}
        </View>
      ))}
    </View>
  );
}
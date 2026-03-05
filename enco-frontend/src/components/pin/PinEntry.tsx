import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, StyleSheet, Dimensions, Platform } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type Props = {
  title: string;
  resetKey?: number;
  length?: number;
  onComplete: (pin: string) => void;
};

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const BUTTON_SIZE = Math.min(SCREEN_WIDTH / 4.5, 75);

export default function PinEntry({
  title,
  resetKey = 0,
  length = 6,
  onComplete,
}: Props) {
  const [pin, setPin] = useState("");

  const shuffled = useMemo(
    () => shuffle(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]),
    [resetKey]
  );

  const keyRows: (string | null)[][] = useMemo(
    () => [
      shuffled.slice(0, 3),
      shuffled.slice(3, 6),
      shuffled.slice(6, 9),
      [null, shuffled[9], "⌫"],
    ],
    [shuffled]
  );

  useEffect(() => {
    setPin("");
  }, [resetKey]);

  const handlePress = (key: string | null) => {
    if (!key) return;
    if (key === "⌫") {
      setPin((p) => p.slice(0, -1));
      return;
    }
    if (pin.length >= length) return;
    const next = pin + key;
    setPin(next);
    if (next.length === length) onComplete(next);
  };

  return (
    <View style={styles.root}>
      {/* 상단: 타이틀 + 입력된 핀 상태(점) */}
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.dotsRow}>
          {Array.from({ length }).map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i < pin.length && styles.dotFilled]}
            />
          ))}
        </View>
      </View>

      {/* 키패드: 간격이 있는 둥근 버튼 형태 */}
      <View style={styles.keypadContainer}>
        {keyRows.map((row, rowIdx) => (
          <View key={rowIdx} style={styles.keyRow}>
            {row.map((key, colIdx) => (
              <View key={colIdx} style={styles.keyCellContainer}>
                {key !== null ? (
                  <Pressable
                    onPress={() => handlePress(key)}
                    style={({ pressed }) => [
                      styles.keyButton,
                      pressed && styles.keyPressed,
                    ]}
                  >
                    <Text style={key === "⌫" ? styles.backText : styles.keyText}>
                      {key}
                    </Text>
                  </Pressable>
                ) : (
                  <View style={styles.keyButton} />
                )}
              </View>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FFFFFF", 
  },

  header: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 30,
  },

  title: {
    fontSize: 18,
    fontWeight: "500",
    color: "#1C1C1E",
    letterSpacing: -0.3,
  },

  dotsRow: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: "#C6C6C8",
    backgroundColor: "transparent",
  },
  dotFilled: {
    backgroundColor: "#007AFF", 
    borderColor: "#007AFF",
  },

  keypadContainer: {
    paddingBottom: Platform.OS === "ios" ? 50 : 30,
    paddingHorizontal: 20,
    gap: 12, 
  },

  keyRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24, 
  },

  keyCellContainer: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
  },

  keyButton: {
    flex: 1,
    borderRadius: BUTTON_SIZE / 2, 
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent", 
  },

  keyPressed: {
    backgroundColor: "#E5E5EA", 
  },

  keyText: {
    fontSize: 32, 
    fontWeight: "400",
    color: "#1C1C1E",
  },

  backText: {
    fontSize: 26,
    color: "#1C1C1E",
  },
});
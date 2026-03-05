import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import RandomKeypad from "./RandomKeypad";
import PinDots from "./PinDots";

type Props = {
  title: string;
  resetKey?: number;
  length?: number;
  onComplete: (pin: string) => void;
};

export default function PinEntry({
  title,
  resetKey = 0,
  length = 6,
  onComplete,
}: Props) {
  const [pin, setPin] = useState("");

  useEffect(() => {
    setPin("");
  }, [resetKey]);

  const handleDigit = (d: string) => {
    setPin((prev) => {
      if (prev.length >= length) return prev;
      const next = prev + d;
      if (next.length === length) onComplete(next);
      return next;
    });
  };

  const handleBackspace = () => {
    setPin((p) => p.slice(0, -1));
  };

  const handleReset = () => {
    setPin("");
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <PinDots length={length} filledCount={pin.length} />
      </View>

      <View style={styles.keypadContainer}>
        <RandomKeypad
          resetKey={resetKey}
          onDigit={handleDigit}
          onBackspace={handleBackspace}
          onReset={handleReset}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFFFFF" },
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
  keypadContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
});
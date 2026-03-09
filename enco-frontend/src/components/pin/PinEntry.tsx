import { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import RandomKeypad from "./RandomKeypad";
import PinDots from "./PinDots";
import { PinEntryProps } from "../../types/pin";

export default function PinEntry({
  title,
  resetKey = 0,
  length = 6,
  onComplete,
}: PinEntryProps) {
  const [pin, setPin] = useState("");
  const completedRef = useRef(false);

  useEffect(() => {
    setPin("");
    completedRef.current = false;
  }, [resetKey]);

  useEffect(() => {
    if (pin.length === length && !completedRef.current) {
      completedRef.current = true;
      onComplete(pin);
    }
  }, [pin, length, onComplete]);

  const handleDigit = (d: string) => {
    setPin((prev) => {
      if (prev.length >= length) return prev;
      return prev + d;
    });
  };

  const handleBackspace = () => {
    setPin((p) => p.slice(0, -1));
    completedRef.current = false;
  };

  const handleReset = () => {
    setPin("");
    completedRef.current = false;
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
  keypadContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
});
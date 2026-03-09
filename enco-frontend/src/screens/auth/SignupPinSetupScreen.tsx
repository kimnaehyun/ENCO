import React, { useState } from "react";
import { View, Text } from "react-native";
import type { AuthStackScreenProps } from "../../types/auth";
import PinEntry from "../../components/pin/PinEntry";

export default function SignupPinSetupScreen({
  route,
  navigation,
}: AuthStackScreenProps<"SignupPinSetup">) {
  const { name, birth, phone, email } = route.params;

  const [step, setStep] = useState<"set" | "confirm">("set");
  const [firstPin, setFirstPin] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [resetKey, setResetKey] = useState(0);

  const resetPinEntry = () => setResetKey((k) => k + 1);

  const handleComplete = (pin: string) => {
    if (step === "set") {
      setFirstPin(pin);
      setError("");
      setStep("confirm");
      resetPinEntry();
      return;
    }

    if (pin !== firstPin) {
      setError("비밀번호가 일치하지 않아요. 다시 설정해주세요.");
      setFirstPin(null);
      setStep("set");
      resetPinEntry();
      return;
    }

    setError("");

    navigation.reset({
      index: 0,
      routes: [{ name: "AuthLanding" }],
    });
  };

  return (
    <View style={{ flex: 1, padding: 20, gap: 12 }}>
      {error ? <Text style={{ color: "red" }}>{error}</Text> : null}

      <PinEntry
        key={`${step}-${resetKey}`}
        title={step === "set" ? "6자리 비밀번호(PIN) 설정" : "비밀번호(PIN) 재입력"}
        resetKey={resetKey}
        onComplete={handleComplete}
      />
    </View>
  );
}
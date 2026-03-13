import React, { useState } from "react";
import { View, Text } from "react-native";
import type { AuthScreenProps } from "../../types/navigation";
import PinEntry from "../../components/pin/PinEntry";

export default function SignupPinSetupScreen({
  route,
  navigation,
}: AuthScreenProps<"SignupPinSetup">) {
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
      setError("비밀번호가 일치하지 않아요");
      setFirstPin(null);
      setStep("set");
      resetPinEntry();
      return;
    }

    navigation.replace("SignupComplete");
  };

  return (
    <View className="flex-1 bg-gray-200 p-6">

      {error ? (
        <Text className="text-red-500 text-center mb-4">
          {error}
        </Text>
      ) : null}

      <PinEntry
        key={`${step}-${resetKey}`}
        title={step === "set" ? "비밀번호를 입력해주세요" : "한번 더 입력해주세요"}
        resetKey={resetKey}
        onComplete={handleComplete}
      />
    </View>
  );
}
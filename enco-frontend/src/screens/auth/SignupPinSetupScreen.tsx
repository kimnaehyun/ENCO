import React, { useState } from "react";
import { View, Text, Button } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/RootNavigator";
import PinEntry from "../../components/pin/PinEntry";

type Props = NativeStackScreenProps<RootStackParamList, "SignupPinSetup">;

export default function SignupPinSetupScreen({ route, navigation }: Props) {
  const { name, birth, phone, email } = route.params;

  const [step, setStep] = useState<"set" | "confirm" | "done">("set");
  const [firstPin, setFirstPin] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [resetKey, setResetKey] = useState(0); 

  const resetPinEntry = () => setResetKey((k) => k + 1);

  if (step === "done") {
    return (
      <View style={{ flex: 1, padding: 20, gap: 10 }}>
        <Text style={{ fontSize: 20, fontWeight: "700" }}>가입 완료(목업)</Text>
        <Text>{name}</Text>
        <Text>{birth}</Text>
        <Text>{phone}</Text>
        <Text>{email}</Text>

        <Button title="처음으로" onPress={() => navigation.popToTop()} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 20, gap: 12 }}>
      {error ? <Text style={{ color: "red" }}>{error}</Text> : null}

      <PinEntry
        title={step === "set" ? "6자리 비밀번호(PIN) 설정" : "비밀번호(PIN) 재입력"}
        resetKey={resetKey}
        onComplete={(pin) => {
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
          setStep("done");
        }}
      />

      <Button
        title="처음부터 다시"
        onPress={() => {
          setError("");
          setFirstPin(null);
          setStep("set");
          resetPinEntry();
        }}
      />
    </View>
  );
}
import { useState } from "react";
import { Text, View } from "react-native";
import PinEntry from "../../components/pin/PinEntry";
import { ROUTES } from "../../constants/routes";
import { GroupProps } from "../../types/group";

export default function GroupPinSetupScreen({ route, navigation }: GroupProps<"GroupPinSetup">) {
  const { groupName, address, tags, selectedCardId } = route.params;

  const [step, setStep] = useState<"set" | "confirm">("set");
  const [firstPin, setFirstPin] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [resetKey, setResetKey] = useState(0);

  const resetPinEntry = () => setResetKey((k) => k + 1);

  return (
    <View style={{ flex: 1, padding: 20, gap: 12 }}>
      {error ? <Text style={{ color: "red" }}>{error}</Text> : null}

      <PinEntry
        title={step === "set" ? "결제 비밀번호 설정" : "결제 비밀번호 재입력"}
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

          navigation.navigate(ROUTES.GROUP_DASHBOARD as any, {
            groupId: `temp-${Date.now()}`,
            groupName,
            address,
            tags,
            selectedCard: selectedCardId,
          });
        }}
      />

      <Text
        style={{
          textAlign: "center",
          color: "#6B7280",
          marginTop: 8,
        }}
      >
        {step === "set"
          ? "사용할 6자리 비밀번호를 입력해주세요."
          : "같은 비밀번호를 한 번 더 입력해주세요."}
      </Text>
    </View>
  );
}
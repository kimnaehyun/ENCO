import { useState } from "react";
import { Text, View } from "react-native";
import PinEntry from "../../components/pin/PinEntry";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "GroupPinSetup">;

export default function GroupPinSetupScreen({ route, navigation }: Props) {
  const { groupName, address, tags, selectedCardId } = route.params;

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
      // 틀렸을 때 → 에러 표시 후 재입력(confirm)만 다시
      setError("비밀번호가 맞지 않아요");
      resetPinEntry();
      return;
    }

    setError("");

    const groupId = `temp-${Date.now()}`;

    navigation.reset({
      index: 0,
      routes: [
        {
          name: "App",
          state: {
            routes: [
              {
                name: "HomeTab",
                state: {
                  routes: [
                    { name: "Home" },
                    {
                      name: "GroupDashboard",
                      params: {
                        groupId,
                        groupName,
                        address,
                        tags,
                        selectedCard: selectedCardId,
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F0F4FF' }}>
      <PinEntry
        key={`${step}-${resetKey}`}
        title={
  error
    ? `비밀번호가 맞지 않아요\n다시 입력해주세요`
    : step === "set"
    ? `결제 비밀번호를\n설정해주세요`
    : `비밀번호를\n한 번 더 입력해주세요`
}
        resetKey={resetKey}
        onComplete={handleComplete}
      />
    </View>
  );
}
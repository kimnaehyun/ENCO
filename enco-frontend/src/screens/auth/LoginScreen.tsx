import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import type { AuthScreenProps } from "../../types/navigation";
import PinEntry from "../../components/pin/PinEntry";
import { useAuthStore } from "../../store/useAuthStore";

export default function LoginScreen({}: AuthScreenProps<"Login">) {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"email" | "pin">("email");
  const [resetKey, setResetKey] = useState(0);

  const login = useAuthStore((s) => s.login);

  const TEST_EMAIL = "test@test.com";
  const TEST_PIN = "2580";

  const canNext = useMemo(() => email.trim().length > 0, [email]);

  const handleNext = () => {
    if (!canNext) return;
    setStep("pin");
  };

  const handlePinComplete = (pin: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const isValid = normalizedEmail === TEST_EMAIL && pin === TEST_PIN;

    if (isValid) {
      login(normalizedEmail);
      return;
    }

    Alert.alert("로그인 실패", "이메일 또는 비밀번호가 올바르지 않습니다.");
    setResetKey((prev) => prev + 1);
  };

  const handleBackToEmail = () => {
    setStep("email");
    setResetKey((prev) => prev + 1);
  };

  if (step === "pin") {
    return (
      <View className="flex-1">
        <Pressable
          onPress={handleBackToEmail}
          className="absolute top-14 left-6 z-10"
        >
          <Text
            className="text-[#1428A0] text-sm"
            style={{ fontFamily: "GmarketSansTTFMedium" }}
          >
            ← 이메일 다시 입력
          </Text>
        </Pressable>

        <PinEntry
          title={"비밀번호를\n입력해주세요"}
          resetKey={resetKey}
          length={4}
          onComplete={handlePinComplete}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#F0F4FF]"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="flex-1 justify-center px-6">
        <Text
          className="text-[#111827] text-3xl mb-2"
          style={{ fontFamily: "GmarketSansTTFBold" }}
        >
          로그인
        </Text>
        <Text
          className="text-[#6B7280] text-sm mb-10"
          style={{ fontFamily: "GmarketSansTTFMedium" }}
        >
          서비스 이용을 위해 로그인해주세요
        </Text>

        <Text
          className="text-[#374151] text-sm mb-2"
          style={{ fontFamily: "GmarketSansTTFMedium" }}
        >
          이메일
        </Text>
        <TextInput
          className="bg-white rounded-2xl px-4 h-14 text-base text-[#111827] mb-4"
          style={{
            fontFamily: "GmarketSansTTFMedium",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 1,
          }}
          value={email}
          onChangeText={setEmail}
          placeholder="이메일을 입력해주세요"
          placeholderTextColor="#9CA3AF"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Pressable
          onPress={handleNext}
          disabled={!canNext}
          className={`rounded-2xl h-14 items-center justify-center mt-2 ${
            canNext ? "bg-[#1428A0]" : "bg-[#D1D5DB]"
          }`}
        >
          <Text
            className="text-white text-lg"
            style={{ fontFamily: "GmarketSansTTFBold" }}
          >
            다음
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
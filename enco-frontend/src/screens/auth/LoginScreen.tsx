// src/screens/auth/LoginScreen.tsx
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
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
  const TEST_PIN = "258000";

  const canNext = useMemo(() => email.trim().length > 0, [email]);

  const handleNext = () => {
    if (!canNext) return;
    setStep("pin");
  };

  const handlePinComplete = (pin: string) => {
    const normalizedEmail = email.trim().toLowerCase();

    const isValid =
      normalizedEmail === TEST_EMAIL &&
      pin === TEST_PIN;

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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>로그인</Text>

      {step === "email" ? (
        <>
          <Text style={styles.label}>이메일</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="test@test.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Pressable
            style={[styles.button, !canNext && styles.buttonDisabled]}
            disabled={!canNext}
            onPress={handleNext}
          >
            <Text style={styles.buttonText}>다음</Text>
          </Pressable>
        </>
      ) : (
        <>
          <Text style={styles.subText}>이메일</Text>
          <Text style={styles.email}>{email}</Text>

          <PinEntry
            title="6자리 비밀번호를 입력하세요"
            resetKey={resetKey}
            length={6}
            onComplete={handlePinComplete}
          />

          <Pressable style={styles.textButton} onPress={handleBackToEmail}>
            <Text style={styles.textButtonLabel}>이메일 다시 입력</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#111",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  subText: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 20,
  },
  textButton: {
    marginTop: 20,
    alignItems: "center",
  },
  textButtonLabel: {
    fontSize: 14,
    color: "#444",
  },
});
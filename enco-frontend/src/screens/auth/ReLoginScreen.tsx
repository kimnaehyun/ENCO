import React, { useState } from "react";
import { View, TextInput, Pressable, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native"
import Text from '@/components/typography';;
import type { AuthScreenProps } from "../../types/navigation";
import { useAuthStore } from "../../store/useAuthStore";
import { ReLoginService } from "../../services/authService";
import { saveTokens, saveDeviceToken } from "../../utils/tokenStorage";
import PinEntry from "../../components/pin/PinEntry";

type Step = "email" | "password";

export default function ReLoginScreen({
  navigation,
}: AuthScreenProps<"ReLogin">) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [pinResetKey, setPinResetKey] = useState(0);

  const loginWithProfile = useAuthStore((s) => s.loginWithProfile);

  const handleEmailNext = () => {
    if (!email.trim()) {
      Alert.alert("입력 오류", "이메일을 입력해주세요.");
      return;
    }
    setStep("password");
  };

  const handlePinComplete = async (pin: string) => {
    setLoading(true);
    try {
      const response = await ReLoginService({ email, password: pin });

      // 토큰 저장
      if (response.result?.accessToken) {
        await saveTokens(response.result.accessToken, "");
      }

      // 디바이스 토큰 저장 (다음 로그인부터 PIN으로 가능)
      if (response.result?.deviceToken) {
        await saveDeviceToken(response.result.deviceToken);
      }

      // 로그인 + 프로필을 한 번에 저장 (타이밍 이슈 방지)
      const r = response.result;
      loginWithProfile(r.name, {
        name: r.name,
        email: r.email ?? '',
        phoneNumber: r.phoneNumber ?? '',
        birthDay: '',
        gender: 'M',
        address: '',
        profileUrl: r.profileImg ?? 0,
      }, r.id);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        "로그인에 실패했습니다. 다시 시도해주세요.";
      Alert.alert("로그인 실패", message);
      setPinResetKey((prev) => prev + 1);
    } finally {
      setLoading(false);
    }
  };

  // 로딩 화면
  if (loading) {
    return (
      <View className="flex-1 bg-[#F0F4FF] items-center justify-center">
        <ActivityIndicator size="large" color="#1428A0" />
        <Text
          className="text-[#374151] text-lg mt-4"
          
        >
          로그인 중...
        </Text>
      </View>
    );
  }

  // Step 2: 비밀번호 PIN 입력
  if (step === "password") {
    return (
      <View className="flex-1">
        <PinEntry
          title={"비밀번호를\n입력해주세요"}
          resetKey={pinResetKey}
          length={4}
          onComplete={handlePinComplete}
          footerContent={
            <Pressable onPress={() => setStep("email")}>
              <Text
                className="text-[#6B7280] text-sm underline"
                
              >
                이메일 다시 입력
              </Text>
            </Pressable>
          }
        />
      </View>
    );
  }

  // Step 1: 이메일 입력
  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#F0F4FF]"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View className="flex-1 justify-center px-8">
        <Text weight="bold" color="#1428A0"
          className="text-2xl text-center mb-10"
          
        >
          이메일로 로그인
        </Text>

        <Text
          className="text-sm mb-2 text-[#374151]"
          
        >
          이메일
        </Text>
        <TextInput
          className="bg-white rounded-xl px-4 py-3 mb-8 text-base"
          
          placeholder="example@email.com"
          placeholderTextColor="#9CA3AF"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus
          value={email}
          onChangeText={setEmail}
          onSubmitEditing={handleEmailNext}
          returnKeyType="next"
        />

        <Pressable
          className="bg-[#1428A0] rounded-2xl py-4 items-center"
          onPress={handleEmailNext}
        >
          <Text weight="bold" color="white"
            
           style={{ fontSize: 18 }}>
            다음
          </Text>
        </Pressable>

        <Pressable
          className="mt-4 items-center"
          onPress={() => navigation.goBack()}
        >
          <Text
            className="text-[#6B7280] text-sm underline"
            
          >
            뒤로 가기
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
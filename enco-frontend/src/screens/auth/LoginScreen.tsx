import React, { useState } from "react";
import { View, Text, Alert, ActivityIndicator } from "react-native";
import type { AuthScreenProps } from "../../types/navigation";
import PinEntry from "../../components/pin/PinEntry";
import { useAuthStore } from "../../store/useAuthStore";
import { loginService } from "../../services/authService";
import { getDeviceToken } from "../../utils/tokenStorage";
import { saveTokens } from "../../utils/tokenStorage";

export default function LoginScreen({}: AuthScreenProps<"Login">) {
  const [resetKey, setResetKey] = useState(0);
  const [loading, setLoading] = useState(false);

  const login = useAuthStore((s) => s.login);

  const handlePinComplete = async (pin: string) => {
    setLoading(true);
    try {
      const deviceToken = await getDeviceToken();

      if (!deviceToken) {
        Alert.alert("로그인 실패", "기기 정보를 찾을 수 없습니다. 회원가입을 먼저 진행해주세요.");
        setResetKey((prev) => prev + 1);
        setLoading(false);
        return;
      }

      const response = await loginService({
        pinCode: pin,
        deviceToken,
      });

      // accessToken 저장
      if (response.result?.accessToken) {
        console.log('[Login] accessToken:', response.result.accessToken);
        await saveTokens(response.result.accessToken, "");
      }

      // zustand에 사용자 이름 저장 → RootNavigator가 App으로 전환
      login(response.result.name);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || "로그인에 실패했습니다. 다시 시도해주세요.";
      Alert.alert("로그인 실패", message);
      setResetKey((prev) => prev + 1);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-[#F0F4FF] items-center justify-center">
        <ActivityIndicator size="large" color="#1428A0" />
        <Text
          className="text-[#374151] text-lg mt-4"
          style={{ fontFamily: "GmarketSansTTFMedium" }}
        >
          로그인 중...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <PinEntry
        title={"비밀번호를\n입력해주세요"}
        resetKey={resetKey}
        length={4}
        onComplete={handlePinComplete}
      />
    </View>
  );
}
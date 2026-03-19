import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import type { AuthScreenProps } from "../../types/navigation";
import { useAuthStore } from "../../store/useAuthStore";
import { ReLoginService } from "../../services/authService";
import { saveTokens, saveDeviceToken } from "../../utils/tokenStorage";

export default function ReLoginScreen({
  navigation,
}: AuthScreenProps<"ReLogin">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const login = useAuthStore((s) => s.login);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("입력 오류", "이메일과 비밀번호를 모두 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      const response = await ReLoginService({ email, password });

      // 토큰 저장
      if (response.result?.accessToken) {
        await saveTokens(response.result.accessToken, "");
      }

      // 디바이스 토큰 저장 (다음 로그인부터 PIN으로 가능)
      if (response.result?.deviceToken) {
        await saveDeviceToken(response.result.deviceToken);
      }

      // zustand에 사용자 이름 저장 → RootNavigator가 App으로 전환
      login(response.result.name);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        "로그인에 실패했습니다. 다시 시도해주세요.";
      Alert.alert("로그인 실패", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#F0F4FF]"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View className="flex-1 justify-center px-8">
        <Text
          className="text-2xl text-center mb-10"
          style={{ fontFamily: "GmarketSansTTFBold", color: "#1428A0" }}
        >
          이메일로 로그인
        </Text>

        <Text
          className="text-sm mb-2 text-[#374151]"
          style={{ fontFamily: "GmarketSansTTFMedium" }}
        >
          이메일
        </Text>
        <TextInput
          className="bg-white rounded-xl px-4 py-3 mb-4 text-base"
          style={{ fontFamily: "GmarketSansTTFMedium" }}
          placeholder="example@email.com"
          placeholderTextColor="#9CA3AF"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={setEmail}
        />

        <Text
          className="text-sm mb-2 text-[#374151]"
          style={{ fontFamily: "GmarketSansTTFMedium" }}
        >
          비밀번호
        </Text>
        <TextInput
          className="bg-white rounded-xl px-4 py-3 mb-8 text-base"
          style={{ fontFamily: "GmarketSansTTFMedium" }}
          placeholder="비밀번호를 입력하세요"
          placeholderTextColor="#9CA3AF"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Pressable
          className="bg-[#1428A0] rounded-2xl py-4 items-center"
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text
              style={{
                fontFamily: "GmarketSansTTFBold",
                color: "white",
                fontSize: 18,
              }}
            >
              로그인
            </Text>
          )}
        </Pressable>

        <Pressable
          className="mt-4 items-center"
          onPress={() => navigation.goBack()}
        >
          <Text
            className="text-[#6B7280] text-sm underline"
            style={{ fontFamily: "GmarketSansTTFMedium" }}
          >
            뒤로 가기
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

import React, { useEffect, useMemo, useState } from "react";
import { View, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform } from "react-native"
import Text from '@/components/typography';;
import { AuthScreenProps } from "../../types/navigation";
import type { SignupStep } from "../../types/navigation";

const PROFILE_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function InputInfoScreen({
  navigation,
}: AuthScreenProps<"InputInfo">) {
  const [step, setStep] = useState<SignupStep>("name");

  const [name, setName] = useState("");
  const [birth, setBirth] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState<"M" | "W" | null>(null);
  const [profileUrl, setProfileUrl] = useState<number | null>(null);

  const nBirth = birth.replace(/[^\d]/g, "");
  const nPhone = phone.replace(/[^\d]/g, "");

  const canName = name.trim().length >= 2;
  const canBirth = nBirth.length === 8;
  const canPhone = nPhone.length >= 10;
  const canEmail = email.includes("@");
  const canGender = gender !== null;
  const canProfile = profileUrl !== null;

  const canDone = useMemo(
    () => canName && canBirth && canPhone && canEmail && canGender && canProfile,
    [canName, canBirth, canPhone, canEmail, canGender, canProfile]
  );

  // step 자동 진행
  useEffect(() => {
    if (step === "name" && canName) {
      setStep("birth");
    }
  }, [canName]);

  useEffect(() => {
    if (step === "birth" && canBirth) {
      setStep("phone");
    }
  }, [canBirth]);

  useEffect(() => {
    if (step === "phone" && canPhone) {
      setStep("email");
    }
  }, [canPhone]);

  useEffect(() => {
    if (step === "email" && canEmail) {
      setStep("gender");
    }
  }, [canEmail]);

  useEffect(() => {
    if (step === "gender" && canGender) {
      setStep("profile");
    }
  }, [canGender]);

  // show helper
  const orderList: SignupStep[] = [
    "name", "birth", "phone", "email", "gender", "profile", "done",
  ];
  const show = (from: SignupStep) =>
    orderList.indexOf(step) >= orderList.indexOf(from);

  const handleProfileSelect = (num: number) => {
    setProfileUrl(num);
    setStep("done");
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#F0F4FF]"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-6 pt-10">
          <View className="flex-1 rounded-2xl p-6 justify-between">
            {/* 입력 영역 */}
            <View className="gap-8">
              <Pressable className="rounded-xl py-3">
                <Text weight="bold"
                  className="text-[#111827] text-center text-2xl"
                  
                >
                  회원가입
                </Text>
              </Pressable>

              {/* 이름 */}
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="이름"
                className="border-b border-gray-500 py-2 text-2xl"
              />

              {/* 생년월일 */}
              {show("birth") && (
                <TextInput
                  value={birth}
                  onChangeText={(t) => setBirth(t.replace(/[^\d]/g, ""))}
                  placeholder="생년월일 8자리"
                  keyboardType="number-pad"
                  maxLength={8}
                  className="border-b border-gray-500 py-2 text-2xl"
                />
              )}

              {/* 전화번호 */}
              {show("phone") && (
                <TextInput
                  value={phone}
                  onChangeText={(t) => setPhone(t.replace(/[^\d]/g, ""))}
                  placeholder="전화번호 010XXXXXXXX"
                  keyboardType="phone-pad"
                  maxLength={11}
                  className="border-b border-gray-500 py-2 text-2xl"
                />
              )}

              {/* 이메일 */}
              {show("email") && (
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="이메일"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="border-b border-gray-500 py-2 text-2xl"
                />
              )}

              {/* 성별 */}
              {show("gender") && (
                <View>
                  <Text className="text-gray-500 text-base mb-2">성별</Text>
                  <View className="flex-row gap-4">
                    {(["M", "W"] as const).map((g) => (
                      <Pressable
                        key={g}
                        onPress={() => setGender(g)}
                        className={`flex-1 py-3 rounded-xl items-center ${
                          gender === g
                            ? "bg-[#1428A0]"
                            : "bg-white border border-gray-300"
                        }`}
                      >
                        <Text
                          className={`text-lg ${
                            gender === g ? "text-white" : "text-gray-700"
                          }`}
                          
                        >
                          {g === "M" ? "남성" : "여성"}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}

              {/* 프로필 선택 */}
              {show("profile") && (
                <View>
                  <Text className="text-gray-500 text-base mb-3">
                    프로필 선택
                  </Text>
                  <View className="flex-row flex-wrap gap-3 justify-center">
                    {PROFILE_OPTIONS.map((num) => {
                      const sel = profileUrl === num;
                      return (
                        <Pressable
                          key={num}
                          onPress={() => handleProfileSelect(num)}
                          className={`w-14 h-14 rounded-full items-center justify-center ${
                            sel
                              ? "bg-[#1428A0]"
                              : "bg-white border border-gray-300"
                          }`}
                        >
                          <Text weight="bold"
                            className={`text-lg ${
                              sel ? "text-white" : "text-gray-700"
                            }`}
                            
                          >
                            {num}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              )}
            </View>

            {/* 하단 버튼 */}
            {step === "done" && (
              <Pressable
                disabled={!canDone}
                onPress={() =>
                  navigation.navigate("SignupPinSetup", {
                    name: name.trim(),
                    birth: nBirth,
                    phone: nPhone,
                    email: email.trim(),
                    gender: gender!,
                    profileUrl: profileUrl!,
                  })
                }
                className={`rounded-xl py-4 mt-8 ${
                  canDone ? "bg-[#1428A0]" : "bg-gray-400"
                }`}
              >
                <Text weight="bold"
                  className="text-white text-center font-bold text-2xl"
                  
                >
                  간편비밀번호 설정하기
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
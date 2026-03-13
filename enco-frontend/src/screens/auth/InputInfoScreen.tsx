import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { AuthScreenProps } from "../../types/navigation";
import type { SignupStep } from "../../types/navigation";

export default function InputInfoScreen({
  navigation,
}: AuthScreenProps<"InputInfo">) {
  const [step, setStep] = useState<SignupStep>("name");

  const [name, setName] = useState("");
  const [birth, setBirth] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const birthRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);

  const nBirth = birth.replace(/[^\d]/g, "");
  const nPhone = phone.replace(/[^\d]/g, "");

  const canName = name.trim().length >= 2;
  const canBirth = nBirth.length === 8;
  const canPhone = nPhone.length >= 10;
  const canEmail = email.includes("@");

  const canDone = useMemo(
    () => canName && canBirth && canPhone && canEmail,
    [canName, canBirth, canPhone, canEmail]
  );

  // step 증가만 허용
  useEffect(() => {
    if (step === "name" && canName) {
      setStep("birth");
      setTimeout(() => birthRef.current?.focus(), 120);
    }
  }, [canName]);

  useEffect(() => {
    if (step === "birth" && canBirth) {
      setStep("phone");
      setTimeout(() => phoneRef.current?.focus(), 120);
    }
  }, [canBirth]);

  useEffect(() => {
    if (step === "phone" && canPhone) {
      setStep("email");
      setTimeout(() => emailRef.current?.focus(), 120);
    }
  }, [canPhone]);

  useEffect(() => {
    if (step === "email" && canEmail) {
      setStep("done");
    }
  }, [canEmail]);

  return (
    <View className="flex-1 bg-gray-200 px-6 pt-10">

      <Text className="text-2xl font-bold mb-6 text-gray-700">
        회원가입
      </Text>

      <View className="bg-gray-100 rounded-2xl p-6">

        <Pressable className="bg-blue-800 rounded-xl py-3 mb-8">
          <Text className="text-white text-center text-lg font-bold">
            회원가입
          </Text>
        </Pressable>

        {/* 이름 */}
        <View className="mb-8">
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="이름"
            className="border-b border-gray-500 py-2 text-2xl"
          />
        </View>

        {/* 생년월일 */}
        {(step === "birth" ||
          step === "phone" ||
          step === "email" ||
          step === "done") && (
          <View className="mb-8">
            <TextInput
              ref={birthRef}
              value={birth}
              onChangeText={(t) => setBirth(t.replace(/[^\d]/g, ""))}
              placeholder="생년월일 8자리"
              keyboardType="number-pad"
              maxLength={8}
              className="border-b border-gray-500 py-2 text-2xl"
            />
          </View>
        )}

        {/* 전화번호 */}
        {(step === "phone" || step === "email" || step === "done") && (
          <View className="mb-8">
            <TextInput
              ref={phoneRef}
              value={phone}
              onChangeText={(t) => setPhone(t.replace(/[^\d]/g, ""))}
              placeholder="전화번호-010-XXXX-XXXX"
              keyboardType="phone-pad"
              className="border-b border-gray-500 py-2 text-2xl"
            />
          </View>
        )}

        {/* 이메일 */}
        {(step === "email" || step === "done") && (
          <View className="mb-8">
            <TextInput
              ref={emailRef}
              value={email}
              onChangeText={setEmail}
              placeholder="이메일"
              keyboardType="email-address"
              autoCapitalize="none"
              className="border-b border-gray-500 py-2 text-2xl"
            />
          </View>
        )}

        {step === "done" && (
          <Pressable
            disabled={!canDone}
            onPress={() =>
              navigation.navigate("SignupPinSetup", {
                name: name.trim(),
                birth: nBirth,
                phone: nPhone,
                email: email.trim(),
              })
            }
            className={`rounded-xl py-3 ${
              canDone ? "bg-blue-800" : "bg-gray-400"
            }`}
          >
            <Text className="text-white text-center font-bold text-2xl">
              PIN 설정하기
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
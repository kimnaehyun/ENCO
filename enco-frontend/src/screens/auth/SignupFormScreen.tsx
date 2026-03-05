import React, { useMemo, useRef, useState } from "react";
import { View, Text, TextInput, Button, Pressable } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/RootNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "SignupForm">;
type Step = "name" | "birth" | "phone" | "email" | "done";

export default function SignupFormScreen({ navigation }: Props) {
  const [step, setStep] = useState<Step>("name");

  const [name, setName] = useState("");
  const [birth, setBirth] = useState(""); // YYYYMMDD
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const birthRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);

  const nBirth = birth.replace(/[^\d]/g, "");
  const nPhone = phone.replace(/[^\d]/g, "");

  const canName = name.trim().length >= 2;
  const canBirth = nBirth.length === 8;      // 목업: YYYYMMDD
  const canPhone = nPhone.length >= 10;      // 목업
  const canEmail = email.includes("@");      // 목업

  const canDone = useMemo(() => canName && canBirth && canPhone && canEmail, [
    canName,
    canBirth,
    canPhone,
    canEmail,
  ]);

  const go = (next: Step) => {
    setStep(next);
    // 다음 입력창 포커스
    setTimeout(() => {
      if (next === "birth") birthRef.current?.focus();
      if (next === "phone") phoneRef.current?.focus();
      if (next === "email") emailRef.current?.focus();
    }, 120);
  };

  return (
    <View style={{ flex: 1, padding: 20, gap: 14 }}>
      <Pressable onPress={() => navigation.goBack()}>
        <Text style={{ textDecorationLine: "underline" }}>뒤로</Text>
      </Pressable>

      <Text style={{ fontSize: 20, fontWeight: "700" }}>회원가입</Text>

      {/* 1) 이름 */}
      <View style={{ gap: 6 }}>
        <Text>이름</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="홍길동"
          returnKeyType="next"
          onSubmitEditing={() => {
            if (!canName) return;
            go("birth");
          }}
        />
        {step === "name" && (
          <Button title="다음" disabled={!canName} onPress={() => go("birth")} />
        )}
      </View>

      {/* 2) 생년월일 */}
      {step !== "name" && (
        <View style={{ gap: 6 }}>
          <Text>생년월일(YYYYMMDD)</Text>
          <TextInput
            ref={birthRef}
            value={birth}
            onChangeText={(t) => setBirth(t.replace(/[^\d]/g, ""))}
            placeholder="19990101"
            keyboardType="number-pad"
            maxLength={8}
            returnKeyType="next"
            onSubmitEditing={() => {
              if (!canBirth) return;
              go("phone");
            }}
          />
          {step === "birth" && (
            <Button
              title="다음"
              disabled={!canBirth}
              onPress={() => go("phone")}
            />
          )}
        </View>
      )}

      {/* 3) 전화번호 */}
      {step !== "name" && step !== "birth" && (
        <View style={{ gap: 6 }}>
          <Text>전화번호</Text>
          <TextInput
            ref={phoneRef}
            value={phone}
            onChangeText={(t) => setPhone(t.replace(/[^\d]/g, ""))}
            placeholder="01012345678"
            keyboardType="phone-pad"
            returnKeyType="next"
            onSubmitEditing={() => {
              if (!canPhone) return;
              go("email");
            }}
          />
          {step === "phone" && (
            <Button
              title="다음"
              disabled={!canPhone}
              onPress={() => go("email")}
            />
          )}
        </View>
      )}

      {/* 4) 이메일 */}
      {step === "email" || step === "done" ? (
        <View style={{ gap: 6 }}>
          <Text>이메일</Text>
          <TextInput
            ref={emailRef}
            value={email}
            onChangeText={setEmail}
            placeholder="test@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="done"
            onSubmitEditing={() => {
              if (!canEmail) return;
              setStep("done");
            }}
          />

          {step === "email" && (
            <Button
              title="입력 완료"
              disabled={!canEmail}
              onPress={() => setStep("done")}
            />
          )}
        </View>
      ) : null}

      {/* 5) PIN 설정으로 */}
      {step === "done" && (
        <Button
          title="PIN(6자리) 설정하러 가기"
          disabled={!canDone}
          onPress={() =>
            navigation.navigate("SignupPinSetup", {
              name: name.trim(),
              birth: nBirth,
              phone: nPhone,
              email: email.trim(),
            })
          }
        />
      )}
    </View>
  );
}
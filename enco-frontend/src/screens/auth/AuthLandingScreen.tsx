import React from 'react';
import { View, Text, Image, Button, Pressable } from 'react-native';
import { images } from '../../types/images';
import { AuthScreenProps } from '../../types/navigation'; 

export default function AuthLandingScreen({
  navigation,
}: AuthScreenProps<'AuthLanding'>) {
  return (
    <View
      className ="flex-1 px-6"
    >
      <View
        className = "flex-1 justify-center items-center"
      >
      <Image
        source={images.logo}
        style={{ width: 350, height: 350 }}
        resizeMode="contain"
      />
      <Pressable className='bg-[#1428A0] rounded-2xl px-12 py-3 items-center' onPress={() => navigation.navigate('Login')}>
        <Text style ={{fontFamily : 'GmarketSansTTFBold' , color: 'white', fontSize:24}}>
          LOGIN
        </Text>
        </Pressable>
  </View>
      
      <View className = "items-center mb-10">
      <Text style = {{fontFamily :'GmarketSansTTFMedium' , fontSize : 16}}>ENCO에 처음 오셨나요?</Text>
      <Pressable onPress={() => navigation.navigate('SignupVerify')}>
        <Text style={{ textDecorationLine: 'underline', color : "blue" , fontFamily :'GmarketSansTTFMedium', fontSize:16}}>
          회원가입하러 가기
        </Text>
      </Pressable>
      </View>
    </View>
  );
}
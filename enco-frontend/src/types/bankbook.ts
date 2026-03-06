import { NativeStackScreenProps } from "@react-navigation/native-stack";

export type BankbookStackParamList = {
    BankbookCreate : undefined
    
}


export type BankbookStackScreenProps<T extends keyof BankbookStackParamList> = NativeStackScreenProps<BankbookStackParamList,T>;
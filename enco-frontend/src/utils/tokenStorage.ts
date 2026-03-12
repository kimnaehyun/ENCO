import EncryptedStorage from 'react-native-encrypted-storage'

const STORAGE_KEYS = {
    accessToken : 'accessToken',
    refreshToken: 'refreshToken',
} as const;

let accessTokenCache: string | null = null;
let refreshTokenCache: string | null = null;

export async function initTokenCache(){
    accessTokenCache = await EncryptedStorage.getItem(STORAGE_KEYS.accessToken);
    refreshTokenCache = await EncryptedStorage.getItem(STORAGE_KEYS.refreshToken);
}

export function getCachedAccessToken(){
    return accessTokenCache;
}

export function getCachedRefreshToken(){
    return refreshTokenCache;
}

export async function saveTokens(accessToken : string, refreshToken : string) {
    accessTokenCache = accessToken;
    refreshTokenCache = refreshToken;

    await EncryptedStorage.setItem(STORAGE_KEYS.accessToken,accessToken);
    await EncryptedStorage.setItem(STORAGE_KEYS.refreshToken,refreshToken);
}

export async function clearTokens() {
    accessTokenCache =null;
    refreshTokenCache = null;
    await EncryptedStorage.removeItem(STORAGE_KEYS.accessToken);
    await EncryptedStorage.removeItem(STORAGE_KEYS.refreshToken);
}
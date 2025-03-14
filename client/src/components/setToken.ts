export function setToken(accessToken: string, refreshToken: string) {
    document.cookie = `accessToken=${accessToken}`;
    document.cookie = `refreshToken=${refreshToken}`; 
}
    
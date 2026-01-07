let currentAccessToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  currentAccessToken = token || null;
};

export const getAuthToken = (): string | null => { 
  return currentAccessToken;
};


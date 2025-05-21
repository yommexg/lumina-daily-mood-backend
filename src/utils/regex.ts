export const isPasswordValid = (password: string): boolean => {
  const passwordRegex =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_])[A-Za-z\d!@#$%^&*(),.?":{}|<>_]{8,}$/;
  return passwordRegex.test(password);
};

export const isEmailValid = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

export const getUsernameFromEmail = (email: string): string => {
  return email.split("@")[0];
};

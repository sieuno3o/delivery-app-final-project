export type AuthFieldErrors = Partial<
  Record<"name" | "email" | "password" | "confirmPassword", string[]>
>;

export type AuthActionState = {
  message?: string;
  fieldErrors?: AuthFieldErrors;
};

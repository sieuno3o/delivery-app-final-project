export type OrderFieldErrors = Partial<
  Record<
    "deliveryAddress" | "deliveryAddressDetail" | "deliveryRequest",
    string[]
  >
>;

export type OrderActionState = {
  message?: string;
  fieldErrors?: OrderFieldErrors;
};

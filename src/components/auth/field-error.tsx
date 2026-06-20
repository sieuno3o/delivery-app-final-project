type FieldErrorProps = {
  id: string;
  errors?: string[];
};

export function FieldError({ id, errors }: FieldErrorProps) {
  if (!errors?.length) {
    return null;
  }

  return (
    <p className="mt-2 text-xs font-medium text-red-600" id={id} role="alert">
      {errors[0]}
    </p>
  );
}

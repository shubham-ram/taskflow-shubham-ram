import { forwardRef } from "react";
import { Controller, type Control, type FieldErrors, type FieldValues, type RegisterOptions } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface InputControllerProps {
  name: string;
  control: Control<FieldValues>;
  defaultValue?: string;
  rules?: RegisterOptions;
  errors: FieldErrors;
  label?: string;
  type?: string;
  placeholder?: string;
  [key: string]: unknown;
}

function InputController(props: InputControllerProps, ref: React.ForwardedRef<HTMLInputElement>) {
  const {
    name = "",
    control,
    defaultValue = "",
    rules = {},
    errors = {},
    label = "",
    ...rest
  } = props;

  const errorMessage = (errors[name]?.message as string) || "";

  return (
    <div className="flex flex-col gap-2">
      {label && <Label htmlFor={name}>{label}</Label>}
      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue}
        rules={rules}
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            ref={ref}
            id={name}
            onChange={onChange}
            onBlur={onBlur}
            value={value}
            aria-invalid={!!errorMessage}
            {...rest}
          />
        )}
      />
      {errorMessage && (
        <p className="text-sm text-destructive">{errorMessage}</p>
      )}
    </div>
  );
}

export default forwardRef(InputController);

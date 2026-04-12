import { forwardRef } from "react";
import {
  Controller,
  type Control,
  type FieldErrors,
  type FieldValues,
  type RegisterOptions,
} from "react-hook-form";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectControllerProps {
  name: string;
  control: Control<FieldValues>;
  defaultValue?: string;
  rules?: RegisterOptions;
  errors: FieldErrors;
  label?: string;
  placeholder?: string;
  options?: SelectOption[];
  [key: string]: unknown;
}

function SelectController(
  props: SelectControllerProps,
  ref: React.ForwardedRef<HTMLButtonElement>,
) {
  const {
    name = "",
    control,
    defaultValue = "",
    rules = {},
    errors = {},
    label = "",
    placeholder = "",
    options = [],
    ...rest
  } = props;

  // Remove props that shouldn't be spread onto Select
  const { type: _type, ...selectRest } = rest;
  void _type;
  void selectRest;

  const errorMessage = (errors[name]?.message as string) || "";

  return (
    <div className="flex flex-col gap-2">
      {label && <Label htmlFor={name}>{label}</Label>}
      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue}
        rules={rules}
        render={({ field: { onChange, value } }) => (
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger ref={ref} aria-invalid={!!errorMessage}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      {errorMessage && (
        <p className="text-sm text-destructive">{errorMessage}</p>
      )}
    </div>
  );
}

export default forwardRef(SelectController);

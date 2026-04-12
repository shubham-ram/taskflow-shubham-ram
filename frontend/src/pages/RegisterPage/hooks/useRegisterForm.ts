import { useForm } from "react-hook-form";

function useRegisterForm() {
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  return { control, handleSubmit, setError, errors };
}

export default useRegisterForm;

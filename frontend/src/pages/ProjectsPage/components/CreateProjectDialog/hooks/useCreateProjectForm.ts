import { useForm } from "react-hook-form";

function useCreateProjectForm() {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
    },
  });

  return { control, handleSubmit, reset, errors };
}

export default useCreateProjectForm;

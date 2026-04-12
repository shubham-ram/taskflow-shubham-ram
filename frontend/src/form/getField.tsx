import InputController from "./Controller/InputController";
import TextareaController from "./Controller/TextareaController";
import SelectController from "./Controller/SelectController";

const MAPPING: Record<string, React.ComponentType<any>> = {
  text: InputController,
  email: InputController,
  password: InputController,
  date: InputController,
  textarea: TextareaController,
  select: SelectController,
};

const getField = (type: string) => {
  const element = MAPPING[type];

  if (!element) {
    return null;
  }

  return element;
};

export default getField;

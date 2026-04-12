const createProjectControls = [
  {
    name: "name",
    type: "text",
    label: "Name",
    placeholder: "Project name",
    rules: { required: "Project name is required" },
  },
  {
    name: "description",
    type: "textarea",
    label: "Description (optional)",
    placeholder: "What is this project about?",
  },
];

export default createProjectControls;

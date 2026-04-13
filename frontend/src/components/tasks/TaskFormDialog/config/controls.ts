import type { User } from "@/types";
import type { SelectOption } from "@/form/Controller/SelectController";

const getTaskControls = (members: User[]) => {
  const memberOptions: SelectOption[] = [
    { value: "unassigned", label: "Unassigned" },
    ...members.map((m) => ({ value: m.id, label: m.name })),
  ];

  return [
    {
      name: "title",
      type: "text",
      label: "Title",
      placeholder: "Task title",
      rules: { required: "Title is required" },
      className: "col-span-12",
    },
    {
      name: "description",
      type: "textarea",
      label: "Description (optional)",
      placeholder: "Describe the task...",
      className: "col-span-12",
    },
    {
      name: "status",
      type: "select",
      label: "Status",
      options: [
        { value: "todo", label: "Todo" },
        { value: "in_progress", label: "In Progress" },
        { value: "done", label: "Done" },
      ],
      className: "col-span-12 md:col-span-6",
    },
    {
      name: "priority",
      type: "select",
      label: "Priority",
      options: [
        { value: "low", label: "Low" },
        { value: "medium", label: "Medium" },
        { value: "high", label: "High" },
      ],
      className: "col-span-12 md:col-span-6",
    },
    {
      name: "assigneeId",
      type: "select",
      label: "Assignee (optional)",
      placeholder: "Unassigned",
      options: memberOptions,
      className: "col-span-12 md:col-span-6",
    },
    {
      name: "dueDate",
      type: "date",
      label: "Due date (optional)",
      className: "col-span-12 md:col-span-6",
    },
  ];
};

export default getTaskControls;

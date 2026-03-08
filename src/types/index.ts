export type Task = {
  id: string;
  title: string;
  dueDate: string; // "YYYY-MM-DD"
  isCompleted: boolean;
};

export type SmallCategory = {
  id: string;
  name: string;
  tasks: Task[];
};

export type LargeCategory = {
  id: string;
  name: string;
  smallCategories: SmallCategory[];
};

import type { Task, LargeCategory } from '../types';

export const sortTasksByDueDate = (tasks: Task[]): Task[] => {
    return [...tasks].sort((taskA, taskB) => {
        const timeA = taskA.dueDate ? new Date(taskA.dueDate).getTime() : Infinity;
        const timeB = taskB.dueDate ? new Date(taskB.dueDate).getTime() : Infinity;
        return timeA - timeB;
    });
};

export const sortAllTasksInCategories = (largeCategories: LargeCategory[]): LargeCategory[] => {
    return largeCategories.map(largeCategory => ({
        ...largeCategory,
        smallCategories: largeCategory.smallCategories.map(smallCategory => ({
            ...smallCategory,
            tasks: sortTasksByDueDate(smallCategory.tasks)
        }))
    }));
};

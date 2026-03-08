import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { LargeCategory, Task } from '../types';
import { sortAllTasksInCategories, sortTasksByDueDate } from '../utils/taskUtils';

type TodoState = {
    categories: LargeCategory[];
    selectedLargeCategoryId: string | null;
    setSelectedLargeCategoryId: (id: string | null) => void;
    addLargeCategory: (name: string) => void;
    deleteLargeCategory: (id: string) => void;
    editLargeCategory: (id: string, newName: string) => void;
    addSmallCategory: (largeCategoryId: string, name: string) => void;
    deleteSmallCategory: (largeCategoryId: string, smallCategoryId: string) => void;
    editSmallCategory: (largeCategoryId: string, smallCategoryId: string, newName: string) => void;
    addTask: (largeCategoryId: string, smallCategoryId: string, title: string, dueDate: string) => void;
    updateTask: (largeCategoryId: string, smallCategoryId: string, updatedTask: Task) => void;
    deleteTask: (largeCategoryId: string, smallCategoryId: string, taskId: string) => void;
    importData: (categories: LargeCategory[]) => void;
};

export const useTodoStore = create<TodoState>()(
    persist(
        (set) => ({
            categories: [],
            selectedLargeCategoryId: null,
            setSelectedLargeCategoryId: (id) => set({ selectedLargeCategoryId: id }),
            addLargeCategory: (name) => set((state) => {
                const newCat = { id: uuidv4(), name, smallCategories: [] };
                return {
                    categories: [...state.categories, newCat],
                    selectedLargeCategoryId: newCat.id
                };
            }),
            deleteLargeCategory: (id) => set((state) => ({
                categories: state.categories.filter(c => c.id !== id),
                selectedLargeCategoryId: state.selectedLargeCategoryId === id ? null : state.selectedLargeCategoryId
            })),
            addSmallCategory: (largeCategoryId, name) => set((state) => ({
                categories: state.categories.map(c =>
                    c.id === largeCategoryId
                        ? { ...c, smallCategories: [...c.smallCategories, { id: uuidv4(), name, tasks: [] }] }
                        : c
                )
            })),
            deleteSmallCategory: (largeCategoryId, smallCategoryId) => set((state) => ({
                categories: state.categories.map(c =>
                    c.id === largeCategoryId
                        ? { ...c, smallCategories: c.smallCategories.filter(sc => sc.id !== smallCategoryId) }
                        : c
                )
            })),
            editLargeCategory: (id, newName) => set((state) => ({
                categories: state.categories.map(c => c.id === id ? { ...c, name: newName } : c)
            })),
            editSmallCategory: (largeCategoryId, smallCategoryId, newName) => set((state) => ({
                categories: state.categories.map(c =>
                    c.id === largeCategoryId
                        ? { ...c, smallCategories: c.smallCategories.map(sc => sc.id === smallCategoryId ? { ...sc, name: newName } : sc) }
                        : c
                )
            })),
            addTask: (largeCategoryId, smallCategoryId, title, dueDate) => set((state) => {
                const newTask: Task = { id: uuidv4(), title, dueDate, isCompleted: false };
                const newCats = state.categories.map(c => {
                    if (c.id !== largeCategoryId) return c;
                    return {
                        ...c,
                        smallCategories: c.smallCategories.map(sc => {
                            if (sc.id !== smallCategoryId) return sc;
                            return { ...sc, tasks: sortTasksByDueDate([...sc.tasks, newTask]) };
                        })
                    };
                });
                return { categories: newCats };
            }),
            updateTask: (largeCategoryId, smallCategoryId, updatedTask) => set((state) => {
                const newCats = state.categories.map(c => {
                    if (c.id !== largeCategoryId) return c;
                    return {
                        ...c,
                        smallCategories: c.smallCategories.map(sc => {
                            if (sc.id !== smallCategoryId) return sc;
                            const updatedTasks = sc.tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
                            return { ...sc, tasks: sortTasksByDueDate(updatedTasks) };
                        })
                    };
                });
                return { categories: newCats };
            }),
            deleteTask: (largeCategoryId, smallCategoryId, taskId) => set((state) => {
                const newCats = state.categories.map(c => {
                    if (c.id !== largeCategoryId) return c;
                    return {
                        ...c,
                        smallCategories: c.smallCategories.map(sc => {
                            if (sc.id !== smallCategoryId) return sc;
                            return { ...sc, tasks: sc.tasks.filter(t => t.id !== taskId) };
                        })
                    };
                });
                return { categories: newCats };
            }),
            importData: (categories) => set(() => ({
                categories: sortAllTasksInCategories(categories),
                selectedLargeCategoryId: null
            })),
        }),
        {
            name: 'todo-app-storage',
            onRehydrateStorage: () => (state) => {
                if (state) {
                    state.categories = sortAllTasksInCategories(state.categories);
                }
            }
        }
    )
);

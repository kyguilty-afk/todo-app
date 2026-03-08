import { useState } from 'react';
import type { SmallCategory } from '../types';
import { TaskItem } from './TaskItem';
import { useTodoStore } from '../store/useTodoStore';
import { ChevronDown, ChevronRight, Plus, Trash2, Pencil, Check, X } from 'lucide-react';

type Props = {
    largeCategoryId: string;
    smallCategory: SmallCategory;
};

export const SmallCategoryItem = ({ largeCategoryId, smallCategory }: Props) => {
    const [isOpen, setIsOpen] = useState(true);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDate, setNewTaskDate] = useState('');

    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(smallCategory.name);

    const { addTask, deleteSmallCategory, editSmallCategory } = useTodoStore();

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;
        addTask(largeCategoryId, smallCategory.id, newTaskTitle, newTaskDate);
        setNewTaskTitle('');
        setNewTaskDate('');
    };

    const handleEditStart = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsEditing(true);
        setEditName(smallCategory.name);
    };

    const handleEditSubmit = (e: React.MouseEvent | React.KeyboardEvent) => {
        e.stopPropagation();
        if (editName.trim()) {
            editSmallCategory(largeCategoryId, smallCategory.id, editName.trim());
        }
        setIsEditing(false);
    };

    const handleEditCancel = (e: React.MouseEvent | React.KeyboardEvent) => {
        e.stopPropagation();
        setIsEditing(false);
    };

    return (
        <div id={`small-category-${smallCategory.id}`} className="small-category">
            <div className="category-header small-header" onClick={() => !isEditing && setIsOpen(!isOpen)}>
                {isEditing ? (
                    <div className="edit-inline-form flex-grow" onClick={(e) => e.stopPropagation()}>
                        <input
                            autoFocus
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="input-field input-small flex-grow"
                            style={{ padding: '0.2rem 0.5rem' }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleEditSubmit(e);
                                if (e.key === 'Escape') handleEditCancel(e);
                            }}
                        />
                        <button className="icon-btn check-btn" onClick={handleEditSubmit}>
                            <Check size={16} className="icon-success" />
                        </button>
                        <button className="icon-btn delete-btn" onClick={handleEditCancel}>
                            <X size={16} />
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="category-title">
                            {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                            <h4>{smallCategory.name}</h4>
                            <span className="badge">{smallCategory.tasks.length}</span>
                        </div>
                        <div style={{ display: 'flex' }}>
                            <button
                                className="icon-btn edit-btn-small"
                                onClick={handleEditStart}
                                title="小カテゴリ名を変更"
                            >
                                <Pencil size={14} />
                            </button>
                            <button
                                className="icon-btn delete-btn"
                                onClick={(e) => { e.stopPropagation(); deleteSmallCategory(largeCategoryId, smallCategory.id); }}
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </>
                )}
            </div>

            {isOpen && !isEditing && (
                <div className="category-body small-body">
                    <div className="task-list">
                        {smallCategory.tasks.map(task => (
                            <TaskItem
                                key={task.id}
                                largeCategoryId={largeCategoryId}
                                smallCategoryId={smallCategory.id}
                                task={task}
                            />
                        ))}
                    </div>

                    <form className="add-form task-form" onSubmit={handleAddTask}>
                        <input
                            type="text"
                            placeholder="新しいタスク..."
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            className="input-field flex-grow"
                        />
                        <input
                            type="date"
                            value={newTaskDate}
                            onChange={(e) => setNewTaskDate(e.target.value)}
                            className="input-field date-input"
                        />
                        <button type="submit" className="add-btn" disabled={!newTaskTitle.trim()}>
                            <Plus size={16} /> 追加
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

import { useState } from 'react';
import type { Task } from '../types';
import { useTodoStore } from '../store/useTodoStore';
import { Calendar, Trash2, CheckCircle, Circle, Pencil, Check, X } from 'lucide-react';

type Props = {
    largeCategoryId: string;
    smallCategoryId: string;
    task: Task;
};

export const TaskItem = ({ largeCategoryId, smallCategoryId, task }: Props) => {
    const { updateTask, deleteTask } = useTodoStore();
    const [isHovered, setIsHovered] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(task.title);
    const [editDate, setEditDate] = useState(task.dueDate);

    const toggleComplete = () => {
        updateTask(largeCategoryId, smallCategoryId, { ...task, isCompleted: !task.isCompleted });
    };

    const handleDelete = () => {
        deleteTask(largeCategoryId, smallCategoryId, task.id);
    };

    const handleEditSave = () => {
        if (editTitle.trim()) {
            updateTask(largeCategoryId, smallCategoryId, { ...task, title: editTitle.trim(), dueDate: editDate });
        }
        setIsEditing(false);
    };

    const handleEditCancel = () => {
        setEditTitle(task.title);
        setEditDate(task.dueDate);
        setIsEditing(false);
    };

    // Due date check: discard time for purely date-based comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = task.dueDate ? new Date(task.dueDate) : null;
    const isOverdue = dueDate && dueDate < today && !task.isCompleted;

    return (
        <div
            className={`task-item ${task.isCompleted ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}`}
            onMouseEnter={() => !isEditing && setIsHovered(true)}
            onMouseLeave={() => !isEditing && setIsHovered(false)}
        >
            <button className="icon-btn check-btn" onClick={toggleComplete}>
                {task.isCompleted ? <CheckCircle className="icon-success" size={20} /> : <Circle className="icon-muted" size={20} />}
            </button>
            {isEditing ? (
                <div className="edit-inline-form flex-grow" style={{ flexDirection: 'row', gap: '0.5rem' }}>
                    <input
                        autoFocus
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="input-field input-small flex-grow"
                        style={{ padding: '0.2rem 0.5rem' }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleEditSave();
                            if (e.key === 'Escape') handleEditCancel();
                        }}
                    />
                    <input
                        type="date"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        className="input-field input-small date-input"
                        style={{ padding: '0.2rem 0.5rem', width: 'auto' }}
                    />
                    <button className="icon-btn check-btn" onClick={handleEditSave}>
                        <Check size={16} className="icon-success" />
                    </button>
                    <button className="icon-btn delete-btn" onClick={handleEditCancel}>
                        <X size={16} />
                    </button>
                </div>
            ) : (
                <>
                    <div className="task-content">
                        <span className="task-title">{task.title}</span>
                        {task.dueDate && (
                            <span className={`task-date ${isOverdue ? 'text-danger' : 'text-muted'}`}>
                                <Calendar size={14} />
                                {task.dueDate}
                            </span>
                        )}
                    </div>
                    {isHovered && (
                        <div style={{ display: 'flex' }}>
                            <button className="icon-btn edit-btn-small" onClick={() => setIsEditing(true)} title="タスクを編集">
                                <Pencil size={14} />
                            </button>
                            <button className="icon-btn delete-btn" onClick={handleDelete} title="タスクを削除">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

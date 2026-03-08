import { useState } from 'react';
import type { LargeCategory } from '../types';
import { SmallCategoryItem } from './SmallCategoryItem';
import { useTodoStore } from '../store/useTodoStore';
import { ChevronDown, ChevronRight, Plus, Trash2, Folder } from 'lucide-react';

type Props = {
    largeCategory: LargeCategory;
};

export const LargeCategoryItem = ({ largeCategory }: Props) => {
    const [isOpen, setIsOpen] = useState(true);
    const [newSmallCategoryName, setNewSmallCategoryName] = useState('');

    const { addSmallCategory, deleteLargeCategory } = useTodoStore();

    const handleAddSmallCategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSmallCategoryName.trim()) return;
        addSmallCategory(largeCategory.id, newSmallCategoryName);
        setNewSmallCategoryName('');
    };

    const tasksCount = largeCategory.smallCategories.reduce((acc, cat) => acc + cat.tasks.length, 0);

    return (
        <div className="large-category card glass">
            <div className="category-header large-header" onClick={() => setIsOpen(!isOpen)}>
                <div className="category-title">
                    {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                    <Folder className="icon-folder" size={20} />
                    <h3>{largeCategory.name}</h3>
                    <span className="badge badge-primary">{tasksCount} Tasks</span>
                </div>
                <button
                    className="icon-btn delete-btn"
                    onClick={(e) => { e.stopPropagation(); deleteLargeCategory(largeCategory.id); }}
                >
                    <Trash2 size={18} />
                </button>
            </div>

            {isOpen && (
                <div className="category-body large-body">
                    <div className="small-category-list">
                        {largeCategory.smallCategories.map(sc => (
                            <SmallCategoryItem
                                key={sc.id}
                                largeCategoryId={largeCategory.id}
                                smallCategory={sc}
                            />
                        ))}
                    </div>

                    <form className="add-form" onSubmit={handleAddSmallCategory}>
                        <input
                            type="text"
                            placeholder="新しい小カテゴリ..."
                            value={newSmallCategoryName}
                            onChange={(e) => setNewSmallCategoryName(e.target.value)}
                            className="input-field flex-grow"
                        />
                        <button type="submit" className="add-btn" disabled={!newSmallCategoryName.trim()}>
                            <Plus size={16} /> 小カテゴリ追加
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

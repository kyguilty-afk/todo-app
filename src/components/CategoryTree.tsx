import { useState } from 'react';
import { useTodoStore } from '../store/useTodoStore';
import { LargeCategoryItem } from './LargeCategoryItem';
import { Plus } from 'lucide-react';

export const CategoryTree = () => {
    const { categories, addLargeCategory } = useTodoStore();
    const [newLargeCategoryName, setNewLargeCategoryName] = useState('');

    const handleAddLargeCategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newLargeCategoryName.trim()) return;
        addLargeCategory(newLargeCategoryName);
        setNewLargeCategoryName('');
    };

    return (
        <div className="category-tree">
            <form className="add-form large-add-form card glass" onSubmit={handleAddLargeCategory}>
                <input
                    type="text"
                    placeholder="新しい大カテゴリを作成..."
                    value={newLargeCategoryName}
                    onChange={(e) => setNewLargeCategoryName(e.target.value)}
                    className="input-field input-large flex-grow"
                />
                <button type="submit" className="add-btn btn-primary" disabled={!newLargeCategoryName.trim()}>
                    <Plus size={20} /> 大カテゴリ追加
                </button>
            </form>

            <div className="large-categories-container">
                {categories.length === 0 ? (
                    <div className="empty-state glass card">
                        <p>カテゴリがありません。新しい大カテゴリを作成して始めましょう！</p>
                    </div>
                ) : (
                    categories.map(category => (
                        <LargeCategoryItem key={category.id} largeCategory={category} />
                    ))
                )}
            </div>
        </div>
    );
};

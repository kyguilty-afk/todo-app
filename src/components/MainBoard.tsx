import { useState } from 'react';
import { useTodoStore } from '../store/useTodoStore';
import { SmallCategoryItem } from './SmallCategoryItem';
import { Plus, Trash2, FolderOpen } from 'lucide-react';

export const MainBoard = () => {
    const { categories, selectedLargeCategoryId, deleteLargeCategory, addSmallCategory } = useTodoStore();
    const [newSmallCategoryName, setNewSmallCategoryName] = useState('');

    const selectedCategory = categories.find(c => c.id === selectedLargeCategoryId);

    if (!selectedCategory) {
        return (
            <div className="empty-board">
                <div className="empty-state glass card">
                    <FolderOpen size={48} className="icon-muted mb-4" />
                    <h2>カテゴリが選択されていません</h2>
                    <p>左側のサイドバーから大カテゴリを選択するか、新しく作成してください。</p>
                </div>
            </div>
        );
    }

    const handleAddSmallCategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSmallCategoryName.trim()) return;
        addSmallCategory(selectedCategory.id, newSmallCategoryName);
        setNewSmallCategoryName('');
    };

    const tasksCount = selectedCategory.smallCategories.reduce((acc, cat) => acc + cat.tasks.length, 0);

    return (
        <div className="main-board">
            <div className="board-header glass card">
                <div>
                    <h2 className="board-title">{selectedCategory.name}</h2>
                    <span className="badge badge-primary">{tasksCount} Tasks</span>
                </div>
                <button
                    className="icon-btn delete-btn"
                    onClick={() => deleteLargeCategory(selectedCategory.id)}
                    title="大カテゴリを削除"
                >
                    <Trash2 size={20} />
                </button>
            </div>

            <div className="board-content">
                <div className="small-category-list">
                    {selectedCategory.smallCategories.length === 0 ? (
                        <p className="text-muted text-center my-8">小カテゴリがありません。下のフォームから作成してください。</p>
                    ) : (
                        selectedCategory.smallCategories.map(sc => (
                            <SmallCategoryItem
                                key={sc.id}
                                largeCategoryId={selectedCategory.id}
                                smallCategory={sc}
                            />
                        ))
                    )}
                </div>

                <form className="add-form task-form" onSubmit={handleAddSmallCategory}>
                    <input
                        type="text"
                        placeholder="新しい小カテゴリを作成..."
                        value={newSmallCategoryName}
                        onChange={(e) => setNewSmallCategoryName(e.target.value)}
                        className="input-field flex-grow"
                    />
                    <button type="submit" className="add-btn btn-primary" disabled={!newSmallCategoryName.trim()}>
                        <Plus size={16} /> 小カテゴリ追加
                    </button>
                </form>
            </div>
        </div>
    );
};

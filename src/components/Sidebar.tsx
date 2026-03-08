import { useState, useEffect } from 'react';
import { get, set as setIDB } from 'idb-keyval';
import { useTodoStore } from '../store/useTodoStore';
import { LayoutList, Plus, Folder, FolderOpen, Download, Upload, RefreshCw, Pencil, Check, X } from 'lucide-react';

export const Sidebar = () => {
    const { categories, selectedLargeCategoryId, setSelectedLargeCategoryId, addLargeCategory, editLargeCategory, importData } = useTodoStore();
    const [newCategoryName, setNewCategoryName] = useState('');
    const [fileHandle, setFileHandle] = useState<any>(null);

    const [editingLargeId, setEditingLargeId] = useState<string | null>(null);
    const [editLargeName, setEditLargeName] = useState('');

    // マウント時に保存されたファイルハンドルがあるか（かつ許可済みか）チェック
    useEffect(() => {
        const checkStoredHandle = async () => {
            try {
                const handle = await get('nexus-todo-file-handle');
                if (handle) {
                    const permission = await handle.queryPermission({ mode: 'readwrite' });
                    if (permission === 'granted') {
                        setFileHandle(handle);
                    }
                }
            } catch (err) {
                console.error(err);
            }
        };
        checkStoredHandle();
    }, []);

    // 変更が発生するたびに自動保存を実行する副作用
    useEffect(() => {
        if (!fileHandle) return;
        const autoSaveToFile = async () => {
            try {
                const writable = await fileHandle.createWritable();
                await writable.write(JSON.stringify(categories, null, 2));
                await writable.close();
            } catch (error) {
                console.error('自動同期に失敗しました:', error);
            }
        };
        autoSaveToFile();
    }, [categories, fileHandle]);

    const handleAddCategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;
        addLargeCategory(newCategoryName);
        setNewCategoryName('');
    };

    const handleExport = () => {
        const dataStr = JSON.stringify(categories, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `nexus_todo_backup_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const parsed = JSON.parse(event.target?.result as string);
                importData(parsed);
            } catch (err) {
                alert('無効なJSONファイルです。復元できませんでした。');
            }
        };
        reader.readAsText(file);
        e.target.value = ''; // reset
    };

    const handleConnectAutoSave = async (forceNew = false) => {
        try {
            if (!('showSaveFilePicker' in window)) {
                alert('お使いのブラウザは自動同期に対応していません。ChromeかEdgeをご利用ください。');
                return;
            }

            if (!forceNew) {
                // まず保存済みのハンドルがあれば、権限復活を試みる（ブラウザ仕様上クリックなどのユーザー操作必須）
                const storedHandle = await get('nexus-todo-file-handle');
                if (storedHandle) {
                    try {
                        const permission = await storedHandle.requestPermission({ mode: 'readwrite' });
                        if (permission === 'granted') {
                            setFileHandle(storedHandle);
                            alert('以前のファイルへの同期を再開しました！');
                            return;
                        }
                    } catch (_e) {
                        // 権限取得失敗時は新規ファイル選択へ進む
                    }
                }
            }

            // @ts-ignore
            const handle = await window.showSaveFilePicker({
                suggestedName: 'nexus_todo_autosync.json',
                types: [{
                    description: 'JSON Backup',
                    accept: { 'application/json': ['.json'] },
                }],
            });
            await setIDB('nexus-todo-file-handle', handle);
            setFileHandle(handle);
            alert('自動同期を有効にしました！\nブラウザを開いている間、ここで指定したファイルにタスクがすべて自動上書き保存されます。');
        } catch (err) {
            console.error('Sync cancelled:', err);
        }
    };

    const handleEditLargeStart = (e: React.MouseEvent, id: string, name: string) => {
        e.stopPropagation();
        setEditingLargeId(id);
        setEditLargeName(name);
    };

    const handleEditLargeSubmit = (id: string) => {
        if (editLargeName.trim()) {
            editLargeCategory(id, editLargeName.trim());
        }
        setEditingLargeId(null);
    };

    const handleEditLargeCancel = () => {
        setEditingLargeId(null);
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="logo-container">
                    <LayoutList size={28} className="logo-icon" />
                    <h1>Nexus Todo</h1>
                </div>
            </div>

            <form className="sidebar-add-form" onSubmit={handleAddCategory}>
                <input
                    type="text"
                    placeholder="大カテゴリを追加..."
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="input-field flex-grow"
                />
                <button type="submit" className="icon-btn add-icon-btn" disabled={!newCategoryName.trim()}>
                    <Plus size={20} />
                </button>
            </form>

            <div className="sidebar-category-list">
                {categories.map(category => {
                    const isSelected = category.id === selectedLargeCategoryId;
                    const taskCount = category.smallCategories.reduce((acc, sum) => acc + sum.tasks.length, 0);

                    return (
                        <div key={category.id}>
                            <div
                                className={`sidebar-item ${isSelected ? 'active' : ''}`}
                                onClick={() => {
                                    if (editingLargeId !== category.id) {
                                        setSelectedLargeCategoryId(category.id);
                                    }
                                }}
                            >
                                {editingLargeId === category.id ? (
                                    <div className="edit-inline-form flex-grow" onClick={(e) => e.stopPropagation()}>
                                        <input
                                            autoFocus
                                            type="text"
                                            value={editLargeName}
                                            onChange={(e) => setEditLargeName(e.target.value)}
                                            className="input-field input-small width-full"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleEditLargeSubmit(category.id);
                                                if (e.key === 'Escape') handleEditLargeCancel();
                                            }}
                                        />
                                        <button className="icon-btn check-btn" onClick={() => handleEditLargeSubmit(category.id)}>
                                            <Check size={16} className="icon-success" />
                                        </button>
                                        <button className="icon-btn delete-btn" onClick={handleEditLargeCancel}>
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="sidebar-item-content">
                                            {isSelected ? <FolderOpen size={18} className="icon-folder-open" /> : <Folder size={18} className="icon-folder" />}
                                            <span className="sidebar-item-name">{category.name}</span>
                                            <button
                                                className="icon-btn edit-btn-small ml-auto"
                                                onClick={(e) => handleEditLargeStart(e, category.id, category.name)}
                                                title="大カテゴリ名を変更"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                        </div>
                                        <span className={`badge ${isSelected ? 'badge-primary' : ''}`}>{taskCount}</span>
                                    </>
                                )}
                            </div>
                            {/* 小カテゴリーへのジャンプメニュー */}
                            {isSelected && category.smallCategories.length > 0 && (
                                <div className="sidebar-subcategories">
                                    {category.smallCategories.map(sc => (
                                        <div
                                            key={sc.id}
                                            className="sidebar-subitem"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                document.getElementById(`small-category-${sc.id}`)?.scrollIntoView({ behavior: 'smooth' });
                                            }}
                                        >
                                            <span className="sidebar-subitem-name">- {sc.name}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="sidebar-footer">
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <button className="add-btn flex-grow" onClick={handleExport} title="現在のデータを1回保存">
                        <Download size={16} /> 保存
                    </button>
                    <label className="add-btn flex-grow text-center" style={{ cursor: 'pointer' }} title="保存したファイルから復元">
                        <Upload size={16} /> 復元
                        <input type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
                    </label>
                </div>
                {fileHandle ? (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            className="add-btn btn-primary flex-grow"
                            title="指定したローカルファイルに変更を常に自動保存（上書き）し続けます"
                            style={{ cursor: 'default' }}
                        >
                            <RefreshCw size={16} /> PCへ自動同期中
                        </button>
                        <button
                            className="icon-btn edit-btn-small"
                            onClick={() => handleConnectAutoSave(true)}
                            title="保存先のファイルを変更する"
                            style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '4px' }}
                        >
                            <FolderOpen size={16} />
                        </button>
                    </div>
                ) : (
                    <button
                        className="add-btn w-100"
                        onClick={() => handleConnectAutoSave()}
                        title="指定したローカルファイルに変更を常に自動保存（上書き）し続けます"
                    >
                        <RefreshCw size={16} /> PCファイルへの同期を再開/設定
                    </button>
                )}
            </div>
        </aside>
    );
};

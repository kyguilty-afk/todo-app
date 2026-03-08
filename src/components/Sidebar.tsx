import { useState, useEffect, useRef } from 'react';
import { get, set as setIDB } from 'idb-keyval';
import { useTodoStore } from '../store/useTodoStore';
import { LayoutList, Plus, Folder, FolderOpen, Download, RefreshCw, Pencil, Check, X } from 'lucide-react';

export const Sidebar = () => {
    const { categories, selectedLargeCategoryId, setSelectedLargeCategoryId, addLargeCategory, editLargeCategory, importData } = useTodoStore();
    const [newCategoryName, setNewCategoryName] = useState('');
    const [fileHandle, setFileHandle] = useState<any>(null);
    const [hasStoredHandle, setHasStoredHandle] = useState<boolean>(false);
    const skipNextSave = useRef(false);

    const [editingLargeId, setEditingLargeId] = useState<string | null>(null);
    const [editLargeName, setEditLargeName] = useState('');

    // マウント時に保存されたファイルハンドルがあるか（かつ許可済みか）チェック
    useEffect(() => {
        const checkStoredHandle = async () => {
            try {
                const handle = await get('nexus-todo-file-handle');
                if (handle) {
                    setHasStoredHandle(true);
                    const permission = await handle.queryPermission({ mode: 'readwrite' });
                    if (permission === 'granted') {
                        try {
                            const file = await handle.getFile();
                            const text = await file.text();
                            if (text.trim()) {
                                const parsed = JSON.parse(text);
                                skipNextSave.current = true;
                                importData(parsed);
                            }
                        } catch (readError) {
                            console.error('起動時の自動復元に失敗しました:', readError);
                        }
                        setFileHandle(handle);
                    }
                }
            } catch (err) {
                console.error(err);
            }
        };
        checkStoredHandle();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 変更が発生するたびに自動保存を実行する副作用
    useEffect(() => {
        if (!fileHandle) return;
        if (skipNextSave.current) {
            skipNextSave.current = false;
            return;
        }
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



    const handleConnectAutoSave = async (forceNew = false) => {
        try {
            if (!('showOpenFilePicker' in window)) {
                alert('お使いのブラウザは自動同期に対応していません。ChromeかEdgeをご利用ください。');
                return;
            }

            if (!forceNew) {
                // まず保存済みのハンドルがあれば、権限復活を試みる
                const storedHandle = await get('nexus-todo-file-handle');
                if (storedHandle) {
                    try {
                        const permission = await storedHandle.requestPermission({ mode: 'readwrite' });
                        if (permission === 'granted') {
                            try {
                                const file = await storedHandle.getFile();
                                const text = await file.text();
                                if (text.trim()) {
                                    const parsed = JSON.parse(text);
                                    skipNextSave.current = true;
                                    importData(parsed);
                                }
                            } catch (readError) {
                                console.error('ファイルの読み込みに失敗:', readError);
                                alert('ファイルの読み込みに失敗しました。データは復元されていません。');
                            }
                            setFileHandle(storedHandle);
                            return;
                        }
                    } catch (_e) {
                        // 権限取得キャンセルまたは失敗
                        return;
                    }
                }
            }

            // 新規または強制変更の場合
            // ファイルを選択（復元ファイルと自動保存ファイルを同じファイルにする）
            const isCreateNew = confirm("新しくファイルを作成して保存しますか？\n\n・[OK] 新規でファイルを作成\n・[キャンセル] 既存のファイルを選択して復元＆同期");

            let handle;
            if (isCreateNew) {
                // @ts-ignore
                handle = await window.showSaveFilePicker({
                    suggestedName: 'nexus_todo_autosync.json',
                    types: [{ description: 'JSON Backup', accept: { 'application/json': ['.json'] } }],
                });
                // 初期状態を即時保存するためskipNextSaveは不要
            } else {
                // @ts-ignore
                const [openHandle] = await window.showOpenFilePicker({
                    types: [{ description: 'JSON Backup', accept: { 'application/json': ['.json'] } }],
                });
                handle = openHandle;

                // 既存ファイルから読み込んで復元
                const file = await handle.getFile();
                const text = await file.text();
                if (text.trim()) {
                    const parsed = JSON.parse(text);
                    skipNextSave.current = true;
                    importData(parsed);
                }
            }

            await setIDB('nexus-todo-file-handle', handle);
            setFileHandle(handle);
            setHasStoredHandle(true);
            if (!isCreateNew) alert('指定したファイルからデータを復元し、自動同期を開始しました！');
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
                        <div
                            key={category.id}
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
                    );
                })}
            </div>

            <div className="sidebar-footer">
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <button className="add-btn flex-grow" onClick={handleExport} title="現在のデータを手動で1回ダウンロード">
                        <Download size={16} /> ダウンロード
                    </button>
                </div>

                {fileHandle ? (
                    <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(74, 222, 128, 0.1)', padding: '0.5rem', borderRadius: '4px' }}>
                        <button
                            className="flex-grow"
                            title="指定したローカルファイルに変更を常に自動保存（上書き）し続けます"
                            style={{ cursor: 'default', background: 'transparent', border: 'none', color: '#4ade80', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '14px', fontWeight: 'bold' }}
                        >
                            <RefreshCw size={16} /> 自動同期中
                        </button>
                        <button
                            className="icon-btn edit-btn-small"
                            onClick={() => handleConnectAutoSave(true)}
                            title="保存先ファイルを変更・別ファイルから復元"
                            style={{ background: 'rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '4px' }}
                        >
                            <FolderOpen size={16} />
                        </button>
                    </div>
                ) : hasStoredHandle ? (
                    <button
                        className="add-btn w-100"
                        onClick={() => handleConnectAutoSave(false)}
                        title="ブラウザ再起動時は自動復元にクリックが必要です"
                        style={{ background: '#ef4444', color: '#fff', fontWeight: 'bold' }}
                    >
                        <RefreshCw size={16} className="mr-2" /> 前回ファイルから復元して同期
                    </button>
                ) : (
                    <button
                        className="add-btn w-100"
                        onClick={() => handleConnectAutoSave(true)}
                        title="PCファイル(自動保存用)を指定して同期を設定します"
                        style={{ background: '#3b82f6', color: '#fff' }}
                    >
                        <RefreshCw size={16} /> PCファイルと同期 / 復元
                    </button>
                )}
            </div>
        </aside>
    );
};

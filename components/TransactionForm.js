import { useState, useEffect } from 'react';

export default function TransactionForm() {
  const [form, setForm] = useState({
    type: 'expense', // 'expense'/'income'で管理、送信時に変換
    date: new Date().toISOString().split('T')[0],
    amount: '',
    categoriesList: [],
    tag: '',
    memo: '',
    tagsList: [],
  });

  // コンポーネントマウント時にカテゴリ・タグ一覧を取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        // カテゴリ一覧取得
        const catRes = await fetch('/api/categories/all');
        const catData = await catRes.json();

        // tags一覧取得
        const tagRes = await fetch('/api/tags/all');
        const tagData = await tagRes.json();

        const categories = catData && catData.data.data.rows ? catData.data.data.rows.map((c) => c.name) : [];
        const tags = tagData && tagData.data.data.rows ? tagData.data.data.rows.map((t) => t.name) : [];

        setForm((prevForm) => ({
          ...prevForm,
          categoriesList: categories,
          tagsList: tags,
        }));
      } catch (error) {
        console.error('Failed to fetch categories/tags:', error);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleTypeChange = (type) => {
    setForm({ ...form, type });
  };

  const addCategory = () => {
    const newCategory = prompt('新しいカテゴリを入力してください:');
    if (newCategory && !form.categoriesList.includes(newCategory)) {
      setForm((prevForm) => ({
        ...prevForm,
        categoriesList: [...prevForm.categoriesList, newCategory],
        category: newCategory,
      }));
    }
  };

  const addTag = () => {
    const newTag = prompt('新しいタグを入力してください:');
    if (newTag && !form.tagsList.includes(newTag)) {
      setForm((prevForm) => ({
        ...prevForm,
        tagsList: [...prevForm.tagsList, newTag],
        tag: newTag,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // 必須項目のチェック
    if (!form.amount || !form.category || !form.date) {
      alert('必須項目（「金額」「種別（カテゴリ）」「日付」）が未入力です。');
      return;
    }

    // type変換: フロントendで'income'/'expense' => DB用に'収入'/'支出'
    const sendType = form.type === 'income' ? '収入' : '支出';

    const response = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: form.amount,
        type: sendType,
        categoryName: form.category,
        tagName: form.tag,
        memo: form.memo,
        date: form.date
      }),
    });

    if (response.ok) {
      alert('登録しました！');
      // ここで必要ならフォームリセット可能
      setForm((prev) => ({
        ...prev,
        amount: '',
        category: '',
        tag: '',
        memo: '',
      }));
    } else {
      alert('登録に失敗しました。');
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="space-y-2 text-sm max-w-md w-full mx-auto p-4"
      style={{ minHeight: '100vh' }} // 必要に応じて高さ調整
    >
      {/* 収入/支出の選択 */}
      <div className="flex justify-center space-x-2">
        <button
          type="button"
          onClick={() => handleTypeChange('income')}
          className={`px-4 py-2 rounded ${
            form.type === 'income' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          収入
        </button>
        <button
          type="button"
          onClick={() => handleTypeChange('expense')}
          className={`px-4 py-2 rounded ${
            form.type === 'expense' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          支出
        </button>
      </div>

      {/* 金額 */}
      <div>
        <label className="block text-xs font-medium text-gray-700">金額*</label>
        <input
          type="number"
          name="amount"
          value={form.amount}
          onChange={handleChange}
          className="w-full px-3 py-1 border rounded-md"
        />
      </div>

      {/* 種別（カテゴリ） */}
      <div>
        <label className="block text-xs font-medium text-gray-700">カテゴリ*</label>
        <div className="flex items-center space-x-2">
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="">選択してください</option>
              {form.categoriesList.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
          </select>
          <button
            type="button"
            onClick={addCategory}
            className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600"
            style={{ minWidth: '70px', height: '40px' }}
          >
            追加
          </button>
        </div>
      </div>

      {/* タグ */}
      <div>
        <label className="block text-xs font-medium text-gray-700">タグ</label>
        <div className="flex items-center space-x-2">
          <select
            name="tag"
            value={form.tag}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="">選択してください</option>
            {form.tagsList.map((tag, index) => (
              <option key={index} value={tag}>
                {tag}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={addTag}
            className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600"
            style={{ minWidth: '70px', height: '40px' }}
          >
            追加
          </button>
        </div>
      </div>

      {/* メモ */}
      <div>
        <label className="block text-xs font-medium text-gray-700">メモ</label>
        <textarea
          name="memo"
          value={form.memo}
          onChange={handleChange}
          className="w-full px-3 py-1 border rounded-md"
          rows="1"
          style={{ resize: 'none' }}
        />
      </div>

      {/* 日付 */}
      <div>
        <label className="block text-xs font-medium text-gray-700">日付*</label>
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          className="w-full px-3 py-1 border rounded-md"
        />
      </div>

      {/* 登録ボタン */}
      <button className="w-full px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600">
        登録
      </button>
    </form>
  );
}

// components/TransactionForm.js
import { useState, useEffect } from 'react'

export default function TransactionForm() {
  const [form, setForm] = useState({
    type: 'expense',   // 'expense' / 'income'
    date: new Date().toISOString().split('T')[0],
    amount: '',
    category: '',
    tag: '',
    memo: '',
  })
  const [categoriesList, setCategoriesList] = useState([])
  const [tagsList, setTagsList] = useState([])

  // カテゴリ・タグ一覧を取得
  useEffect(() => {
    async function fetchLists() {
      try {
        const [catRes, tagRes] = await Promise.all([
          fetch('/api/categories/all'),
          fetch('/api/tags/all'),
        ])
        if (!catRes.ok || !tagRes.ok) throw new Error('一覧取得に失敗しました')

        const [cats, tags] = await Promise.all([
          catRes.json(),
          tagRes.json(),
        ])
        setCategoriesList(cats.map((c) => c.name))
        setTagsList(tags.map((t) => t.name))
      } catch (err) {
        console.error(err)
      }
    }
    fetchLists()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleTypeChange = (type) => {
    setForm((prev) => ({ ...prev, type }))
  }

  // 新しいカテゴリを作成
  const addCategory = async () => {
    const name = prompt('新しいカテゴリを入力してください:')
    if (!name || categoriesList.includes(name)) return

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) throw new Error('カテゴリ作成に失敗しました')

      const created = await res.json()
      setCategoriesList((prev) => [...prev, created.name])
      setForm((prev) => ({ ...prev, category: created.name }))
    } catch (err) {
      console.error(err)
    }
  }

  // 新しいタグを作成
  const addTag = async () => {
    const name = prompt('新しいタグを入力してください:')
    if (!name || tagsList.includes(name)) return

    try {
      const res = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) throw new Error('タグ作成に失敗しました')

      const created = await res.json()
      setTagsList((prev) => [...prev, created.name])
      setForm((prev) => ({ ...prev, tag: created.name }))
    } catch (err) {
      console.error(err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.amount || !form.category || !form.date) {
      alert('必須項目（金額・カテゴリ・日付）を入力してください')
      return
    }

    const payload = {
      amount: form.amount,
      type: form.type === 'income' ? '収入' : '支出',
      categoryName: form.category,
      tagName: form.tag || undefined,
      memo: form.memo || undefined,
      date: form.date,
    }

    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('登録に失敗しました')

      alert('登録しました！')
      setForm((prev) => ({
        ...prev,
        amount: '',
        category: '',
        tag: '',
        memo: '',
      }))
    } catch (err) {
      console.error(err)
      alert('登録に失敗しました')
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-2 text-sm max-w-md w-full mx-auto p-4"
      style={{ minHeight: '100vh' }}
    >
      {/* 収入 / 支出 */}
      <div className="flex justify-center space-x-2">
        <button
          type="button"
          onClick={() => handleTypeChange('income')}
          className={`px-4 py-2 rounded ${
            form.type === 'income'
              ? 'bg-green-500 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          収入
        </button>
        <button
          type="button"
          onClick={() => handleTypeChange('expense')}
          className={`px-4 py-2 rounded ${
            form.type === 'expense'
              ? 'bg-red-500 text-white'
              : 'bg-gray-200 text-gray-700'
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

      {/* カテゴリ */}
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
            {categoriesList.map((c, i) => (
              <option key={i} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={addCategory}
            className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
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
            {tagsList.map((t, i) => (
              <option key={i} value={t}>
                {t}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={addTag}
            className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
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
  )
}

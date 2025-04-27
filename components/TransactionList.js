// components/TransactionList.js
import { useEffect, useState } from 'react'

export default function TransactionList() {
  const now = new Date()
  const [year, setYear] = useState(String(now.getFullYear()))
  const [month, setMonth] = useState(String(now.getMonth() + 1))
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchList() {
      setLoading(true)
      try {
        const params = new URLSearchParams({ year, month })
        const res = await fetch(`/api/transactions/list?${params.toString()}`)
        if (!res.ok) throw new Error('一覧取得失敗')
        const data = await res.json()
        setList(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchList()
  }, [year, month])

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <div className="flex space-x-2">
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          {[2023, 2024, 2025].map((y) => (
            <option key={y} value={y}>{y}年</option>
          ))}
        </select>
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={m}>{m}月</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              <th className="border px-2 py-1">日付</th>
              <th className="border px-2 py-1">種別</th>
              <th className="border px-2 py-1">カテゴリ</th>
              <th className="border px-2 py-1">タグ</th>
              <th className="border px-2 py-1">金額</th>
              <th className="border px-2 py-1">メモ</th>
            </tr>
          </thead>
          <tbody>
            {list.map((t) => (
              <tr key={t.id}>
                <td className="border px-2 py-1">{t.date}</td>
                <td className="border px-2 py-1">{t.type === 'INCOME' ? '収入' : '支出'}</td>
                <td className="border px-2 py-1">{t.category}</td>
                <td className="border px-2 py-1">{t.tag}</td>
                <td className="border px-2 py-1">{Number(t.amount).toLocaleString()}</td>
                <td className="border px-2 py-1">{t.memo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

// components/Chart.js
import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function Chart() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const [data, setData] = useState(null);
  const [year, setYear] = useState(String(currentYear));
  const [month, setMonth] = useState(String(currentMonth));
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState('');
  const [tagCondition, setTagCondition] = useState('only');

  // タグ一覧を取得
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await fetch('/api/tags/all');
        if (!res.ok) throw new Error('タグ一覧の取得に失敗しました');
        const tagList = await res.json(); // => [{ id, name }, ...]
        setTags(tagList.map((t) => t.name));
      } catch (error) {
        console.error(error);
      }
    };
    fetchTags();
  }, []);

  // トランザクション集計を取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = new URLSearchParams({ year, month });
        if (selectedTag) {
          params.append('tag', selectedTag);
          params.append('condition', tagCondition);
        }
        const res = await fetch(`/api/transactions?${params.toString()}`);
        if (!res.ok) throw new Error('データ取得に失敗しました');
        const json = await res.json();
        setData({
          categories: json.categories,
          income:     json.income,
          expense:    json.expense,
        });
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, [year, month, selectedTag, tagCondition]);

  if (!data) return <div>Loading...</div>;

  // Chart.js 用の色割り当て
  const baseColors = [
    'rgba(75,192,192,0.6)',   // teal
    'rgba(255,99,132,0.6)',   // pink
    'rgba(255,206,86,0.6)',   // yellow
    'rgba(54,162,235,0.6)',   // blue
    'rgba(153,102,255,0.6)',  // purple
    'rgba(201,203,207,0.6)',  // grey
    'rgba(255,159,64,0.6)',   // orange
    'rgba(255,99,71,0.6)',    // tomato
    'rgba(60,179,113,0.6)',   // mediumseagreen
    'rgba(218,112,214,0.6)',  // orchid
    'rgba(147,112,219,0.6)',  // mediumpurple
    'rgba(0,191,255,0.6)',    // deepskyblue
    'rgba(124,252,0,0.6)',    // lawngreen
    'rgba(255,20,147,0.6)',   // deeppink
  ];
  const assignColors = (arr) => arr.map((_, i) => baseColors[i % baseColors.length]);

  // 円グラフ用データ
  const incomeChartData = {
    labels: data.categories,
    datasets: [{ data: data.income, backgroundColor: assignColors(data.categories) }],
  };
  const expenseChartData = {
    labels: data.categories,
    datasets: [{ data: data.expense, backgroundColor: assignColors(data.categories) }],
  };
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: 10 },
    plugins: {
      legend: { display: false },
      title:  { display: false },
    },
  };

  // 該当月に実際に値があるカテゴリだけを抽出
  const presentCategories = data.categories.filter((_, idx) =>
    Number(data.income[idx] || 0) > 0 || Number(data.expense[idx] || 0) > 0
  );
  const legendColors = assignColors(presentCategories);

  const totalIncome  = data.income.reduce((sum, v) => sum + Number(v), 0);
  const totalExpense = data.expense.reduce((sum, v) => sum + Number(v), 0);

  const handleTagConditionChange = (e) => setTagCondition(e.target.value);

  return (
    <div className="w-full flex flex-col items-center p-4 space-y-4">
      {/* フィルター操作パネル */}
      <div className="max-w-md w-full p-4 bg-white rounded shadow space-y-4">
        <div className="flex space-x-2">
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-700">年</label>
            <select
              className="border rounded px-2 py-1"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            >
              {[2023, 2024, 2025].map((y) => (
                <option key={y} value={y}>{y}年</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-700">月</label>
            <select
              className="border rounded px-2 py-1"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>{m}月</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-medium text-gray-700">タグ</label>
          <div className="flex space-x-2 items-center">
            <select
              className="border rounded px-2 py-1 w-full"
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
            >
              <option value="">選択しない</option>
              {tags.map((t, i) => (
                <option key={i} value={t}>{t}</option>
              ))}
            </select>
            {selectedTag && (
              <div className="flex items-center space-x-1 text-xs">
                {['only', 'exclude'].map((cond) => (
                  <label key={cond} className="flex items-center space-x-1">
                    <input
                      type="radio"
                      name="tagCondition"
                      value={cond}
                      checked={tagCondition === cond}
                      onChange={handleTagConditionChange}
                    />
                    <span>{cond === 'only' ? 'のみ' : '以外'}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* カスタム凡例：該当月に存在するカテゴリのみ表示 */}
      <div className="max-w-2xl w-full bg-white p-4 rounded shadow space-y-2">
        <div className="flex justify-center space-x-4">
          {presentCategories.map((cat, i) => (
            <div key={i} className="flex items-center space-x-1">
              <div
                style={{
                  width: 12,
                  height: 12,
                  backgroundColor: legendColors[i],
                  borderRadius: 2,
                }}
              />
              <span className="text-xs">{cat}</span>
            </div>
          ))}
        </div>

        {/* 円グラフ表示 */}
        <div className="flex justify-around items-center">
          {[
            { title: '収入', total: totalIncome, chartData: incomeChartData },
            { title: '支出', total: totalExpense, chartData: expenseChartData },
          ].map(({ title, total, chartData }) => (
            <div
              key={title}
              className="flex flex-col items-center space-y-2"
              style={{ width: '45%' }}
            >
              <h3 className="text-sm font-medium">{title}</h3>
              <p className="text-sm font-medium">{total.toLocaleString()}円</p>
              <div className="relative" style={{ width: '100%', maxWidth: 200, height: 200 }}>
                <Pie data={chartData} options={pieOptions} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

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

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const tagRes = await fetch('/api/tags/all');
        const tagData = await tagRes.json();
        const tags = tagData && tagData.data?.data?.rows ? tagData.data.data.rows.map((t) => t.name) : [];
        setTags(tags);
      } catch (error) {
        console.error('Failed to fetch tags:', error);
      }
    };

    fetchTags();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const query = new URLSearchParams({
        year,
        month,
        tag: selectedTag,
        condition: tagCondition
      });

      try {
        const res = await fetch('/api/transactions?' + query.toString());
        const json = await res.json();

        setData({
          categories: json.categories || ["未分類"],
          income: json.income || [0],
          expense: json.expense || [0],
        });
      } catch (error) {
        console.error('Failed to fetch transaction data:', error);
      }
    };

    fetchData();
  }, [year, month, selectedTag, tagCondition]);

  if (!data) return <div>Loading...</div>;

  const colors = [
    'rgba(75, 192, 192, 0.6)',
    'rgba(255, 99, 132, 0.6)',
    'rgba(255, 206, 86, 0.6)',
    'rgba(54, 162, 235, 0.6)',
    'rgba(153, 102, 255, 0.6)',
    'rgba(201, 203, 207, 0.6)',
  ];

  // カテゴリごとに色を割り当てる
  const assignColors = (cats) => cats.map((_, i) => colors[i % colors.length]);
  const incomeColors = assignColors(data.categories);
  const expenseColors = assignColors(data.categories);

  const incomeChartData = {
    labels: data.categories,
    datasets: [
      {
        data: data.income,
        backgroundColor: incomeColors,
      },
    ],
  };

  const expenseChartData = {
    labels: data.categories,
    datasets: [
      {
        data: data.expense,
        backgroundColor: expenseColors,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: 10 },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false
      }
    },
  };

  const handleTagConditionChange = (e) => {
    setTagCondition(e.target.value);
  };

  // 凡例用のカテゴリ一覧（重複を除く）
  const allCats = new Set(data.categories);
  const uniqueCategories = Array.from(allCats);
  const legendColors = uniqueCategories.map((_, i) => colors[i % colors.length]);

  // 合計収入・合計支出を計算
  const totalIncome = data.income.reduce((acc, val) => acc + Number(val), 0);
  const totalExpense = data.expense.reduce((acc, val) => acc + Number(val), 0);

  return (
    <div className="w-full flex flex-col items-center p-4 space-y-4">
      <div className="max-w-md w-full p-4 bg-white rounded-md shadow-md space-y-4">
        <div className="flex space-x-2">
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-700">年</label>
            <select 
              className="border rounded px-2 py-1"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            >
              <option value="2023">2023年</option>
              <option value="2024">2024年</option>
              <option value="2025">2025年</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-700">月</label>
            <select 
              className="border rounded px-2 py-1"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            >
              {Array.from({length: 12}, (_, i) => i + 1).map(m => (
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
              <option value="">選択してください</option>
              {tags.map((tag, idx) => (
                <option key={idx} value={tag}>{tag}</option>
              ))}
            </select>
            <div className="flex items-center space-x-1 text-xs">
              <label className="flex items-center space-x-1">
                <input 
                  type="radio" 
                  name="tagCondition" 
                  value="only" 
                  checked={tagCondition === 'only'}
                  onChange={handleTagConditionChange}
                />
                <span>のみ</span>
              </label>
              <label className="flex items-center space-x-1">
                <input 
                  type="radio" 
                  name="tagCondition" 
                  value="exclude"
                  checked={tagCondition === 'exclude'}
                  onChange={handleTagConditionChange}
                />
                <span>以外</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* カスタム凡例 */}
      <div className="max-w-2xl w-full bg-white p-4 rounded-md shadow-md space-y-2">
        <div className="flex justify-center space-x-4">
          {uniqueCategories.map((cat, i) => (
            <div key={i} className="flex items-center space-x-1">
              <div style={{ width: '12px', height: '12px', backgroundColor: legendColors[i], borderRadius: '2px' }}></div>
              <span className="text-xs">{cat}</span>
            </div>
          ))}
        </div>
        
        <div className="max-w-2xl w-full bg-white p-4 rounded-md shadow-md flex justify-around items-center" 
             style={{ overflow: 'visible' }}>
          <div className="flex flex-col items-center space-y-2" style={{ width: '45%', overflow: 'hidden' }}>
            <h3 className="text-center text-sm font-medium mb-2">収入</h3>
            <p className="text-sm font-medium">{totalIncome.toLocaleString()}円</p> {/* 収入合計額表示 */}
            <div className="relative" style={{ width: '100%', maxWidth: '200px', height: 'auto' }}>
              <Pie data={incomeChartData} options={pieOptions} />
            </div>
          </div>
          <div className="flex flex-col items-center space-y-2" style={{ width: '45%', overflow: 'hidden' }}>
            <h3 className="text-center text-sm font-medium mb-2">支出</h3>
            <p className="text-sm font-medium">{totalExpense.toLocaleString()}円</p> {/* 支出合計額表示 */}
            <div className="relative" style={{ width: '100%', maxWidth: '200px', height: 'auto' }}>
              <Pie data={expenseChartData} options={pieOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

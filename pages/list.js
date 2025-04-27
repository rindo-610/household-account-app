// pages/list.js
import Navbar from '../components/Navbar'
import TransactionList from '../components/TransactionList'

export default function ListPage() {
  return (
    <div>
      <Navbar />
      <div className="flex justify-center bg-gray-100 py-4">
        <div className="p-6 bg-white rounded-md shadow-md">
          <TransactionList />
        </div>
      </div>
    </div>
  )
}

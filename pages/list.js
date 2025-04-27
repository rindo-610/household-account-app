// pages/list.js
import Navbar from '../components/Navbar'
import TransactionList from '../components/TransactionList'
import { getServerSession } from 'next-auth/next'
import { authOptions } from './api/auth/[...nextauth]'

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions)
  if (!session) {
    return {
      redirect: {
        destination: '/api/auth/signin', // NextAuth のサインイン画面
        permanent: false,
      },
    }
  }
  return { props: {} }
}

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

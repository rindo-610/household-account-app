import Navbar from '../components/Navbar';
import TransactionForm from '../components/TransactionForm';
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

export default function Register() {
  return (
    <div>
      <Navbar />
      <div className="flex justify-center bg-gray-100 py-4">
        <div className="p-6 bg-white rounded-md shadow-md">
          {/* <h1 className="text-2xl font-bold mb-4">収入/支出の登録</h1> */}
          <TransactionForm />
        </div>
      </div>
    </div>
  );
}

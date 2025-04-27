import Navbar from '../components/Navbar';
import Chart from '../components/Chart';
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

export default function Analysis() {
  return (
    <div>
      <Navbar />
      <div className="p-6">
        <div className="mt-6">
          <Chart />
        </div>
      </div>
    </div>
  );
}

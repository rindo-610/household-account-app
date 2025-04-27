// pages/protected.js
import { getSession } from 'next-auth/react'

export default function ProtectedPage({ user }) {
  return <p>Hello {user.name}, このページはログインが必要です。</p>
}

export async function getServerSideProps(ctx) {
  const session = await getSession(ctx)
  if (!session) {
    return {
      redirect: { destination: '/api/auth/signin', permanent: false }
    }
  }
  return { props: { user: session.user } }
}

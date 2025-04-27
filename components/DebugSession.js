// components/DebugSession.js
import { useEffect } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'

export default function DebugSession() {
  // data: session 情報、status: 'loading' | 'authenticated' | 'unauthenticated'
  const { data: session, status } = useSession()

  useEffect(() => {
    console.log('useSession status:', status)
    console.log('session object:', session)
  }, [status, session])

  if (status === 'loading') {
    return <p>Loading session...</p>
  }

  if (!session) {
    return (
      <div>
        <p>未ログインです。</p>
        <button onClick={() => signIn('github')} className="btn">
          GitHubでログイン
        </button>
      </div>
    )
  }

  return (
    <div>
      <p>ログイン中のユーザー情報:</p>
      <pre className="bg-gray-100 p-2 rounded">
        {JSON.stringify(session, null, 2)}
      </pre>
      <button onClick={() => signOut()} className="btn mt-2">
        ログアウト
      </button>
    </div>
  )
}

// components/LoginButton.js
import { signIn, signOut, useSession } from 'next-auth/react'

export default function LoginButton() {
  const { data: session, status } = useSession()
  if (status === 'loading') return null

  if (session) {
    return (
      <div className="flex items-center space-x-2">
        <span>ようこそ、{session.user.name}さん</span>
        <button onClick={() => signOut()} className="text-sm text-white bg-red-500 px-2 py-1 rounded">
          ログアウト
        </button>
      </div>
    )
  }
  return (
    <button onClick={() => signIn('github')} className="text-sm text-white bg-green-500 px-2 py-1 rounded">
      GitHubでログイン
    </button>
  )
}

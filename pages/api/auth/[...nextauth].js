import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

export const authOptions = {
  providers: [
    GoogleProvider({
        clientId:     process.env.GOOGLE_ID,
        clientSecret: process.env.GOOGLE_SECRET,
      }),
  ],
  session: {
    strategy: 'jwt',
    // セッションの有効期限を 30 日に設定（デフォルトは 30 日）
    maxAge: 60 * 60 * 24 * 30,
    // 例えば 24 時間ごとにトークンの有効期限を延長する
    updateAge: 60 * 60 * 24,
  },
  
  jwt: {
    // JWT 自体の有効期限を 30 日に設定
    maxAge: 60 * 60 * 24 * 30,
  },

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    // OAuth サインイン時に profile.id (Google の内部ユーザーID) を token.id に保存
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.id = profile.sub
      }
      return token
    },
    // クライアントに返す session.user に token.id をセット
    async session({ session, token }) {
      session.user.id = token.id
      return session
    },
  },
}
export default NextAuth(authOptions)

'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ProfilePage() {
  const [userInfo, setUserInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUserInfo = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Get access token from session
      const tokenResponse = await fetch('/api/token', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!tokenResponse.ok) {
        throw new Error('Failed to get access token')
      }

      const tokenData = await tokenResponse.json()
      const accessToken = tokenData.access_token

      // Use access token to call /api/me
      const response = await fetch('/api/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch user info')
      }

      const data = await response.json()
      setUserInfo(data.user)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl font-bold mb-2">プロフィール情報</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
            /api/me エンドポイントからユーザー情報を取得
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 w-full max-w-2xl">
          <div className="mb-6">
            <button
              onClick={fetchUserInfo}
              disabled={loading}
              className="w-full rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm sm:text-base h-12 px-5"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  ユーザー情報取得中...
                </>
              ) : (
                'ユーザー情報を取得'
              )}
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-400">
                <span className="font-semibold">エラー:</span> {error}
              </p>
              <p className="text-xs text-red-600 dark:text-red-500 mt-2">
                ログインしていることを確認してください
              </p>
            </div>
          )}

          {userInfo && (
            <div className="bg-gray-100 dark:bg-gray-900/50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                ユーザー情報
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                  <span className="font-medium text-gray-600 dark:text-gray-400">ユーザーID:</span>
                  <span className="text-gray-900 dark:text-white font-mono text-sm">{userInfo.sub}</span>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                  <span className="font-medium text-gray-600 dark:text-gray-400">名前:</span>
                  <span className="text-gray-900 dark:text-white">{userInfo.name}</span>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                  <span className="font-medium text-gray-600 dark:text-gray-400">メールアドレス:</span>
                  <span className="text-gray-900 dark:text-white">{userInfo.email}</span>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                  <span className="font-medium text-gray-600 dark:text-gray-400">メール認証:</span>
                  <span className={userInfo.email_verified ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                    {userInfo.email_verified ? '認証済み' : '未認証'}
                  </span>
                </div>
                
                {userInfo.picture && (
                  <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                    <span className="font-medium text-gray-600 dark:text-gray-400">プロフィール画像:</span>
                    <img 
                      src={userInfo.picture} 
                      alt="Profile" 
                      className="w-12 h-12 rounded-full border-2 border-gray-200 dark:border-gray-600"
                    />
                  </div>
                )}
                
                <div className="flex items-center justify-between py-3">
                  <span className="font-medium text-gray-600 dark:text-gray-400">最終更新:</span>
                  <span className="text-gray-900 dark:text-white text-sm">
                    {userInfo.updated_at ? new Date(userInfo.updated_at).toLocaleDateString('ja-JP') : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-center mt-4">
          <Link
            href="/"
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            ← トップページに戻る
          </Link>
        </div>
      </main>
    </div>
  )
}
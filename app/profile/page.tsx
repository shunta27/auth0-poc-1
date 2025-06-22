'use client'

import { useState } from 'react'
import Link from 'next/link'

interface TokenData {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  expires_in?: number;
  token_type?: string;
  scope?: string;
}

interface UserInfo {
  sub: string;
  name: string;
  email: string;
  picture?: string;
  email_verified: boolean;
  updated_at?: string;
}

export default function ProfilePage() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [tokenData, setTokenData] = useState<TokenData | null>(null)
  const [loading, setLoading] = useState(false)
  const [refreshLoading, setRefreshLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTokens = async () => {
    try {
      const tokenResponse = await fetch('/api/token', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!tokenResponse.ok) {
        throw new Error('Failed to get tokens')
      }

      const tokens = await tokenResponse.json()
      setTokenData(tokens)
      return tokens
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to fetch tokens')
    }
  }

  const fetchUserInfo = async (accessToken?: string) => {
    setLoading(true)
    setError(null)
    
    try {
      let tokens = tokenData
      
      // Get tokens if not provided
      if (!accessToken && !tokens) {
        tokens = await fetchTokens()
      }

      const token = accessToken || tokens?.access_token

      if (!token) {
        throw new Error('No access token available')
      }

      // Use access token to call /api/me
      const response = await fetch('/api/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error_description || errorData.error || 'Failed to fetch user info')
      }

      const data = await response.json()
      setUserInfo(data.user)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const refreshToken = async () => {
    if (!tokenData?.refresh_token) {
      setError('No refresh token available')
      return
    }

    setRefreshLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: tokenData.refresh_token
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error_description || errorData.error || 'Failed to refresh token')
      }

      const newTokens = await response.json()
      setTokenData(prev => ({ ...prev, ...newTokens }))
      
      // Automatically fetch user info with new token
      await fetchUserInfo(newTokens.access_token)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setRefreshLoading(false)
    }
  }

  const loadTokensOnly = async () => {
    setError(null)
    try {
      await fetchTokens()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tokens')
    }
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl font-bold mb-2">アクセストークン・リフレッシュトークンテスト</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
            Auth0のトークン管理とAPI認証のデモンストレーション
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 w-full max-w-4xl">
          {/* Control Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <button
              onClick={loadTokensOnly}
              className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-green-600 text-white hover:bg-green-700 font-medium text-sm sm:text-base h-12 px-5"
            >
              トークン取得
            </button>
            
            <button
              onClick={() => fetchUserInfo()}
              disabled={loading}
              className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm sm:text-base h-12 px-5"
            >
              {loading ? 'ユーザー情報取得中...' : 'ユーザー情報取得'}
            </button>
            
            <button
              onClick={refreshToken}
              disabled={refreshLoading || !tokenData?.refresh_token}
              className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm sm:text-base h-12 px-5"
            >
              {refreshLoading ? 'トークン更新中...' : 'トークン更新'}
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-400">
                <span className="font-semibold">エラー:</span> {error}
              </p>
            </div>
          )}

          {/* Token Information */}
          {tokenData && (
            <div className="mb-6 bg-gray-100 dark:bg-gray-900/50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                トークン情報
              </h2>
              
              <div className="space-y-4">
                <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
                  <span className="font-medium text-gray-600 dark:text-gray-400 block mb-2">アクセストークン:</span>
                  <code className="text-xs bg-white dark:bg-gray-800 p-2 rounded border text-gray-900 dark:text-white break-all block">
                    {tokenData.access_token ? `${tokenData.access_token.substring(0, 50)}...` : 'なし'}
                  </code>
                </div>
                
                <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
                  <span className="font-medium text-gray-600 dark:text-gray-400 block mb-2">リフレッシュトークン:</span>
                  <code className="text-xs bg-white dark:bg-gray-800 p-2 rounded border text-gray-900 dark:text-white break-all block">
                    {tokenData.refresh_token ? `${tokenData.refresh_token.substring(0, 50)}...` : 'なし'}
                  </code>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium text-gray-600 dark:text-gray-400">有効期限（秒）:</span>
                    <span className="text-gray-900 dark:text-white ml-2">{tokenData.expires_in || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600 dark:text-gray-400">トークンタイプ:</span>
                    <span className="text-gray-900 dark:text-white ml-2">{tokenData.token_type || 'N/A'}</span>
                  </div>
                </div>
                
                {tokenData.expires_at && (
                  <div>
                    <span className="font-medium text-gray-600 dark:text-gray-400">有効期限:</span>
                    <span className="text-gray-900 dark:text-white ml-2">
                      {new Date(tokenData.expires_at * 1000).toLocaleString('ja-JP')}
                    </span>
                  </div>
                )}
                
                {tokenData.scope && (
                  <div>
                    <span className="font-medium text-gray-600 dark:text-gray-400">スコープ:</span>
                    <span className="text-gray-900 dark:text-white ml-2">{tokenData.scope}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* User Information */}
          {userInfo && (
            <div className="bg-gray-100 dark:bg-gray-900/50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                ユーザー情報（/api/me から取得）
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
                    {userInfo.updated_at ? new Date(userInfo.updated_at).toLocaleString('ja-JP') : 'N/A'}
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
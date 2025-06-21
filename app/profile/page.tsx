'use client'

import { useState } from 'react'

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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Profile Information
          </h1>

          <div className="mb-6">
            <button
              onClick={fetchUserInfo}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {loading ? 'Loading...' : 'Fetch User Info'}
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">
                <span className="font-semibold">Error:</span> {error}
              </p>
              <p className="text-red-600 text-xs mt-2">
                Make sure you are logged in and have a valid access token
              </p>
            </div>
          )}

          {userInfo && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                User Information
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="font-medium text-gray-600">ID:</span>
                  <span className="text-gray-900">{userInfo.sub}</span>
                </div>
                
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="font-medium text-gray-600">Name:</span>
                  <span className="text-gray-900">{userInfo.name}</span>
                </div>
                
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="font-medium text-gray-600">Email:</span>
                  <span className="text-gray-900">{userInfo.email}</span>
                </div>
                
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="font-medium text-gray-600">Email Verified:</span>
                  <span className={userInfo.email_verified ? 'text-green-600' : 'text-red-600'}>
                    {userInfo.email_verified ? 'Yes' : 'No'}
                  </span>
                </div>
                
                {userInfo.picture && (
                  <div className="py-2">
                    <span className="font-medium text-gray-600 block mb-2">Profile Picture:</span>
                    <img 
                      src={userInfo.picture} 
                      alt="Profile" 
                      className="w-16 h-16 rounded-full"
                    />
                  </div>
                )}
                
                <div className="flex justify-between py-2">
                  <span className="font-medium text-gray-600">Last Updated:</span>
                  <span className="text-gray-900">
                    {userInfo.updated_at ? new Date(userInfo.updated_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 text-center">
            <a 
              href="/"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
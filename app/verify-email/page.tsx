import Link from "next/link";

export default function VerifyEmail() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl font-bold mb-2">メール確認</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
            アカウントが正常に作成されました
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 w-full max-w-md text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 4.1c.59.31 1.28.31 1.87 0L21 8m-18 4v8a2 2 0 002 2h12a2 2 0 002-2v-8M5 10V6a2 2 0 012-2h10a2 2 0 012-2v4"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              検証メールを送信しました
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              登録されたメールアドレスに確認メールを送信しました。
              メール内のリンクをクリックしてアカウントを有効化してください。
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
            <p className="text-sm text-blue-800 dark:text-blue-400">
              <strong>注意:</strong>{" "}
              メールが届かない場合は、スパムフォルダもご確認ください。
            </p>
          </div>

          <div className="space-y-3">
            <Link
              href="/auth/login"
              className="w-full rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-blue-600 text-white hover:bg-blue-700 font-medium text-sm sm:text-base h-12 px-5"
            >
              ログインページへ
            </Link>
            <Link
              href="/"
              className="w-full rounded-full border border-solid border-gray-300 dark:border-gray-600 transition-colors flex items-center justify-center bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium text-sm sm:text-base h-12 px-5"
            >
              トップページへ戻る
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

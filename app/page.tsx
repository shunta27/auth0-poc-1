import { auth0 } from "../lib/auth0";

export default async function Home() {
  const session = await auth0.getSession();

  if (!session) {
    return (
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-bold mb-4">Auth0 PoC</h1>
            <p className="text-lg mb-8 text-gray-600 dark:text-gray-400">
              Next.js with Auth0 authentication
            </p>
          </div>

          <div className="flex gap-4 items-center flex-col sm:flex-row">
            <a
              className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-green-600 text-white hover:bg-green-700 font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
              href="/create-user"
            >
              ユーザー作成
            </a>
            <a
              className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-blue-600 text-white hover:bg-blue-700 font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
              href="/auth/login"
            >
              Log in
            </a>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl font-bold mb-2">
            Welcome, {session.user.name}!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
            You are successfully authenticated with Auth0
          </p>
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-8">
            <p className="text-sm font-mono">
              <strong>Email:</strong> {session.user.email}
            </p>
            <p className="text-sm font-mono">
              <strong>User ID:</strong> {session.user.sub}
            </p>
          </div>
        </div>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-red-600 text-white hover:bg-red-700 font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
            href="/auth/logout"
          >
            Log out
          </a>
        </div>
      </main>
    </div>
  );
}

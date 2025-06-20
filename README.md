# Auth0 検証プロジェクト (PoC)

このリポジトリは、Next.js を利用した Auth0 の検証・PoC を行うプロジェクトです。

## 技術スタック

- **Next.js 15.3.4** (App Router)
- **TypeScript** (strict mode)
- **Tailwind CSS v4**
- **Auth0 Next.js SDK v4.6.1**
- **Node.js 20 LTS**

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Auth0 設定

Auth0 ダッシュボードでアプリケーションを作成し、以下の設定を行ってください：

- **Application Type**: Regular Web Application
- **Allowed Callback URLs**: `https://127.0.0.1:3000/auth/callback`
- **Allowed Logout URLs**: `https://127.0.0.1:3000`

### 3. 環境変数の設定

`.env.local` ファイルを作成し、Auth0 の設定値を入力してください：

```bash
AUTH0_DOMAIN=your-auth0-domain.auth0.com
AUTH0_CLIENT_ID=your-auth0-client-id
AUTH0_CLIENT_SECRET=your-auth0-client-secret
AUTH0_SECRET=your-32-character-secret-here
APP_BASE_URL=https://127.0.0.1:3000
```

`AUTH0_SECRET` は以下のコマンドで生成できます：
```bash
openssl rand -hex 32
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

アプリケーションは `https://127.0.0.1:3000` でアクセスできます。

**注意**: このプロジェクトでは Auth0 の認証フローテストのため、必ず `127.0.0.1` を使用し、`localhost` は使用しないでください。

## 利用可能なコマンド

- `npm run dev` - 開発サーバーを起動（HTTPS、127.0.0.1）
- `npm run build` - プロダクション用ビルド
- `npm run start` - プロダクションサーバーを起動
- `npm run lint` - ESLint によるコード品質チェック

## Auth0 機能

このプロジェクトでは以下の Auth0 機能を検証できます：

- ユーザー認証（ログイン・ログアウト）
- セッション管理
- ユーザー情報の取得

### 認証ルート

Auth0 SDK により以下のルートが自動で提供されます：

- `/auth/login` - ログインページ
- `/auth/logout` - ログアウト
- `/auth/callback` - Auth0 コールバック処理

## プロジェクト構成

```
├── app/
│   ├── page.tsx          # メインページ（認証ロジック含む）
│   └── layout.tsx        # レイアウトコンポーネント
├── lib/
│   └── auth0.ts          # Auth0 クライアント設定
├── middleware.ts         # Auth0 ミドルウェア
├── .env.local           # 環境変数（要作成）
└── certificates/        # HTTPS 証明書
```

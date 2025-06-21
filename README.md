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
# Auth0 Configuration
AUTH0_DOMAIN=your-auth0-domain.auth0.com
AUTH0_CLIENT_ID=your-auth0-client-id
AUTH0_CLIENT_SECRET=your-auth0-client-secret
AUTH0_SECRET=your-32-character-secret-here
APP_BASE_URL=https://localhost:3000
AUTH0_AUDIENCE=https://127.0.0.1:3000/
AUTH0_SCOPE=openid profile email

# Auth0 Management API Configuration
AUTH0_MANAGEMENT_CLIENT_ID=your-management-api-client-id
AUTH0_MANAGEMENT_CLIENT_SECRET=your-management-api-client-secret
AUTH0_MANAGEMENT_AUDIENCE=https://your-auth0-domain.auth0.com/api/v2/
AUTH0_CONNECTION_NAME=your-connection-name

# Mailtrap Configuration
MAILTRAP_API_KEY=your-mailtrap-api-key
MAILTRAP_SMTP_HOST=live.smtp.mailtrap.io
MAILTRAP_SMTP_PORT=587
MAILTRAP_FROM_EMAIL=noreply@your-domain.com
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
- Management API を使用したユーザー作成
- Mailtrap を使用したメール送信

### 認証ルート

Auth0 SDK により以下のルートが自動で提供されます：

- `/auth/login` - ログインページ
- `/auth/logout` - ログアウト
- `/auth/callback` - Auth0 コールバック処理

### API エンドポイント

#### ユーザー作成 API

Management API を使用してユーザーを作成できます：

```bash
curl -X POST https://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123!"
  }' \
  --insecure
```

**パラメータ:**

- `email` (必須): ユーザーのメールアドレス（user_id としても使用される）
- `password` (必須): ユーザーのパスワード
- `name` (オプション): ユーザーの表示名（未指定の場合はメールアドレスから生成）

**レスポンス例:**

```json
{
  "success": true,
  "user": {
    "user_id": "user@example.com",
    "email": "user@example.com",
    "name": "User Name",
    "created_at": "2023-12-01T00:00:00.000Z"
  }
}
```

#### メール送信 API

Mailtrap を使用してメールを送信できます：

**ウェルカムメール送信:**

```bash
curl -X POST https://localhost:3000/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "shunta27ichikawa@gmail.com",
    "name": "Test User",
    "type": "welcome"
  }' \
  --insecure
```

**カスタムメール送信:**

```bash
curl -X POST https://localhost:3000/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "user@example.com",
    "subject": "Test Email",
    "text": "This is a test email",
    "html": "<h1>Test Email</h1><p>This is a test email</p>"
  }' \
  --insecure
```

**パラメータ:**

**ウェルカムメール (`type: "welcome"`):**

- `to` (必須): 送信先メールアドレス
- `name` (必須): ユーザー名
- `type` (必須): "welcome" を指定

**カスタムメール:**

- `to` (必須): 送信先メールアドレス
- `subject` (必須): メール件名
- `text` (オプション): プレーンテキスト本文
- `html` (オプション): HTML 形式本文

**レスポンス例:**

```json
{
  "success": true,
  "message": "Email sent successfully"
}
```

## プロジェクト構成

```
├── app/
│   ├── api/
│   │   ├── users/        # ユーザー作成 API
│   │   └── send-email/   # メール送信 API
│   ├── page.tsx          # メインページ（認証ロジック含む）
│   └── layout.tsx        # レイアウトコンポーネント
├── lib/
│   ├── auth0.ts          # Auth0 クライアント設定
│   ├── auth0-management.ts # Auth0 Management API 設定
│   └── mailer.ts         # メール送信ユーティリティ
├── middleware.ts         # Auth0 ミドルウェア
├── .env.local           # 環境変数（要作成）
└── certificates/        # HTTPS 証明書
```

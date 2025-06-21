# Auth0 認証アーキテクチャ詳細

## プロジェクト概要

Next.js 15.3.4 + Auth0 を使用した認証機能付き PoC アプリケーション。カスタムユーザー登録とメール検証機能を含む。

## システム構成

### 開発環境

- **URL**: `https://localhost:3000` (localhost ではなく localhost を使用)
- **プロトコル**: HTTPS 必須 (Auth0 認証に必要)
- **証明書**: `/certificates/` ディレクトリに配置

### 主要技術スタック

- **Framework**: Next.js 15.3.4 (App Router)
- **Language**: TypeScript (strict mode)
- **Authentication**: Auth0 Next.js SDK v4.6.1
- **Email**: Mailtrap SMTP
- **Styling**: Tailwind CSS v4

## ファイル構成と役割

### 認証コア

| ファイル                  | 役割                   | 説明                         |
| ------------------------- | ---------------------- | ---------------------------- |
| `lib/auth0.ts`            | Auth0 クライアント設定 | メインの Auth0 SDK 設定      |
| `middleware.ts`           | ルート保護             | 全ページに認証チェックを適用 |
| `lib/auth0-management.ts` | Management API         | ユーザー管理操作用           |

### API エンドポイント

| エンドポイント      | メソッド | 機能                      |
| ------------------- | -------- | ------------------------- |
| `/api/users`        | POST     | カスタムユーザー登録      |
| `/api/verify-email` | GET      | メール検証処理            |
| `/auth/login`       | GET      | Auth0 ログイン (自動)     |
| `/auth/logout`      | GET      | ログアウト (自動)         |
| `/auth/callback`    | GET      | OAuth コールバック (自動) |

### ユーティリティ

| ファイル        | 機能                   |
| --------------- | ---------------------- |
| `lib/mailer.ts` | Mailtrap メール送信    |
| `lib/jwt.ts`    | JWT トークン生成・検証 |

## 認証フロー詳細

### 1. 標準ログインフロー

```
ユーザー → ホームページ → ログインボタン → Auth0 → 認証 → コールバック → セッション作成 → ホームページ (認証済み)
```

**技術詳細:**

- `auth0.getSession()` でセッション状態確認
- Auth0 Hosted Login Page を使用
- OAuth 2.0 / OpenID Connect プロトコル
- セッション Cookie は Auth0 SDK が自動管理

### 2. カスタムユーザー登録フロー

```
登録リクエスト → Auth0 Management API → ユーザー作成 → JWT生成 → メール送信 → 完了通知
```

**詳細処理 (`app/api/users/route.ts`):**

```typescript
// 1. ユーザーデータ準備
const userData = {
  user_id: email,
  email,
  password,
  connection: "Username-Password-Authentication",
  name: name || email.split("@")[0],
  email_verified: false, // 重要: 未検証状態で作成
  verify_email: false,
};

// 2. Auth0でユーザー作成
const user = await managementClient.createUser(userData);

// 3. 検証トークン生成 (24時間有効)
const verificationToken = jwt.sign({ email }, JWT_SECRET, {
  expiresIn: "24h",
  issuer: "auth-poc",
  subject: email,
});

// 4. メール送信
await sendEmail({
  to: email,
  subject: "メールアドレスの確認",
  html: `<a href="${EMAIL_VERIFY_URL}?token=${verificationToken}">確認する</a>`,
});
```

### 3. メール検証フロー

```
メール受信 → リンククリック → JWT検証 → Auth0更新 → ログインページリダイレクト
```

**詳細処理 (`app/api/verify-email/route.ts`):**

```typescript
// 1. JWT トークン検証
const decoded = jwt.verify(token, JWT_SECRET, {
  issuer: "auth-poc",
  subject: email,
});

// 2. Auth0 でメール検証状態を更新
await managementClient.updateUser(
  { id: `auth0|${email}` },
  { email_verified: true }
);

// 3. ログインページにリダイレクト (email プリセット)
return NextResponse.redirect(`${APP_BASE_URL}/auth/login?login_hint=${email}`);
```

## セキュリティ実装

### 1. 環境変数管理

すべての機密情報は `.env.local` で管理:

```env
# Auth0 基本設定
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=app-client-id
AUTH0_CLIENT_SECRET=app-client-secret
AUTH0_SECRET=32-character-random-string

# Management API (ユーザー管理用)
AUTH0_MANAGEMENT_CLIENT_ID=mgmt-client-id
AUTH0_MANAGEMENT_CLIENT_SECRET=mgmt-client-secret
AUTH0_MANAGEMENT_AUDIENCE=https://your-domain.auth0.com/api/v2/

# JWT・メール設定
JWT_SECRET=jwt-signing-secret
MAILTRAP_API_KEY=mailtrap-key
EMAIL_VERIFY_URL=https://localhost:3000/api/verify-email
```

### 2. JWT セキュリティ

- **有効期限**: 24 時間で自動失効
- **署名検証**: `issuer` と `subject` を検証
- **用途限定**: メール検証のみに使用

### 3. HTTPS 強制

- 開発環境でも HTTPS を使用
- `localhost` を使用 (`localhost` ではない)
- Auth0 コールバック URL も HTTPS 必須

### 4. ルート保護

```typescript
// middleware.ts
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
```

- 静的ファイル以外はすべて認証チェック
- 未認証ユーザーは自動的にログインページにリダイレクト

## エラーハンドリング

### 1. ユーザー登録時のロールバック

メール送信失敗時は作成済みユーザーを削除:

```typescript
try {
  await sendEmail(emailData);
  return NextResponse.json({ message: "ユーザーが作成されました" });
} catch (emailError) {
  // ロールバック: Auth0からユーザーを削除
  await managementClient.deleteUser({ id: user.user_id });
  throw new Error("メール送信に失敗しました");
}
```

### 2. JWT 検証エラー

- トークン無効/期限切れ時はエラーページにリダイレクト
- 詳細なエラー情報はログに記録

### 3. Auth0 API エラー

- Management API の呼び出し失敗を適切にハンドリング
- レート制限やネットワークエラーに対応

## パフォーマンス最適化

### 1. セッション管理

- Auth0 SDK がセッション Cookie を効率的に管理
- サーバーサイドでのセッション確認を最小限に抑制

### 2. Middleware 最適化

- 静的ファイルは認証チェックをスキップ
- 必要なルートのみに認証を適用

### 3. JWT 処理

- 軽量な JWT ライブラリを使用
- トークン検証は最小限の処理で実行

## デバッグとモニタリング

### 1. ログ出力

```typescript
console.log("Auth0 user created:", user.user_id);
console.log("Email verification sent to:", email);
console.error("JWT verification failed:", error);
```

### 2. 開発ツール

- Auth0 Dashboard でユーザー状態を確認
- Mailtrap でメール送信をテスト
- ブラウザ開発者ツールでセッション Cookie を確認

### 3. エラー追跡

- 各段階でのエラー情報を詳細にログ出力
- ユーザー登録からログインまでの全フローを追跡可能

## 本番環境への準備

### 1. 環境変数の更新

- 本番用 Auth0 ドメイン・クライアント設定
- 本番用メール配信サービス設定
- セキュアな JWT_SECRET と AUTH0_SECRET

### 2. HTTPS 証明書

- 正式な SSL 証明書の設定
- ドメイン検証の完了

### 3. Auth0 ダッシュボード設定

```
Allowed Callback URLs: https://yourdomain.com/auth/callback
Allowed Logout URLs: https://yourdomain.com
Allowed Web Origins: https://yourdomain.com
```

### 4. セキュリティ強化

- CORS 設定の最適化
- CSP (Content Security Policy) の設定
- Rate Limiting の実装

## トラブルシューティング

### よくある問題

1. **ログインループ**

   - `localhost` ではなく `localhost` を使用している
   - Auth0 ダッシュボードの URL 設定が間違っている

2. **メール検証が動作しない**

   - JWT_SECRET が設定されていない
   - Mailtrap の設定が間違っている

3. **セッションが保持されない**
   - HTTPS が使用されていない
   - AUTH0_SECRET が設定されていない

### デバッグ手順

1. 環境変数をすべて確認
2. Auth0 ダッシュボードの設定を確認
3. ブラウザのネットワークタブでリクエストを確認
4. サーバーログでエラー内容を確認

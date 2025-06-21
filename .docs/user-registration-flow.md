# ユーザー登録フロー - シーケンス図

## 概要

このドキュメントでは、Auth0 PoC プロジェクトにおけるユーザー登録から認証までの完全なフローをシーケンス図で示します。

## 1. 標準的なAuth0ログインフロー

```mermaid
sequenceDiagram
    participant U as ユーザー
    participant B as ブラウザ
    participant A as Next.jsアプリ
    participant M as Middleware
    participant AUTH as Auth0
    
    U->>B: https://127.0.0.1:3000 にアクセス
    B->>A: GET /
    A->>A: auth0.getSession() でセッション確認
    A-->>B: セッションなし - ログインボタン表示
    B-->>U: ホームページ (未認証状態)
    
    U->>B: "Log in" ボタンをクリック
    B->>A: GET /auth/login
    A->>AUTH: Auth0 Hosted Login にリダイレクト
    AUTH-->>U: ログインページ表示
    
    U->>AUTH: 認証情報入力 (email/password)
    AUTH->>AUTH: 認証情報検証
    AUTH->>A: GET /auth/callback?code=...
    A->>AUTH: 認証コードを検証
    AUTH->>A: アクセストークン・IDトークン返却
    A->>A: セッション作成
    A-->>B: / にリダイレクト
    
    B->>A: GET / (セッション付き)
    A->>A: auth0.getSession() でセッション確認
    A-->>B: 認証済み状態のページ表示
    B-->>U: ホームページ (認証済み)
```

## 2. カスタムユーザー登録フロー

```mermaid
sequenceDiagram
    participant U as ユーザー
    participant C as クライアント
    participant API as Next.js API
    participant MGMT as Auth0 Management API
    participant MAIL as Mailtrap
    participant JWT as JWT Service
    
    U->>C: ユーザー登録リクエスト
    C->>API: POST /api/users<br/>{email, password, name}
    
    API->>MGMT: ユーザー作成リクエスト
    Note over API,MGMT: email_verified: false<br/>verify_email: false
    MGMT->>API: ユーザー作成成功
    
    API->>JWT: 検証トークン生成 (24時間有効)
    JWT->>API: JWT トークン返却
    
    API->>MAIL: 検証メール送信<br/>URL: /api/verify-email?token=...
    
    alt メール送信成功
        MAIL->>API: 送信成功
        API->>C: ユーザー登録成功レスポンス
    else メール送信失敗
        MAIL->>API: 送信失敗
        API->>MGMT: ユーザー削除 (ロールバック)
        MGMT->>API: 削除完了
        API->>C: エラーレスポンス
    end
    
    C-->>U: 登録結果表示
```

## 3. メール検証フロー

```mermaid
sequenceDiagram
    participant U as ユーザー
    participant E as Email Client
    participant B as ブラウザ
    participant API as Next.js API
    participant JWT as JWT Service
    participant MGMT as Auth0 Management API
    participant AUTH as Auth0
    
    U->>E: 受信メールを確認
    E-->>U: 検証リンク表示
    
    U->>B: 検証リンクをクリック
    B->>API: GET /api/verify-email?token=...
    
    API->>JWT: トークン検証・デコード
    
    alt トークン有効
        JWT->>API: email 取得成功
        API->>MGMT: ユーザーの email_verified を true に更新
        MGMT->>API: 更新成功
        API->>B: ログインページにリダイレクト<br/>login_hint=email
        B-->>U: ログインページ (email 自動入力)
        
        U->>AUTH: ログイン実行
        AUTH->>AUTH: 認証処理 (email_verified: true)
        Note over AUTH: メール検証済みユーザーなので<br/>ログイン許可
        AUTH->>B: 認証成功・セッション作成
        
    else トークン無効/期限切れ
        JWT->>API: 検証失敗
        API->>B: エラーページにリダイレクト
        B-->>U: 検証エラー表示
    end
```

## 4. 完全なユーザー登録〜認証フロー

```mermaid
sequenceDiagram
    participant U as ユーザー
    participant C as クライアント
    participant APP as Next.jsアプリ
    participant API as API Routes
    participant MGMT as Auth0 Management
    participant MAIL as Email Service
    participant AUTH as Auth0 Authentication
    
    Note over U,AUTH: Phase 1: ユーザー登録
    U->>C: 新規ユーザー登録
    C->>API: POST /api/users
    API->>MGMT: ユーザー作成 (email_verified: false)
    API->>MAIL: 検証メール送信
    API->>C: 登録完了通知
    C-->>U: "確認メールを送信しました"
    
    Note over U,AUTH: Phase 2: メール検証
    U->>U: メール受信・リンククリック
    U->>API: GET /api/verify-email?token=...
    API->>MGMT: email_verified を true に更新
    API->>U: ログインページにリダイレクト
    
    Note over U,AUTH: Phase 3: 初回ログイン
    U->>APP: ログインページアクセス
    APP->>AUTH: Auth0 Hosted Login
    U->>AUTH: 認証情報入力
    AUTH->>AUTH: email_verified=true 確認
    AUTH->>APP: 認証成功・コールバック
    APP->>APP: セッション作成
    APP-->>U: 認証済みホームページ表示
    
    Note over U,AUTH: Phase 4: セッション管理
    U->>APP: 以降のページアクセス
    APP->>APP: Middleware セッション確認
    APP-->>U: 認証済み状態でページ表示
```

## フロー詳細説明

### 重要なポイント

1. **HTTPS必須**: 開発環境でも `https://127.0.0.1:3000` を使用
2. **メール検証必須**: ユーザーは email_verified=true になるまでログインできない
3. **JWT有効期限**: 検証トークンは24時間で無効化
4. **ロールバック機能**: メール送信失敗時はAuth0からユーザーを削除
5. **セッション管理**: Auth0 SDK が自動的にセッション Cookie を管理

### 環境変数設定

```env
# Auth0 基本設定
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
AUTH0_SECRET=your-32-char-secret
APP_BASE_URL=https://127.0.0.1:3000

# Management API
AUTH0_MANAGEMENT_CLIENT_ID=mgmt-client-id
AUTH0_MANAGEMENT_CLIENT_SECRET=mgmt-client-secret
AUTH0_MANAGEMENT_AUDIENCE=https://your-domain.auth0.com/api/v2/

# メール設定
MAILTRAP_API_KEY=your-mailtrap-key
EMAIL_VERIFY_URL=https://127.0.0.1:3000/api/verify-email
JWT_SECRET=your-jwt-secret
```

### セキュリティ考慮事項

- JWT トークンは24時間で自動失効
- すべての機密情報は環境変数で管理
- HTTPS 強制でセキュアな通信を保証
- Auth0 のセキュリティ機能を最大限活用
- メール検証完了まで認証を許可しない
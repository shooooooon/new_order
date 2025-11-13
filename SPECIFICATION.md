# 軽量版 在庫・発注管理システム - 完全仕様書

## 📋 プロジェクト概要

**プロジェクト名**: inventory-lite  
**目的**: 複雑な機能を排除した、シンプルで軽量な在庫・発注管理システム  
**GitHubリポジトリ**: https://github.com/shooooooon/new_order  
**技術スタック**: Next.js 15 + tRPC 11 + Drizzle ORM + MySQL + Tailwind CSS 4 + shadcn/ui

---

## 🎯 設計思想

### 削除された複雑な機能（元システムから）
- ❌ Supabase依存（完全削除）
- ❌ 商魂システム連携（Excelアップロード）
- ❌ FIFO自動引落機能
- ❌ 監査ログ機能
- ❌ アラート通知機能
- ❌ バーコード/QRコード対応
- ❌ 品目写真登録機能

### 保持されたコア機能
- ✅ ロット単位の在庫管理
- ✅ 発注管理（作成・一覧・詳細）
- ✅ 入荷処理（発注→在庫反映）
- ✅ 出荷管理（在庫減算）
- ✅ 在庫調整（手動調整・履歴記録）
- ✅ 品目マスタ管理
- ✅ 仕入先マスタ管理
- ✅ CSVエクスポート機能
- ✅ ダッシュボード（統計・低在庫アラート）

---

## 🗄️ データベース設計

### テーブル構成（8テーブル）

#### 1. users（ユーザーテーブル）
```typescript
{
  id: int (PK, AUTO_INCREMENT)
  openId: varchar(64) UNIQUE NOT NULL
  name: text
  email: varchar(320)
  loginMethod: varchar(64)
  role: enum('user', 'admin') DEFAULT 'user'
  createdAt: timestamp DEFAULT NOW()
  updatedAt: timestamp DEFAULT NOW() ON UPDATE NOW()
  lastSignedIn: timestamp DEFAULT NOW()
}
```

#### 2. suppliers（仕入先マスタ）
```typescript
{
  id: int (PK, AUTO_INCREMENT)
  code: varchar(50) UNIQUE NOT NULL
  name: varchar(255) NOT NULL
  contactPerson: varchar(100)
  phone: varchar(50)
  email: varchar(320)
  notes: text
  createdAt: timestamp DEFAULT NOW()
  updatedAt: timestamp DEFAULT NOW() ON UPDATE NOW()
}
```

#### 3. items（品目マスタ）
```typescript
{
  id: int (PK, AUTO_INCREMENT)
  code: varchar(50) UNIQUE NOT NULL
  name: varchar(255) NOT NULL
  unit: varchar(20) NOT NULL
  requiresLot: boolean DEFAULT false
  notes: text
  createdAt: timestamp DEFAULT NOW()
  updatedAt: timestamp DEFAULT NOW() ON UPDATE NOW()
}
```

#### 4. stockLots（ロット在庫）
```typescript
{
  id: int (PK, AUTO_INCREMENT)
  itemId: int NOT NULL
  lotNumber: varchar(100)
  quantity: int NOT NULL DEFAULT 0
  receivedDate: timestamp NOT NULL
  expiryDate: timestamp
  createdAt: timestamp DEFAULT NOW()
  updatedAt: timestamp DEFAULT NOW() ON UPDATE NOW()
}
```
**⚠️ 既知の問題**: `unitPrice`（単価）フィールドが欠落

#### 5. purchaseOrders（発注ヘッダ）
```typescript
{
  id: int (PK, AUTO_INCREMENT)
  orderNumber: varchar(50) UNIQUE NOT NULL
  supplierId: int NOT NULL
  orderDate: timestamp NOT NULL
  expectedDeliveryDate: timestamp NOT NULL
  status: enum('pending', 'received') DEFAULT 'pending'
  orderedBy: int NOT NULL
  notes: text
  createdAt: timestamp DEFAULT NOW()
  updatedAt: timestamp DEFAULT NOW() ON UPDATE NOW()
}
```

#### 6. purchaseOrderItems（発注明細）
```typescript
{
  id: int (PK, AUTO_INCREMENT)
  purchaseOrderId: int NOT NULL
  itemId: int NOT NULL
  lotNumber: varchar(100)
  quantity: int NOT NULL
  unitPrice: int  // ⚠️ int型のため、NaNエラーの原因
  createdAt: timestamp DEFAULT NOW()
  updatedAt: timestamp DEFAULT NOW() ON UPDATE NOW()
}
```
**⚠️ 既知の問題**: `unitPrice`が`int`型で、空文字列を`Number()`に渡すと`NaN`になる

#### 7. shipments（出荷ヘッダ）
```typescript
{
  id: int (PK, AUTO_INCREMENT)
  shipmentNumber: varchar(50) UNIQUE NOT NULL
  shipmentDate: timestamp NOT NULL
  destination: varchar(255) NOT NULL
  shippedBy: int NOT NULL
  notes: text
  createdAt: timestamp DEFAULT NOW()
  updatedAt: timestamp DEFAULT NOW() ON UPDATE NOW()
}
```

#### 8. shipmentItems（出荷明細）
```typescript
{
  id: int (PK, AUTO_INCREMENT)
  shipmentId: int NOT NULL
  itemId: int NOT NULL
  lotId: int
  quantity: int NOT NULL
  createdAt: timestamp DEFAULT NOW()
  updatedAt: timestamp DEFAULT NOW() ON UPDATE NOW()
}
```
**⚠️ 既知の問題**: `unitPrice`（単価）フィールドが欠落

#### 9. stockAdjustments（在庫調整履歴）
```typescript
{
  id: int (PK, AUTO_INCREMENT)
  itemId: int NOT NULL
  lotId: int
  quantityChange: int NOT NULL
  reason: varchar(255) NOT NULL
  adjustedBy: int NOT NULL
  adjustedAt: timestamp DEFAULT NOW()
  notes: text
  createdAt: timestamp DEFAULT NOW()
}
```

---

## 🔧 技術スタック詳細

### フロントエンド
- **React 19.1.1**: 最新のReactバージョン
- **Tailwind CSS 4.1.14**: ユーティリティファーストCSS
- **shadcn/ui**: Radix UIベースのコンポーネントライブラリ
  - 使用中のコンポーネント: avatar, dialog, dropdown-menu, label, popover, select, separator, slot, switch, tabs, tooltip
- **wouter 3.3.5**: 軽量ルーティングライブラリ
- **lucide-react**: アイコンライブラリ
- **sonner**: トースト通知

### バックエンド
- **Express 4.21.2**: Node.jsウェブフレームワーク
- **tRPC 11.6.0**: 型安全なAPI通信
- **Drizzle ORM 0.44.5**: TypeScript-firstのORM
- **MySQL2 3.15.0**: MySQLドライバー
- **Zod 4.1.12**: スキーマバリデーション
- **Superjson 1.13.3**: Date型などの自動シリアライゼーション

### 開発ツール
- **TypeScript 5.9.3**: 型安全性
- **Vite 7.1.7**: 高速ビルドツール
- **tsx 4.19.1**: TypeScript実行環境
- **Drizzle Kit 0.31.4**: データベースマイグレーション

---

## 📁 プロジェクト構造

```
inventory-lite/
├── client/                      # フロントエンド
│   ├── public/                  # 静的ファイル
│   └── src/
│       ├── _core/
│       │   └── hooks/
│       │       └── useAuth.ts   # 認証フック
│       ├── components/
│       │   ├── DashboardLayout.tsx        # ダッシュボードレイアウト
│       │   ├── DashboardLayoutSkeleton.tsx
│       │   ├── ErrorBoundary.tsx
│       │   ├── ManusDialog.tsx
│       │   ├── Map.tsx
│       │   └── ui/              # shadcn/uiコンポーネント
│       ├── contexts/
│       │   └── ThemeContext.tsx
│       ├── hooks/               # カスタムフック
│       ├── lib/
│       │   ├── trpc.ts          # tRPCクライアント設定
│       │   └── utils.ts
│       ├── pages/               # ページコンポーネント
│       │   ├── Dashboard.tsx
│       │   ├── Home.tsx
│       │   ├── Items.tsx
│       │   ├── NotFound.tsx
│       │   ├── PurchaseOrderDetail.tsx
│       │   ├── PurchaseOrders.tsx
│       │   ├── ShipmentDetail.tsx
│       │   ├── Shipments.tsx
│       │   ├── Stock.tsx
│       │   ├── StockAdjustments.tsx
│       │   └── Suppliers.tsx
│       ├── App.tsx              # ルーティング設定
│       ├── const.ts             # 定数定義
│       └── main.tsx             # エントリーポイント
│
├── server/                      # バックエンド
│   ├── _core/                   # フレームワークコア（編集不要）
│   │   ├── context.ts
│   │   ├── cookies.ts
│   │   ├── dataApi.ts
│   │   ├── env.ts
│   │   ├── imageGeneration.ts
│   │   ├── index.ts
│   │   ├── llm.ts
│   │   ├── map.ts
│   │   ├── notification.ts
│   │   ├── oauth.ts
│   │   ├── sdk.ts
│   │   ├── systemRouter.ts
│   │   ├── trpc.ts
│   │   ├── vite.ts
│   │   └── voiceTranscription.ts
│   ├── db.ts                    # データベースクエリ関数
│   ├── routers.ts               # tRPCルーター定義
│   └── storage.ts               # S3ストレージヘルパー
│
├── drizzle/                     # データベーススキーマ
│   ├── meta/                    # マイグレーション履歴
│   ├── relations.ts
│   └── schema.ts                # テーブル定義
│
├── shared/                      # 共有型・定数
│   ├── _core/
│   │   └── errors.ts
│   ├── const.ts
│   └── types.ts
│
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
└── drizzle.config.ts
```

---

## 🌐 ページ構成（10ページ）

| ページ名 | パス | 説明 |
|---------|------|------|
| ダッシュボード | `/` | 統計情報、低在庫アラート、在庫上位品目 |
| 品目管理 | `/items` | 品目CRUD、検索、CSVエクスポート |
| 仕入先管理 | `/suppliers` | 仕入先CRUD、CSVエクスポート |
| 在庫一覧 | `/stock` | ロット単位の在庫表示、CSVエクスポート |
| 発注管理 | `/purchase-orders` | 発注一覧、ステータスフィルター、新規作成 |
| 発注詳細 | `/purchase-orders/:id` | 発注詳細、入荷処理 |
| 出荷管理 | `/shipments` | 出荷一覧、新規作成 |
| 出荷詳細 | `/shipments/:id` | 出荷詳細表示 |
| 在庫調整 | `/stock-adjustments` | 在庫調整履歴、新規調整 |
| 404 | `/404` | ページが見つかりません |

---

## 🔌 API設計（tRPCルーター）

### auth（認証）
- `me`: 現在のユーザー情報取得
- `logout`: ログアウト処理

### suppliers（仕入先）
- `list`: 仕入先一覧取得
- `get`: 仕入先詳細取得
- `create`: 仕入先作成
- `update`: 仕入先更新
- `delete`: 仕入先削除

### items（品目）
- `list`: 品目一覧取得（検索対応）
- `get`: 品目詳細取得
- `create`: 品目作成
- `update`: 品目更新
- `delete`: 品目削除

### stock（在庫）
- `list`: 在庫一覧取得
- `getLowStock`: 低在庫品目取得（閾値10以下）
- `getTopItems`: 在庫上位品目取得（TOP 5）
- `getStats`: 統計情報取得

### purchaseOrders（発注）
- `list`: 発注一覧取得（ステータスフィルター）
- `get`: 発注詳細取得（明細含む）
- `create`: 発注作成（ヘッダ + 明細）
  - **⚠️ 既知の問題**: unitPriceが空文字列の場合NaNエラー
- `receive`: 入荷処理（在庫ロット自動作成）
- `delete`: 発注削除

### shipments（出荷）
- `list`: 出荷一覧取得
- `get`: 出荷詳細取得（明細含む）
- `create`: 出荷作成（在庫自動減算）
- `delete`: 出荷削除

### stockAdjustments（在庫調整）
- `list`: 在庫調整履歴取得
- `create`: 在庫調整作成（在庫数量更新）

### csv（CSVエクスポート）
- `exportItems`: 品目CSVエクスポート
- `exportSuppliers`: 仕入先CSVエクスポート
- `exportStock`: 在庫CSVエクスポート

---

## 🐛 既知の問題と改善提案

### 🔴 緊急度：高（即座に修正すべき）

#### 1. 発注作成時のNaNエラー
**問題**: `unitPrice`フィールドが`int`型で、空文字列を`Number()`に渡すと`NaN`になる

**原因箇所**:
- `client/src/pages/PurchaseOrders.tsx` (99行目)
  ```typescript
  unitPrice: unitPrice ? Number(unitPrice) : undefined
  ```
- `drizzle/schema.ts` (101行目)
  ```typescript
  unitPrice: int("unitPrice"),  // int型
  ```

**修正案**:
1. UIでの空文字列チェックを強化
2. スキーマを`decimal(10, 2)`に変更（小数点対応）
3. バリデーションで0以上の数値を必須にする

#### 2. 出荷管理の類似エラー
**問題**: 出荷作成時も同様のパターンでエラーが発生する可能性

**確認必要箇所**:
- `client/src/pages/Shipments.tsx`

---

### 🟡 緊急度：中（機能強化として検討）

#### 3. 在庫ロットに単価情報がない
**問題**: `stockLots`テーブルに`unitPrice`フィールドが欠落

**影響**:
- 在庫一覧画面で単価を表示できない
- 在庫の総額を計算できない
- 原価管理ができない

**改善案**:
```sql
ALTER TABLE stockLots ADD COLUMN unitPrice DECIMAL(10, 2);
```

#### 4. 出荷明細に単価情報がない
**問題**: `shipmentItems`テーブルに`unitPrice`フィールドが欠落

**影響**:
- 出荷時の単価を記録できない
- 出荷金額を計算できない

**改善案**:
```sql
ALTER TABLE shipmentItems ADD COLUMN unitPrice DECIMAL(10, 2);
```

#### 5. 棚卸機能が未実装
**問題**: `inventory_counts`テーブルは存在するが、APIとUIが未実装

**改善案**:
- 棚卸作成API実装
- 棚卸一覧・詳細画面実装
- 実地棚卸と理論在庫の差異表示

---

### 🟢 緊急度：低（将来的な機能追加）

#### 6. 部分入荷機能
**現状**: 入荷処理は全量入荷のみ対応

**改善案**:
- 入荷数量を指定可能にする
- 残数量を計算して表示
- 複数回に分けて入荷可能にする

#### 7. PDF出荷伝票
**改善案**:
- 発注書のPDF出力機能
- 出荷伝票のPDF出力機能
- `manus-md-to-pdf`コマンドを使用

---

## 📊 パフォーマンス最適化履歴

### 最適化前
- 依存関係: 64パッケージ
- CSSサイズ: 119.21KB
- 未使用コンポーネント: 14個

### 最適化後
- 依存関係: 49パッケージ（-23.4%）
- CSSサイズ: 103.81KB（-12.9%）
- 未使用コンポーネント: 0個
- TypeScriptエラー: 0件
- ビルド時間: 4.39秒

---

## 🚀 デプロイ手順

### 開発環境
```bash
pnpm install
pnpm db:push  # データベースマイグレーション
pnpm dev      # 開発サーバー起動（ポート3000）
```

### 本番環境
```bash
pnpm build    # ビルド実行
pnpm start    # 本番サーバー起動
```

### 環境変数（必須）
```
DATABASE_URL=mysql://user:password@host:port/database
JWT_SECRET=your-jwt-secret
VITE_APP_ID=your-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://login.manus.im
OWNER_OPEN_ID=owner-open-id
OWNER_NAME=owner-name
```

---

## 📝 サンプルデータ

### 仕入先（3件）
- SUP-001: 株式会社サンプル商事
- SUP-002: 東京物産株式会社
- SUP-003: 関西流通センター

### 品目（5件）
- ITEM-001: スーパーボーイ（個）
- ITEM-002: メガパック（箱）
- ITEM-003: プレミアムセット（セット）
- その他2件

### 在庫ロット（6件）
- 各品目に対して1〜2ロット存在

---

## 🔐 認証・認可

### 認証方式
- Manus OAuth 2.0
- JWTトークンベースのセッション管理
- Cookie保存（httpOnly, secure）

### ロール
- `user`: 一般ユーザー（全機能利用可能）
- `admin`: 管理者（将来的な拡張用）

---

## 📚 参考リソース

- **GitHubリポジトリ**: https://github.com/shooooooon/new_order
- **tRPC公式ドキュメント**: https://trpc.io/
- **Drizzle ORM公式ドキュメント**: https://orm.drizzle.team/
- **shadcn/ui公式ドキュメント**: https://ui.shadcn.com/

---

## 📅 開発履歴

### Phase 1: 初期実装（完了）
- データベーススキーマ設計
- 基本CRUD機能実装
- 発注・入荷・出荷機能実装

### Phase 2: 機能追加（完了）
- CSVエクスポート機能
- ダッシュボード実装
- 低在庫アラート機能

### Phase 3: パフォーマンス最適化（完了）
- 未使用コンポーネント削除
- 依存関係削減
- ビルドサイズ削減

### Phase 4: 安定性テスト（完了）
- TypeScriptエラー0件達成
- プロダクションビルド成功
- 全ページ動作確認完了

### Phase 5: 発注作成UI追加（完了）
- 新規発注ダイアログ実装
- 仕入先選択機能
- 品目追加・削除機能

### Phase 6: 次期開発（未着手）
- 単価管理の完全実装
- エラー修正（NaN問題）
- 棚卸機能の完全実装

---

## 🎯 新規フルスタック開発での改善目標

1. **単価管理の完全実装**
   - 全テーブルに`unitPrice`フィールドを追加（DECIMAL型）
   - 在庫一覧・出荷一覧で単価表示
   - 総額計算機能

2. **エラー修正**
   - 発注・出荷作成時のNaNエラー解消
   - バリデーション強化

3. **棚卸機能の完全実装**
   - 棚卸作成・一覧・詳細画面
   - 実地棚卸と理論在庫の差異表示
   - 棚卸結果の在庫反映

4. **部分入荷機能**
   - 入荷数量指定
   - 残数量表示
   - 複数回入荷対応

5. **PDF出力機能**
   - 発注書PDF
   - 出荷伝票PDF

6. **UX改善**
   - ローディング状態の改善
   - エラーメッセージの詳細化
   - 操作ガイドの追加

---

**作成日**: 2025年1月7日  
**バージョン**: 1.0  
**最終更新**: 2025年1月7日

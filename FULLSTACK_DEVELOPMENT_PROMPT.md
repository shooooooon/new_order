# 在庫・発注管理システム フルスタック開発プロンプト

## 📌 プロジェクト概要

既存の軽量版在庫・発注管理システム（inventory-lite）を参照しながら、既知の問題を修正し、不足している機能を追加した完全版の在庫・発注管理システムをゼロから構築してください。

**参照リポジトリ**: https://github.com/shooooooon/new_order  
**技術スタック**: Next.js 15 + tRPC 11 + Drizzle ORM + MySQL + Tailwind CSS 4 + shadcn/ui

---

## 🎯 開発目標

### 1. 既存システムの問題修正

#### 🔴 緊急度：高

**問題1: 発注作成時のNaNエラー**
- **現象**: `unitPrice`フィールドに空文字列を渡すと`NaN`エラーが発生
- **原因**: スキーマで`int`型を使用しているため、空文字列が`Number()`で`NaN`になる
- **修正内容**:
  - `unitPrice`を`decimal(10, 2)`型に変更
  - UIでの入力バリデーション強化（空文字列の場合は`null`または`0`に変換）
  - エラーハンドリングの改善

**問題2: 出荷管理の類似エラー**
- **確認事項**: 出荷作成時も同様のパターンでエラーが発生する可能性
- **修正内容**: 発注と同じ修正を適用

---

### 2. 単価管理の完全実装

#### 在庫ロット（stock_lots）に単価追加
```sql
ALTER TABLE stockLots ADD COLUMN unitPrice DECIMAL(10, 2);
```

**実装内容**:
- 入荷処理時に発注明細の単価を在庫ロットにコピー
- 在庫一覧画面で単価を表示
- 在庫総額の計算機能（数量 × 単価）

#### 出荷明細（shipment_items）に単価追加
```sql
ALTER TABLE shipmentItems ADD COLUMN unitPrice DECIMAL(10, 2);
```

**実装内容**:
- 出荷時に在庫ロットの単価を出荷明細にコピー
- 出荷一覧・詳細画面で単価を表示
- 出荷金額の計算機能

---

### 3. 棚卸機能の完全実装

#### データベーススキーマ
既存の`inventory_counts`テーブルを活用（スキーマは参照リポジトリを確認）

**実装内容**:
- **棚卸作成API**: 棚卸ヘッダと明細を作成
- **棚卸一覧画面**: 棚卸履歴を表示
- **棚卸詳細画面**: 
  - 実地棚卸数量の入力
  - 理論在庫との差異表示
  - 差異理由の記録
- **在庫反映機能**: 棚卸結果を在庫に反映（在庫調整として記録）

---

### 4. 部分入荷機能

**現状**: 入荷処理は全量入荷のみ対応

**改善内容**:
- 入荷数量を指定可能にする
- 残数量を計算して表示（発注数量 - 入荷済数量）
- 複数回に分けて入荷可能にする
- 発注ステータスに「部分入荷」を追加（`pending`, `partial`, `received`）

**データベース変更**:
```sql
ALTER TABLE purchaseOrders 
MODIFY COLUMN status ENUM('pending', 'partial', 'received') DEFAULT 'pending';

ALTER TABLE purchaseOrders 
ADD COLUMN receivedQuantity INT DEFAULT 0;
```

---

### 5. PDF出力機能

**実装内容**:
- **発注書PDF**: 発注詳細画面から発注書をPDF出力
- **出荷伝票PDF**: 出荷詳細画面から出荷伝票をPDF出力

**実装方法**:
1. Markdownで伝票テンプレートを作成
2. データを埋め込み
3. `manus-md-to-pdf`コマンドでPDF変換
4. ダウンロードリンクを提供

**テンプレート例**:
```markdown
# 発注書

**発注番号**: PO-123456  
**発注日**: 2025-01-07  
**仕入先**: 株式会社サンプル商事

## 発注明細

| 品目コード | 品目名 | 数量 | 単価 | 金額 |
|-----------|--------|------|------|------|
| ITEM-001  | スーパーボーイ | 100 | 500 | 50,000 |

**合計金額**: ¥50,000
```

---

### 6. UX改善

#### ローディング状態の改善
- すべてのAPI呼び出しにスケルトンローディングを追加
- ボタンクリック時のローディングスピナー表示
- 楽観的更新（Optimistic Update）の活用

#### エラーメッセージの詳細化
- エラー内容を具体的に表示
- エラー発生箇所を明示
- 解決方法のヒントを提供

#### 操作ガイド
- 各画面に簡単な操作説明を追加
- ツールチップでフィールドの説明を表示
- 初回訪問時のウォークスルー（オプション）

---

## 📋 機能要件（既存システムから継承）

### 保持すべきコア機能

#### 1. 品目管理
- ✅ 品目CRUD（作成・読取・更新・削除）
- ✅ 品目コード・名称・単位・ロット管理要否・備考
- ✅ 検索機能
- ✅ CSVエクスポート

#### 2. 仕入先管理
- ✅ 仕入先CRUD
- ✅ 仕入先コード・名称・担当者・電話・メール・備考
- ✅ CSVエクスポート

#### 3. 在庫管理
- ✅ ロット単位の在庫表示
- ✅ 品目別在庫集計
- ✅ 在庫検索
- ✅ CSVエクスポート
- 🆕 **単価表示**（新規追加）
- 🆕 **在庫総額表示**（新規追加）

#### 4. 発注管理
- ✅ 発注作成（ヘッダ + 明細）
- ✅ 発注一覧（ステータスフィルター）
- ✅ 発注詳細表示
- ✅ 発注削除
- 🆕 **単価入力のバリデーション強化**（修正）
- 🆕 **部分入荷対応**（新規追加）
- 🆕 **PDF出力**（新規追加）

#### 5. 入荷処理
- ✅ 発注からの入荷処理
- ✅ 在庫ロット自動作成
- ✅ 発注ステータス更新
- 🆕 **部分入荷対応**（新規追加）
- 🆕 **入荷数量指定**（新規追加）
- 🆕 **残数量表示**（新規追加）

#### 6. 出荷管理
- ✅ 出荷作成（ヘッダ + 明細）
- ✅ 出荷一覧
- ✅ 出荷詳細表示
- ✅ 在庫自動減算
- ✅ 出荷削除
- 🆕 **単価記録**（新規追加）
- 🆕 **出荷金額表示**（新規追加）
- 🆕 **PDF出力**（新規追加）

#### 7. 在庫調整
- ✅ 在庫調整作成
- ✅ 在庫調整履歴表示
- ✅ 調整理由・備考記録

#### 8. 棚卸管理
- 🆕 **棚卸作成**（新規追加）
- 🆕 **棚卸一覧**（新規追加）
- 🆕 **棚卸詳細**（新規追加）
- 🆕 **実地棚卸入力**（新規追加）
- 🆕 **差異表示**（新規追加）
- 🆕 **在庫反映**（新規追加）

#### 9. ダッシュボード
- ✅ 統計情報（品目数、在庫数、未完了発注）
- ✅ 低在庫アラート（閾値10以下）
- ✅ 在庫上位品目（TOP 5）
- 🆕 **在庫総額表示**（新規追加）

---

## 🗄️ データベース設計

### 修正が必要なテーブル

#### 1. purchaseOrderItems（発注明細）
```typescript
{
  id: int (PK, AUTO_INCREMENT)
  purchaseOrderId: int NOT NULL
  itemId: int NOT NULL
  lotNumber: varchar(100)
  quantity: int NOT NULL
  unitPrice: decimal(10, 2)  // ← int から decimal に変更
  createdAt: timestamp DEFAULT NOW()
  updatedAt: timestamp DEFAULT NOW() ON UPDATE NOW()
}
```

#### 2. stockLots（在庫ロット）
```typescript
{
  id: int (PK, AUTO_INCREMENT)
  itemId: int NOT NULL
  lotNumber: varchar(100)
  quantity: int NOT NULL DEFAULT 0
  unitPrice: decimal(10, 2)  // ← 新規追加
  receivedDate: timestamp NOT NULL
  expiryDate: timestamp
  createdAt: timestamp DEFAULT NOW()
  updatedAt: timestamp DEFAULT NOW() ON UPDATE NOW()
}
```

#### 3. shipmentItems（出荷明細）
```typescript
{
  id: int (PK, AUTO_INCREMENT)
  shipmentId: int NOT NULL
  itemId: int NOT NULL
  lotId: int
  quantity: int NOT NULL
  unitPrice: decimal(10, 2)  // ← 新規追加
  createdAt: timestamp DEFAULT NOW()
  updatedAt: timestamp DEFAULT NOW() ON UPDATE NOW()
}
```

#### 4. purchaseOrders（発注ヘッダ）
```typescript
{
  id: int (PK, AUTO_INCREMENT)
  orderNumber: varchar(50) UNIQUE NOT NULL
  supplierId: int NOT NULL
  orderDate: timestamp NOT NULL
  expectedDeliveryDate: timestamp NOT NULL
  status: enum('pending', 'partial', 'received') DEFAULT 'pending'  // ← partial 追加
  orderedBy: int NOT NULL
  receivedQuantity: int DEFAULT 0  // ← 新規追加
  notes: text
  createdAt: timestamp DEFAULT NOW()
  updatedAt: timestamp DEFAULT NOW() ON UPDATE NOW()
}
```

### 新規追加が必要なテーブル（参照リポジトリを確認）

#### 5. inventoryCounts（棚卸ヘッダ）
既存のスキーマを確認して実装

#### 6. inventoryCountItems（棚卸明細）
既存のスキーマを確認して実装

---

## 🔧 技術仕様

### フロントエンド

#### 使用技術
- **React 19.1.1**: 最新のReactバージョン
- **Tailwind CSS 4.1.14**: ユーティリティファーストCSS
- **shadcn/ui**: Radix UIベースのコンポーネントライブラリ
- **wouter 3.3.5**: 軽量ルーティングライブラリ
- **lucide-react**: アイコンライブラリ
- **sonner**: トースト通知

#### コンポーネント設計
- DashboardLayoutを使用した統一レイアウト
- shadcn/uiコンポーネントの活用
- レスポンシブデザイン対応
- ダークモード対応（オプション）

#### 状態管理
- tRPCのuseQueryとuseMutationを使用
- 楽観的更新（Optimistic Update）の活用
- エラーハンドリングの統一

### バックエンド

#### 使用技術
- **Express 4.21.2**: Node.jsウェブフレームワーク
- **tRPC 11.6.0**: 型安全なAPI通信
- **Drizzle ORM 0.44.5**: TypeScript-firstのORM
- **MySQL2 3.15.0**: MySQLドライバー
- **Zod 4.1.12**: スキーマバリデーション
- **Superjson 1.13.3**: Date型などの自動シリアライゼーション

#### API設計
- RESTful APIではなくtRPCを使用
- 型安全な通信
- エラーハンドリングの統一
- トランザクション処理の実装

---

## 📁 プロジェクト構造

参照リポジトリ（https://github.com/shooooooon/new_order）の構造を踏襲してください。

```
inventory-management/
├── client/                      # フロントエンド
│   ├── public/                  # 静的ファイル
│   └── src/
│       ├── _core/
│       │   └── hooks/
│       │       └── useAuth.ts   # 認証フック
│       ├── components/
│       │   ├── DashboardLayout.tsx
│       │   └── ui/              # shadcn/uiコンポーネント
│       ├── contexts/
│       │   └── ThemeContext.tsx
│       ├── lib/
│       │   ├── trpc.ts          # tRPCクライアント設定
│       │   └── utils.ts
│       ├── pages/               # ページコンポーネント
│       │   ├── Dashboard.tsx
│       │   ├── Items.tsx
│       │   ├── Suppliers.tsx
│       │   ├── Stock.tsx
│       │   ├── PurchaseOrders.tsx
│       │   ├── PurchaseOrderDetail.tsx
│       │   ├── Shipments.tsx
│       │   ├── ShipmentDetail.tsx
│       │   ├── StockAdjustments.tsx
│       │   ├── InventoryCounts.tsx      # 新規追加
│       │   ├── InventoryCountDetail.tsx # 新規追加
│       │   └── NotFound.tsx
│       ├── App.tsx              # ルーティング設定
│       └── main.tsx             # エントリーポイント
│
├── server/                      # バックエンド
│   ├── _core/                   # フレームワークコア（編集不要）
│   ├── db.ts                    # データベースクエリ関数
│   ├── routers.ts               # tRPCルーター定義
│   └── storage.ts               # S3ストレージヘルパー
│
├── drizzle/                     # データベーススキーマ
│   ├── meta/                    # マイグレーション履歴
│   └── schema.ts                # テーブル定義
│
└── shared/                      # 共有型・定数
    └── types.ts
```

---

## 🌐 ページ構成（12ページ）

| ページ名 | パス | 説明 | 新規/既存 |
|---------|------|------|----------|
| ダッシュボード | `/` | 統計情報、低在庫アラート | 既存（改善） |
| 品目管理 | `/items` | 品目CRUD、検索、CSVエクスポート | 既存 |
| 仕入先管理 | `/suppliers` | 仕入先CRUD、CSVエクスポート | 既存 |
| 在庫一覧 | `/stock` | ロット単位の在庫表示、単価表示 | 既存（改善） |
| 発注管理 | `/purchase-orders` | 発注一覧、新規作成 | 既存（改善） |
| 発注詳細 | `/purchase-orders/:id` | 発注詳細、部分入荷、PDF出力 | 既存（改善） |
| 出荷管理 | `/shipments` | 出荷一覧、新規作成 | 既存（改善） |
| 出荷詳細 | `/shipments/:id` | 出荷詳細、PDF出力 | 既存（改善） |
| 在庫調整 | `/stock-adjustments` | 在庫調整履歴、新規調整 | 既存 |
| 棚卸一覧 | `/inventory-counts` | 棚卸履歴一覧 | **新規** |
| 棚卸詳細 | `/inventory-counts/:id` | 棚卸詳細、実地棚卸入力 | **新規** |
| 404 | `/404` | ページが見つかりません | 既存 |

---

## 🔌 API設計（tRPCルーター）

### 既存APIの改善

#### purchaseOrders（発注）
```typescript
create: protectedProcedure
  .input(z.object({
    supplierId: z.number(),
    orderDate: z.date(),
    expectedDeliveryDate: z.date(),
    notes: z.string().optional(),
    items: z.array(z.object({
      itemId: z.number(),
      lotNumber: z.string().optional(),
      quantity: z.number().min(1),
      unitPrice: z.number().min(0).optional(),  // ← バリデーション強化
    })),
  }))
  .mutation(async ({ input, ctx }) => {
    // 実装内容
  })

receive: protectedProcedure
  .input(z.object({ 
    id: z.number(),
    receivedQuantity: z.number().min(1)  // ← 部分入荷対応
  }))
  .mutation(async ({ input, ctx }) => {
    // 部分入荷処理の実装
  })

exportPdf: protectedProcedure
  .input(z.object({ id: z.number() }))
  .mutation(async ({ input }) => {
    // PDF生成処理
  })
```

#### shipments（出荷）
```typescript
create: protectedProcedure
  .input(z.object({
    shipmentDate: z.date(),
    destination: z.string().min(1),
    notes: z.string().optional(),
    items: z.array(z.object({
      itemId: z.number(),
      lotId: z.number().optional(),
      quantity: z.number().min(1),
    })),
  }))
  .mutation(async ({ input, ctx }) => {
    // 出荷時に単価を記録
  })

exportPdf: protectedProcedure
  .input(z.object({ id: z.number() }))
  .mutation(async ({ input }) => {
    // PDF生成処理
  })
```

### 新規API

#### inventoryCounts（棚卸）
```typescript
inventoryCounts: router({
  list: protectedProcedure.query(async () => {
    // 棚卸一覧取得
  }),
  
  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      // 棚卸詳細取得（明細含む）
    }),
  
  create: protectedProcedure
    .input(z.object({
      countDate: z.date(),
      notes: z.string().optional(),
      items: z.array(z.object({
        itemId: z.number(),
        lotId: z.number(),
        theoreticalQuantity: z.number(),
        actualQuantity: z.number(),
        difference: z.number(),
        reason: z.string().optional(),
      })),
    }))
    .mutation(async ({ input, ctx }) => {
      // 棚卸作成
    }),
  
  applyToStock: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      // 棚卸結果を在庫に反映
    }),
  
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      // 棚卸削除
    }),
})
```

---

## 📝 実装の優先順位

### Phase 1: 緊急度の高い修正（1日目）
1. ✅ 単価フィールドを`decimal(10, 2)`に変更
2. ✅ 発注作成のバリデーション修正
3. ✅ 出荷作成のバリデーション修正
4. ✅ エラーハンドリングの改善

### Phase 2: 単価管理の実装（2日目）
1. ✅ 在庫ロットに単価追加
2. ✅ 出荷明細に単価追加
3. ✅ 在庫一覧画面で単価表示
4. ✅ 出荷一覧画面で単価表示
5. ✅ 在庫総額・出荷金額の計算機能

### Phase 3: 部分入荷機能（3日目）
1. ✅ 発注ステータスに`partial`追加
2. ✅ `receivedQuantity`フィールド追加
3. ✅ 部分入荷API実装
4. ✅ 残数量表示機能
5. ✅ 複数回入荷対応

### Phase 4: 棚卸機能（4日目）
1. ✅ 棚卸作成API実装
2. ✅ 棚卸一覧画面実装
3. ✅ 棚卸詳細画面実装
4. ✅ 実地棚卸入力機能
5. ✅ 差異表示機能
6. ✅ 在庫反映機能

### Phase 5: PDF出力機能（5日目）
1. ✅ 発注書PDFテンプレート作成
2. ✅ 出荷伝票PDFテンプレート作成
3. ✅ PDF生成API実装
4. ✅ ダウンロード機能実装

### Phase 6: UX改善（6日目）
1. ✅ ローディング状態の改善
2. ✅ エラーメッセージの詳細化
3. ✅ 操作ガイドの追加
4. ✅ レスポンシブデザインの確認

### Phase 7: テストとデバッグ（7日目）
1. ✅ 全機能の動作確認
2. ✅ エッジケースのテスト
3. ✅ パフォーマンステスト
4. ✅ ドキュメント作成

---

## 🧪 テスト要件

### 単体テスト
- すべてのAPI関数のテスト
- バリデーションのテスト
- エラーハンドリングのテスト

### 統合テスト
- 発注→入荷→在庫反映のフロー
- 出荷→在庫減算のフロー
- 棚卸→在庫反映のフロー

### E2Eテスト（オプション）
- ユーザーシナリオに基づいたテスト
- 各画面の操作テスト

---

## 📚 参考資料

### 必須参照
- **GitHubリポジトリ**: https://github.com/shooooooon/new_order
  - データベーススキーマ: `drizzle/schema.ts`
  - API実装: `server/routers.ts`
  - データベース関数: `server/db.ts`
  - ページコンポーネント: `client/src/pages/`

### 技術ドキュメント
- **tRPC**: https://trpc.io/
- **Drizzle ORM**: https://orm.drizzle.team/
- **shadcn/ui**: https://ui.shadcn.com/
- **Tailwind CSS**: https://tailwindcss.com/

---

## ✅ 完了条件

### 必須条件
- ✅ すべての既知の問題が修正されている
- ✅ 単価管理が完全に実装されている
- ✅ 棚卸機能が完全に実装されている
- ✅ 部分入荷機能が実装されている
- ✅ PDF出力機能が実装されている
- ✅ TypeScriptエラーが0件
- ✅ プロダクションビルドが成功する
- ✅ すべてのページが正常に動作する

### 推奨条件
- ✅ ローディング状態が適切に表示される
- ✅ エラーメッセージが詳細で分かりやすい
- ✅ レスポンシブデザインが実装されている
- ✅ CSVエクスポートが正常に動作する
- ✅ ドキュメントが完備されている

---

## 🚀 開発の進め方

### ステップ1: リポジトリのクローン
```bash
gh repo clone shooooooon/new_order
cd new_order
```

### ステップ2: プロジェクトの解析
- データベーススキーマを確認
- API実装を確認
- ページコンポーネントを確認
- 既知の問題を理解

### ステップ3: 新規プロジェクトの作成
```bash
# Manusの新規プロジェクト作成機能を使用
# テンプレート: web-db-user（tRPC + Database + Auth）
```

### ステップ4: データベーススキーマの実装
- 既存のスキーマをコピー
- 修正が必要な箇所を変更
- マイグレーションを実行

### ステップ5: API実装
- 既存のAPIをコピー
- 修正が必要な箇所を変更
- 新規APIを追加

### ステップ6: UI実装
- 既存のページをコピー
- 修正が必要な箇所を変更
- 新規ページを追加

### ステップ7: テストとデバッグ
- 全機能の動作確認
- エラー修正
- パフォーマンス最適化

### ステップ8: ドキュメント作成
- README.md作成
- API仕様書作成
- ユーザーマニュアル作成（オプション）

---

## 💡 開発のヒント

### データベースマイグレーション
```bash
# スキーマ変更後
pnpm db:push
```

### 開発サーバー起動
```bash
pnpm dev  # ポート3000で起動
```

### ビルド
```bash
pnpm build
pnpm start
```

### TypeScriptエラーチェック
```bash
pnpm check
```

---

## 🎯 成功の指標

### 技術的指標
- TypeScriptエラー: 0件
- ビルド時間: 5秒以内
- 依存関係: 60パッケージ以内
- CSSサイズ: 120KB以内

### 機能的指標
- すべての既知の問題が解決
- すべての新機能が実装
- すべてのページが正常に動作
- CSVエクスポートが正常に動作
- PDF出力が正常に動作

### UX指標
- ローディング時間: 1秒以内
- エラーメッセージ: 具体的で分かりやすい
- レスポンシブデザイン: すべてのデバイスで正常表示
- 操作性: 直感的で分かりやすい

---

**作成日**: 2025年1月7日  
**バージョン**: 1.0  
**対象**: Manus AI（フルスタック開発タスク）

---

## 📌 重要な注意事項

1. **参照リポジトリを必ず確認する**: すべての実装は参照リポジトリをベースにしてください
2. **安定性を最優先する**: 新機能追加よりも既存機能の安定性を優先してください
3. **型安全性を保つ**: TypeScriptの型エラーは必ず解決してください
4. **段階的に実装する**: 一度にすべてを実装せず、Phase単位で進めてください
5. **テストを怠らない**: 各Phase完了後に必ず動作確認を行ってください

---

このプロンプトを使用して、新しいタスクで完全版の在庫・発注管理システムを開発してください。

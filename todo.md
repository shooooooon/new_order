# 軽量版 在庫・発注管理システム TODO

## Phase 1: データベーススキーマ設計
- [x] 品目マスタテーブル (items)
- [x] 仕入先マスタテーブル (suppliers)
- [x] ロット在庫テーブル (stock_lots)
- [x] 発注ヘッダテーブル (purchase_orders)
- [x] 発注明細テーブル (purchase_order_items)
- [x] 在庫調整履歴テーブル (stock_adjustments)
- [x] データベースマイグレーション実行

## Phase 2: バックエンド実装
- [x] 品目管理API (CRUD)
- [x] 仕入先管理API (CRUD)
- [x] 在庫管理API (一覧・検索)
- [x] 発注管理API (CRUD)
- [x] 入荷処理API
- [x] 在庫調整API

## Phase 3: フロントエンド実装
- [x] DashboardLayoutの設定
- [x] 品目管理画面
- [x] 仕入先管理画面
- [x] 在庫一覧画面
- [x] 発注一覧画面
- [x] 発注詳細画面
- [x] 入荷処理画面
- [x] 在庫調整画面

## Phase 4: テストとデプロイ準備
- [x] 基本的な動作確認
- [x] サンプルデータの投入
- [ ] チェックポイント作成

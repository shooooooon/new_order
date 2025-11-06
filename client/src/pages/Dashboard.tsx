import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Package, ShoppingCart, AlertTriangle, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Dashboard() {
  const { data: items } = trpc.items.list.useQuery({});
  const { data: stockList } = trpc.stock.list.useQuery();
  const { data: orders } = trpc.purchaseOrders.list.useQuery({});

  // 統計情報の計算
  const totalItems = items?.length || 0;
  const totalStockQuantity = stockList?.reduce((sum, stock) => sum + stock.quantity, 0) || 0;
  const pendingOrders = orders?.filter(o => o.status === "pending").length || 0;
  
  // 低在庫アラート（固定閾値: 10以下）
  const lowStockItems = stockList
    ?.reduce((acc, stock) => {
      const existing = acc.find(item => item.itemCode === stock.itemCode);
      if (existing) {
        existing.totalQuantity += stock.quantity;
      } else {
        acc.push({
          itemCode: stock.itemCode || '',
          itemName: stock.itemName || '',
          unit: stock.unit || '',
          totalQuantity: stock.quantity,
        });
      }
      return acc;
    }, [] as Array<{ itemCode: string; itemName: string; unit: string; totalQuantity: number }>)
    ?.filter(item => item.totalQuantity <= 10)
    ?.sort((a, b) => a.totalQuantity - b.totalQuantity) || [];

  // 在庫回転率の高い品目（在庫数が多い順）
  const topStockItems = stockList
    ?.reduce((acc, stock) => {
      const existing = acc.find(item => item.itemCode === stock.itemCode);
      if (existing) {
        existing.totalQuantity += stock.quantity;
      } else {
        acc.push({
          itemCode: stock.itemCode || '',
          itemName: stock.itemName || '',
          unit: stock.unit || '',
          totalQuantity: stock.quantity,
        });
      }
      return acc;
    }, [] as Array<{ itemCode: string; itemName: string; unit: string; totalQuantity: number }>)
    ?.sort((a, b) => b.totalQuantity - a.totalQuantity)
    ?.slice(0, 5) || [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">ダッシュボード</h1>

      {/* 統計カード */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">登録品目数</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">品目</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総在庫数</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStockQuantity}</div>
            <p className="text-xs text-muted-foreground">全品目合計</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">未完了発注</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders}</div>
            <p className="text-xs text-muted-foreground">件</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">低在庫アラート</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{lowStockItems.length}</div>
            <p className="text-xs text-muted-foreground">品目（在庫10以下）</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* 低在庫アラート */}
        <Card>
          <CardHeader>
            <CardTitle>低在庫アラート</CardTitle>
            <CardDescription>在庫が10以下の品目</CardDescription>
          </CardHeader>
          <CardContent>
            {lowStockItems.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>品目コード</TableHead>
                    <TableHead>品目名</TableHead>
                    <TableHead className="text-right">在庫数</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStockItems.map((item) => (
                    <TableRow key={item.itemCode}>
                      <TableCell className="font-mono">{item.itemCode}</TableCell>
                      <TableCell>{item.itemName}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="destructive">
                          {item.totalQuantity} {item.unit}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground">低在庫の品目はありません</p>
            )}
          </CardContent>
        </Card>

        {/* 在庫上位品目 */}
        <Card>
          <CardHeader>
            <CardTitle>在庫上位品目</CardTitle>
            <CardDescription>在庫数が多い品目トップ5</CardDescription>
          </CardHeader>
          <CardContent>
            {topStockItems.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>品目コード</TableHead>
                    <TableHead>品目名</TableHead>
                    <TableHead className="text-right">在庫数</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topStockItems.map((item) => (
                    <TableRow key={item.itemCode}>
                      <TableCell className="font-mono">{item.itemCode}</TableCell>
                      <TableCell>{item.itemName}</TableCell>
                      <TableCell className="text-right">
                        {item.totalQuantity} {item.unit}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground">在庫データがありません</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

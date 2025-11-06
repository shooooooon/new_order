import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Package, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function PurchaseOrderDetail({ id }: { id: number }) {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  const { data: order, isLoading } = trpc.purchaseOrders.get.useQuery({ id });

  const receiveMutation = trpc.purchaseOrders.receive.useMutation({
    onSuccess: () => {
      utils.purchaseOrders.get.invalidate({ id });
      utils.purchaseOrders.list.invalidate();
      utils.stock.list.invalidate();
      toast.success("入荷処理が完了しました");
    },
    onError: (error) => {
      toast.error(`エラー: ${error.message}`);
    },
  });

  const handleReceive = () => {
    if (confirm("入荷処理を実行しますか?")) {
      receiveMutation.mutate({ id });
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("ja-JP");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!order) {
    return <div>発注が見つかりません</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => setLocation("/purchase-orders")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          戻る
        </Button>
        <h1 className="text-3xl font-bold">発注詳細</h1>
      </div>

      <div className="grid grid-cols-2 gap-4 p-6 border rounded-lg">
        <div>
          <div className="text-sm text-muted-foreground">発注番号</div>
          <div className="font-mono font-semibold">{order.orderNumber}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">仕入先</div>
          <div className="font-semibold">{order.supplierName}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">発注日</div>
          <div>{formatDate(order.orderDate)}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">予定入庫日</div>
          <div>{formatDate(order.expectedDeliveryDate)}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">発注者</div>
          <div>{order.orderedByName}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">ステータス</div>
          <div>
            {order.status === "pending" ? (
              <Badge variant="outline">発注中</Badge>
            ) : (
              <Badge>入荷済</Badge>
            )}
          </div>
        </div>
        {order.notes && (
          <div className="col-span-2">
            <div className="text-sm text-muted-foreground">備考</div>
            <div>{order.notes}</div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">発注明細</h2>
        {order.status === "pending" && (
          <Button onClick={handleReceive} disabled={receiveMutation.isPending}>
            {receiveMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Package className="h-4 w-4 mr-2" />
            )}
            入荷処理
          </Button>
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>品目コード</TableHead>
            <TableHead>品目名</TableHead>
            <TableHead>単位</TableHead>
            <TableHead>ロット番号</TableHead>
            <TableHead className="text-right">数量</TableHead>
            <TableHead className="text-right">単価</TableHead>
            <TableHead className="text-right">小計</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {order.items?.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-mono">{item.itemCode}</TableCell>
              <TableCell>{item.itemName}</TableCell>
              <TableCell>{item.unit}</TableCell>
              <TableCell>
                {item.requiresLot ? (
                  item.lotNumber || "-"
                ) : (
                  <Badge variant="outline">ロット管理なし</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">{item.quantity}</TableCell>
              <TableCell className="text-right">
                {item.unitPrice ? `¥${item.unitPrice.toLocaleString()}` : "-"}
              </TableCell>
              <TableCell className="text-right">
                {item.unitPrice
                  ? `¥${(item.quantity * item.unitPrice).toLocaleString()}`
                  : "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

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
import { Eye, Loader2 } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

export default function PurchaseOrders() {
  const [, setLocation] = useLocation();
  const [statusFilter, setStatusFilter] = useState<"pending" | "received" | undefined>();

  const { data: orders, isLoading } = trpc.purchaseOrders.list.useQuery({ status: statusFilter });

  const formatDate = (date: Date | string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("ja-JP");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">発注管理</h1>
      </div>

      <div className="flex gap-2">
        <Button
          variant={statusFilter === undefined ? "default" : "outline"}
          onClick={() => setStatusFilter(undefined)}
        >
          すべて
        </Button>
        <Button
          variant={statusFilter === "pending" ? "default" : "outline"}
          onClick={() => setStatusFilter("pending")}
        >
          発注中
        </Button>
        <Button
          variant={statusFilter === "received" ? "default" : "outline"}
          onClick={() => setStatusFilter("received")}
        >
          入荷済
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>発注番号</TableHead>
              <TableHead>仕入先</TableHead>
              <TableHead>発注日</TableHead>
              <TableHead>予定入庫日</TableHead>
              <TableHead>発注者</TableHead>
              <TableHead>ステータス</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders?.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono">{order.orderNumber}</TableCell>
                <TableCell>{order.supplierName}</TableCell>
                <TableCell>{formatDate(order.orderDate)}</TableCell>
                <TableCell>{formatDate(order.expectedDeliveryDate)}</TableCell>
                <TableCell>{order.orderedByName}</TableCell>
                <TableCell>
                  {order.status === "pending" ? (
                    <Badge variant="outline">発注中</Badge>
                  ) : (
                    <Badge>入荷済</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setLocation(`/purchase-orders/${order.id}`)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

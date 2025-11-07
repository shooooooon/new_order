import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useLocation } from "wouter";

export default function ShipmentDetail({ id }: { id: number }) {
  const [, setLocation] = useLocation();

  const { data: shipment, isLoading } = trpc.shipments.get.useQuery({ id });

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

  if (!shipment) {
    return <div>出荷が見つかりません</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => setLocation("/shipments")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          戻る
        </Button>
        <h1 className="text-3xl font-bold">出荷詳細</h1>
      </div>

      <div className="grid grid-cols-2 gap-4 p-6 border rounded-lg">
        <div>
          <div className="text-sm text-muted-foreground">出荷番号</div>
          <div className="font-mono font-semibold">{shipment.shipmentNumber}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">出荷先</div>
          <div className="font-semibold">{shipment.destination}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">出荷日</div>
          <div>{formatDate(shipment.shipmentDate)}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">出荷者</div>
          <div>{shipment.shippedByName}</div>
        </div>
        {shipment.notes && (
          <div className="col-span-2">
            <div className="text-sm text-muted-foreground">備考</div>
            <div>{shipment.notes}</div>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">出荷明細</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>品目コード</TableHead>
              <TableHead>品目名</TableHead>
              <TableHead>単位</TableHead>
              <TableHead>ロット番号</TableHead>
              <TableHead className="text-right">数量</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shipment.items?.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-mono">{item.itemCode}</TableCell>
                <TableCell>{item.itemName}</TableCell>
                <TableCell>{item.unit}</TableCell>
                <TableCell>{item.lotNumber || "-"}</TableCell>
                <TableCell className="text-right">{item.quantity}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

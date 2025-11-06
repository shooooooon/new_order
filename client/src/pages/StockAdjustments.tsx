import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Plus, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function StockAdjustments() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string>("");

  const utils = trpc.useUtils();
  const { data: adjustments, isLoading } = trpc.stockAdjustments.list.useQuery();
  const { data: items } = trpc.items.list.useQuery({});
  const { data: stockLots } = trpc.stock.byItem.useQuery(
    { itemId: Number(selectedItemId) },
    { enabled: !!selectedItemId }
  );

  const createMutation = trpc.stockAdjustments.create.useMutation({
    onSuccess: () => {
      utils.stockAdjustments.list.invalidate();
      utils.stock.list.invalidate();
      setIsCreateOpen(false);
      setSelectedItemId("");
      toast.success("在庫調整を記録しました");
    },
    onError: (error) => {
      toast.error(`エラー: ${error.message}`);
    },
  });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const lotId = formData.get("lotId") as string;
    
    createMutation.mutate({
      itemId: Number(formData.get("itemId")),
      lotId: lotId ? Number(lotId) : undefined,
      quantityChange: Number(formData.get("quantityChange")),
      reason: formData.get("reason") as string,
      notes: formData.get("notes") as string,
    });
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleString("ja-JP");
  };

  const selectedItem = items?.find((item) => item.id === Number(selectedItemId));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">在庫調整</h1>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              新規作成
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>在庫調整を記録</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label htmlFor="itemId">品目 *</Label>
                <Select
                  name="itemId"
                  value={selectedItemId}
                  onValueChange={setSelectedItemId}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="品目を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {items?.map((item) => (
                      <SelectItem key={item.id} value={String(item.id)}>
                        {item.code} - {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedItem?.requiresLot && stockLots && stockLots.length > 0 && (
                <div>
                  <Label htmlFor="lotId">ロット</Label>
                  <Select name="lotId">
                    <SelectTrigger>
                      <SelectValue placeholder="ロットを選択（任意）" />
                    </SelectTrigger>
                    <SelectContent>
                      {stockLots.map((lot) => (
                        <SelectItem key={lot.id} value={String(lot.id)}>
                          {lot.lotNumber} (在庫: {lot.quantity})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="quantityChange">調整数量 *</Label>
                <Input
                  id="quantityChange"
                  name="quantityChange"
                  type="number"
                  required
                  placeholder="正の数で増加、負の数で減少"
                />
              </div>

              <div>
                <Label htmlFor="reason">調整理由 *</Label>
                <Input
                  id="reason"
                  name="reason"
                  required
                  placeholder="例: 棚卸差異、破損、紛失"
                />
              </div>

              <div>
                <Label htmlFor="notes">備考</Label>
                <Textarea id="notes" name="notes" />
              </div>

              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                記録
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>調整日時</TableHead>
              <TableHead>品目コード</TableHead>
              <TableHead>品目名</TableHead>
              <TableHead>ロット番号</TableHead>
              <TableHead className="text-right">調整数量</TableHead>
              <TableHead>理由</TableHead>
              <TableHead>調整者</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {adjustments?.map((adjustment) => (
              <TableRow key={adjustment.id}>
                <TableCell>{formatDate(adjustment.adjustedAt)}</TableCell>
                <TableCell className="font-mono">{adjustment.itemCode}</TableCell>
                <TableCell>{adjustment.itemName}</TableCell>
                <TableCell>{adjustment.lotNumber || "-"}</TableCell>
                <TableCell className="text-right">
                  <Badge variant={adjustment.quantityChange > 0 ? "default" : "destructive"}>
                    {adjustment.quantityChange > 0 ? "+" : ""}
                    {adjustment.quantityChange}
                  </Badge>
                </TableCell>
                <TableCell>{adjustment.reason}</TableCell>
                <TableCell>{adjustment.adjustedByName}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

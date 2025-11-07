import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Eye, Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function PurchaseOrders() {
  const [, setLocation] = useLocation();
  const [statusFilter, setStatusFilter] = useState<"pending" | "received" | undefined>();
  const [open, setOpen] = useState(false);
  const [supplierId, setSupplierId] = useState<number | null>(null);
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split("T")[0]);
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<Array<{ itemId: number; lotNumber?: string; quantity: number; unitPrice?: number }>>([]);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [lotNumber, setLotNumber] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState("");

  const utils = trpc.useUtils();
  const { data: orders, isLoading } = trpc.purchaseOrders.list.useQuery({ status: statusFilter });
  const { data: suppliers } = trpc.suppliers.list.useQuery();
  const { data: allItems } = trpc.items.list.useQuery({ search: "" });

  const createMutation = trpc.purchaseOrders.create.useMutation({
    onSuccess: () => {
      utils.purchaseOrders.list.invalidate();
      setOpen(false);
      resetForm();
      toast.success("発注を作成しました");
    },
    onError: (error) => {
      toast.error(`エラー: ${error.message}`);
    },
  });

  const deleteMutation = trpc.purchaseOrders.delete.useMutation({
    onSuccess: () => {
      utils.purchaseOrders.list.invalidate();
      toast.success("発注を削除しました");
    },
    onError: (error) => {
      toast.error(`エラー: ${error.message}`);
    },
  });

  const resetForm = () => {
    setSupplierId(null);
    setOrderDate(new Date().toISOString().split("T")[0]);
    setExpectedDeliveryDate(new Date().toISOString().split("T")[0]);
    setNotes("");
    setItems([]);
    setSelectedItemId(null);
    setLotNumber("");
    setQuantity("");
    setUnitPrice("");
  };

  const addItem = () => {
    if (!selectedItemId || !quantity) {
      toast.error("品目と数量を入力してください");
      return;
    }

    setItems([
      ...items,
      {
        itemId: selectedItemId,
        lotNumber: lotNumber || undefined,
        quantity: Number(quantity),
        unitPrice: unitPrice ? Number(unitPrice) : undefined,
      },
    ]);
    setSelectedItemId(null);
    setLotNumber("");
    setQuantity("");
    setUnitPrice("");
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleCreate = () => {
    if (!supplierId) {
      toast.error("仕入先を選択してください");
      return;
    }
    if (items.length === 0) {
      toast.error("品目を追加してください");
      return;
    }

    createMutation.mutate({
      supplierId,
      orderDate: new Date(orderDate),
      expectedDeliveryDate: new Date(expectedDeliveryDate),
      notes,
      items,
    });
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("ja-JP");
  };

  const getStatusBadge = (status: string) => {
    if (status === "pending") {
      return <Badge variant="outline">発注中</Badge>;
    }
    return <Badge>入荷済</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">発注管理</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              新規発注
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>新規発注作成</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supplier">仕入先 *</Label>
                  <Select
                    value={supplierId?.toString()}
                    onValueChange={(value) => setSupplierId(Number(value))}
                  >
                    <SelectTrigger id="supplier">
                      <SelectValue placeholder="仕入先を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers?.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id.toString()}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orderDate">発注日 *</Label>
                  <Input
                    id="orderDate"
                    type="date"
                    value={orderDate}
                    onChange={(e) => setOrderDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expectedDeliveryDate">納期 *</Label>
                <Input
                  id="expectedDeliveryDate"
                  type="date"
                  value={expectedDeliveryDate}
                  onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">備考</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="備考を入力"
                />
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-4">発注品目</h3>
                <div className="grid grid-cols-5 gap-2 mb-2">
                  <div className="col-span-2">
                    <Label>品目 *</Label>
                    <Select
                      value={selectedItemId?.toString()}
                      onValueChange={(value) => setSelectedItemId(Number(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="品目を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {allItems?.map((item) => (
                          <SelectItem key={item.id} value={item.id.toString()}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>ロット番号</Label>
                    <Input
                      value={lotNumber}
                      onChange={(e) => setLotNumber(e.target.value)}
                      placeholder="ロット番号"
                    />
                  </div>
                  <div>
                    <Label>数量 *</Label>
                    <Input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="数量"
                    />
                  </div>
                  <div>
                    <Label>単価</Label>
                    <Input
                      type="number"
                      value={unitPrice}
                      onChange={(e) => setUnitPrice(e.target.value)}
                      placeholder="単価"
                    />
                  </div>
                </div>
                <Button onClick={addItem} variant="outline" size="sm" className="mb-4">
                  <Plus className="h-4 w-4 mr-2" />
                  品目を追加
                </Button>

                {items.length > 0 && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>品目</TableHead>
                        <TableHead>ロット番号</TableHead>
                        <TableHead>数量</TableHead>
                        <TableHead>単価</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item, index) => {
                        const itemData = allItems?.find((i) => i.id === item.itemId);
                        return (
                          <TableRow key={index}>
                            <TableCell>{itemData?.name}</TableCell>
                            <TableCell>{item.lotNumber || "-"}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>{item.unitPrice ? `¥${item.unitPrice}` : "-"}</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  キャンセル
                </Button>
                <Button onClick={handleCreate} disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  作成
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
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
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : !orders || orders.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          発注データがありません
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>発注番号</TableHead>
              <TableHead>仕入先</TableHead>
              <TableHead>発注日</TableHead>
              <TableHead>納期</TableHead>
              <TableHead>ステータス</TableHead>
              <TableHead>備考</TableHead>
              <TableHead className="w-[100px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.orderNumber}</TableCell>
                <TableCell>{order.supplierName || "-"}</TableCell>
                <TableCell>{formatDate(order.orderDate)}</TableCell>
                <TableCell>{formatDate(order.expectedDeliveryDate)}</TableCell>
                <TableCell>{getStatusBadge(order.status)}</TableCell>
                <TableCell>{order.notes || "-"}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setLocation(`/purchase-orders/${order.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

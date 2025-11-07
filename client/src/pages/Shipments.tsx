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
import { trpc } from "@/lib/trpc";
import { Plus, Loader2, Trash2, Eye } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function Shipments() {
  const [, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  const [shipmentDate, setShipmentDate] = useState(new Date().toISOString().split("T")[0]);
  const [destination, setDestination] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<Array<{ itemId: number; lotId?: number; quantity: number }>>([]);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [selectedLotId, setSelectedLotId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState("");

  const utils = trpc.useUtils();
  const { data: shipments, isLoading } = trpc.shipments.list.useQuery();
  const { data: allItems } = trpc.items.list.useQuery({ search: "" });
  const { data: stockLots } = trpc.stock.byItem.useQuery(
    { itemId: selectedItemId! },
    { enabled: !!selectedItemId }
  );

  const createMutation = trpc.shipments.create.useMutation({
    onSuccess: () => {
      utils.shipments.list.invalidate();
      utils.stock.list.invalidate();
      setOpen(false);
      resetForm();
      toast.success("出荷を作成しました");
    },
    onError: (error) => {
      toast.error(`エラー: ${error.message}`);
    },
  });

  const deleteMutation = trpc.shipments.delete.useMutation({
    onSuccess: () => {
      utils.shipments.list.invalidate();
      toast.success("出荷を削除しました");
    },
    onError: (error) => {
      toast.error(`エラー: ${error.message}`);
    },
  });

  const resetForm = () => {
    setShipmentDate(new Date().toISOString().split("T")[0]);
    setDestination("");
    setNotes("");
    setItems([]);
    setSelectedItemId(null);
    setSelectedLotId(null);
    setQuantity("");
  };

  const addItem = () => {
    if (!selectedItemId || !quantity) {
      toast.error("品目と数量を入力してください");
      return;
    }

    setItems([...items, { itemId: selectedItemId, lotId: selectedLotId || undefined, quantity: Number(quantity) }]);
    setSelectedItemId(null);
    setSelectedLotId(null);
    setQuantity("");
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!destination || items.length === 0) {
      toast.error("出荷先と品目を入力してください");
      return;
    }

    createMutation.mutate({
      shipmentDate: new Date(shipmentDate),
      destination,
      notes,
      items,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("この出荷を削除しますか?")) {
      deleteMutation.mutate({ id });
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">出荷管理</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              新規出荷
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>新規出荷</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="shipmentDate">出荷日</Label>
                <Input
                  id="shipmentDate"
                  type="date"
                  value={shipmentDate}
                  onChange={(e) => setShipmentDate(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="destination">出荷先</Label>
                <Input
                  id="destination"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="出荷先を入力"
                />
              </div>

              <div>
                <Label htmlFor="notes">備考</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="備考を入力"
                />
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">出荷品目</h3>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  <div>
                    <Label>品目</Label>
                    <Select
                      value={selectedItemId?.toString()}
                      onValueChange={(value) => {
                        setSelectedItemId(Number(value));
                        setSelectedLotId(null);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="品目を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {allItems?.map((item) => (
                          <SelectItem key={item.id} value={item.id.toString()}>
                            {item.code} - {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>ロット</Label>
                    <Select
                      value={selectedLotId?.toString()}
                      onValueChange={(value) => setSelectedLotId(Number(value))}
                      disabled={!selectedItemId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="ロットを選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {stockLots?.map((lot) => (
                          <SelectItem key={lot.id} value={lot.id.toString()}>
                            {lot.lotNumber || "ロットなし"} (在庫: {lot.quantity})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>数量</Label>
                    <Input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="数量"
                    />
                  </div>

                  <div className="flex items-end">
                    <Button type="button" onClick={addItem} size="sm">
                      追加
                    </Button>
                  </div>
                </div>

                {items.length > 0 && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>品目</TableHead>
                        <TableHead>ロット</TableHead>
                        <TableHead className="text-right">数量</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item, index) => {
                        const itemData = allItems?.find((i) => i.id === item.itemId);
                        const lotData = stockLots?.find((l) => l.id === item.lotId);
                        return (
                          <TableRow key={index}>
                            <TableCell>{itemData?.name}</TableCell>
                            <TableCell>{lotData?.lotNumber || "-"}</TableCell>
                            <TableCell className="text-right">{item.quantity}</TableCell>
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

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  キャンセル
                </Button>
                <Button onClick={handleSubmit} disabled={createMutation.isPending}>
                  {createMutation.isPending && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  作成
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>出荷番号</TableHead>
            <TableHead>出荷日</TableHead>
            <TableHead>出荷先</TableHead>
            <TableHead>出荷者</TableHead>
            <TableHead className="w-[100px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shipments?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                出荷データがありません
              </TableCell>
            </TableRow>
          ) : (
            shipments?.map((shipment) => (
              <TableRow key={shipment.id}>
                <TableCell className="font-mono">{shipment.shipmentNumber}</TableCell>
                <TableCell>{formatDate(shipment.shipmentDate)}</TableCell>
                <TableCell>{shipment.destination}</TableCell>
                <TableCell>{shipment.shippedByName}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setLocation(`/shipments/${shipment.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(shipment.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

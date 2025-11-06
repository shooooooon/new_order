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
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Plus, Pencil, Trash2, Loader2, Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Items() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [search, setSearch] = useState("");

  const utils = trpc.useUtils();
  const { data: items, isLoading } = trpc.items.list.useQuery({ search });

  const createMutation = trpc.items.create.useMutation({
    onSuccess: () => {
      utils.items.list.invalidate();
      setIsCreateOpen(false);
      toast.success("品目を作成しました");
    },
    onError: (error) => {
      toast.error(`エラー: ${error.message}`);
    },
  });

  const updateMutation = trpc.items.update.useMutation({
    onSuccess: () => {
      utils.items.list.invalidate();
      setIsEditOpen(false);
      setEditingItem(null);
      toast.success("品目を更新しました");
    },
    onError: (error) => {
      toast.error(`エラー: ${error.message}`);
    },
  });

  const deleteMutation = trpc.items.delete.useMutation({
    onSuccess: () => {
      utils.items.list.invalidate();
      toast.success("品目を削除しました");
    },
    onError: (error) => {
      toast.error(`エラー: ${error.message}`);
    },
  });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMutation.mutate({
      code: formData.get("code") as string,
      name: formData.get("name") as string,
      unit: formData.get("unit") as string,
      requiresLot: formData.get("requiresLot") === "on",
      notes: formData.get("notes") as string,
    });
  };

  const handleEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateMutation.mutate({
      id: editingItem.id,
      code: formData.get("code") as string,
      name: formData.get("name") as string,
      unit: formData.get("unit") as string,
      requiresLot: formData.get("requiresLot") === "on",
      notes: formData.get("notes") as string,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("本当に削除しますか?")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleExportCSV = async () => {
    try {
      const result = await utils.client.export.items.query();
      const blob = new Blob([result.csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = result.filename;
      link.click();
      toast.success('CSVファイルをダウンロードしました');
    } catch (error) {
      toast.error('エクスポートに失敗しました');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">品目管理</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            CSVエクスポート
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              新規作成
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>品目を作成</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label htmlFor="code">品目コード *</Label>
                <Input id="code" name="code" required />
              </div>
              <div>
                <Label htmlFor="name">品目名 *</Label>
                <Input id="name" name="name" required />
              </div>
              <div>
                <Label htmlFor="unit">単位 *</Label>
                <Input id="unit" name="unit" defaultValue="個" required />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="requiresLot"
                  name="requiresLot"
                  className="h-4 w-4"
                />
                <Label htmlFor="requiresLot">ロット管理が必要</Label>
              </div>
              <div>
                <Label htmlFor="notes">備考</Label>
                <Textarea id="notes" name="notes" />
              </div>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                作成
              </Button>
            </form>
          </DialogContent>
          </Dialog>
        </div>
      </div>

      <div>
        <Input
          placeholder="品目コードまたは品目名で検索..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>品目コード</TableHead>
              <TableHead>品目名</TableHead>
              <TableHead>単位</TableHead>
              <TableHead>ロット管理</TableHead>
              <TableHead>備考</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items?.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-mono">{item.code}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.unit}</TableCell>
                <TableCell>
                  {item.requiresLot ? (
                    <Badge>必要</Badge>
                  ) : (
                    <Badge variant="outline">不要</Badge>
                  )}
                </TableCell>
                <TableCell className="max-w-xs truncate">{item.notes}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingItem(item);
                      setIsEditOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {editingItem && (
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>品目を編集</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <Label htmlFor="edit-code">品目コード *</Label>
                <Input
                  id="edit-code"
                  name="code"
                  defaultValue={editingItem.code}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-name">品目名 *</Label>
                <Input
                  id="edit-name"
                  name="name"
                  defaultValue={editingItem.name}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-unit">単位 *</Label>
                <Input
                  id="edit-unit"
                  name="unit"
                  defaultValue={editingItem.unit}
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="edit-requiresLot"
                  name="requiresLot"
                  defaultChecked={editingItem.requiresLot}
                  className="h-4 w-4"
                />
                <Label htmlFor="edit-requiresLot">ロット管理が必要</Label>
              </div>
              <div>
                <Label htmlFor="edit-notes">備考</Label>
                <Textarea
                  id="edit-notes"
                  name="notes"
                  defaultValue={editingItem.notes || ""}
                />
              </div>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                更新
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

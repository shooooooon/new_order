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
import { trpc } from "@/lib/trpc";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Suppliers() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);

  const utils = trpc.useUtils();
  const { data: suppliers, isLoading } = trpc.suppliers.list.useQuery();

  const createMutation = trpc.suppliers.create.useMutation({
    onSuccess: () => {
      utils.suppliers.list.invalidate();
      setIsCreateOpen(false);
      toast.success("仕入先を作成しました");
    },
    onError: (error) => {
      toast.error(`エラー: ${error.message}`);
    },
  });

  const updateMutation = trpc.suppliers.update.useMutation({
    onSuccess: () => {
      utils.suppliers.list.invalidate();
      setIsEditOpen(false);
      setEditingSupplier(null);
      toast.success("仕入先を更新しました");
    },
    onError: (error) => {
      toast.error(`エラー: ${error.message}`);
    },
  });

  const deleteMutation = trpc.suppliers.delete.useMutation({
    onSuccess: () => {
      utils.suppliers.list.invalidate();
      toast.success("仕入先を削除しました");
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
      contactPerson: formData.get("contactPerson") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      notes: formData.get("notes") as string,
    });
  };

  const handleEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateMutation.mutate({
      id: editingSupplier.id,
      code: formData.get("code") as string,
      name: formData.get("name") as string,
      contactPerson: formData.get("contactPerson") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      notes: formData.get("notes") as string,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("本当に削除しますか?")) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">仕入先管理</h1>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              新規作成
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>仕入先を作成</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label htmlFor="code">仕入先コード *</Label>
                <Input id="code" name="code" required />
              </div>
              <div>
                <Label htmlFor="name">仕入先名 *</Label>
                <Input id="name" name="name" required />
              </div>
              <div>
                <Label htmlFor="contactPerson">担当者名</Label>
                <Input id="contactPerson" name="contactPerson" />
              </div>
              <div>
                <Label htmlFor="phone">電話番号</Label>
                <Input id="phone" name="phone" type="tel" />
              </div>
              <div>
                <Label htmlFor="email">メールアドレス</Label>
                <Input id="email" name="email" type="email" />
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

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>仕入先コード</TableHead>
              <TableHead>仕入先名</TableHead>
              <TableHead>担当者</TableHead>
              <TableHead>電話番号</TableHead>
              <TableHead>メールアドレス</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers?.map((supplier) => (
              <TableRow key={supplier.id}>
                <TableCell className="font-mono">{supplier.code}</TableCell>
                <TableCell>{supplier.name}</TableCell>
                <TableCell>{supplier.contactPerson || "-"}</TableCell>
                <TableCell>{supplier.phone || "-"}</TableCell>
                <TableCell>{supplier.email || "-"}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingSupplier(supplier);
                      setIsEditOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(supplier.id)}
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

      {editingSupplier && (
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>仕入先を編集</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <Label htmlFor="edit-code">仕入先コード *</Label>
                <Input
                  id="edit-code"
                  name="code"
                  defaultValue={editingSupplier.code}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-name">仕入先名 *</Label>
                <Input
                  id="edit-name"
                  name="name"
                  defaultValue={editingSupplier.name}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-contactPerson">担当者名</Label>
                <Input
                  id="edit-contactPerson"
                  name="contactPerson"
                  defaultValue={editingSupplier.contactPerson || ""}
                />
              </div>
              <div>
                <Label htmlFor="edit-phone">電話番号</Label>
                <Input
                  id="edit-phone"
                  name="phone"
                  type="tel"
                  defaultValue={editingSupplier.phone || ""}
                />
              </div>
              <div>
                <Label htmlFor="edit-email">メールアドレス</Label>
                <Input
                  id="edit-email"
                  name="email"
                  type="email"
                  defaultValue={editingSupplier.email || ""}
                />
              </div>
              <div>
                <Label htmlFor="edit-notes">備考</Label>
                <Textarea
                  id="edit-notes"
                  name="notes"
                  defaultValue={editingSupplier.notes || ""}
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

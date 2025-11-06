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
import { Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Stock() {
  const utils = trpc.useUtils();
  const { data: stockList, isLoading } = trpc.stock.list.useQuery();

  const formatDate = (date: Date | string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("ja-JP");
  };

  const handleExportCSV = async () => {
    try {
      const result = await utils.client.export.stock.query();
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
        <h1 className="text-3xl font-bold">在庫一覧</h1>
        <Button variant="outline" onClick={handleExportCSV}>
          <Download className="h-4 w-4 mr-2" />
          CSVエクスポート
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
              <TableHead>品目コード</TableHead>
              <TableHead>品目名</TableHead>
              <TableHead>単位</TableHead>
              <TableHead>ロット番号</TableHead>
              <TableHead className="text-right">在庫数量</TableHead>
              <TableHead>入庫日</TableHead>
              <TableHead>有効期限</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stockList?.map((stock) => (
              <TableRow key={stock.id}>
                <TableCell className="font-mono">{stock.itemCode}</TableCell>
                <TableCell>{stock.itemName}</TableCell>
                <TableCell>{stock.unit}</TableCell>
                <TableCell>
                  {stock.requiresLot ? (
                    stock.lotNumber || "-"
                  ) : (
                    <Badge variant="outline">ロット管理なし</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {stock.quantity}
                </TableCell>
                <TableCell>{formatDate(stock.receivedDate)}</TableCell>
                <TableCell>{formatDate(stock.expiryDate)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

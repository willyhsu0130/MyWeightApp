import { Alert, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

export interface BatchItem {
  id: number;
  val: number;
}

export interface Batch {
  id: number;
  items: BatchItem[];
}

export interface ExportMetadata {
  date: string;       // e.g. "115年 6月 25日" or "2026-06-25"
  farmer: string;     // 養殖戶
  origin: string;     // 產地
  driver: string;     // 司機
  basketWeight: number; // 容器扣重 (e.g., 10)
}

export const exportToSpreadsheet = async (
  batches: Batch[],
  meta: ExportMetadata
) => {
  if (batches.every((b) => b.items.length === 0)) {
    Alert.alert('提示', '目前沒有任何資料可供匯出');
    return;
  }

  // UTF-8 Byte Order Mark (BOM) for Chinese character support in Excel/Numbers
  let csvContent = '\uFEFF';

  // 1. 公司寶號標題 (Company Title Header)
  csvContent += `晁欣漁產有限公司,,,,,,\n`;

  // 2. 表頭基本資訊 (Receipt Meta Header)
  csvContent += `日期,${meta.date || '-'},養殖戶,${meta.farmer || '-'},產地,${meta.origin || '-'},司機,${meta.driver || '-'}\n\n`;

  // 3. 欄位標頭 (Columns: 1, 2, 3, 4... + 備註 Remarks column)
  const numBatches = batches.length;
  const columnHeaders = [
    '#',
    ...Array.from({ length: numBatches }, (_, i) => `${i + 1}`),
    '備註',
  ];
  csvContent += columnHeaders.join(',') + '\n';

  // 4. 資料列 (Rows 1 to 25, matching the paper grid)
  const maxRows = Math.max(25, ...batches.map((b) => b.items.length));

  for (let r = 0; r < maxRows; r++) {
    const rowValues = batches.map((b) => (b.items[r] ? b.items[r].val : ''));
    
    // Attach paper remark labels to row 1 & 10 on the right-most column
    let remark = '';
    if (r === 0) remark = `※容器扣重 ${meta.basketWeight} 台斤`;
    if (r === 9) remark = '公斤 / 已扣重';

    const row = [r + 1, ...rowValues, remark];
    csvContent += row.join(',') + '\n';
  }

  // 5. 底部小計 (Subtotal Row)
  const subtotals = batches.map((b) =>
    b.items.reduce((acc, curr) => acc + curr.val, 0).toFixed(2)
  );
  const subtotalRow = ['小計', ...subtotals, ''];
  csvContent += '\n' + subtotalRow.join(',') + '\n';

  // 6. 總計摘要列 (Grand Totals Summary)
  const totalSum = batches.reduce(
    (acc, b) => acc + b.items.reduce((iAcc, item) => iAcc + item.val, 0),
    0
  );
  const totalBaskets = batches.reduce((acc, b) => acc + b.items.length, 0);
  const netWeight = totalSum - totalBaskets * meta.basketWeight;
  const totalPrice = netWeight * 0.975;

  csvContent += `總和,${totalSum.toFixed(2)}\n`;
  csvContent += `總籃數,${totalBaskets}\n`;
  csvContent += `總淨重,${netWeight.toFixed(2)} kg\n`;
  csvContent += `總金額,$${totalPrice.toFixed(2)}\n`;

  // 檔名設定
  const fileName = `晁欣漁產_稱重單據_${meta.date || '未命名'}.csv`;

  try {
    if (Platform.OS === 'web') {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: '分享/儲存 稱重報表',
        });
      } else {
        Alert.alert('匯出成功', `檔案已儲存至: ${fileUri}`);
      }
    }
  } catch (error) {
    Alert.alert('匯出失敗', '產生報表時發生錯誤');
    console.error(error);
  }
};
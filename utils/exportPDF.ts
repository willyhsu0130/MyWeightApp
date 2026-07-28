import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';

export interface BatchItem {
  id: number;
  val: number;
}

export interface Batch {
  id: number;
  items: BatchItem[];
}

export interface ExportMetadata {
  date: string;
  farmer: string;
  origin: string;
  driver: string;
  basketWeight: number;
  waterDeductionFactor: number;
  unitPrice: number;
  unit: string; // '台斤' | '公斤'
  grandTotalSum: number;
  grandTotalCount: number;
  grandTotalNetWeight: number;
  grandTotalWaterWeight: number; // Final Weight after Water Deduction
  grandTotalFinalPrice: number;
}

export const exportToPdf = async (
  batches: Batch[],
  meta: ExportMetadata
) => {
  if (batches.every((b) => b.items.length === 0)) {
    Alert.alert('提示', '目前沒有任何資料可供匯出');
    return;
  }

  const numBatches = batches.length;
  // Always render at least 25 rows to match physical sheet height
  const maxRows = Math.max(25, ...batches.map((b) => b.items.length));
  const unitLabel = meta.unit === '台斤' ? '台斤' : '公斤';

  // 1. Column Headers (Batch 1, 2, 3...)
  const columnHeadersHtml = Array.from(
    { length: numBatches },
    (_, i) => `<th style="border: 1px solid #000; padding: 4px;">${i + 1}</th>`
  ).join('');

  // 2. Grid Rows (1 to 25+) - Without Remarks Column
  let dataRowsHtml = '';
  for (let r = 0; r < maxRows; r++) {
    const cellsHtml = batches
      .map(
        (b) =>
          `<td style="border: 1px solid #000; text-align: center; height: 22px; font-size: 13px;">${b.items[r] ? b.items[r].val : ''
          }</td>`
      )
      .join('');

    dataRowsHtml += `
      <tr>
        <td style="border: 1px solid #000; text-align: center; font-weight: bold; width: 32px; font-size: 11px;">${r + 1}</td>
        ${cellsHtml}
      </tr>
    `;
  }

  // 3. Subtotal Row (小計)
  const subtotalsHtml = batches
    .map((b) => {
      const sum = b.items.reduce((acc, curr) => acc + curr.val, 0);
      return `<td style="border: 1px solid #000; text-align: center; font-weight: bold; font-size: 12px;">${sum > 0 ? sum.toFixed(1) : ''}</td>`;
    })
    .join('');

  // 4. HTML Document Structure
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>晁欣漁產稱重單據</title>
        <style>
          @page { margin: 10mm; }
          body { 
            font-family: system-ui, -apple-system, sans-serif; 
            padding: 10px; 
            color: #000; 
            background: #fff;
          }
          .header-title { 
            text-align: center; 
            font-size: 26px; 
            font-weight: bold; 
            letter-spacing: 2px;
            margin-bottom: 8px; 
          }
          .meta-row { 
            display: flex; 
            justify-content: space-between; 
            font-size: 13px; 
            margin-bottom: 8px; 
            font-weight: bold; 
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
          }
          th { 
            border: 1px solid #000; 
            font-size: 13px;
          }
          .subtotal-label { 
            font-weight: bold; 
            text-align: center; 
            width: 32px; 
            border: 1px solid #000; 
            font-size: 11px;
          }
          
          /* Summary Footer Card */
          .summary-card { 
            margin-top: 12px; 
            border: 1.5px solid #000; 
            padding: 10px 14px; 
            font-size: 12px; 
          }
          .summary-grid { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 4px; 
          }
          .price-row { 
            display: flex; 
            justify-content: space-between; 
            font-size: 15px; 
            font-weight: bold; 
            border-top: 1px dashed #000; 
            padding-top: 6px; 
            margin-top: 6px; 
          }
        </style>
      </head>
      <body>
        <div class="header-title">晁欣漁產有限公司</div>
        
        <div class="meta-row">
          <span>日期：${meta.date || '___年 __月 __日'}</span>
          <span>養殖戶：${meta.farmer || '______'}</span>
          <span>產地：${meta.origin || '______'}</span>
          <span>司機：${meta.driver || '______'}</span>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 32px; border: 1px solid #000;">#</th>
              ${columnHeadersHtml}
            </tr>
          </thead>
          <tbody>
            ${dataRowsHtml}
            <tr>
              <td class="subtotal-label">小計</td>
              ${subtotalsHtml}
            </tr>
          </tbody>
        </table>

        <!-- Summary Section -->
        <div class="summary-card">
          <div class="summary-grid">
            <span><b>總和:</b> ${meta.grandTotalSum} ${unitLabel}</span>
            <span><b>總籃數:</b> ${meta.grandTotalCount} 籃</span>
            <span><b>容器扣重:</b> ${meta.basketWeight} ${unitLabel}/籃</span>
          </div>
          <div class="summary-grid">
            <span><b>淨重:</b> ${meta.grandTotalNetWeight} ${unitLabel}</span>
            <span><b>水重:</b> ${meta.waterDeductionFactor}</span>
          </div>
          <div class="summary-grid" style="margin-top: 4px;">
            <span><b>已扣水重:</b> ${meta.grandTotalWaterWeight} ${unitLabel}</span>
            <span><b>單價:</b> $${meta.unitPrice} / ${unitLabel}</span>
            <span></span>
          </div>
          <div class="price-row">
            <span>總金額 (Final Price):</span>
            <span>$${meta.grandTotalFinalPrice}</span>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    if (Platform.OS === 'web') {
      // 1. Web Download Strategy
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `稱重單據_${meta.date || 'export'}.html`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      // 2. Native Mobile Strategy (iOS / Android)
      const { uri } = await Print.printToFileAsync({ html: htmlContent });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: '列印 / 分享 PDF 稱重單據',
        });
      } else {
        Alert.alert('PDF 已產生', `檔案位置: ${uri}`);
      }
    }
  } catch (error) {
    Alert.alert('PDF 產生失敗', '無法建立 PDF 檔案');
    console.error(error);
  }
};
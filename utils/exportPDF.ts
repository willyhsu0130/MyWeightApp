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
  const maxRows = Math.max(25, ...batches.map((b) => b.items.length));

  // 1. Calculations
  const grandTotalSum = batches.reduce(
    (acc, b) => acc + b.items.reduce((iAcc, item) => iAcc + item.val, 0),
    0
  );
  const grandTotalCount = batches.reduce((acc, b) => acc + b.items.length, 0);
  const grandTotalNetWeight = grandTotalSum - grandTotalCount * meta.basketWeight;
  const grandTotalPrice = grandTotalNetWeight * 0.975;

  // 2. Generate Table Column Headers (1, 2, 3...)
  const columnHeadersHtml = Array.from(
    { length: numBatches },
    (_, i) => `<th style="width: 10%; border: 1px solid #000; padding: 4px;">${i + 1}</th>`
  ).join('');

  // 3. Generate Data Rows (1 to 25+)
  let dataRowsHtml = '';
  for (let r = 0; r < maxRows; r++) {
    const cellsHtml = batches
      .map(
        (b) =>
          `<td style="border: 1px solid #000; text-align: center; height: 22px;">${
            b.items[r] ? b.items[r].val : ''
          }</td>`
      )
      .join('');

    // Attach right-side paper remarks
    let remark = '';
    if (r === 0) remark = `※容器扣重 ${meta.basketWeight} 台斤`;
    if (r === 9) remark = '公斤 / 已扣重';

    dataRowsHtml += `
      <tr>
        <td style="border: 1px solid #000; text-align: center; font-weight: bold; width: 30px;">${r + 1}</td>
        ${cellsHtml}
        <td style="border: 1px solid #000; text-align: center; font-size: 11px;">${remark}</td>
      </tr>
    `;
  }

  // 4. Generate Subtotal Row (小計)
  const subtotalsHtml = batches
    .map((b) => {
      const sum = b.items.reduce((acc, curr) => acc + curr.val, 0);
      return `<td style="border: 1px solid #000; text-align: center; font-weight: bold;">${sum > 0 ? sum.toFixed(1) : ''}</td>`;
    })
    .join('');

  // 5. HTML Template with Final Price Included
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; padding: 20px; color: #000; }
          .title { text-align: center; font-size: 24px; font-weight: bold; margin-bottom: 12px; }
          .meta-row { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 10px; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin-top: 5px; }
          th, td { font-size: 12px; }
          .subtotal-label { font-weight: bold; text-align: center; width: 30px; border: 1px solid #000; }
          
          /* Summary Footer Section */
          .summary-container { margin-top: 15px; border: 1.5px solid #000; padding: 12px; font-size: 13px; }
          .summary-row { display: flex; justify-content: space-between; margin-bottom: 6px; }
          .summary-row:last-child { margin-bottom: 0; }
          .price-highlight { font-size: 16px; font-weight: bold; color: #000; border-top: 1px dashed #000; padding-top: 6px; margin-top: 6px; }
        </style>
      </head>
      <body>
        <div class="title">晁欣漁產有限公司</div>
        
        <div class="meta-row">
          <span>日期：${meta.date || '___年 __月 __日'}</span>
          <span>養殖戶：${meta.farmer || '______'}</span>
          <span>產地：${meta.origin || '______'}</span>
          <span>司機：${meta.driver || '______'}</span>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 30px; border: 1px solid #000;">#</th>
              ${columnHeadersHtml}
              <th style="border: 1px solid #000; width: 110px;">備註</th>
            </tr>
          </thead>
          <tbody>
            ${dataRowsHtml}
            <tr>
              <td class="subtotal-label">小計</td>
              ${subtotalsHtml}
              <td style="border: 1px solid #000;"></td>
            </tr>
          </tbody>
        </table>

        <!-- Total Calculation Box with Price -->
        <div class="summary-container">
          <div class="summary-row">
            <span><b>總和 (Sum):</b> ${grandTotalSum.toFixed(2)}</span>
            <span><b>總籃數 (Baskets):</b> ${grandTotalCount} 籃</span>
            <span><b>單籃扣重:</b> ${meta.basketWeight} kg</span>
          </div>
          <div class="summary-row">
            <span><b>總淨重 (Net Weight):</b> ${grandTotalNetWeight.toFixed(2)} kg</span>
            <span><b>折價比率:</b> 0.975</span>
          </div>
          <div class="summary-row price-highlight">
            <span><b>總金額 (Final Price):</b></span>
            <span><b>$${grandTotalPrice.toFixed(2)}</b></span>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    if (Platform.OS === 'web') {
      await Print.printAsync({ html: htmlContent });
    } else {
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
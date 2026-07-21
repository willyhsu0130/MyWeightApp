import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  ScrollView,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import { Card } from 'react-native-paper';

// Native File System & Sharing
import { exportToSpreadsheet } from '@/utils/exportCSV';
import { exportToPdf } from '@/utils/exportPDF';

// 1. Types
export interface BatchItem {
  id: number;
  val: number;
}

export interface Batch {
  id: number;
  items: BatchItem[];
}

// 2. Type-annotated INITIAL_BATCHES
const INITIAL_BATCHES: Batch[] = [
  {
    id: Date.now(),
    items: [],
  },
];

export default function App() {
  const [batches, setBatches] = useState<Batch[]>(INITIAL_BATCHES);
  const [activeBatchId, setActiveBatchId] = useState<number>(INITIAL_BATCHES[0].id);

  const [input, setInput] = useState<string>('');
  const [basketWeight, setBasketWeight] = useState<string>('10');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editInput, setEditInput] = useState<string>('');
  const [showAllHistory, setShowAllHistory] = useState<boolean>(false);

  // Metadata State
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [exportDate, setExportDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [exportFarmer, setExportFarmer] = useState<string>('');
  const [exportOrigin, setExportOrigin] = useState<string>('');
  const [exportDriver, setExportDriver] = useState<string>('');

  // Draft Modal State
  const [tempDate, setTempDate] = useState<string>('');
  const [tempFarmer, setTempFarmer] = useState<string>('');
  const [tempOrigin, setTempOrigin] = useState<string>('');
  const [tempDriver, setTempDriver] = useState<string>('');

  // Active Batch Safe Access
  const activeBatchIndex = batches.findIndex((b) => b.id === activeBatchId);
  const safeActiveIndex = activeBatchIndex !== -1 ? activeBatchIndex : 0;
  const activeBatch: Batch = batches[safeActiveIndex] || { id: 0, items: [] };

  const getBatchName = (index: number) => `批次 ${index + 1}`;
  const currentBasketWeight = parseFloat(basketWeight) || 0;

  // 1. Current Batch Calculations
  const currentSum = activeBatch.items.reduce((acc, curr) => acc + curr.val, 0);
  const currentCount = activeBatch.items.length;
  const currentNetWeight = currentSum - currentCount * currentBasketWeight;
  const currentPrice = currentNetWeight * 0.975;

  // 2. Grand Totals
  const grandTotalSum = batches.reduce(
    (acc, b) => acc + b.items.reduce((iAcc, item) => iAcc + item.val, 0),
    0
  );
  const grandTotalCount = batches.reduce((acc, b) => acc + b.items.length, 0);
  const grandTotalNetWeight =
    grandTotalSum - grandTotalCount * currentBasketWeight;
  const grandTotalPrice = grandTotalNetWeight * 0.975;

  const maxRows = Math.max(...batches.map((b) => b.items.length), 0);

  // Handlers
  const addBatch = () => {
    const newId = Date.now();
    const newBatch: Batch = {
      id: newId,
      items: [],
    };
    setBatches([...batches, newBatch]);
    setActiveBatchId(newId);
  };

  const addNumber = () => {
    const num = parseFloat(input);
    if (!isNaN(num)) {
      setBatches((prev) =>
        prev.map((batch) =>
          batch.id === activeBatchId
            ? {
                ...batch,
                items: [...batch.items, { id: Date.now(), val: num }],
              }
            : batch
        )
      );
      setInput('');
    }
  };

  const saveEdit = (itemId: number) => {
    const updatedNum = parseFloat(editInput);
    if (!isNaN(updatedNum)) {
      setBatches((prev) =>
        prev.map((batch) =>
          batch.id === activeBatchId
            ? {
                ...batch,
                items: batch.items.map((item) =>
                  item.id === itemId ? { ...item, val: updatedNum } : item
                ),
              }
            : batch
        )
      );
    }
    setEditingId(null);
    setEditInput('');
  };

  const removeItem = (itemId: number) => {
    setBatches((prev) =>
      prev.map((batch) =>
        batch.id === activeBatchId
          ? {
              ...batch,
              items: batch.items.filter((item) => item.id !== itemId),
            }
          : batch
      )
    );
  };

  // --- 開啟魚資訊 Modal ---
  const openFishInfoModal = () => {
    setTempDate(exportDate);
    setTempFarmer(exportFarmer);
    setTempOrigin(exportOrigin);
    setTempDriver(exportDriver);
    setShowExportModal(true);
  };

  // --- 儲存魚資訊並返回 ---
  const saveFishInfo = () => {
    setExportDate(tempDate);
    setExportFarmer(tempFarmer);
    setExportOrigin(tempOrigin);
    setExportDriver(tempDriver);
    setShowExportModal(false);
  };

  // --- 選擇匯出格式 (PDF / CSV) ---
  const handleExport = () => {
    const metadata = {
      date: exportDate,
      farmer: exportFarmer,
      origin: exportOrigin,
      driver: exportDriver,
      basketWeight: currentBasketWeight,
    };

    Alert.alert(
      '選擇匯出格式',
      '請選擇您要產生的報表格式：',
      [
        {
          text: '📄 PDF 報表 (列印/分享)',
          onPress: () => exportToPdf(batches, metadata),
        },
        {
          text: '📊 Excel / CSV 試算表',
          onPress: () => exportToSpreadsheet(batches, metadata),
        },
        {
          text: '取消',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        {/* 頂部批次切換頁籤 */}
        <View style={styles.topTabBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {batches.map((batch, idx) => (
              <TouchableOpacity
                key={batch.id}
                style={[
                  styles.tabItem,
                  batch.id === activeBatchId && styles.activeTabItem,
                ]}
                onPress={() => setActiveBatchId(batch.id)}
              >
                <Text
                  style={[
                    styles.tabText,
                    batch.id === activeBatchId && styles.activeTabText,
                  ]}
                >
                  {getBatchName(idx)} ({batch.items.length})
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.addTabBtn} onPress={addBatch}>
              <Text style={styles.addTabBtnText}>+ 新增批次</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <View style={styles.body}>
          {/* 主要作業區 */}
          <View style={styles.mainArea}>
            <Card style={styles.inputCard}>
              <Text style={styles.heading}>
                {getBatchName(safeActiveIndex)} - 輸入數值
              </Text>

              {/* 第一行：重量輸入框 + 加入按鈕 */}
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.textInput}
                  placeholder="請輸入重量"
                  placeholderTextColor="#7f8c8d"
                  value={input}
                  onChangeText={setInput}
                  keyboardType="numeric"
                />
                <View style={styles.addBtnWrapper}>
                  <Button title="加入" onPress={addNumber} />
                </View>
              </View>

              {/* 第二行：籃重設定區 */}
              <View style={styles.basketWeightContainer}>
                <Text style={styles.basketWeightLabel}>單籃扣重設定 (kg):</Text>
                <TextInput
                  style={styles.basketWeightInput}
                  placeholder="籃重"
                  placeholderTextColor="#7f8c8d"
                  value={basketWeight}
                  onChangeText={setBasketWeight}
                  keyboardType="numeric"
                />
              </View>
            </Card>

            {/* 當前批次統計 */}
            <Text style={styles.sectionTitle}>
              當前批次統計 ({getBatchName(safeActiveIndex)})
            </Text>
            <View style={styles.statsContainer}>
              <Card style={[styles.statBox, { borderLeftColor: '#3498db' }]}>
                <Text style={styles.statLabel}>總和</Text>
                <Text style={[styles.statValue, { color: '#2980b9' }]}>
                  {currentSum.toFixed(2)}
                </Text>
              </Card>

              <Card style={[styles.statBox, { borderLeftColor: '#9b59b6' }]}>
                <Text style={styles.statLabel}>籃數 (筆數)</Text>
                <Text style={[styles.statValue, { color: '#8e44ad' }]}>
                  {currentCount} <Text style={styles.unitText}>籃</Text>
                </Text>
              </Card>

              <Card style={[styles.statBox, { borderLeftColor: '#2ecc71' }]}>
                <View style={styles.labelWithSub}>
                  <Text style={styles.statLabel}>淨重</Text>
                  <Text style={styles.subFormula}>
                    (總和 - 籃數×{currentBasketWeight})
                  </Text>
                </View>
                <Text style={[styles.statValue, { color: '#27ae60' }]}>
                  {currentNetWeight.toFixed(2)}
                </Text>
              </Card>

              <Card style={[styles.statBox, { borderLeftColor: '#e67e22' }]}>
                <View style={styles.labelWithSub}>
                  <Text style={styles.statLabel}>金額 (Price)</Text>
                  <Text style={styles.subFormula}>(淨重 × 0.975)</Text>
                </View>
                <Text style={[styles.statValue, { color: '#d35400' }]}>
                  ${currentPrice.toFixed(2)}
                </Text>
              </Card>
            </View>

            {/* 全域總計列 & 匯出按鈕 */}
            <Card style={styles.grandTotalCard}>
              <Text style={styles.grandTotalTitle}>所有批次總計 (Grand Total)</Text>

              {/* 魚資訊預覽 */}
              {exportFarmer || exportOrigin || exportDriver ? (
                <View style={styles.fishInfoPreview}>
                  <Text style={styles.fishInfoPreviewText}>
                    👤 {exportFarmer || '無'} | 📍 {exportOrigin || '無'} | 🚗 {exportDriver || '無'}
                  </Text>
                </View>
              ) : null}

              <View style={styles.grandTotalRow}>
                <Text style={styles.grandTotalText}>
                  總和: <Text style={styles.bold}>{grandTotalSum.toFixed(2)}</Text>
                </Text>
                <Text style={styles.grandTotalText}>
                  總籃數: <Text style={styles.bold}>{grandTotalCount}</Text>
                </Text>
                <Text style={styles.grandTotalText}>
                  總淨重: <Text style={styles.bold}>{grandTotalNetWeight.toFixed(2)}</Text>
                </Text>
                <Text style={styles.grandTotalText}>
                  總金額: <Text style={styles.bold}>${grandTotalPrice.toFixed(2)}</Text>
                </Text>
              </View>

              {/* 三按鈕：填寫魚資訊 / 匯出報表 / 查看總明細 */}
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.fishInfoBtn}
                  onPress={openFishInfoModal}
                >
                  <Text style={styles.fishInfoBtnText}>魚資訊</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.exportBtn}
                  onPress={handleExport}
                >
                  <Text style={styles.exportBtnText}>匯出報表</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.viewAllBtn}
                  onPress={() => setShowAllHistory(true)}
                >
                  <Text style={styles.viewAllBtnText}>總明細</Text>
                </TouchableOpacity>
              </View>
            </Card>
          </View>

          {/* 右側：當前批次歷史紀錄 */}
          <View style={styles.sidebar}>
            <Text style={styles.historyLabel}>
              {getBatchName(safeActiveIndex)} 紀錄
            </Text>
            <ScrollView style={styles.scrollList} showsVerticalScrollIndicator={false}>
              {activeBatch.items.map((item, index) => (
                <View key={item.id} style={styles.historyCard}>
                  {editingId === item.id ? (
                    <View style={styles.editRow}>
                      <Text style={styles.indexTag}>#{index + 1}</Text>
                      <TextInput
                        style={styles.editInput}
                        value={editInput}
                        onChangeText={setEditInput}
                        keyboardType="numeric"
                        autoFocus
                      />
                      <TouchableOpacity
                        style={styles.saveBtn}
                        onPress={() => saveEdit(item.id)}
                      >
                        <Text style={styles.saveBtnText}>儲存</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.itemRow}
                      onPress={() => {
                        setEditingId(item.id);
                        setEditInput(item.val.toString());
                      }}
                    >
                      <View style={styles.valWithIndex}>
                        <Text style={styles.indexTag}>#{index + 1}</Text>
                        <Text style={styles.itemText}>{item.val}</Text>
                      </View>
                      <TouchableOpacity onPress={() => removeItem(item.id)}>
                        <Text style={styles.deleteBtn}>✕</Text>
                      </TouchableOpacity>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* 1. 全區所有批次總明細 Modal */}
        <Modal visible={showAllHistory} animationType="slide">
          <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>全區所有批次總明細</Text>
                <Button title="關閉" onPress={() => setShowAllHistory(false)} />
              </View>

              <View style={styles.receiptHeaderCard}>
                <View style={styles.receiptHeaderRow}>
                  <Text style={styles.receiptHeaderText}>
                    <Text style={styles.receiptLabel}>年月日：</Text>
                    {exportDate || '未填寫'}
                  </Text>
                  <Text style={styles.receiptHeaderText}>
                    <Text style={styles.receiptLabel}>養殖戶：</Text>
                    {exportFarmer || '未填寫'}
                  </Text>
                </View>
                <View style={styles.receiptHeaderRow}>
                  <Text style={styles.receiptHeaderText}>
                    <Text style={styles.receiptLabel}>產地：</Text>
                    {exportOrigin || '未填寫'}
                  </Text>
                  <Text style={styles.receiptHeaderText}>
                    <Text style={styles.receiptLabel}>司機：</Text>
                    {exportDriver || '未填寫'}
                  </Text>
                </View>
                <View style={styles.receiptHeaderRow}>
                  <Text style={styles.receiptHeaderText}>
                    <Text style={styles.receiptLabel}>容器扣重：</Text>
                    {currentBasketWeight} kg / 籃
                  </Text>
                </View>
              </View>

              <ScrollView style={{ flex: 1 }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                  <View style={styles.excelTable}>
                    {/* Header Row */}
                    <View style={styles.excelHeaderRow}>
                      <View
                        style={[
                          styles.excelCell,
                          styles.excelHeaderCell,
                          styles.indexColumn,
                        ]}
                      >
                        <Text style={styles.excelHeaderText}>#</Text>
                      </View>
                      {batches.map((b, idx) => (
                        <View
                          key={b.id}
                          style={[styles.excelCell, styles.excelHeaderCell]}
                        >
                          <Text style={styles.excelHeaderText}>
                            {getBatchName(idx)} ({b.items.length} 籃)
                          </Text>
                        </View>
                      ))}
                      <View
                        style={[
                          styles.excelCell,
                          styles.excelHeaderCell,
                          styles.grandTotalHeaderCell,
                        ]}
                      >
                        <Text style={styles.excelHeaderText}>全區總計</Text>
                      </View>
                    </View>

                    {/* Data Rows */}
                    {Array.from({ length: maxRows }).map((_, rowIndex) => {
                      const rowSum = batches.reduce(
                        (acc, b) =>
                          acc + (b.items[rowIndex] ? b.items[rowIndex].val : 0),
                        0
                      );

                      return (
                        <View key={rowIndex} style={styles.excelRow}>
                          <View style={[styles.excelCell, styles.indexCell]}>
                            <Text style={styles.indexCellText}>
                              #{rowIndex + 1}
                            </Text>
                          </View>
                          {batches.map((b) => {
                            const item = b.items[rowIndex];
                            return (
                              <View key={b.id} style={styles.excelCell}>
                                <Text style={styles.excelCellText}>
                                  {item ? item.val : '-'}
                                </Text>
                              </View>
                            );
                          })}
                          <View
                            style={[styles.excelCell, styles.grandTotalCell]}
                          >
                            <Text style={styles.grandTotalCellText}>
                              {rowSum > 0 ? rowSum.toFixed(2) : '-'}
                            </Text>
                          </View>
                        </View>
                      );
                    })}

                    {/* Summary Row 1: Sum */}
                    <View style={[styles.excelRow, styles.summaryRow]}>
                      <View style={[styles.excelCell, styles.summaryLabelCell]}>
                        <Text style={styles.summaryLabelText}>總和</Text>
                      </View>
                      {batches.map((b) => {
                        const sum = b.items.reduce(
                          (acc, curr) => acc + curr.val,
                          0
                        );
                        return (
                          <View key={b.id} style={styles.excelCell}>
                            <Text
                              style={[
                                styles.summaryValText,
                                { color: '#2980b9' },
                              ]}
                            >
                              {sum.toFixed(2)}
                            </Text>
                          </View>
                        );
                      })}
                      <View
                        style={[
                          styles.excelCell,
                          styles.grandTotalSummaryCell,
                        ]}
                      >
                        <Text
                          style={[styles.summaryValText, { color: '#2980b9' }]}
                        >
                          {grandTotalSum.toFixed(2)}
                        </Text>
                      </View>
                    </View>

                    {/* Summary Row 2: Count */}
                    <View style={[styles.excelRow, styles.summaryRow]}>
                      <View style={[styles.excelCell, styles.summaryLabelCell]}>
                        <Text style={styles.summaryLabelText}>籃數</Text>
                      </View>
                      {batches.map((b) => (
                        <View key={b.id} style={styles.excelCell}>
                          <Text
                            style={[
                              styles.summaryValText,
                              { color: '#8e44ad' },
                            ]}
                          >
                            {b.items.length}
                          </Text>
                        </View>
                      ))}
                      <View
                        style={[
                          styles.excelCell,
                          styles.grandTotalSummaryCell,
                        ]}
                      >
                        <Text
                          style={[styles.summaryValText, { color: '#8e44ad' }]}
                        >
                          {grandTotalCount}
                        </Text>
                      </View>
                    </View>

                    {/* Summary Row 3: Net Weight */}
                    <View style={[styles.excelRow, styles.summaryRow]}>
                      <View style={[styles.excelCell, styles.summaryLabelCell]}>
                        <Text style={styles.summaryLabelText}>淨重</Text>
                      </View>
                      {batches.map((b) => {
                        const sum = b.items.reduce(
                          (acc, curr) => acc + curr.val,
                          0
                        );
                        const net = sum - b.items.length * currentBasketWeight;
                        return (
                          <View key={b.id} style={styles.excelCell}>
                            <Text
                              style={[
                                styles.summaryValText,
                                { color: '#27ae60' },
                              ]}
                            >
                              {net.toFixed(2)}
                            </Text>
                          </View>
                        );
                      })}
                      <View
                        style={[
                          styles.excelCell,
                          styles.grandTotalSummaryCell,
                        ]}
                      >
                        <Text
                          style={[
                            styles.summaryValText,
                            {
                              color: '#27ae60',
                              fontSize: 13,
                              fontWeight: '900',
                            },
                          ]}
                        >
                          {grandTotalNetWeight.toFixed(2)}
                        </Text>
                      </View>
                    </View>

                    {/* Summary Row 4: Price */}
                    <View style={[styles.excelRow, styles.summaryRow]}>
                      <View style={[styles.excelCell, styles.summaryLabelCell]}>
                        <Text style={styles.summaryLabelText}>金額</Text>
                      </View>
                      {batches.map((b) => {
                        const sum = b.items.reduce(
                          (acc, curr) => acc + curr.val,
                          0
                        );
                        const net = sum - b.items.length * currentBasketWeight;
                        const price = net * 0.975;
                        return (
                          <View key={b.id} style={styles.excelCell}>
                            <Text
                              style={[
                                styles.summaryValText,
                                { color: '#e67e22' },
                              ]}
                            >
                              ${price.toFixed(2)}
                            </Text>
                          </View>
                        );
                      })}
                      <View
                        style={[
                          styles.excelCell,
                          styles.grandTotalSummaryCell,
                        ]}
                      >
                        <Text
                          style={[
                            styles.summaryValText,
                            {
                              color: '#d35400',
                              fontSize: 13,
                              fontWeight: '900',
                            },
                          ]}
                        >
                          ${grandTotalPrice.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </ScrollView>
              </ScrollView>
            </View>
          </SafeAreaView>
        </Modal>

        {/* 2. 魚資訊填寫 Modal */}
        <Modal
          visible={showExportModal}
          transparent={true}
          animationType="fade"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.exportModalBox}>
              <Text style={styles.exportModalTitle}>填寫出貨魚資訊</Text>

              {/* 報表表頭即時預覽 */}
              {/* <View style={styles.modalPreviewCard}>
                <View style={styles.modalPreviewRow}>
                  <Text style={styles.modalPreviewText}>
                    <Text style={styles.modalPreviewLabel}>年月日：</Text>
                    {tempDate || '未填寫'}
                  </Text>
                  <Text style={styles.modalPreviewText}>
                    <Text style={styles.modalPreviewLabel}>養殖戶：</Text>
                    {tempFarmer || '未填寫'}
                  </Text>
                </View>
                <View style={styles.modalPreviewRow}>
                  <Text style={styles.modalPreviewText}>
                    <Text style={styles.modalPreviewLabel}>產地：</Text>
                    {tempOrigin || '未填寫'}
                  </Text>
                  <Text style={styles.modalPreviewText}>
                    <Text style={styles.modalPreviewLabel}>司機：</Text>
                    {tempDriver || '未填寫'}
                  </Text>
                </View>
              </View> */}

              {/* 輸入表單 */}
              <View style={styles.exportInputGroup}>
                <Text style={styles.exportInputLabel}>年月日 :</Text>
                <TextInput
                  style={styles.exportTextInput}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#7f8c8d"
                  value={tempDate}
                  onChangeText={setTempDate}
                />
              </View>

              <View style={styles.exportInputGroup}>
                <Text style={styles.exportInputLabel}>養殖戶 :</Text>
                <TextInput
                  style={styles.exportTextInput}
                  placeholder="請輸入養殖戶姓名"
                  placeholderTextColor="#7f8c8d"
                  value={tempFarmer}
                  onChangeText={setTempFarmer}
                />
              </View>

              <View style={styles.exportInputGroup}>
                <Text style={styles.exportInputLabel}>產地 :</Text>
                <TextInput
                  style={styles.exportTextInput}
                  placeholder="請輸入產地位置"
                  placeholderTextColor="#7f8c8d"
                  value={tempOrigin}
                  onChangeText={setTempOrigin}
                />
              </View>

              <View style={styles.exportInputGroup}>
                <Text style={styles.exportInputLabel}>司機 :</Text>
                <TextInput
                  style={styles.exportTextInput}
                  placeholder="請輸入司機姓名"
                  placeholderTextColor="#7f8c8d"
                  value={tempDriver}
                  onChangeText={setTempDriver}
                />
              </View>

              <View style={styles.exportActionRow}>
                <TouchableOpacity
                  style={[styles.exportModalBtn, styles.cancelBtn]}
                  onPress={() => setShowExportModal(false)}
                >
                  <Text style={styles.cancelBtnText}>取消</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.exportModalBtn, styles.confirmBtn]}
                  onPress={saveFishInfo}
                >
                  <Text style={styles.confirmBtnText}>儲存並返回</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#f4f6f7',
  },
  topTabBar: {
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tabItem: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: '#ecf0f1',
    marginRight: 8,
  },
  activeTabItem: {
    backgroundColor: '#3498db',
  },
  tabText: {
    fontSize: 13,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#ffffff',
  },
  addTabBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#3498db',
    borderStyle: 'dashed',
  },
  addTabBtnText: {
    fontSize: 13,
    color: '#3498db',
    fontWeight: 'bold',
  },
  body: {
    flex: 1,
    flexDirection: 'row',
  },
  mainArea: {
    flex: 2,
    padding: 14,
  },
  sidebar: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderLeftWidth: 1,
    borderLeftColor: '#e0e0e0',
    padding: 12,
  },
  inputCard: {
    padding: 14,
    marginBottom: 12,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    elevation: 1,
  },
  heading: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2c3e50',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#7f8c8d',
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 8,
    padding: 8,
    fontSize: 15,
    backgroundColor: '#fff',
  },
  addBtnWrapper: {
    width: 65,
  },
  basketWeightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f3f4',
  },
  basketWeightLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7f8c8d',
    marginRight: 8,
  },
  basketWeightInput: {
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 12,
    fontSize: 14,
    backgroundColor: '#fff',
    textAlign: 'center',
    width: 75,
  },
  statsContainer: {
    gap: 8,
    marginBottom: 12,
  },
  statBox: {
    padding: 10,
    backgroundColor: '#ffffff',
    borderLeftWidth: 5,
    borderRadius: 8,
  },
  labelWithSub: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  subFormula: {
    fontSize: 9,
    color: '#bdc3c7',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 2,
  },
  unitText: {
    fontSize: 12,
    fontWeight: 'normal',
    color: '#7f8c8d',
  },
  grandTotalCard: {
    padding: 12,
    backgroundColor: '#2c3e50',
    borderRadius: 8,
  },
  grandTotalTitle: {
    color: '#f1c40f',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  fishInfoPreview: {
    backgroundColor: 'rgba(39, 174, 96, 0.15)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  fishInfoPreviewText: {
    color: '#2ecc71',
    fontSize: 12,
    fontWeight: '600',
  },
  grandTotalRow: {
    flexDirection: 'column',
    gap: 4,
    marginBottom: 12,
  },
  grandTotalText: {
    color: '#ecf0f1',
    fontSize: 13,
  },
  bold: {
    fontWeight: 'bold',
    color: '#ffffff',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 6,
  },
  fishInfoBtn: {
    flex: 1.1,
    backgroundColor: '#e67e22',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fishInfoBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  exportBtn: {
    flex: 1.2,
    backgroundColor: '#27ae60',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exportBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  viewAllBtn: {
    flex: 1,
    backgroundColor: '#34495e',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewAllBtnText: {
    color: '#bdc3c7',
    fontSize: 12,
    fontWeight: 'bold',
  },
  historyLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#34495e',
    marginBottom: 8,
  },
  scrollList: {
    flex: 1,
  },
  historyCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    padding: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  valWithIndex: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indexTag: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#95a5a6',
    marginRight: 6,
  },
  itemText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
  },
  deleteBtn: {
    color: '#e74c3c',
    fontSize: 13,
    paddingHorizontal: 4,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#3498db',
    borderRadius: 4,
    padding: 2,
    paddingHorizontal: 6,
    width: '45%',
    backgroundColor: '#fff',
    fontSize: 13,
  },
  saveBtn: {
    backgroundColor: '#2ecc71',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  receiptHeaderCard: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dcdcdc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 14,
  },
  receiptHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  receiptHeaderText: {
    fontSize: 13,
    color: '#2c3e50',
    flex: 1,
  },
  receiptLabel: {
    fontWeight: 'bold',
    color: '#34495e',
  },
  excelTable: {
    borderWidth: 1,
    borderColor: '#c0c0c0',
    backgroundColor: '#ffffff',
  },
  excelHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#2c3e50',
  },
  excelRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  excelCell: {
    width: 110,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRightWidth: 1,
    borderRightColor: '#dcdcdc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  excelHeaderCell: {
    backgroundColor: '#2c3e50',
  },
  excelHeaderText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 13,
    textAlign: 'center',
  },
  excelCellText: {
    fontSize: 13,
    color: '#2c3e50',
  },
  indexColumn: {
    width: 50,
    backgroundColor: '#34495e',
  },
  indexCell: {
    width: 50,
    backgroundColor: '#f0f3f4',
  },
  indexCellText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#7f8c8d',
  },
  summaryRow: {
    backgroundColor: '#eaeded',
    borderTopWidth: 1,
    borderTopColor: '#bdc3c7',
  },
  summaryLabelCell: {
    width: 50,
    backgroundColor: '#d5dbdb',
  },
  summaryLabelText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  summaryValText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  grandTotalHeaderCell: {
    backgroundColor: '#d35400',
  },
  grandTotalCell: {
    backgroundColor: '#fdf2e9',
  },
  grandTotalCellText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#d35400',
  },
  grandTotalSummaryCell: {
    backgroundColor: '#f5cba7',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exportModalBox: {
    width: '85%',
    maxWidth: 400,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  exportModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalPreviewCard: {
    backgroundColor: '#eef2f3',
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  modalPreviewTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#7f8c8d',
    marginBottom: 6,
    textAlign: 'center',
  },
  modalPreviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  modalPreviewText: {
    fontSize: 12,
    color: '#2c3e50',
    flex: 1,
  },
  modalPreviewLabel: {
    fontWeight: 'bold',
    color: '#34495e',
  },
  exportInputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  exportInputLabel: {
    width: 70,
    fontSize: 14,
    fontWeight: '600',
    color: '#34495e',
  },
  exportTextInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    fontSize: 14,
    backgroundColor: '#fcfcfc',
  },
  exportActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  exportModalBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#ecf0f1',
    borderWidth: 1,
    borderColor: '#bdc3c7',
  },
  cancelBtnText: {
    color: '#7f8c8d',
    fontWeight: '600',
  },
  confirmBtn: {
    backgroundColor: '#27ae60',
  },
  confirmBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});
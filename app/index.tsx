import type { Batch } from "@/types/weight";
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Button,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Card } from 'react-native-paper';
// Native File System & Sharing
import { exportToSpreadsheet } from '@/utils/exportCSV';
import { exportToPdf } from '@/utils/exportPDF';

type WeightUnit = 'jin' | 'kg';

export default function App() {
  const weightInputRef = useRef<TextInput>(null);

  const [batches, setBatches] = useState<Batch[]>(() => [{ id: Date.now(), items: [] }]);
  const [activeBatchId, setActiveBatchId] = useState<number>(() => batches[0]?.id || Date.now());

  // Unit State (台斤 vs 公斤)
  const [unit, setUnit] = useState<WeightUnit>('jin');

  const [input, setInput] = useState<string>('');
  const [basketWeight, setBasketWeight] = useState<string>('10');
  const [waterDeductionFactor, setWaterDeductionFactor] = useState<string>('0.975');
  const [unitPrice, setUnitPrice] = useState<string>('0');

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
  const [tempDeductionFactor, setTempDeductionFactor] = useState<string>('0.975');
  const [tempUnitPrice, setTempUnitPrice] = useState<string>('0');

  // Active Batch Safe Access
  const activeBatchIndex = batches.findIndex((b) => b.id === activeBatchId);
  const safeActiveIndex = activeBatchIndex !== -1 ? activeBatchIndex : 0;
  const activeBatch: Batch = batches[safeActiveIndex] || { id: 0, items: [] };

  const getBatchName = (index: number) => `批次 ${index + 1}`;
  const unitLabel = unit === 'jin' ? '斤' : 'kg';
  const unitTextFull = unit === 'jin' ? '台斤' : '公斤';

  const currentBasketWeight = parseFloat(basketWeight) || 0;
  const currentDeductionFactor = parseFloat(waterDeductionFactor) || 0;
  const currentUnitPrice = parseFloat(unitPrice) || 0;

  // 1. Current Batch Calculations
  const currentSum = activeBatch.items.reduce((acc, curr) => acc + curr.val, 0);
  const currentCount = activeBatch.items.length;
  const currentNetWeight = currentSum - currentCount * currentBasketWeight;
  const currentWaterWeight = currentNetWeight * currentDeductionFactor;
  const currentFinalPrice = currentWaterWeight * currentUnitPrice;

  // 2. Grand Totals
  const grandTotalSum = batches.reduce(
    (acc, b) => acc + b.items.reduce((iAcc, item) => iAcc + item.val, 0),
    0
  );
  const grandTotalCount = batches.reduce((acc, b) => acc + b.items.length, 0);
  const grandTotalNetWeight = grandTotalSum - grandTotalCount * currentBasketWeight;

  // Truncate grand total water weight to 2 decimal places without rounding up
  const grandTotalWaterWeight = Math.trunc(grandTotalNetWeight * currentDeductionFactor);
  const grandTotalFinalPrice = Math.trunc(grandTotalWaterWeight * currentUnitPrice);

  const maxRows = Math.max(...batches.map((b) => b.items.length), 0);
  const focusWeightInput = () => {
    setTimeout(() => {
      weightInputRef.current?.focus();
    }, 50);
  };

  const addBatch = () => {
    const newId = Date.now();
    const newBatch: Batch = {
      id: newId,
      items: [],
    };
    setBatches([...batches, newBatch]);
    setActiveBatchId(newId);
    focusWeightInput();
  };

  // --- 刪除批次 Confirmation & Handler ---
  const confirmDeleteBatch = (batchIdToDelete: number) => {
    const targetIndex = batches.findIndex((b) => b.id === batchIdToDelete);
    const batchName = getBatchName(targetIndex !== -1 ? targetIndex : safeActiveIndex);

    if (Platform.OS === "ios") {
      Alert.alert(
        '確認刪除批次',
        `您確定要刪除「${batchName}」及其所有紀錄嗎？此動作無法復原。`,
        [
          { text: '取消', style: 'cancel' },
          {
            text: '刪除',
            style: 'destructive',
            onPress: () => {
              if (batches.length <= 1) {
                const newId = Date.now();
                setBatches([{ id: newId, items: [] }]);
                setActiveBatchId(newId);
                return;
              }

              const updatedBatches = batches.filter((b) => b.id !== batchIdToDelete);
              setBatches(updatedBatches);

              if (activeBatchId === batchIdToDelete) {
                setActiveBatchId(updatedBatches[0].id);
              }
            },
          },
        ]
      );
    }
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
    focusWeightInput();
  };

  const handleInputSubmit = () => {
    if (input.trim() === '') {
      addBatch();
    } else {
      addNumber();
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
    setTempDeductionFactor(waterDeductionFactor);
    setTempUnitPrice(unitPrice);
    setShowExportModal(true);
  };

  // --- 儲存魚資訊並返回 ---
  const saveFishInfo = () => {
    setExportDate(tempDate);
    setExportFarmer(tempFarmer);
    setExportOrigin(tempOrigin);
    setExportDriver(tempDriver);
    setWaterDeductionFactor(tempDeductionFactor);
    setUnitPrice(tempUnitPrice);
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
      waterDeductionFactor: currentDeductionFactor,
      unitPrice: currentUnitPrice,
      unit: unitTextFull,
      // Pre-calculated grand totals
      grandTotalSum,
      grandTotalCount,
      grandTotalNetWeight,
      grandTotalWaterWeight: Math.floor(grandTotalWaterWeight),
      grandTotalFinalPrice,
    };

    if (Platform.OS === "web") {
      // Prompt user to pick PDF or CSV on web
      const isPdf = window.confirm(
        "請選擇匯出格式：\n\n按下 [確定] 匯出 PDF 報表\n按下 [取消] 匯出 Excel / CSV 試算表"
      );
      if (isPdf) {
        exportToPdf(batches, metadata);
      } else {
        exportToSpreadsheet(batches, metadata);
      }
    } else {
      Alert.alert(
        '選擇匯出格式',
        '請選擇您要產生的報表格式：',
        [
          {
            text: 'PDF 報表 (列印/分享)',
            onPress: () => exportToPdf(batches, metadata),
          },
          {
            text: 'Excel / CSV 試算表',
            onPress: () => exportToSpreadsheet(batches, metadata),
          },
          {
            text: '取消',
            style: 'cancel',
          },
        ],
        { cancelable: true }
      );
    }
  };

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    // Check if user has entered any weight items across all batches
    const hasData = batches.some((b) => b.items.length > 0);
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasData) {
        // Standard Web API way to trigger browser default confirmation dialog
        event.preventDefault();
        return '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [batches]);

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

          {/* Left Area */}
          <View style={styles.mainArea}>

            <Card style={styles.inputCard}>
              {/* 單位切換鈕 (台斤 / 公斤) */}
              <View style={styles.unitToggleContainer}>
                <TouchableOpacity
                  style={[
                    styles.unitBtn,
                    unit === 'jin' && styles.activeUnitBtn,
                  ]}
                  onPress={() => setUnit('jin')}
                >
                  <Text
                    style={[
                      styles.unitBtnText,
                      unit === 'jin' && styles.activeUnitBtnText,
                    ]}
                  >
                    台斤
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.unitBtn,
                    unit === 'kg' && styles.activeUnitBtn,
                  ]}
                  onPress={() => setUnit('kg')}
                >
                  <Text
                    style={[
                      styles.unitBtnText,
                      unit === 'kg' && styles.activeUnitBtnText,
                    ]}
                  >
                    公斤
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={Platform.OS === "ios" ? styles.headingWrapperMobile : styles.headingWrapper}>
                <Text style={styles.heading}>
                  {getBatchName(safeActiveIndex)} - 輸入數值
                </Text>
              </View>

              {/* 第一行：重量輸入框 + 加入按鈕 */}
              <View style={styles.inputRow}>
                <TextInput
                  ref={weightInputRef}
                  style={styles.textInput}
                  placeholder={`請輸入重量 (${unitLabel})`}
                  placeholderTextColor="#7f8c8d"
                  value={input}
                  onChangeText={setInput}
                  keyboardType="numeric"
                  onSubmitEditing={handleInputSubmit}
                />
                <View style={styles.addBtnWrapper}>
                  <Button title="加入" onPress={addNumber} />
                </View>
              </View>

              {/* 第二行：籃重、水重、單價設定區 */}
              <View style={Platform.OS === "ios" ? styles.settingsContainerMobile : styles.settingsContainer}>
                <View style={styles.settingItem}>
                  <Text style={styles.settingLabel}>籃重 ({unitLabel}):</Text>
                  <TextInput
                    style={styles.settingInput}
                    placeholder="籃重"
                    placeholderTextColor="#7f8c8d"
                    value={basketWeight}
                    onChangeText={setBasketWeight}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.settingItem}>
                  <Text style={styles.settingLabel}>水重:</Text>
                  <TextInput
                    style={styles.settingInput}
                    placeholder="0.975"
                    placeholderTextColor="#7f8c8d"
                    value={waterDeductionFactor}
                    onChangeText={setWaterDeductionFactor}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.settingItem}>
                  <Text style={styles.settingLabel}>單價 ($/{unitLabel}):</Text>
                  <TextInput
                    style={styles.settingInput}
                    placeholder="單價"
                    placeholderTextColor="#7f8c8d"
                    value={unitPrice}
                    onChangeText={setUnitPrice}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* 第三行：最底部的刪除批次按鈕 */}
              <TouchableOpacity
                style={styles.deleteBatchBtn}
                onPress={() => confirmDeleteBatch(activeBatch.id)}
              >
                <Text style={styles.deleteBatchBtnText}>刪除此批次</Text>
              </TouchableOpacity>
            </Card>

            {/* 當前批次統計 */}
            <Text style={styles.sectionTitle}>
              當前批次統計 ({getBatchName(safeActiveIndex)})
            </Text>

            <View style={styles.statsContainer}>
              <View style={styles.statsRow}>
                <Card style={[styles.statBox, { flex: 1, borderLeftColor: '#3498db' }]}>
                  <Text style={styles.statLabel}>總和 ({unitLabel})</Text>
                  <Text style={[styles.statValue, { color: '#2980b9' }]}>
                    {currentSum.toFixed(2)} <Text style={styles.unitText}>{unitLabel}</Text>
                  </Text>
                </Card>

                <Card style={[styles.statBox, { flex: 1, borderLeftColor: '#9b59b6' }]}>
                  <Text style={styles.statLabel}>籃數 (筆數)</Text>
                  <Text style={[styles.statValue, { color: '#8e44ad' }]}>
                    {currentCount} <Text style={styles.unitText}>籃</Text>
                  </Text>
                </Card>
              </View>

              <View style={styles.statsRow}>
                <Card style={[styles.statBox, { flex: 1, borderLeftColor: '#2ecc71' }]}>
                  <View style={Platform.OS === "ios" ? styles.labelWithSubMobile : styles.labelWithSub}>
                    <Text style={styles.statLabel}>淨重 ({unitLabel})</Text>
                    <Text style={styles.subFormula}>(總和 - 籃數×{currentBasketWeight})</Text>
                  </View>
                  <Text style={[styles.statValue, { color: '#27ae60' }]}>
                    {currentNetWeight.toFixed(2)} <Text style={styles.unitText}>{unitLabel}</Text>
                  </Text>
                </Card>

                <Card style={[styles.statBox, { flex: 1, borderLeftColor: '#e67e22' }]}>
                  <View style={Platform.OS === "ios" ? styles.labelWithSubMobile : styles.labelWithSub}>
                    <Text style={styles.statLabel}>已扣水重 ({unitLabel})</Text>
                    <Text style={styles.subFormula}>(淨重 × {currentDeductionFactor})</Text>
                  </View>
                  <Text style={[styles.statValue, { color: '#d35400' }]}>
                    {currentWaterWeight.toFixed(2)} <Text style={styles.unitText}>{unitLabel}</Text>
                  </Text>
                </Card>
              </View>

              {/* 最終總金額卡片 */}
              <Card style={[styles.statBox, { borderLeftColor: '#f1c40f', backgroundColor: '#fef9e7' }]}>
                <View style={styles.labelWithSub}>
                  <Text style={[styles.statLabel, { color: '#b7950b', fontWeight: 'bold' }]}>
                    金額 (Final Amount)
                  </Text>
                  <Text style={[styles.subFormula, { color: '#d4ac0d' }]}>
                    (已扣水重 × ${currentUnitPrice})
                  </Text>
                </View>
                <Text style={[styles.statValue, { color: '#b7950b' }]}>
                  ${currentFinalPrice.toFixed(2)}
                </Text>
              </Card>
            </View>


            {/* 全域總計列 & 匯出按鈕 */}
            <View style={styles.grandTotalCard} id="grandTotalCard">
              <Text style={styles.grandTotalTitle}>
                所有批次總計 (Grand Total) - {unitTextFull}
              </Text>

              {/* Main Horizontal Content Area */}
              <View style={styles.cardContentRow}>

                {/* Left Side: Dominant Info Area */}
                <View style={styles.fContainer} id="fContainer">
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
                      總和: <Text style={styles.bold}>{grandTotalSum} {unitLabel}</Text>
                    </Text>
                    <Text style={styles.grandTotalText}>
                      總籃數: <Text style={styles.bold}>{grandTotalCount} 籃</Text>
                    </Text>
                    <Text style={styles.grandTotalText}>
                      總淨重: <Text style={styles.bold}>{grandTotalNetWeight} {unitLabel}</Text>
                    </Text>
                    <Text style={styles.grandTotalText}>
                      總已扣水重: <Text style={styles.bold}>{grandTotalWaterWeight} {unitLabel}</Text>
                    </Text>
                    <Text style={[styles.grandTotalText, { color: '#f1c40f', fontWeight: 'bold' }]}>
                      總金額: <Text style={styles.bold}>${grandTotalFinalPrice}</Text>
                    </Text>
                  </View>
                </View>

                {/* Right Side: Action Buttons Column */}
                <View style={styles.actionColumn}>
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

              </View>
            </View>
          </View>

          {/* Right Area */}
          <View style={styles.sidebar}>
            <Text style={styles.historyLabel}>
              {getBatchName(safeActiveIndex)} 紀錄 ({unitLabel})
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
                        <Text style={styles.itemText}>{item.val} {unitLabel}</Text>
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
                <Text style={styles.modalTitle}>全區所有批次總明細 ({unitTextFull})</Text>
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
                    <Text style={styles.receiptLabel}>計量單位：</Text>
                    {unitTextFull}
                  </Text>
                  <Text style={styles.receiptHeaderText}>
                    <Text style={styles.receiptLabel}>容器扣重：</Text>
                    {currentBasketWeight} {unitLabel} / 籃
                  </Text>
                  <Text style={styles.receiptHeaderText}>
                    <Text style={styles.receiptLabel}>水重：</Text>
                    {currentDeductionFactor}
                  </Text>
                  <Text style={styles.receiptHeaderText}>
                    <Text style={styles.receiptLabel}>單價：</Text>
                    ${currentUnitPrice} / {unitLabel}
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
                              {rowSum > 0 ? rowSum : '-'}
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
                          {grandTotalSum}
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
                          {grandTotalNetWeight}
                        </Text>
                      </View>
                    </View>

                    {/* Summary Row 4: Water Weight */}
                    <View style={[styles.excelRow, styles.summaryRow]}>
                      <View style={[styles.excelCell, styles.summaryLabelCell]}>
                        <Text style={styles.summaryLabelText}>已扣水重</Text>
                      </View>
                      {batches.map((b) => {
                        const sum = b.items.reduce(
                          (acc, curr) => acc + curr.val,
                          0
                        );
                        const net = sum - b.items.length * currentBasketWeight;
                        const waterWeight = net * currentDeductionFactor;
                        return (
                          <View key={b.id} style={styles.excelCell}>
                            <Text
                              style={[
                                styles.summaryValText,
                                { color: '#e67e22' },
                              ]}
                            >
                              {waterWeight.toFixed(2)}
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
                          {grandTotalWaterWeight}
                        </Text>
                      </View>
                    </View>

                    {/* Summary Row 5: Price */}
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
                        const waterWeight = net * currentDeductionFactor;
                        const finalPrice = waterWeight * currentUnitPrice;
                        return (
                          <View key={b.id} style={styles.excelCell}>
                            <Text
                              style={[
                                styles.summaryValText,
                                { color: '#b7950b' },
                              ]}
                            >
                              ${finalPrice.toFixed(2)}
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
                              color: '#b7950b',
                              fontSize: 13,
                              fontWeight: '900',
                            },
                          ]}
                        >
                          ${grandTotalFinalPrice}
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

              <View style={styles.exportInputGroup}>
                <Text style={styles.exportInputLabel}>水重 :</Text>
                <TextInput
                  style={styles.exportTextInput}
                  placeholder="0.975"
                  placeholderTextColor="#7f8c8d"
                  value={tempDeductionFactor}
                  onChangeText={setTempDeductionFactor}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.exportInputGroup}>
                <Text style={styles.exportInputLabel}>單價 ($/{unitLabel}) :</Text>
                <TextInput
                  style={styles.exportTextInput}
                  placeholder="請輸入單價"
                  placeholderTextColor="#7f8c8d"
                  value={tempUnitPrice}
                  onChangeText={setTempUnitPrice}
                  keyboardType="numeric"
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
    fontFamily: Platform.OS === 'web'
      ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "PingFang TC", "Microsoft JhengHei", sans-serif'
      : undefined,
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
  headingWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headingWrapperMobile: {
    flexDirection: 'row',
    flexWrap: "wrap",
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  heading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  unitToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#f0f3f4',
    borderRadius: 6,
    padding: 2,
    marginBottom: 6
  },
  unitBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 4,
    flex: 1
  },
  activeUnitBtn: {
    backgroundColor: '#3498db',
  },
  unitBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7f8c8d',
  },
  activeUnitBtnText: {
    color: '#ffffff',
  },
  deleteBatchBtn: {
    backgroundColor: '#ffebee',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ffcdd2',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  deleteBatchBtnText: {
    color: '#e53935',
    fontSize: 13,
    fontWeight: 'bold',
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
  settingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f3f4',
    gap: 4,
  },
  settingsContainerMobile: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f3f4',
    gap: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7f8c8d',
    marginRight: 4,
  },
  settingInput: {
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 6,
    fontSize: 13,
    backgroundColor: '#fff',
    textAlign: 'center',
    width: 55,
  },
  statsContainer: {
    gap: 8,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
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
  labelWithSubMobile: {
    flexDirection: 'row',
    flexWrap: "wrap",
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
    fontSize: 18,
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
    flex: 1,
  },
  grandTotalTitle: {
    color: '#f1c40f',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardContentRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  fContainer: {
    flex: 3,
    justifyContent: 'space-between',
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
    flex: 1,
    flexDirection: 'column',
    justifyContent: "space-evenly",
  },
  grandTotalText: {
    color: '#ecf0f1',
    fontSize: Platform.select({
      ios: 13,
      web: 15,
      default: 13,
    }),
  },
  bold: {
    fontWeight: 'bold',
    color: '#ffffff',
  },
  actionColumn: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: 6,
    flex: 2
  },
  fishInfoBtn: {
    flex: 1,
    backgroundColor: '#e67e22',
    paddingVertical: 2,
    paddingHorizontal: 6,
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
    flex: 1,
    backgroundColor: '#27ae60',
    paddingVertical: 2,
    paddingHorizontal: 6,
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
    paddingVertical: 2,
    paddingHorizontal: 6,
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
  exportInputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  exportInputLabel: {
    width: 100,
    fontSize: 13,
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
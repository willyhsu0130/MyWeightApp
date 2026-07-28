import { useState } from 'react';
import { Alert } from 'react-native';
import { Batch, ExportMetadata } from '@/types/weight';
import { exportToSpreadsheet } from '@/utils/exportCSV';
import { exportToPdf } from '@/utils/exportPDF';

const INITIAL_BATCHES: Batch[] = [{ id: Date.now(), items: [] }];

export function useWeightCalculator() {
  const [batches, setBatches] = useState<Batch[]>(INITIAL_BATCHES);
  const [activeBatchId, setActiveBatchId] = useState<number>(INITIAL_BATCHES[0].id);

  const [input, setInput] = useState<string>('');
  const [basketWeight, setBasketWeight] = useState<string>('10');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editInput, setEditInput] = useState<string>('');

  const [waterWeight, setWaterWeight] = useState(0.975)
  
  // Modals
  const [showAllHistory, setShowAllHistory] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);

  // Metadata State
  const [exportDate, setExportDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [exportFarmer, setExportFarmer] = useState<string>('');
  const [exportOrigin, setExportOrigin] = useState<string>('');
  const [exportDriver, setExportDriver] = useState<string>('');

  // Temp Draft Metadata
  const [tempDate, setTempDate] = useState<string>('');
  const [tempFarmer, setTempFarmer] = useState<string>('');
  const [tempOrigin, setTempOrigin] = useState<string>('');
  const [tempDriver, setTempDriver] = useState<string>('');

  // Active Batch Access
  const activeBatchIndex = batches.findIndex((b) => b.id === activeBatchId);
  const safeActiveIndex = activeBatchIndex !== -1 ? activeBatchIndex : 0;
  const activeBatch: Batch = batches[safeActiveIndex] || { id: 0, items: [] };

  const currentBasketWeight = parseFloat(basketWeight) || 0;

  // Active Batch Calculations
  const currentSum = activeBatch.items.reduce((acc, curr) => acc + curr.val, 0);
  const currentCount = activeBatch.items.length;
  const currentNetWeight = currentSum - currentCount * currentBasketWeight;
  const currentPrice = currentNetWeight * 0.975;

  // Grand Totals Calculations
  const grandTotalSum = batches.reduce(
    (acc, b) => acc + b.items.reduce((iAcc, item) => iAcc + item.val, 0),
    0
  );
  const grandTotalCount = batches.reduce((acc, b) => acc + b.items.length, 0);
  const grandTotalNetWeight = grandTotalSum - grandTotalCount * currentBasketWeight;
  const grandTotalPrice = grandTotalNetWeight * 0.975;
  const maxRows = Math.max(...batches.map((b) => b.items.length), 0);

  // Handlers
  const addBatch = () => {
    const newId = Date.now();
    setBatches((prev) => [...prev, { id: newId, items: [] }]);
    setActiveBatchId(newId);
  };

  const addNumber = () => {
    const num = parseFloat(input);
    if (!isNaN(num)) {
      setBatches((prev) =>
        prev.map((b) =>
          b.id === activeBatchId
            ? { ...b, items: [...b.items, { id: Date.now(), val: num }] }
            : b
        )
      );
      setInput('');
    }
  };

  const saveEdit = (itemId: number) => {
    const updatedNum = parseFloat(editInput);
    if (!isNaN(updatedNum)) {
      setBatches((prev) =>
        prev.map((b) =>
          b.id === activeBatchId
            ? {
                ...b,
                items: b.items.map((item) =>
                  item.id === itemId ? { ...item, val: updatedNum } : item
                ),
              }
            : b
        )
      );
    }
    setEditingId(null);
    setEditInput('');
  };

  const removeItem = (itemId: number) => {
    setBatches((prev) =>
      prev.map((b) =>
        b.id === activeBatchId
          ? { ...b, items: b.items.filter((item) => item.id !== itemId) }
          : b
      )
    );
  };

  const openFishInfoModal = () => {
    setTempDate(exportDate);
    setTempFarmer(exportFarmer);
    setTempOrigin(exportOrigin);
    setTempDriver(exportDriver);
    setShowExportModal(true);
  };

  const saveFishInfo = () => {
    setExportDate(tempDate);
    setExportFarmer(tempFarmer);
    setExportOrigin(tempOrigin);
    setExportDriver(tempDriver);
    setShowExportModal(false);
  };

  const handleExport = () => {
    const metadata: ExportMetadata = {
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
        { text: 'PDF 報表 (列印/分享)', onPress: () => exportToPdf(batches, metadata) },
        { text: 'Excel / CSV 試算表', onPress: () => exportToSpreadsheet(batches, metadata) },
        { text: '取消', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  return {
    batches,
    activeBatchId,
    setActiveBatchId,
    safeActiveIndex,
    activeBatch,
    input,
    setInput,
    basketWeight,
    setBasketWeight,
    editingId,
    setEditingId,
    editInput,
    setEditInput,
    showAllHistory,
    setShowAllHistory,
    showExportModal,
    setShowExportModal,
    metadata: { exportDate, exportFarmer, exportOrigin, exportDriver },
    tempMetadata: { tempDate, setTempDate, tempFarmer, setTempFarmer, tempOrigin, setTempOrigin, tempDriver, setTempDriver },
    currentBasketWeight,
    stats: { currentSum, currentCount, currentNetWeight, currentPrice },
    grandTotals: { grandTotalSum, grandTotalCount, grandTotalNetWeight, grandTotalPrice, maxRows },
    actions: { addBatch, addNumber, saveEdit, removeItem, openFishInfoModal, saveFishInfo, handleExport },
  };
}
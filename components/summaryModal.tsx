// import { Modal } from "react-native-paper";
// import { View, SafeAreaView, Text, Button } from "react-native"



// export const summaryModal = () =>{
//     return(
//         <Modal visible={showAllHistory} animationType="slide">
//                   <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
//                     <View style={styles.modalContainer}>
//                       <View style={styles.modalHeader}>
//                         <Text style={styles.modalTitle}>全區所有批次總明細</Text>
//                         <Button title="關閉" onPress={() => setShowAllHistory(false)} />
//                       </View>
        
//                       {/* 🌟 仿照實體過秤單頭部的資訊卡片 🌟 */}
//                       <View style={styles.receiptHeaderCard}>
//                         <View style={styles.receiptHeaderRow}>
//                           <Text style={styles.receiptHeaderText}>
//                             <Text style={styles.receiptLabel}>年月日：</Text>{exportDate || '未填寫'}
//                           </Text>
//                           <Text style={styles.receiptHeaderText}>
//                             <Text style={styles.receiptLabel}>養殖戶：</Text>{exportFarmer || '未填寫'}
//                           </Text>
//                         </View>
//                         <View style={styles.receiptHeaderRow}>
//                           <Text style={styles.receiptHeaderText}>
//                             <Text style={styles.receiptLabel}>產地：</Text>{exportOrigin || '未填寫'}
//                           </Text>
//                           <Text style={styles.receiptHeaderText}>
//                             <Text style={styles.receiptLabel}>司機：</Text>{exportDriver || '未填寫'}
//                           </Text>
//                         </View>
//                         <View style={styles.receiptHeaderRow}>
//                           <Text style={styles.receiptHeaderText}>
//                             <Text style={styles.receiptLabel}>容器扣重：</Text>{currentBasketWeight} kg / 籃
//                           </Text>
//                         </View>
//                       </View>
        
//                       <ScrollView style={{ flex: 1 }}>
//                         <ScrollView horizontal showsHorizontalScrollIndicator={true}>
//                           <View style={styles.excelTable}>
//                             {/* Header Row: Index-based Batch Names + Grand Total Header */}
//                             <View style={styles.excelHeaderRow}>
//                               <View style={[styles.excelCell, styles.excelHeaderCell, styles.indexColumn]}>
//                                 <Text style={styles.excelHeaderText}>#</Text>
//                               </View>
//                               {batches.map((b, idx) => (
//                                 <View key={b.id} style={[styles.excelCell, styles.excelHeaderCell]}>
//                                   <Text style={styles.excelHeaderText}>
//                                     {getBatchName(idx)} ({b.items.length} 籃)
//                                   </Text>
//                                 </View>
//                               ))}
//                               {/* Grand Total Column Header */}
//                               <View style={[styles.excelCell, styles.excelHeaderCell, styles.grandTotalHeaderCell]}>
//                                 <Text style={styles.excelHeaderText}>全區總計</Text>
//                               </View>
//                             </View>
        
//                             {/* Data Rows: Item Values arranged vertically + row sum */}
//                             {Array.from({ length: maxRows }).map((_, rowIndex) => {
//                               const rowSum = batches.reduce(
//                                 (acc, b) => acc + (b.items[rowIndex] ? b.items[rowIndex].val : 0),
//                                 0
//                               );
        
//                               return (
//                                 <View key={rowIndex} style={styles.excelRow}>
//                                   <View style={[styles.excelCell, styles.indexCell]}>
//                                     <Text style={styles.indexCellText}>#{rowIndex + 1}</Text>
//                                   </View>
//                                   {batches.map((b) => {
//                                     const item = b.items[rowIndex];
//                                     return (
//                                       <View key={b.id} style={styles.excelCell}>
//                                         <Text style={styles.excelCellText}>
//                                           {item ? item.val : '-'}
//                                         </Text>
//                                       </View>
//                                     );
//                                   })}
//                                   {/* Grand Total Row Cell */}
//                                   <View style={[styles.excelCell, styles.grandTotalCell]}>
//                                     <Text style={styles.grandTotalCellText}>
//                                       {rowSum > 0 ? rowSum.toFixed(2) : '-'}
//                                     </Text>
//                                   </View>
//                                 </View>
//                               );
//                             })}
        
//                             {/* Summary Row 1: Sum */}
//                             <View style={[styles.excelRow, styles.summaryRow]}>
//                               <View style={[styles.excelCell, styles.summaryLabelCell]}>
//                                 <Text style={styles.summaryLabelText}>總和</Text>
//                               </View>
//                               {batches.map((b) => {
//                                 const sum = b.items.reduce((acc, curr) => acc + curr.val, 0);
//                                 return (
//                                   <View key={b.id} style={styles.excelCell}>
//                                     <Text style={[styles.summaryValText, { color: '#2980b9' }]}>
//                                       {sum.toFixed(2)}
//                                     </Text>
//                                   </View>
//                                 );
//                               })}
//                               {/* Grand Total of Sums */}
//                               <View style={[styles.excelCell, styles.grandTotalSummaryCell]}>
//                                 <Text style={[styles.summaryValText, { color: '#2980b9' }]}>
//                                   {grandTotalSum.toFixed(2)}
//                                 </Text>
//                               </View>
//                             </View>
        
//                             {/* Summary Row 2: Count */}
//                             <View style={[styles.excelRow, styles.summaryRow]}>
//                               <View style={[styles.excelCell, styles.summaryLabelCell]}>
//                                 <Text style={styles.summaryLabelText}>籃數</Text>
//                               </View>
//                               {batches.map((b) => (
//                                 <View key={b.id} style={styles.excelCell}>
//                                   <Text style={[styles.summaryValText, { color: '#8e44ad' }]}>
//                                     {b.items.length}
//                                   </Text>
//                                 </View>
//                               ))}
//                               {/* Grand Total of Counts */}
//                               <View style={[styles.excelCell, styles.grandTotalSummaryCell]}>
//                                 <Text style={[styles.summaryValText, { color: '#8e44ad' }]}>
//                                   {grandTotalCount}
//                                 </Text>
//                               </View>
//                             </View>
        
//                             {/* Summary Row 3: Net Weight */}
//                             <View style={[styles.excelRow, styles.summaryRow]}>
//                               <View style={[styles.excelCell, styles.summaryLabelCell]}>
//                                 <Text style={styles.summaryLabelText}>淨重</Text>
//                               </View>
//                               {batches.map((b) => {
//                                 const sum = b.items.reduce((acc, curr) => acc + curr.val, 0);
//                                 const net = sum - b.items.length * currentBasketWeight;
//                                 return (
//                                   <View key={b.id} style={styles.excelCell}>
//                                     <Text style={[styles.summaryValText, { color: '#27ae60' }]}>
//                                       {net.toFixed(2)}
//                                     </Text>
//                                   </View>
//                                 );
//                               })}
//                               {/* Grand Total of Net Weight */}
//                               <View style={[styles.excelCell, styles.grandTotalSummaryCell]}>
//                                 <Text style={[styles.summaryValText, { color: '#27ae60', fontSize: 13, fontWeight: '900' }]}>
//                                   {grandTotalNetWeight.toFixed(2)}
//                                 </Text>
//                               </View>
//                             </View>
        
//                             {/* Summary Row 4: Price */}
//                             <View style={[styles.excelRow, styles.summaryRow]}>
//                               <View style={[styles.excelCell, styles.summaryLabelCell]}>
//                                 <Text style={styles.summaryLabelText}>金額</Text>
//                               </View>
//                               {batches.map((b) => {
//                                 const sum = b.items.reduce((acc, curr) => acc + curr.val, 0);
//                                 const net = sum - b.items.length * currentBasketWeight;
//                                 const price = net * 0.975;
//                                 return (
//                                   <View key={b.id} style={styles.excelCell}>
//                                     <Text style={[styles.summaryValText, { color: '#e67e22' }]}>
//                                       ${price.toFixed(2)}
//                                     </Text>
//                                   </View>
//                                 );
//                               })}
//                               {/* Grand Total of Price */}
//                               <View style={[styles.excelCell, styles.grandTotalSummaryCell]}>
//                                 <Text style={[styles.summaryValText, { color: '#d35400', fontSize: 13, fontWeight: '900' }]}>
//                                   ${grandTotalPrice.toFixed(2)}
//                                 </Text>
//                               </View>
//                             </View>
//                           </View>
//                         </ScrollView>
//                       </ScrollView>
//                     </View>
//                   </SafeAreaView>
//                 </Modal>
        
//     )
// }

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: '#ffffff',
//     paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
//   },
//   container: {
//     flex: 1,
//     backgroundColor: '#f4f6f7',
//   },
//   topTabBar: {
//     backgroundColor: '#ffffff',
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#e0e0e0',
//   },
//   tabItem: {
//     paddingVertical: 6,
//     paddingHorizontal: 14,
//     borderRadius: 16,
//     backgroundColor: '#ecf0f1',
//     marginRight: 8,
//   },
//   activeTabItem: {
//     backgroundColor: '#3498db',
//   },
//   tabText: {
//     fontSize: 13,
//     color: '#7f8c8d',
//     fontWeight: '600',
//   },
//   activeTabText: {
//     color: '#ffffff',
//   },
//   addTabBtn: {
//     paddingVertical: 6,
//     paddingHorizontal: 14,
//     borderRadius: 16,
//     borderWidth: 1,
//     borderColor: '#3498db',
//     borderStyle: 'dashed',
//   },
//   addTabBtnText: {
//     fontSize: 13,
//     color: '#3498db',
//     fontWeight: 'bold',
//   },
//   body: {
//     flex: 1,
//     flexDirection: 'row',
//   },
//   mainArea: {
//     flex: 2,
//     padding: 14,
//   },
//   sidebar: {
//     flex: 1,
//     backgroundColor: '#ffffff',
//     borderLeftWidth: 1,
//     borderLeftColor: '#e0e0e0',
//     padding: 12,
//   },
//   inputCard: {
//     padding: 14,
//     marginBottom: 12,
//     backgroundColor: '#ffffff',
//     borderRadius: 8,
//     elevation: 1,
//   },
//   heading: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginBottom: 10,
//     color: '#2c3e50',
//   },
//   sectionTitle: {
//     fontSize: 13,
//     fontWeight: 'bold',
//     color: '#7f8c8d',
//     marginBottom: 6,
//   },
//   inputRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   textInput: {
//     flex: 1,
//     borderWidth: 1,
//     borderColor: '#bdc3c7',
//     borderRadius: 8,
//     padding: 8,
//     fontSize: 15,
//     backgroundColor: '#fff',
//   },
//   addBtnWrapper: {
//     width: 65,
//   },
//   basketWeightContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 12,
//     paddingTop: 12,
//     borderTopWidth: 1,
//     borderTopColor: '#f0f3f4',
//   },
//   basketWeightLabel: {
//     fontSize: 13,
//     fontWeight: '600',
//     color: '#7f8c8d',
//     marginRight: 8,
//   },
//   basketWeightInput: {
//     borderWidth: 1,
//     borderColor: '#bdc3c7',
//     borderRadius: 8,
//     paddingVertical: 4,
//     paddingHorizontal: 12,
//     fontSize: 14,
//     backgroundColor: '#fff',
//     textAlign: 'center',
//     width: 75,
//   },
//   statsContainer: {
//     gap: 8,
//     marginBottom: 12,
//   },
//   statBox: {
//     padding: 10,
//     backgroundColor: '#ffffff',
//     borderLeftWidth: 5,
//     borderRadius: 8,
//   },
//   labelWithSub: {
//     flexDirection: 'row',
//     alignItems: 'baseline',
//     justifyContent: 'space-between',
//   },
//   statLabel: {
//     fontSize: 12,
//     color: '#7f8c8d',
//     fontWeight: '600',
//   },
//   subFormula: {
//     fontSize: 9,
//     color: '#bdc3c7',
//   },
//   statValue: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginTop: 2,
//   },
//   unitText: {
//     fontSize: 12,
//     fontWeight: 'normal',
//     color: '#7f8c8d',
//   },
//   grandTotalCard: {
//     padding: 12,
//     backgroundColor: '#2c3e50',
//     borderRadius: 8,
//   },
//   grandTotalTitle: {
//     color: '#f1c40f',
//     fontSize: 13,
//     fontWeight: 'bold',
//     marginBottom: 6,
//   },
//   fishInfoPreview: {
//     backgroundColor: 'rgba(39, 174, 96, 0.15)',
//     paddingVertical: 5,
//     paddingHorizontal: 10,
//     borderRadius: 6,
//     marginBottom: 8,
//     alignSelf: 'flex-start',
//   },
//   fishInfoPreviewText: {
//     color: '#2ecc71',
//     fontSize: 12,
//     fontWeight: '600',
//   },
//   grandTotalRow: {
//     flexDirection: 'column',
//     gap: 4,
//     marginBottom: 12,
//   },
//   grandTotalText: {
//     color: '#ecf0f1',
//     fontSize: 13,
//   },
//   bold: {
//     fontWeight: 'bold',
//     color: '#ffffff',
//   },
//   actionRow: {
//     flexDirection: 'row',
//     gap: 6,
//   },
//   fishInfoBtn: {
//     flex: 1.1,
//     backgroundColor: '#e67e22',
//     padding: 8,
//     borderRadius: 6,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   fishInfoBtnText: {
//     color: '#ffffff',
//     fontSize: 12,
//     fontWeight: 'bold',
//   },
//   exportBtn: {
//     flex: 1.2,
//     backgroundColor: '#27ae60',
//     padding: 8,
//     borderRadius: 6,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   exportBtnText: {
//     color: '#ffffff',
//     fontSize: 12,
//     fontWeight: 'bold',
//   },
//   viewAllBtn: {
//     flex: 1,
//     backgroundColor: '#34495e',
//     padding: 8,
//     borderRadius: 6,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   viewAllBtnText: {
//     color: '#bdc3c7',
//     fontSize: 12,
//     fontWeight: 'bold',
//   },
//   historyLabel: {
//     fontSize: 13,
//     fontWeight: 'bold',
//     color: '#34495e',
//     marginBottom: 8,
//   },
//   scrollList: {
//     flex: 1,
//   },
//   historyCard: {
//     backgroundColor: '#f8f9fa',
//     borderRadius: 6,
//     padding: 8,
//     marginBottom: 6,
//     borderWidth: 1,
//     borderColor: '#e9ecef',
//   },
//   itemRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   valWithIndex: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   indexTag: {
//     fontSize: 11,
//     fontWeight: 'bold',
//     color: '#95a5a6',
//     marginRight: 6,
//   },
//   itemText: {
//     fontSize: 14,
//     fontWeight: '500',
//     color: '#2c3e50',
//   },
//   deleteBtn: {
//     color: '#e74c3c',
//     fontSize: 13,
//     paddingHorizontal: 4,
//   },
//   editRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   editInput: {
//     borderWidth: 1,
//     borderColor: '#3498db',
//     borderRadius: 4,
//     padding: 2,
//     paddingHorizontal: 6,
//     width: '45%',
//     backgroundColor: '#fff',
//     fontSize: 13,
//   },
//   saveBtn: {
//     backgroundColor: '#2ecc71',
//     paddingVertical: 3,
//     paddingHorizontal: 6,
//     borderRadius: 4,
//   },
//   saveBtnText: {
//     color: '#fff',
//     fontSize: 11,
//     fontWeight: 'bold',
//   },
//   modalContainer: {
//     flex: 1,
//     padding: 16,
//     backgroundColor: '#fff',
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   /* --- 🌟 仿實體單據頭部卡片樣式 🌟 --- */
//   receiptHeaderCard: {
//     backgroundColor: '#f8f9fa',
//     borderWidth: 1,
//     borderColor: '#dcdcdc',
//     borderRadius: 6,
//     padding: 10,
//     marginBottom: 14,
//   },
//   receiptHeaderRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 4,
//   },
//   receiptHeaderText: {
//     fontSize: 13,
//     color: '#2c3e50',
//     flex: 1,
//   },
//   receiptLabel: {
//     fontWeight: 'bold',
//     color: '#34495e',
//   },
//   /* --- Excel Grid 樣式 --- */
//   excelTable: {
//     borderWidth: 1,
//     borderColor: '#c0c0c0',
//     backgroundColor: '#ffffff',
//   },
//   excelHeaderRow: {
//     flexDirection: 'row',
//     backgroundColor: '#2c3e50',
//   },
//   excelRow: {
//     flexDirection: 'row',
//     borderBottomWidth: 1,
//     borderBottomColor: '#e0e0e0',
//   },
//   excelCell: {
//     width: 110,
//     paddingVertical: 8,
//     paddingHorizontal: 10,
//     borderRightWidth: 1,
//     borderRightColor: '#dcdcdc',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   excelHeaderCell: {
//     backgroundColor: '#2c3e50',
//   },
//   excelHeaderText: {
//     color: '#ffffff',
//     fontWeight: 'bold',
//     fontSize: 13,
//     textAlign: 'center',
//   },
//   excelCellText: {
//     fontSize: 13,
//     color: '#2c3e50',
//   },
//   indexColumn: {
//     width: 50,
//     backgroundColor: '#34495e',
//   },
//   indexCell: {
//     width: 50,
//     backgroundColor: '#f0f3f4',
//   },
//   indexCellText: {
//     fontSize: 11,
//     fontWeight: 'bold',
//     color: '#7f8c8d',
//   },
//   summaryRow: {
//     backgroundColor: '#eaeded',
//     borderTopWidth: 1,
//     borderTopColor: '#bdc3c7',
//   },
//   summaryLabelCell: {
//     width: 50,
//     backgroundColor: '#d5dbdb',
//   },
//   summaryLabelText: {
//     fontSize: 11,
//     fontWeight: 'bold',
//     color: '#2c3e50',
//   },
//   summaryValText: {
//     fontSize: 13,
//     fontWeight: 'bold',
//   },
//   /* --- 全區總計欄樣式 --- */
//   grandTotalHeaderCell: {
//     backgroundColor: '#d35400',
//   },
//   grandTotalCell: {
//     backgroundColor: '#fdf2e9',
//   },
//   grandTotalCellText: {
//     fontSize: 13,
//     fontWeight: 'bold',
//     color: '#d35400',
//   },
//   grandTotalSummaryCell: {
//     backgroundColor: '#f5cba7',
//   },
//   /* --- 魚資訊 Modal 樣式 --- */
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   exportModalBox: {
//     width: '85%',
//     maxWidth: 400,
//     backgroundColor: '#ffffff',
//     borderRadius: 12,
//     padding: 20,
//     elevation: 5,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//   },
//   exportModalTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#2c3e50',
//     marginBottom: 16,
//     textAlign: 'center',
//   },
//   exportInputGroup: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   exportInputLabel: {
//     width: 70,
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#34495e',
//   },
//   exportTextInput: {
//     flex: 1,
//     borderWidth: 1,
//     borderColor: '#bdc3c7',
//     borderRadius: 6,
//     paddingVertical: 6,
//     paddingHorizontal: 10,
//     fontSize: 14,
//     backgroundColor: '#fcfcfc',
//   },
//   exportActionRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 20,
//     gap: 12,
//   },
//   exportModalBtn: {
//     flex: 1,
//     paddingVertical: 10,
//     borderRadius: 6,
//     alignItems: 'center',
//   },
//   cancelBtn: {
//     backgroundColor: '#ecf0f1',
//     borderWidth: 1,
//     borderColor: '#bdc3c7',
//   },
//   cancelBtnText: {
//     color: '#7f8c8d',
//     fontWeight: '600',
//   },
//   confirmBtn: {
//     backgroundColor: '#27ae60',
//   },
//   confirmBtnText: {
//     color: '#ffffff',
//     fontWeight: 'bold',
//   },
// });
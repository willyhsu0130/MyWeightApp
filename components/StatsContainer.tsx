import {
    Platform,
    Text,
    View,
    StyleSheet,
    StatusBar
} from 'react-native';
import { Card } from 'react-native-paper';

export interface BatchMetadata {
    date?: string;
    farmer?: string;
    origin?: string;
    driver?: string;
    basketWeight?: number;
    waterDeductionFactor?: number;
    unitPrice?: number;
    unit?: string;
    grandTotalSum?: number;
    grandTotalCount?: number;
    grandTotalNetWeight?: number;
    grandTotalWaterWeight?: number;
    grandTotalFinalPrice?: number;
}

// Component Props definition
export interface StatsContainerProps {
    metadata?: BatchMetadata;
    // Current batch calculation props
    unitLabel?: string;
    currentSum?: number;
    currentCount?: number;
    currentBasketWeight?: number;
    currentNetWeight?: number;
    currentDeductionFactor?: number;
    currentWaterWeight?: number;
    currentUnitPrice?: number;
    currentFinalPrice?: number;
}


export const StatsContainer: React.FC<StatsContainerProps> = ({
    metadata,
    // Fall back to metadata values if individual props aren't explicitly passed
    unitLabel = metadata?.unit || '斤',
    currentSum = 0,
    currentCount = 0,
    currentBasketWeight = metadata?.basketWeight || 0,
    currentNetWeight = 0,
    currentDeductionFactor = metadata?.waterDeductionFactor || 0,
    currentWaterWeight = 0,
    currentUnitPrice = metadata?.unitPrice || 0,
    currentFinalPrice = 0,
}) => {
    return (
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
    );
};

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
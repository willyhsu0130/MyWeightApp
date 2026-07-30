import React from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { Card } from 'react-native-paper';

// Component Props definition
export interface StatsContainerProps {
    unitLabel: string;
    currentSum: number;
    currentCount: number;
    currentBasketWeight: number;
    currentNetWeight: number;
    currentDeductionFactor: number;
    currentWaterWeight: number;
    currentUnitPrice: number;
    currentFinalPrice: number;
}

export const StatsContainer: React.FC<StatsContainerProps> = ({
    unitLabel,
    currentSum,
    currentCount,
    currentBasketWeight,
    currentNetWeight,
    currentDeductionFactor,
    currentWaterWeight,
    currentUnitPrice,
    currentFinalPrice,
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
});
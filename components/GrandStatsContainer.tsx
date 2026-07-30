import React from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    View,
} from 'react-native';

export interface GrandStatsContainerProps {
    grandTotalSum: number;
    grandTotalCount: number;
    grandTotalNetWeight: number;
    // Truncate grand total water weight to 2 decimal places without rounding up
    grandTotalWaterWeight: number;
    grandTotalFinalPrice: number;
    unitLabel: string;
    unitTextFull: string

}

export const GrandStatsContainer: React.FC<GrandStatsContainerProps> = ({
    unitLabel,
    grandTotalSum,
    grandTotalCount,
    grandTotalNetWeight,
    grandTotalWaterWeight,
    grandTotalFinalPrice,
    unitTextFull
}) => {
    return (

        <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalTitle}>
                所有批次總計 (Grand Total) - {unitTextFull}
            </Text>
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
    );
};

const styles = StyleSheet.create({
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
    grandTotalTitle: {
        color: '#f1c40f',
        fontSize: 15,
        fontWeight: 'bold',
        marginBottom: 8,
    },
});
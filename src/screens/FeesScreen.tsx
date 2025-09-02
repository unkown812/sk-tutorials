import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Text,
  Searchbar,
  Surface,
  Chip,
  Button,
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import supabase from '../lib/supabase';
import { colors } from '../theme/theme';

interface FeeSummary {
  id: string;
  name: string;
  category: string;
  course: string;
  totalAmount: number;
  amountPaid: number;
  amountDue: number;
  status: 'Paid' | 'Partial' | 'Unpaid';
}

export default function FeesScreen() {
  const [feeSummary, setFeeSummary] = useState<FeeSummary[]>([]);
  const [filteredFees, setFilteredFees] = useState<FeeSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchFeeData = async () => {
    try {
      const { data: studentsData, error } = await supabase
        .from('students')
        .select('*');

      if (error) throw error;

      const summary = (studentsData || []).map((student: any) => {
        const totalAmount = student.total_fee || 0;
        const amountPaid = student.paid_fee || 0;
        const amountDue = totalAmount - amountPaid;
        
        let status: 'Paid' | 'Partial' | 'Unpaid';
        if (amountDue === totalAmount) {
          status = 'Unpaid';
        } else if (amountPaid === totalAmount) {
          status = 'Paid';
        } else {
          status = 'Partial';
        }

        return {
          id: student.id,
          name: student.name,
          category: student.category,
          course: student.course,
          totalAmount,
          amountPaid,
          amountDue,
          status,
        };
      });

      setFeeSummary(summary);
      setFilteredFees(summary);
    } catch (error) {
      console.error('Error fetching fee data:', error);
      Alert.alert('Error', 'Failed to fetch fee data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFeeData();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = feeSummary.filter(
        (fee) =>
          fee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          fee.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          fee.course.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredFees(filtered);
    } else {
      setFilteredFees(feeSummary);
    }
  }, [searchQuery, feeSummary]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFeeData();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return colors.success;
      case 'Partial':
        return colors.warning;
      case 'Unpaid':
        return colors.error;
      default:
        return colors.gray[500];
    }
  };

  const totalFees = filteredFees.reduce((sum, fee) => sum + fee.totalAmount, 0);
  const totalCollected = filteredFees.reduce((sum, fee) => sum + fee.amountPaid, 0);
  const totalPending = filteredFees.reduce((sum, fee) => sum + fee.amountDue, 0);

  const renderFeeItem = ({ item }: { item: FeeSummary }) => (
    <Card style={styles.feeCard}>
      <Card.Content>
        <View style={styles.feeHeader}>
          <View style={styles.studentInfo}>
            <Title style={styles.studentName}>{item.name}</Title>
            <Paragraph style={styles.studentDetails}>
              {item.category} • {item.course}
            </Paragraph>
          </View>
          <Chip
            mode="outlined"
            textStyle={{ color: getStatusColor(item.status) }}
            style={{ borderColor: getStatusColor(item.status) }}
          >
            {item.status}
          </Chip>
        </View>

        <View style={styles.feeAmounts}>
          <View style={styles.amountItem}>
            <Text style={styles.amountLabel}>Total</Text>
            <Text style={styles.amountValue}>₹{item.totalAmount.toLocaleString()}</Text>
          </View>
          <View style={styles.amountItem}>
            <Text style={styles.amountLabel}>Paid</Text>
            <Text style={[styles.amountValue, { color: colors.success }]}>
              ₹{item.amountPaid.toLocaleString()}
            </Text>
          </View>
          <View style={styles.amountItem}>
            <Text style={styles.amountLabel}>Due</Text>
            <Text style={[styles.amountValue, { color: colors.error }]}>
              ₹{item.amountDue.toLocaleString()}
            </Text>
          </View>
        </View>

        {item.amountDue > 0 && (
          <Button
            mode="contained"
            style={styles.payButton}
            onPress={() => {
              Alert.alert('Record Payment', 'Payment recording functionality coming soon!');
            }}
          >
            Record Payment
          </Button>
        )}
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.summaryContainer}>
        <Surface style={styles.summaryCard} elevation={2}>
          <Text style={styles.summaryLabel}>Total Fees</Text>
          <Text style={styles.summaryValue}>₹{totalFees.toLocaleString()}</Text>
        </Surface>
        <Surface style={styles.summaryCard} elevation={2}>
          <Text style={styles.summaryLabel}>Collected</Text>
          <Text style={[styles.summaryValue, { color: colors.success }]}>
            ₹{totalCollected.toLocaleString()}
          </Text>
        </Surface>
        <Surface style={styles.summaryCard} elevation={2}>
          <Text style={styles.summaryLabel}>Pending</Text>
          <Text style={[styles.summaryValue, { color: colors.error }]}>
            ₹{totalPending.toLocaleString()}
          </Text>
        </Surface>
      </View>

      <View style={styles.header}>
        <Searchbar
          placeholder="Search by student name..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>

      <FlatList
        data={filteredFees}
        renderItem={renderFeeItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  summaryContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.gray[600],
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  searchbar: {
    elevation: 2,
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
  },
  feeCard: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  feeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  studentInfo: {
    flex: 1,
    marginRight: 12,
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  studentDetails: {
    fontSize: 14,
    color: colors.gray[600],
  },
  feeAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  amountItem: {
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 12,
    color: colors.gray[600],
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  payButton: {
    marginTop: 8,
  },
});
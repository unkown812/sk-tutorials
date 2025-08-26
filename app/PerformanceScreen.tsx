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
import { performanceService } from '../services/performanceService';
import { colors } from '../theme/theme';

interface Performance {
  id: string;
  student_id: string;
  exam_name: string;
  date: string;
  marks: number;
  total_marks: number;
  percentage: number;
  student_name?: string;
}

export default function PerformanceScreen() {
  const [performance, setPerformance] = useState<Performance[]>([]);
  const [filteredPerformance, setFilteredPerformance] = useState<Performance[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchPerformance = async () => {
    try {
      const data = await performanceService.getAll();
      setPerformance(data);
      setFilteredPerformance(data);
    } catch (error) {
      console.error('Error fetching performance:', error);
      Alert.alert('Error', 'Failed to fetch performance data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPerformance();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = performance.filter(
        (record) =>
          record.exam_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          record.student_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPerformance(filtered);
    } else {
      setFilteredPerformance(performance);
    }
  }, [searchQuery, performance]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPerformance();
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 80) return colors.success;
    if (percentage >= 60) return colors.warning;
    return colors.error;
  };

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    return 'F';
  };

  const renderPerformanceItem = ({ item }: { item: Performance }) => (
    <Card style={styles.performanceCard}>
      <Card.Content>
        <View style={styles.performanceHeader}>
          <View style={styles.performanceInfo}>
            <Title style={styles.studentName}>{item.student_name || 'Unknown Student'}</Title>
            <Paragraph style={styles.examDetails}>
              {item.exam_name} • {new Date(item.date).toLocaleDateString()}
            </Paragraph>
          </View>
          <View style={styles.scoreContainer}>
            <Text style={[styles.percentage, { color: getPerformanceColor(item.percentage) }]}>
              {item.percentage.toFixed(1)}%
            </Text>
            <Chip
              mode="outlined"
              textStyle={{ color: getPerformanceColor(item.percentage) }}
              style={{ borderColor: getPerformanceColor(item.percentage) }}
            >
              {getGrade(item.percentage)}
            </Chip>
          </View>
        </View>

        <View style={styles.marksContainer}>
          <Surface style={styles.marksItem} elevation={1}>
            <Text style={styles.marksLabel}>Marks Obtained</Text>
            <Text style={styles.marksValue}>{item.marks}</Text>
          </Surface>
          <Surface style={styles.marksItem} elevation={1}>
            <Text style={styles.marksLabel}>Total Marks</Text>
            <Text style={styles.marksValue}>{item.total_marks}</Text>
          </Surface>
        </View>
      </Card.Content>
    </Card>
  );

  // Calculate performance statistics
  const totalExams = filteredPerformance.length;
  const averagePercentage = totalExams > 0 
    ? filteredPerformance.reduce((sum, record) => sum + record.percentage, 0) / totalExams 
    : 0;
  const highestPercentage = totalExams > 0 
    ? Math.max(...filteredPerformance.map(record => record.percentage)) 
    : 0;

  return (
    <View style={styles.container}>
      <View style={styles.summaryContainer}>
        <Surface style={styles.summaryCard} elevation={2}>
          <Text style={styles.summaryLabel}>Average Score</Text>
          <Text style={[styles.summaryValue, { color: colors.primary }]}>
            {Math.round(averagePercentage)}%
          </Text>
        </Surface>
        <Surface style={styles.summaryCard} elevation={2}>
          <Text style={styles.summaryLabel}>Highest Score</Text>
          <Text style={[styles.summaryValue, { color: colors.success }]}>
            {Math.round(highestPercentage)}%
          </Text>
        </Surface>
        <Surface style={styles.summaryCard} elevation={2}>
          <Text style={styles.summaryLabel}>Total Exams</Text>
          <Text style={[styles.summaryValue, { color: colors.gray[900] }]}>
            {totalExams}
          </Text>
        </Surface>
      </View>

      <View style={styles.header}>
        <Searchbar
          placeholder="Search by student or exam..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>

      <View style={styles.actionContainer}>
        <Button
          mode="contained"
          style={styles.actionButton}
          onPress={() => {
            Alert.alert('Add Results', 'Add exam results functionality coming soon!');
          }}
        >
          Add Exam Results
        </Button>
      </View>

      <FlatList
        data={filteredPerformance}
        renderItem={renderPerformanceItem}
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
  actionContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  actionButton: {
    marginVertical: 8,
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
  },
  performanceCard: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  performanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  performanceInfo: {
    flex: 1,
    marginRight: 12,
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  examDetails: {
    fontSize: 14,
    color: colors.gray[600],
  },
  scoreContainer: {
    alignItems: 'center',
    gap: 8,
  },
  percentage: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  marksContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  marksItem: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  marksLabel: {
    fontSize: 12,
    color: colors.gray[600],
    marginBottom: 4,
  },
  marksValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
});
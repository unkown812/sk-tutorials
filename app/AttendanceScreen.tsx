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
import { attendanceService } from '../services/attendanceService';
import { colors } from '../theme/theme';

interface AttendanceRecord {
  id: string;
  student_id: string;
  date: string;
  status: string;
  subject: string;
  student_name?: string;
}

export default function AttendanceScreen() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [filteredAttendance, setFilteredAttendance] = useState<AttendanceRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchAttendance = async () => {
    try {
      const data = await attendanceService.getAll();
      setAttendance(data);
      setFilteredAttendance(data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      Alert.alert('Error', 'Failed to fetch attendance data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = attendance.filter(
        (record) =>
          record.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          record.student_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredAttendance(filtered);
    } else {
      setFilteredAttendance(attendance);
    }
  }, [searchQuery, attendance]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAttendance();
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'present':
        return colors.success;
      case 'absent':
        return colors.error;
      case 'late':
        return colors.warning;
      default:
        return colors.gray[500];
    }
  };

  const renderAttendanceItem = ({ item }: { item: AttendanceRecord }) => (
    <Card style={styles.attendanceCard}>
      <Card.Content>
        <View style={styles.attendanceHeader}>
          <View style={styles.attendanceInfo}>
            <Title style={styles.studentName}>{item.student_name || 'Unknown Student'}</Title>
            <Paragraph style={styles.attendanceDetails}>
              {item.subject} • {new Date(item.date).toLocaleDateString()}
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
      </Card.Content>
    </Card>
  );

  // Calculate attendance statistics
  const totalRecords = filteredAttendance.length;
  const presentRecords = filteredAttendance.filter(
    (record) => record.status?.toLowerCase() === 'present'
  ).length;
  const absentRecords = filteredAttendance.filter(
    (record) => record.status?.toLowerCase() === 'absent'
  ).length;
  const attendancePercentage = totalRecords > 0 ? (presentRecords / totalRecords) * 100 : 0;

  return (
    <View style={styles.container}>
      <View style={styles.summaryContainer}>
        <Surface style={styles.summaryCard} elevation={2}>
          <Text style={styles.summaryLabel}>Attendance Rate</Text>
          <Text style={[styles.summaryValue, { color: colors.primary }]}>
            {Math.round(attendancePercentage)}%
          </Text>
        </Surface>
        <Surface style={styles.summaryCard} elevation={2}>
          <Text style={styles.summaryLabel}>Present</Text>
          <Text style={[styles.summaryValue, { color: colors.success }]}>
            {presentRecords}
          </Text>
        </Surface>
        <Surface style={styles.summaryCard} elevation={2}>
          <Text style={styles.summaryLabel}>Absent</Text>
          <Text style={[styles.summaryValue, { color: colors.error }]}>
            {absentRecords}
          </Text>
        </Surface>
      </View>

      <View style={styles.header}>
        <Searchbar
          placeholder="Search by student or subject..."
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
            Alert.alert('Mark Attendance', 'Attendance marking functionality coming soon!');
          }}
        >
          Mark Today's Attendance
        </Button>
      </View>

      <FlatList
        data={filteredAttendance}
        renderItem={renderAttendanceItem}
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
  attendanceCard: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  attendanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  attendanceInfo: {
    flex: 1,
    marginRight: 12,
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  attendanceDetails: {
    fontSize: 14,
    color: colors.gray[600],
  },
});
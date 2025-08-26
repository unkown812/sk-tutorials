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
  FAB,
  Chip,
  Surface,
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { studentService } from '../services/studentService';
import { colors } from '../theme/theme';

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  category: string;
  course: string;
  year: number;
  fee_status: string;
  total_fee: number;
  paid_fee: number;
  due_amount: number;
}

export default function StudentsScreen() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    try {
      const data = await studentService.getAll();
      const studentsWithDue = data.map((student: any) => ({
        ...student,
        due_amount: (student.total_fee || 0) - (student.paid_fee || 0),
      }));
      setStudents(studentsWithDue);
      setFilteredStudents(studentsWithDue);
    } catch (error) {
      console.error('Error fetching students:', error);
      Alert.alert('Error', 'Failed to fetch students');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = students.filter(
        (student) =>
          student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.course.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents(students);
    }
  }, [searchQuery, students]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStudents();
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return colors.success;
      case 'partial':
        return colors.warning;
      case 'unpaid':
        return colors.error;
      default:
        return colors.gray[500];
    }
  };

  const renderStudent = ({ item }: { item: Student }) => (
    <Card style={styles.studentCard}>
      <Card.Content>
        <View style={styles.studentHeader}>
          <View style={styles.studentInfo}>
            <Title style={styles.studentName}>{item.name}</Title>
            <Paragraph style={styles.studentDetails}>
              {item.category} • {item.course} • Year {item.year}
            </Paragraph>
            <Paragraph style={styles.contactInfo}>
              {item.email} • {item.phone}
            </Paragraph>
          </View>
          <Chip
            mode="outlined"
            textStyle={{ color: getStatusColor(item.fee_status) }}
            style={{ borderColor: getStatusColor(item.fee_status) }}
          >
            {item.fee_status || 'Unknown'}
          </Chip>
        </View>

        <View style={styles.feeInfo}>
          <Surface style={styles.feeItem} elevation={1}>
            <Text style={styles.feeLabel}>Total Fee</Text>
            <Text style={styles.feeValue}>₹{item.total_fee?.toLocaleString() || 0}</Text>
          </Surface>
          <Surface style={styles.feeItem} elevation={1}>
            <Text style={styles.feeLabel}>Paid</Text>
            <Text style={[styles.feeValue, { color: colors.success }]}>
              ₹{item.paid_fee?.toLocaleString() || 0}
            </Text>
          </Surface>
          <Surface style={styles.feeItem} elevation={1}>
            <Text style={styles.feeLabel}>Due</Text>
            <Text style={[styles.feeValue, { color: colors.error }]}>
              ₹{item.due_amount?.toLocaleString() || 0}
            </Text>
          </Surface>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder="Search students..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>

      <FlatList
        data={filteredStudents}
        renderItem={renderStudent}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {
          Alert.alert('Add Student', 'Add student functionality coming soon!');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  searchbar: {
    elevation: 2,
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
  },
  studentCard: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  studentHeader: {
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
    marginBottom: 2,
  },
  contactInfo: {
    fontSize: 12,
    color: colors.gray[500],
  },
  feeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  feeItem: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  feeLabel: {
    fontSize: 12,
    color: colors.gray[600],
    marginBottom: 4,
  },
  feeValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
});
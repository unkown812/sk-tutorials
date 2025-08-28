import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  ScrollView,
  TouchableOpacity,
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
  Modal,
  Portal,
  TextInput,
  Button,
  Divider,
} from 'react-native-paper';

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
  const [showEditModal, setShowEditModal] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

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

  const handleEditInputChange = (field: keyof Student, value: any) => {
    if (!editStudent) return;
    setEditStudent((prev) => ({
      ...prev!,
      [field]: value,
    }));
  };

  const handleSaveEditStudent = async () => {
    if (!editStudent) return;
    setAdding(true);
    setAddError(null);
    try {
      const studentToUpdate = {
        ...editStudent,
        due_amount: (editStudent.total_fee || 0) - (editStudent.paid_fee || 0),
      };

      await studentService.update(editStudent.id, studentToUpdate);
      
      setShowEditModal(false);
      fetchStudents(); 
      Alert.alert('Success', 'Student details updated successfully');
    } catch (error) {
      console.error('Error updating student:', error);
      setAddError('Failed to update student details');
      Alert.alert('Error', 'Failed to update student details');
    } finally {
      setAdding(false);
    }
  };

  const openEditModal = (student: Student) => {
    setEditStudent(student);
    setShowEditModal(true);
    setAddError(null);
  };

  const renderStudent = ({ item }: { item: Student }) => (
    <TouchableOpacity onPress={() => openEditModal(item)}>
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
              <Text style={styles.feeValue}>
                {item.total_fee
                  ? new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    maximumFractionDigits: 0,
                  }).format(item.total_fee)
                  : '₹0'}
              </Text>
            </Surface>

            <Surface style={styles.feeItem} elevation={1}>
              <Text style={styles.feeLabel}>Paid</Text>
              <Text style={[styles.feeValue, { color: colors.success }]}>
                {item.paid_fee
                  ? new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    maximumFractionDigits: 0,
                  }).format(item.paid_fee)
                  : '₹0'}
              </Text>
            </Surface>

            <Surface style={styles.feeItem} elevation={1}>
              <Text style={styles.feeLabel}>Due</Text>
              <Text style={[styles.feeValue, { color: colors.error }]}>
                {item.due_amount
                  ? new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    maximumFractionDigits: 0,
                  }).format(item.due_amount)
                  : '₹0'}
              </Text>
            </Surface>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
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

      <Portal>
        <Modal
          visible={showEditModal}
          onDismiss={() => setShowEditModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <ScrollView style={styles.modalScrollView}>
            <View style={styles.modalHeader}>
              <Title style={styles.modalTitle}>Edit Student Details</Title>
              <Button
                icon="close"
                onPress={() => setShowEditModal(false)}
                style={styles.closeButton}
              >
                Close
              </Button>
            </View>

            {addError && (
              <Text style={styles.errorText}>{addError}</Text>
            )}

            {editStudent && (
              <View style={styles.modalContent}>
                <Text style={styles.sectionTitle}>Basic Information</Text>
                <TextInput
                  label="Name"
                  value={editStudent.name}
                  onChangeText={(text) => handleEditInputChange('name', text)}
                  style={styles.input}
                  mode="outlined"
                />
                <TextInput
                  label="Email"
                  value={editStudent.email}
                  onChangeText={(text) => handleEditInputChange('email', text)}
                  style={styles.input}
                  mode="outlined"
                  keyboardType="email-address"
                />
                <TextInput
                  label="Phone"
                  value={editStudent.phone}
                  onChangeText={(text) => handleEditInputChange('phone', text)}
                  style={styles.input}
                  mode="outlined"
                  keyboardType="phone-pad"
                />

                <Divider style={styles.divider} />

                <Text style={styles.sectionTitle}>Academic Details</Text>
                <TextInput
                  label="Category"
                  value={editStudent.category}
                  onChangeText={(text) => handleEditInputChange('category', text)}
                  style={styles.input}
                  mode="outlined"
                />
                <TextInput
                  label="Course"
                  value={editStudent.course}
                  onChangeText={(text) => handleEditInputChange('course', text)}
                  style={styles.input}
                  mode="outlined"
                />
                <TextInput
                  label="Year"
                  value={editStudent.year?.toString()}
                  onChangeText={(text) => handleEditInputChange('year', parseInt(text) || 0)}
                  style={styles.input}
                  mode="outlined"
                  keyboardType="numeric"
                />

                <Divider style={styles.divider} />

                <Text style={styles.sectionTitle}>Fee Information</Text>
                <TextInput
                  label="Total Fee"
                  value={editStudent.total_fee?.toString()}
                  onChangeText={(text) => handleEditInputChange('total_fee', parseFloat(text) || 0)}
                  style={styles.input}
                  mode="outlined"
                  keyboardType="numeric"
                />
                <TextInput
                  label="Fee Status"
                  value={editStudent.fee_status}
                  onChangeText={(text) => handleEditInputChange('fee_status', text)}
                  style={styles.input}
                  mode="outlined"
                />
                <TextInput
                  label="Paid Fee"
                  value={editStudent.paid_fee?.toString()}
                  onChangeText={(text) => handleEditInputChange('paid_fee', parseFloat(text) || 0)}
                  style={styles.input}
                  mode="outlined"
                  keyboardType="numeric"
                />

                <View style={styles.modalActions}>
                  <Button
                    mode="outlined"
                    onPress={() => setShowEditModal(false)}
                    style={styles.cancelButton}
                    disabled={adding}
                  >
                    Cancel
                  </Button>
                  <Button
                    mode="contained"
                    onPress={handleSaveEditStudent}
                    style={styles.saveButton}
                    loading={adding}
                    disabled={adding}
                  >
                    {adding ? 'Saving...' : 'Save Changes'}
                  </Button>
                </View>
              </View>
            )}
          </ScrollView>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[200],
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  searchbar: {
    elevation: 5,
    borderColor: "black",
    borderStyle: "solid",
    borderWidth: 1,
    backgroundColor: colors.gray[200],
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    // borderColor: colors.gray[300],
    borderRadius: 40,
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
    backgroundColor: colors.primaryLight,
  },
  modalContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    maxHeight: '80%',
  },
  modalScrollView: {
    maxHeight: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[300],
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    margin: 0,
  },
  modalContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: colors.gray[800],
  },
  input: {
    marginBottom: 12,
  },
  divider: {
    marginVertical: 16,
    backgroundColor: colors.gray[300],
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.gray[300],
  },
  cancelButton: {
    minWidth: 100,
  },
  saveButton: {
    minWidth: 150,
    backgroundColor: colors.primary,
  },
  errorText: {
    color: colors.error,
    textAlign: 'center',
    margin: 16,
    fontSize: 14,
  },
});

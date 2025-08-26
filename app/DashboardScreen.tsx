import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Text,
  Surface,
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { studentService } from '../services/studentService';
import supabase from '../lib/supabase';
import { colors } from '../theme/theme';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
  backgroundColor: string;
}

function StatCard({ title, value, icon, color, backgroundColor }: StatCardProps) {
  return (
    <Surface style={[styles.statCard, { backgroundColor }]} elevation={2}>
      <View style={styles.statCardContent}>
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          <MaterialIcons name={icon} size={32} color={color} />
        </View>
        <View style={styles.statTextContainer}>
          <Text style={styles.statTitle}>{title}</Text>
          <Text style={[styles.statValue, { color }]}>{value}</Text>
        </View>
      </View>
    </Surface>
  );
}

export default function DashboardScreen() {
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalFeesCollected, setTotalFeesCollected] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const students = await studentService.getAll();
      setTotalStudents(students.length);

      const { data: studentsData, error } = await supabase
        .from('students')
        .select('total_fee, paid_fee');

      if (error) throw error;

      if (studentsData && studentsData.length > 0) {
        const totalFeesCollected = studentsData.reduce(
          (sum: number, student: any) => sum + (student.total_fee || 0),
          0
        );
        setTotalFeesCollected(totalFeesCollected);
      } else {
        setTotalFeesCollected(0);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Title style={styles.headerTitle}>Dashboard</Title>
        <Paragraph style={styles.headerSubtitle}>
          Overview of SK Tutorials management system
        </Paragraph>
      </View>

      <View style={styles.statsContainer}>
        <StatCard
          title="Total Students"
          value={totalStudents}
          icon="people"
          color={colors.primary}
          backgroundColor={colors.gray[50]}
        />
        <StatCard
          title="Fee Collection"
          value={`₹${totalFeesCollected.toLocaleString()}`}
          icon="payment"
          color={colors.success}
          backgroundColor={colors.gray[50]}
        />
      </View>

      <View style={styles.cardsContainer}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Recent Activities</Title>
            <Paragraph>View recent fee payments and student updates</Paragraph>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Upcoming Exams</Title>
            <Paragraph>Check scheduled exams and important dates</Paragraph>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Attendance Summary</Title>
            <Paragraph>Monitor student attendance across all classes</Paragraph>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.gray[600],
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
  },
  statCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statTextContainer: {
    flex: 1,
  },
  statTitle: {
    fontSize: 14,
    color: colors.gray[600],
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  cardsContainer: {
    padding: 20,
    gap: 16,
  },
  card: {
    borderRadius: 12,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
});
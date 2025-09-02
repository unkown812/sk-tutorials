import { Student } from '../types/types';

interface GroupedStudents {
  [category: string]: {
    [course: string]: {
      [year: string]: Student[];
    };
  };
}

interface Filters {
  category: string;
  course: string;
  year: string;
}

export function groupStudents(
  students: Student[],
  filters: Filters
): GroupedStudents {
  const groups: GroupedStudents = {};

  students.forEach(student => {
    if (filters.category !== 'All' && student.category !== filters.category) return;
    if (filters.course !== 'All' && student.course !== filters.course) return;
    if (filters.year !== 'All' && student.year !== filters.year) return;

    if (!groups[student.category]) groups[student.category] = {};
    if (!groups[student.category][student.course]) groups[student.category][student.course] = {};
    if (!groups[student.category][student.course][student.year]) groups[student.category][student.course][student.year] = [];

    groups[student.category][student.course][student.year].push(student);
  });

  return groups;
}

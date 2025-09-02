import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Fees from './pages/Fees';
import Attendance from './pages/Attendance';
import Performance from './pages/Performance';
import Courses from './pages/Courses';
import Settings from './pages/Settings';
// import StudentDetail from './pages/StudentDetail';
import Login from './pages/Login';
import { UserProvider } from './context/UserContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="students" element={<Students />} />
            <Route path="fees" element={<Fees />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="performance" element={<Performance />} />
            <Route path="courses" element={<Courses />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
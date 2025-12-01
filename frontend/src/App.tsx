import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import NewCase from './pages/NewCase';
import CaseView from './pages/CaseView';
import Consultations from './pages/Consultations';
import Verses from './pages/Verses';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cases/new"
          element={
            <ProtectedRoute>
              <NewCase />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cases/:id"
          element={
            <ProtectedRoute>
              <CaseView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/consultations"
          element={
            <ProtectedRoute>
              <Consultations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/verses"
          element={
            <ProtectedRoute>
              <Verses />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

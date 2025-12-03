import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import NewCase from './pages/NewCase';
import CaseView from './pages/CaseView';
import Consultations from './pages/Consultations';
import Verses from './pages/Verses';
import VerseDetail from './pages/VerseDetail';
import Login from './pages/Login';
import Signup from './pages/Signup';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes - accessible to everyone */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/cases/new" element={<NewCase />} />
        <Route path="/cases/:id" element={<CaseView />} />
        <Route path="/consultations" element={<Consultations />} />
        <Route path="/verses" element={<Verses />} />
        <Route path="/verses/:canonicalId" element={<VerseDetail />} />

        {/* 404 fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;

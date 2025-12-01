import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import NewCase from './pages/NewCase';
import CaseView from './pages/CaseView';
import Verses from './pages/Verses';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cases/new" element={<NewCase />} />
        <Route path="/cases/:id" element={<CaseView />} />
        <Route path="/verses" element={<Verses />} />
      </Routes>
    </Router>
  );
}

export default App;

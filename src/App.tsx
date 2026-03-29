// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/Home';
import SimulationPage from './pages/SimPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/simulation/:id" element={<SimulationPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
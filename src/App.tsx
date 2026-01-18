import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Pessoas } from './pages/Pessoas';
import { Transacoes } from './pages/Transacoes';
import { Categorias } from './pages/Categorias'; 
import { ConsultaTotais } from './pages/ConsultaTotais'; // 1. IMPORTAR A NOVA PÁGINA

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex bg-slate-50 min-h-screen">
        <Sidebar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pessoas" element={<Pessoas />} />
            <Route path="/categorias" element={<Categorias />} />
            <Route path="/transacoes" element={<Transacoes />} />                    
            <Route path="/totais" element={<ConsultaTotais />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
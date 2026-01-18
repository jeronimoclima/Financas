import { Link, useLocation } from 'react-router-dom';

import { LayoutDashboard, Users, Tags, ReceiptText, BarChart3 } from 'lucide-react';

export const Sidebar = () => {
  const location = useLocation();

  const menu = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Pessoas', path: '/pessoas', icon: Users },
    { name: 'Categorias', path: '/categorias', icon: Tags },
    { name: 'Transações', path: '/transacoes', icon: ReceiptText },
    { name: 'Consulta Totais', path: '/totais', icon: BarChart3 },
  ];

  return (
    <aside className="w-72 h-screen bg-slate-950 fixed left-0 top-0 p-8 text-white z-50">
      <div className="flex items-center gap-3 mb-12">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/40">
          <ReceiptText size={24} />
        </div>
        <span className="text-2xl font-black tracking-tighter">Finanças</span>
      </div>
      
      <nav className="space-y-3">
        {menu.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 ${
                isActive 
                ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30' 
                : 'text-slate-500 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <item.icon size={22} />
              <span className="font-semibold">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
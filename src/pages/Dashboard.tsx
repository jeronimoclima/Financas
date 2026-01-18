import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import api from '../services/api';
import { Wallet, ArrowUpCircle, ArrowDownCircle, Receipt, Loader2 } from 'lucide-react';
import type { ResponseModel } from '../types';


interface Transacao {
  id: number;
  descricao: string;
  valor: number;
  tipo: string; 
  data: string;
  categoriaNome?: string;
  pessoaNome?: string;
}

export const Dashboard = () => {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para os cálculos
  const [totais, setTotais] = useState({
    saldo: 0,
    receitas: 0,
    despesas: 0
  });

  const carregarEDash = useCallback(async () => {
    setLoading(true);
    try {
      
      const res = await api.get<ResponseModel<Transacao[]>>('/Transacoes/BuscarTodas');
      
      if (res.data && res.data.dados) {
        const lista = res.data.dados;
        setTransacoes(lista);

        // CÁLCULOS NO FRONT-END 
        const rec = lista
          .filter(t => t.tipo === 'Receita')
          .reduce((acc, t) => acc + t.valor, 0);
        
        const des = lista
          .filter(t => t.tipo === 'Despesa')
          .reduce((acc, t) => acc + t.valor, 0);

        setTotais({
          receitas: rec,
          despesas: des,
          saldo: rec - des
        });
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) console.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarEDash();
  }, [carregarEDash]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center ml-72 bg-slate-50">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="p-8 md:p-12 ml-72 min-h-screen bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto">
        
        <header className="mb-10">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight italic">Dashboard</h1>
          <p className="text-slate-500 font-medium italic">Calculo e resumo financeiro.</p>
        </header>

        {/* CARDS DE RESUMO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white">
            <div className="flex items-center gap-4 mb-4 text-blue-600">
              <Wallet size={24} />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Saldo Geral</span>
            </div>
            <h2 className={`text-4xl font-bold italic ${totais.saldo >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
              R$ {totais.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h2>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white">
            <div className="flex items-center gap-4 mb-4 text-emerald-500">
              <ArrowUpCircle size={24} />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Entradas</span>
            </div>
            <h2 className="text-4xl font-bold text-emerald-600 italic">
              + R$ {totais.receitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h2>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white">
            <div className="flex items-center gap-4 mb-4 text-rose-500">
              <ArrowDownCircle size={24} />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Saídas</span>
            </div>
            <h2 className="text-4xl font-bold text-rose-600 italic">
              - R$ {totais.despesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h2>
          </div>
        </div>

        {/* LISTA DE TRANSAÇÕES */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-slate-800 italic flex items-center gap-2">
              <Receipt className="text-blue-600" /> Últimas Movimentações
            </h2>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="p-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Descrição</th>
                  <th className="p-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tipo</th>
                  <th className="p-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Valor</th>
                </tr>
              </thead>
              <tbody>
                {transacoes.map((t) => (
                  <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                    <td className="p-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-700">{t.descricao}</span>
                        <span className="text-xs text-slate-400">{t.categoriaNome || ''}</span>
                      </div>
                    </td>

                     <td className="p-6">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                         t.tipo === 'Receita' 
                         ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                          : 'bg-rose-50 text-rose-600 border border-rose-100'
                           }`}>
                            {t.tipo}
                         </span>
                      </td>


                 
                    <td className={`p-6 text-right font-black italic ${t.tipo === 'Receita' ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {t.tipo === 'Receita' ? '+' : '-'} R$ {t.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {transacoes.length === 0 && (
              <div className="p-20 text-center text-slate-400 italic">
                Nenhuma transação encontrada no sistema.
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
};
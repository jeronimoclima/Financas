import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import api from '../services/api';
import { User, ArrowUpCircle, ArrowDownCircle, Wallet, Loader2 } from 'lucide-react';
import type { Pessoa, Transacao, ResponseModel } from '../types';

export const ConsultaTotais = () => {
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const [resPessoas, resTransacoes] = await Promise.all([
          api.get<ResponseModel<Pessoa[]>>('/pessoa/BuscarPessoas'),///api/pessoa/BuscarPessoas
          api.get<ResponseModel<Transacao[]>>('/Transacoes/BuscarTodas')
        ]);

        if (resPessoas.data.dados) setPessoas(resPessoas.data.dados);
        if (resTransacoes.data.dados) setTransacoes(resTransacoes.data.dados);
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) console.error("Erro ao carregar totais:", err.message);
      } finally {
        setLoading(false);
      }
    };
    carregarDados();
  }, []);

  // Cálculo por Pessoa (Individual)
  const totaisPorPessoa = useMemo(() => {
    return pessoas.map(pessoa => {
      const transacoesDaPessoa = transacoes.filter(t => t.pessoa?.id === pessoa.id);
      
      const receitas = transacoesDaPessoa
        .filter(t => t.tipo === 'Receita' || t.tipo === 2)
        .reduce((acc, t) => acc + t.valor, 0);

      const despesas = transacoesDaPessoa
        .filter(t => t.tipo === 'Despesa' || t.tipo === 1)
        .reduce((acc, t) => acc + t.valor, 0);

      return {
        ...pessoa,
        receitas,
        despesas,
        saldo: receitas - despesas
      };
    });
  }, [pessoas, transacoes]);

  //  Cálculo Geral (Rodapé)
  const totalGeral = useMemo(() => {
    return totaisPorPessoa.reduce((acc, p) => ({
      receitas: acc.receitas + p.receitas,
      despesas: acc.despesas + p.despesas,
      saldo: acc.saldo + p.saldo
    }), { receitas: 0, despesas: 0, saldo: 0 });
  }, [totaisPorPessoa]);

  if (loading) return (
    <div className="flex h-screen items-center justify-center ml-72">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  return (
    <div className="p-8 md:p-12 ml-72 min-h-screen bg-[#F8FAFC]">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight italic">Relatório por Morador</h1>
          <p className="text-slate-500 font-medium italic">Resumo consolidado de receitas e gastos individuais.</p>
        </header>

        {/* Tabela de Totais */}
        <section className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Morador</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Receitas</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Despesas</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Saldo Líquido</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {totaisPorPessoa.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold">
                        <User size={18} />
                      </div>
                      <span className="font-bold text-slate-700">{p.nome}</span>
                    </div>
                  </td>
                  <td className="p-6 text-right font-bold text-emerald-500">
                    R$ {p.receitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-6 text-right font-bold text-rose-500">
                    R$ {p.despesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className={`p-6 text-right font-black ${p.saldo >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
                    R$ {p.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Rodapé com Totais Gerais */}
            <tfoot>
              <tr className="bg-slate-900 text-white">
                <td className="p-8 font-black text-lg italic">TOTAL GERAL</td>
                <td className="p-8 text-right font-bold text-emerald-400 text-lg">
                  R$ {totalGeral.receitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="p-8 text-right font-bold text-rose-400 text-lg">
                  R$ {totalGeral.despesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="p-8 text-right font-black text-blue-400 text-2xl">
                  R$ {totalGeral.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>
        </section>

        {/* Cards de Resumo Rápido  */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-emerald-500 p-6 rounded-3xl text-white shadow-lg shadow-emerald-200">
             <ArrowUpCircle className="mb-2 opacity-50" />
             <p className="text-xs font-black uppercase opacity-80">Total Receitas</p>
             <h2 className="text-2xl font-black">R$ {totalGeral.receitas.toLocaleString('pt-BR')}</h2>
          </div>
          <div className="bg-rose-500 p-6 rounded-3xl text-white shadow-lg shadow-rose-200">
             <ArrowDownCircle className="mb-2 opacity-50" />
             <p className="text-xs font-black uppercase opacity-80">Total Despesas</p>
             <h2 className="text-2xl font-black">R$ {totalGeral.despesas.toLocaleString('pt-BR')}</h2>
          </div>
          <div className="bg-blue-600 p-6 rounded-3xl text-white shadow-lg shadow-blue-200">
             <Wallet className="mb-2 opacity-50" />
             <p className="text-xs font-black uppercase opacity-80">Saldo Consolidado</p>
             <h2 className="text-2xl font-black">R$ {totalGeral.saldo.toLocaleString('pt-BR')}</h2>
          </div>
        </div>
      </div>
    </div>
  );
};
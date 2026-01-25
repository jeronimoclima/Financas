// Dashboard.tsx
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import api from "../services/api";
import {
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  Receipt,
  Loader2,
} from "lucide-react";
import type { ResponseModel } from "../types";
import { GraficoDeResumoFinanceiro } from "../components/Grafico/GraficoDeResumoFinanceiro";
import { GraficoDespesasPorCategoria } from "../components/Grafico/GraficoDespesasPorCategoria";


export interface Transacao {
  id: number;
  descricao: string;
  valor: number;
  tipo: number | "Receita" | "Despesa";
  pessoa: {
    id: number;
    nome: string;
    idade: number;
  };
  categoria: {
    id: number;
    descricao: string;
  };
  dataTransacao: string; 
}

export const Dashboard = () => {

  const [transacoes, setTransacoes] = useState<Transacao[]>([]); 
  const [carregando, setcarregando] = useState(true); 
  const [mostrarTodas, setMostrarTodas] = useState(false); // mostrar todas as transações na tabela
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState(""); 

  

  
  // Função que busca dados da API
  const carregarDadosDashboard = useCallback(async () => {
    setcarregando(true);
    try {
      const res = await api.get<ResponseModel<Transacao[]>>("/Transacoes/BuscarTodas");
      if (res.data && res.data.dados) {
        setTransacoes(res.data.dados); // salva todas as transações
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) console.error(err.message);
    } finally {
      setcarregando(false);
    }
  }, []);

  
  //usado para carregar dados ao iniciar a página
  useEffect(() => {
    carregarDadosDashboard();
  }, [carregarDadosDashboard]);

  
  // Usado pra filtrar todas transações de acordo com as datas escolhidas
  const transacoesFiltradas = transacoes.filter((t) => {
    const timestamp = new Date(t.dataTransacao).getTime();
    const inicio = dataInicio ? new Date(dataInicio + "T00:00:00Z").getTime() : null;
    const fim = dataFim ? new Date(dataFim + "T23:59:59Z").getTime() : null;

    if (inicio !== null && timestamp < inicio) return false;
    if (fim !== null && timestamp > fim) return false;

    return true;
  });

  const receitasFiltradas = transacoesFiltradas
    .filter((t) => t.tipo === "Receita")
    .reduce((acc, t) => acc + t.valor, 0);

  const despesasFiltradas = transacoesFiltradas
    .filter((t) => t.tipo === "Despesa")
    .reduce((acc, t) => acc + t.valor, 0);

  const saldoFiltrado = receitasFiltradas - despesasFiltradas;

  const transacoesExibidas = mostrarTodas ? transacoesFiltradas : transacoesFiltradas.slice(0, 3);

  const despesasPorCategoria = Object.entries(
    transacoesFiltradas
      .filter((t) => t.tipo === "Despesa")
      .reduce((acc: Record<string, number>, t) => {
        const categoria = t.categoria.descricao;
        acc[categoria] = (acc[categoria] || 0) + t.valor;
        return acc;
      }, {})
  ).map(([nome, valor]) => ({
    nome,
    valor,
  }));

 
  if (carregando) {
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
          <h1 className="text-4xl font-black text-slate-900 tracking-tight italic">
            Dashboard
          </h1>
          <p className="text-slate-500 font-medium italic">
            Calculo e resumo financeiro.
          </p>
        </header>

        {/* implementação do filtro de dados */}
        <div className="flex justify-end gap-4 mb-4">
          <input
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            className="w-48 p-4 rounded-2xl border-2 border-slate-200 focus:border-blue-500 outline-none font-normal text-slate-400"
          />
          <input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className="w-48 p-4 rounded-2xl border-2 border-slate-200 focus:border-blue-500 outline-none font-normal text-slate-400"
          />
        </div>

        {/* Cards de resumo financeiro */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-emerald-500 p-6 rounded-3xl text-white shadow-lg shadow-emerald-200">
            <ArrowUpCircle className="mb-2 opacity-50" />
            <p className="text-xs font-black uppercase opacity-80">Total Receitas</p>
            <h2 className="text-2xl font-black">
              R$ {receitasFiltradas.toLocaleString("pt-BR")}
            </h2>
          </div>

          <div className="bg-rose-500 p-6 rounded-3xl text-white shadow-lg shadow-rose-200">
            <ArrowDownCircle className="mb-2 opacity-50" />
            <p className="text-xs font-black uppercase opacity-80">Total Despesas</p>
            <h2 className="text-2xl font-black">
              R$ {despesasFiltradas.toLocaleString("pt-BR")}
            </h2>
          </div>

          <div className="bg-blue-600 p-6 rounded-3xl text-white shadow-lg shadow-blue-200">
            <Wallet className="mb-2 opacity-50" />
            <p className="text-xs font-black uppercase opacity-80">Saldo Consolidado</p>
            <h2 className="text-2xl font-black">
              R$ {saldoFiltrado.toLocaleString("pt-BR")}
            </h2>
          </div>
        </div>

        {/* Gráficos*/}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <GraficoDeResumoFinanceiro
            receitas={receitasFiltradas}
            despesas={despesasFiltradas}
          />
          <GraficoDespesasPorCategoria dados={despesasPorCategoria} />
        </div>

        {/*Lista de transações */}
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
                  <th className="p-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Descrição
                  </th>
                  <th className="p-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Tipo
                  </th>
                  <th className="p-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">
                    Valor
                  </th>
                </tr>
              </thead>
              <tbody>
                {transacoesExibidas.map((t) => (
                  <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                    <td className="p-6">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-slate-700">{t.descricao}</span>
                        <span className="text-xs text-slate-400">{t.categoria.descricao}</span>
                        {t.pessoa?.nome && <span className="text-[11px] text-slate-500 italic">{t.pessoa.nome}</span>}
                        <span className="text-[11px] text-slate-400 italic">
                          {new Date(t.dataTransacao).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${t.tipo === "Receita" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"}`}>
                        {t.tipo}
                      </span>
                    </td>
                    <td className={`p-6 text-right font-black italic ${t.tipo === "Receita" ? "text-emerald-500" : "text-rose-500"}`}>
                      {t.tipo === "Receita" ? "+" : "-"} R${" "}
                      {t.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Botão  de espandir as ultimas movimentações - Ver mais / Ocultar */}
            {transacoesFiltradas.length > 3 && (
              <div className="flex justify-center py-6">
                <button
                  onClick={() => setMostrarTodas(!mostrarTodas)}
                  className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition"
                >
                  {mostrarTodas ? "Ocultar" : "Ver mais"}
                  <span className={`transition-transform ${mostrarTodas ? "rotate-180" : ""}`}>▼</span>
                </button>
              </div>
            )}

            {transacoesFiltradas.length === 0 && (
              <div className="p-20 text-center text-slate-400 italic">
                Nenhuma transação encontrada no período selecionado.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

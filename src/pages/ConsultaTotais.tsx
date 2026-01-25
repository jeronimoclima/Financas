import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import api from "../services/api";
import {
  User,
  ArrowUpCircle,
  ArrowDownCircle,
  Wallet,
  Loader2,
} from "lucide-react";
import type { Pessoa, Transacao, ResponseModel } from "../types";

type PessoaComTotais = Pessoa & {
  receitas: number;
  despesas: number;
  saldo: number;
};

export const ConsultaTotais = () => {
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [carregando, setcarregando] = useState(true);
  const [search, setSearch] = useState("");

  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  const calcularTotal = (
    transacoes: Transacao[],
    tipo: "Receita" | "Despesa" | number,
  ) => {
    return transacoes
      .filter((transacao) => transacao.tipo === tipo)
      .reduce((total, transacao) => total + transacao.valor, 0);
  };

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const [resPessoas, resTransacoes] = await Promise.all([
          api.get<ResponseModel<Pessoa[]>>("/pessoa/BuscarPessoas"), //api/pessoa/BuscarPessoas   colocado para nao esquecer
          api.get<ResponseModel<Transacao[]>>("/Transacoes/BuscarTodas"),
        ]);

        if (resPessoas.data.dados) setPessoas(resPessoas.data.dados);
        if (resTransacoes.data.dados) setTransacoes(resTransacoes.data.dados);
      } catch (err: unknown) {
        if (axios.isAxiosError(err))
          console.error("Erro ao carregar totais:", err.message);
      } finally {
        setcarregando(false);
      }
    };
    carregarDados();
  }, []);


const totaisPorPessoa = useMemo<PessoaComTotais[]>(() => {
  return pessoas.map((pessoa) => {
    const transacoesDaPessoa = transacoes
      .filter((t) => t.pessoa?.id === pessoa.id)
      .filter((t) => {
        const data = new Date(t.dataTransacao).getTime();

        const inicio = dataInicio
          ? new Date(dataInicio + "T00:00:00Z").getTime()
          : null;
        const fim = dataFim
          ? new Date(dataFim + "T23:59:59Z").getTime()
          : null;

        if (inicio !== null && data < inicio) return false;
        if (fim !== null && data > fim) return false;

        return true;
      });

    const receitas = calcularTotal(transacoesDaPessoa, "Receita");
    const despesas = calcularTotal(transacoesDaPessoa, "Despesa");

    return {
      ...pessoa,
      receitas,
      despesas,
      saldo: receitas - despesas,
    };
  });
}, [pessoas, transacoes, dataInicio, dataFim]);

  const totaisFiltrados = useMemo(() => {
    if (!search.trim()) return totaisPorPessoa;

    return totaisPorPessoa.filter((p) =>
      p.nome.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search, totaisPorPessoa]);

  const pessoaSelecionada = useMemo<PessoaComTotais | null>(() => {
    if (!search.trim()) return null;

    const filtrados = totaisPorPessoa.filter((p) =>
      p.nome.toLowerCase().includes(search.toLowerCase()),
    );

    return filtrados.length === 1 ? filtrados[0] : null;
  }, [search, totaisPorPessoa]);

const transacoesDaPessoa = useMemo(() => {
  if (!pessoaSelecionada) return [];

  const inicio = dataInicio
    ? new Date(dataInicio + "T00:00:00Z").getTime()
    : null;
  const fim = dataFim
    ? new Date(dataFim + "T23:59:59Z").getTime()
    : null;

  return transacoes
    .filter((t) => t.pessoa?.id === pessoaSelecionada.id)
    .filter((t) => {
      const data = new Date(t.dataTransacao).getTime();

      if (inicio !== null && data < inicio) return false;
      if (fim !== null && data > fim) return false;

      return true;
    });
}, [pessoaSelecionada, transacoes, dataInicio, dataFim]);


  const totalGeral = useMemo(() => {
    return totaisFiltrados.reduce(
      (acc, p) => ({
        receitas: acc.receitas + p.receitas,
        despesas: acc.despesas + p.despesas,
        saldo: acc.saldo + p.saldo,
      }),
      { receitas: 0, despesas: 0, saldo: 0 },
    );
  }, [totaisFiltrados]);
 

  if (carregando)
    return (
      <div className="flex h-screen items-center justify-center ml-72">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );

  return (
    <div className="p-8 md:p-12 ml-72 min-h-screen bg-[#F8FAFC]">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight italic">
            Relatório por moradores
          </h1>
          <p className="text-slate-500 font-medium italic">
            Resumo de gastos individuais.
          </p>
        </header>

      

        <div className="flex flex-col md:flex-row gap-4 mb-8">          
          <input
            type="text"
            placeholder="Buscar por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-96 p-4 rounded-2xl border-2 border-slate-200 focus:border-blue-500 outline-none font-semibold"
          />

        
          <input
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            className="w-full md:w-48 p-4 rounded-2xl border-2 border-slate-200 focus:border-blue-500 outline-none font-normal text-slate-400"
          />

         
          <input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className="w-full md:w-48 p-4 rounded-2xl border-2 border-slate-200 focus:border-blue-500 outline-none font-normal text-slate-400"
          />
        </div>

        {pessoaSelecionada && (
          <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 mb-8">
            <h2 className="text-xl font-black mb-4">
              Resumo financeiro — {pessoaSelecionada.nome}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-emerald-50 p-4 rounded-xl">
                <p className="text-xs font-black uppercase text-emerald-600">
                  Receitas
                </p>
                <p className="text-xl font-bold text-emerald-600">
                  R$ {pessoaSelecionada.receitas.toLocaleString("pt-BR")}
                </p>
              </div>

              <div className="bg-rose-50 p-4 rounded-xl">
                <p className="text-xs font-black uppercase text-rose-600">
                  Despesas
                </p>
                <p className="text-xl font-bold text-rose-600">
                  R$ {pessoaSelecionada.despesas.toLocaleString("pt-BR")}
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-xl">
                <p className="text-xs font-black uppercase text-blue-600">
                  Saldo
                </p>
                <p className="text-xl font-black text-blue-600">
                  R$ {pessoaSelecionada.saldo.toLocaleString("pt-BR")}
                </p>
              </div>
            </div>
          </div>
        )}

      
        {pessoaSelecionada && (
          <section className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 mb-10">
            <h3 className="text-lg font-black mb-4">
              Transações de {pessoaSelecionada.nome}
            </h3>

            {transacoesDaPessoa.length === 0 ? (
              <p className="text-slate-400 italic">
                Nenhuma transação encontrada.
              </p>
            ) : (
              <ul className="divide-y">
                {transacoesDaPessoa.map((t) => (
                  <li key={t.id} className="py-3 flex justify-between">
                    <div className="flex flex-col">
                    
                      <span className="text-xs text-slate-400">
                        {new Date(t.dataTransacao).toLocaleDateString("pt-BR")}
                      </span>
                      <span className="font-semibold text-slate-600">
                        {t.descricao}
                      </span>
                    </div>

                    <span
                      className={`font-bold ${t.tipo === "Receita" || t.tipo === 2 ? "text-emerald-500" : "text-rose-500"}`}
                    >
                      R$ {t.valor.toLocaleString("pt-BR")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

   
        <section className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Morador
                </th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                  Receitas
                </th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                  Despesas
                </th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                  Saldo Líquido
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {totaisFiltrados.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="p-10 text-center text-slate-400 italic"
                  >
                    Nenhuma pessoa encontrada.
                  </td>
                </tr>
              )}

              {totaisFiltrados.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-slate-50/30 transition-colors group"
                >
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold">
                        <User size={18} />
                      </div>
                      <span className="font-bold text-slate-700">{p.nome}</span>
                    </div>
                  </td>
                  <td className="p-6 text-right font-bold text-emerald-500">
                    R${" "}
                    {p.receitas.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td className="p-6 text-right font-bold text-rose-500">
                    R${" "}
                    {p.despesas.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td
                    className={`p-6 text-right font-black ${p.saldo >= 0 ? "text-blue-600" : "text-rose-600"}`}
                  >
                    R${" "}
                    {p.saldo.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              ))}
            </tbody>

           
            <tfoot>
              <tr className="bg-slate-900 text-white">
                <td className="p-8 font-black text-lg italic">TOTAL GERAL</td>
                <td className="p-8 text-right font-bold text-emerald-400 text-lg">
                  R${" "}
                  {totalGeral.receitas.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </td>
                <td className="p-8 text-right font-bold text-rose-400 text-lg">
                  R${" "}
                  {totalGeral.despesas.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </td>
                <td className="p-8 text-right font-black text-blue-400 text-2xl">
                  R${" "}
                  {totalGeral.saldo.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </td>
              </tr>
            </tfoot>
          </table>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-emerald-500 p-6 rounded-3xl text-white shadow-lg shadow-emerald-200">
            <ArrowUpCircle className="mb-2 opacity-50" />
            <p className="text-xs font-black uppercase opacity-80">
              Total Receitas
            </p>
            <h2 className="text-2xl font-black">
              R$ {totalGeral.receitas.toLocaleString("pt-BR")}
            </h2>
          </div>
          <div className="bg-rose-500 p-6 rounded-3xl text-white shadow-lg shadow-rose-200">
            <ArrowDownCircle className="mb-2 opacity-50" />
            <p className="text-xs font-black uppercase opacity-80">
              Total Despesas
            </p>
            <h2 className="text-2xl font-black">
              R$ {totalGeral.despesas.toLocaleString("pt-BR")}
            </h2>
          </div>
          <div className="bg-blue-600 p-6 rounded-3xl text-white shadow-lg shadow-blue-200">
            <Wallet className="mb-2 opacity-50" />
            <p className="text-xs font-black uppercase opacity-80">
              Saldo Consolidado
            </p>
            <h2 className="text-2xl font-black">
              R$ {totalGeral.saldo.toLocaleString("pt-BR")}
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
};

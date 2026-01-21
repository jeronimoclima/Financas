import { useState, useEffect } from "react";
import axios from "axios";
import api from "../services/api";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import type { Pessoa, Categoria, ResponseModel } from "../types";

export const Transacoes = () => {
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [flashMessage, setFlashMessage] = useState<string | null>(null);
  const [flashType, setFlashType] = useState<"success" | "error">("success");

  const [formData, setFormData] = useState({
    descricao: "",
    valor: "",
    tipo: "Despesa",
    idPessoa: "",
    idCategoria: "",
  });

  useEffect(() => {
    const carregarDados = async () => {
      const [resPessoas, resCategorias] = await Promise.all([
        api.get<ResponseModel<Pessoa[]>>("/pessoa/BuscarPessoas"),
        api.get<ResponseModel<Categoria[]>>("/Categoria/Buscar"),
      ]);
      setPessoas(resPessoas.data.dados);
      setCategorias(resCategorias.data.dados);
    };
    carregarDados();
  }, []);

  const showFlashMessage = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setFlashMessage(message);
    setFlashType(type);

    setTimeout(() => {
      setFlashMessage(null);
    }, 2000);
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();

    // Encontrar os dados da pessoa selecionada no formulário
    const pessoaSelecionada = pessoas.find(
      (p) => p.id === parseInt(formData.idPessoa),
    );

    // Validar se é Receita para menor de 18 anos
    if (
      formData.tipo === "Receita" &&
      pessoaSelecionada &&
      pessoaSelecionada.idade < 18
    ) {
      showFlashMessage(
        `Operação negada: ${pessoaSelecionada.nome} é menor de idade.`,
        "error",
      );
      return;
    }

    setLoading(true);
    try {
      await api.post("/Transacoes/CriarTransacao", {
        ...formData,
        valor: parseFloat(formData.valor),
        idPessoa: parseInt(formData.idPessoa),
        idCategoria: parseInt(formData.idCategoria),
        tipo: formData.tipo === "Despesa" ? 1 : 2,
      });

      showFlashMessage("Transação registrada com sucesso!", "success");

      setFormData({
        descricao: "",
        valor: "",
        tipo: "Despesa",
        idPessoa: "",
        idCategoria: "",
      });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.error("Erro na API:", err.message);

        showFlashMessage(
          err.response?.data?.mensagem || "Erro ao salvar transação.",
          "error",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  <button
    disabled={loading}
    className="w-full py-5 bg-slate-900 hover:bg-blue-600 text-white rounded-3xl font-black text-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50"
  >
    {loading ? (
      "Processando..."
    ) : (
      <>
        <CheckCircle2 size={24} /> Confirmar Lançamento
      </>
    )}
  </button>;

  return (
    <div className="ml-72 p-12 min-h-screen bg-[#f8fafc] animate-in fade-in duration-500">
      {flashMessage && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center">       
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />         
          <div
            className={`relative px-10 py-6 rounded-3xl text-white text-lg font-bold shadow-2xl
          animate-in zoom-in-95 fade-in duration-300
          ${flashType === "success" ? "bg-emerald-600" : "bg-rose-600"}
        `}
          >
            {flashMessage}
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Nova Movimentação
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Registre entradas e saídas do seu caixa.
          </p>
        </header>

        <form
          onSubmit={handleSalvar}
          className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 space-y-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Pessoa */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                Quem?
              </label>
              <select
                required
                value={formData.idPessoa}
                onChange={(e) =>
                  setFormData({ ...formData, idPessoa: e.target.value })
                }
                className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none transition-all cursor-pointer"
              >
                <option value="">Selecione o morador</option>
                {pessoas.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Valor */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                Valor?
              </label>
              <div className="relative">
                <span className="absolute left-4 top-4 font-bold text-slate-400">
                  R$
                </span>
                <input
                  required
                  type="number"
                  step="0.01"
                  value={formData.valor}
                  onChange={(e) =>
                    setFormData({ ...formData, valor: e.target.value })
                  }
                  className="w-full p-4 pl-12 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none transition-all font-bold"
                  placeholder="0,00"
                />
              </div>
            </div>

            {/* Tipo */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                Tipo
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, tipo: "Receita" })}
                  className={`flex-1 py-4 rounded-2xl border-2 flex items-center justify-center gap-2 font-bold transition-all ${formData.tipo === "Receita" ? "border-emerald-500 bg-emerald-50 text-emerald-600 shadow-inner" : "border-slate-100 text-slate-400"}`}
                >
                  <ArrowUpCircle size={20} /> Receita
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, tipo: "Despesa" })}
                  className={`flex-1 py-4 rounded-2xl border-2 flex items-center justify-center gap-2 font-bold transition-all ${formData.tipo === "Despesa" ? "border-rose-500 bg-rose-50 text-rose-600 shadow-inner" : "border-slate-100 text-slate-400"}`}
                >
                  <ArrowDownCircle size={20} /> Despesa
                </button>
              </div>
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                O que é?
              </label>
              <input
                required
                value={formData.descricao}
                onChange={(e) =>
                  setFormData({ ...formData, descricao: e.target.value })
                }
                className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none transition-all"
                placeholder="Ex: Compras do mês"
              />
            </div>

            {/* Categoria */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                Categoria
              </label>
              <select
                required
                value={formData.idCategoria}
                onChange={(e) =>
                  setFormData({ ...formData, idCategoria: e.target.value })
                }
                className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none transition-all cursor-pointer"
              >
                <option value="">Selecione a categoria</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.descricao}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full py-5 bg-slate-900 hover:bg-blue-600 text-white rounded-3xl font-black text-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <>
                <CheckCircle2 size={24} />
                <span>Confirmar Lançamento</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import api from "../services/api";
import { UserPlus, Trash2, Loader2, RefreshCw } from "lucide-react";
import type { Pessoa, ResponseModel } from "../types";

export const Pessoas = () => {
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [nome, setNome] = useState("");
  const [idade, setIdade] = useState("");
  const [carregandoLista, setCarregandoLista] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [flashMessage, setFlashMessage] = useState<string | null>(null);
  const [flashType, setFlashType] = useState<"success" | "error">("success");

  const carregarPessoas = useCallback(async () => {
    setCarregandoLista(true);
    try {
      const res = await api.get<ResponseModel<Pessoa[]>>(
        "/pessoa/BuscarPessoas",
      );
      if (res.data && res.data.dados) {
        setPessoas(res.data.dados);
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.error("Erro API:", err.message);
      } else {
        console.error("Erro inesperado:", err);
      }
    } finally {
      setCarregandoLista(false);
    }
  }, []);

  useEffect(() => {
    carregarPessoas();
  }, [carregarPessoas]);

  const showFlashMessage = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setFlashMessage(message);
    setFlashType(type);

    setTimeout(() => {
      setFlashMessage(null);
    }, 1500);
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !idade) return;

    setSalvando(true);
    try {
      await api.post("/pessoa/CriarPessoas", {
        nome,
        idade: Number(idade),
      });

      setNome("");
      setIdade("");
      await carregarPessoas();

      //Flash de sucesso
      showFlashMessage("Morador cadastrado com sucesso!", "success");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.error("Erro ao salvar:", err.message);

        // Flash de erro
        showFlashMessage(
          err.response?.data?.mensagem || "Erro ao salvar morador.",
          "error",
        );
      }
    } finally {
      setSalvando(false);
    }
  };

  const handleDeletar = async (id: number) => {
    if (!confirm("Deseja deletar este morador?")) return;
    try {
      await api.delete(`/pessoa/DeletarPessoas?id=${id}`);
      await carregarPessoas();
      
      showFlashMessage("Morador removido com sucesso!", "success");
    } catch (err: unknown) {
      console.error(err);
     
      showFlashMessage("Erro ao remover morador.", "error");
    }
  };

  return (
    <div className="p-8 md:p-12 ml-72 min-h-screen bg-[#F8FAFC]">
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

      <div className="max-w-5xl mx-auto">
        <header className="mb-10 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight italic">
              Moradores
            </h1>
            <p className="text-slate-500 font-medium">
              Gestão de residentes da casa.
            </p>
          </div>
          <button
            onClick={carregarPessoas}
            className="p-3 text-slate-400 hover:text-blue-600 transition-colors"
          >
            <RefreshCw
              size={20}
              className={carregandoLista ? "animate-spin" : ""}
            />
          </button>
        </header>

        <section className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white mb-12">
          <form
            onSubmit={handleSalvar}
            className="flex flex-col md:flex-row gap-6 items-end"
          >
            <div className="flex-1 w-full">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 mb-2 block">
                Nome
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Jeronimo, Raiane..."
                className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white outline-none transition-all duration-300 font-semibold text-slate-700 placeholder:text-slate-400"
                required
              />
            </div>
            <div className="w-full md:w-32">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 mb-2 block">
                Idade
              </label>
              <input
                type="number"
                value={idade}
                onChange={(e) => setIdade(e.target.value)}
                placeholder="Ex: 18"
                className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none transition-all font-bold"
                required
              />
            </div>
            <button
              type="submit"
              disabled={salvando}
              className="bg-slate-900 hover:bg-blue-700 text-white  h-14 (56px) px-10 rounded-2xl transition-all shadow-lg flex items-center justify-center disabled:opacity-50"
            >
              {salvando ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <UserPlus size={22} />
              )}
            </button>
          </form>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pessoas.map((p) => (
            <div
              key={p.id}
              className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center gap-4 hover:border-blue-200 hover:shadow-lg transition-all group relative"
            >
              <div className="w-14 h-14 bg-linear-to-br from-blue-50 to-blue-100 text-blue-600 rounded-2xl flex items-center justify-center font-bold text-xl">
                {p.nome.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-800 leading-tight">
                  {p.nome}
                </h3>
                <p className="text-sm font-medium text-slate-400">
                  {p.idade} anos
                </p>
              </div>
              <button
                onClick={() => handleDeletar(p.id)}
                className="opacity-0 group-hover:opacity-100 p-2 text-rose-300 hover:text-rose-600 transition-all"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

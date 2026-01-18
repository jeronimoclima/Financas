import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { Tag, Plus, Loader2, Trash2 } from 'lucide-react';
import type { Categoria, ResponseModel } from '../types';

export const Categorias = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [descricao, setDescricao] = useState('');
  const [finalidade, setFinalidade] = useState('Despesa');
  const [carregando, setCarregando] = useState(false);

  const carregarCategorias = useCallback(async () => {
    try {
      const res = await api.get<ResponseModel<Categoria[]>>('/Categoria/Buscar');
      if (res.data && res.data.dados) {
        setCategorias(res.data.dados);
      }
    } catch (error: unknown) {
      
      console.error("Erro ao carregar categorias:", error);
    }
  }, []);

  useEffect(() => {
    carregarCategorias();
  }, [carregarCategorias]);

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricao) return;
    
    setCarregando(true);
    try {
      await api.post('/Categoria/Criar', { 
        descricao, 
        finalidade 
      });
      setDescricao('');
      await carregarCategorias();
    } catch (error: unknown) {
    
      console.error("Erro ao salvar categoria:", error);
      alert("Erro ao salvar. Verifique se a API está rodando.");
    } finally {
      setCarregando(false);
    }
  };

  const handleDeletar = async (id: number) => {
    if (!confirm("Deseja excluir esta categoria?")) return;
    try {
      await api.delete(`/Categoria/Excluir?id=${id}`);
      await carregarCategorias();
    } catch (error: unknown) {
      console.error("Erro ao deletar:", error);
    }
  };

  return (
    <div className="p-8 md:p-12 ml-72 min-h-screen bg-[#F8FAFC] animate-in fade-in duration-500">
      <div className="max-w-5xl mx-auto">
        
        <header className="mb-10">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight italic">Categorias</h1>
          <p className="text-slate-500 font-medium italic">Classifique seus ganhos e gastos.</p>
        </header>

        <section className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white mb-12">
          <form onSubmit={handleSalvar} className="flex flex-col md:flex-row gap-6 items-end">
            <div className="flex-1 w-full">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 mb-2 block">Descrição</label>
              <input 
                value={descricao} 
                onChange={e => setDescricao(e.target.value)}
                placeholder="Ex: Supermercado, Salário..."
                className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none transition-all font-semibold"
              />
            </div>
            
            <div className="w-full md:w-48">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 mb-2 block">Tipo</label>
              <select 
                value={finalidade}
                onChange={e => setFinalidade(e.target.value)}
                className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none font-bold cursor-pointer"
              >
                <option value="Despesa">Despesa</option>
                <option value="Receita">Receita</option>
              </select>
            </div>

            <button 
              type="submit"
              disabled={carregando}
              className="bg-slate-900 hover:bg-blue-600 text-white h-14 (56px) px-8 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 font-bold disabled:opacity-50 active:scale-95"
            >
              {carregando ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
              <span>Adicionar</span>
            </button>
          </form>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categorias.length > 0 ? (
            categorias.map(cat => (
              <div key={cat.id} className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center justify-between hover:shadow-lg transition-all group">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${cat.finalidade === 'Receita' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    <Tag size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 leading-tight">{cat.descricao}</h3>
                    <span className={`text-[10px] font-black uppercase ${cat.finalidade === 'Receita' ? 'text-emerald-500' : 'text-rose-400'}`}>
                      {cat.finalidade}
                    </span>
                  </div>
                </div>

              
                <button 
                  onClick={() => handleDeletar(cat.id)}
                  className="p-2 text-slate-300 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-slate-400 font-medium italic">
              Nenhuma categoria encontrada.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


export interface Pessoa {
    id: number;
    nome: string;
    idade: number;
}

export interface Categoria {
    id: number;
    descricao: string;
    finalidade: string;
}

export interface ResponseModel<T> {
    dados: T;
    mensagem: string;
}

export interface Transacao {
  id: number;
  descricao: string;
  valor: number;
  tipo: number | 'Receita' | 'Despesa';
  pessoa: {
    id: number;
    nome: string;
    idade: number;
  };
  categoria: {
    id: number;
    descricao: string;
  };
}

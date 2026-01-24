import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";

interface Props {
  receitas: number;
  despesas: number;
}

export const GraficoDeResumoFinanceiro = ({ receitas, despesas }: Props) => {
  const dados = [
    { nome: "Receita", valor: receitas },
    { nome: "Despesa", valor: despesas },
  ];

  const CORES = {
    Receita: "#10b981", 
    Despesa: "#f43f5e",
  };

  const formatarReal = (valor: number) =>
    `R$ ${valor.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
    })}`;

  return (
    <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100">
      <h3 className="font-bold text-slate-700 mb-4">Receitas x Despesas</h3>

      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={dados} margin={{ top: 30, right: 20, left: 20, bottom: 5 }} >
          <XAxis dataKey="nome" />
          <YAxis hide />
          <Tooltip
            formatter={(valor) =>
              typeof valor === "number" ? formatarReal(valor) : valor
            }
          />

          <Bar dataKey="valor" barSize={45} radius={[8, 8, 0, 0]}>
            {dados.map((item, index) => (
              <Cell
                key={`cell-${index}`}
                fill={CORES[item.nome as "Receita" | "Despesa"]}
              />
            ))}

            <LabelList
              dataKey="valor"
              position="top"
              formatter={(valor) =>
                typeof valor === "number"
                  ? `R$ ${valor.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}`
                  : ""
              }
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

import {
  PieChart,
  Pie,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const CORES = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#6366f1",
  "#a855f7",
];

interface Props {
  dados: {
    nome: string;
    valor: number;
  }[];
}

export const GraficoDespesasPorCategoria = ({ dados }: Props) => {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100">
      <h3 className="font-bold text-slate-700 mb-4">
        Despesas por categoria
      </h3>

      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={dados}
            dataKey="valor"
            nameKey="nome"
            outerRadius={100}
            label
          >
            {dados.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={CORES[index % CORES.length]}
              />
            ))}
          </Pie>

          <Tooltip
            formatter={(valor) =>
              typeof valor === "number"
                ? `R$ ${valor.toLocaleString("pt-BR")}`
                : valor
            }
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

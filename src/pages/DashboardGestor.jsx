import React, { useEffect, useState, useMemo } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import {
  FaUserTie,
  FaCheckCircle,
  FaTimesCircle,
  FaChartBar,
  FaTrophy,
  FaRedo,
} from "react-icons/fa";
import { Bar, Pie, Line, Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import "./dashboardgestor.css"; // <-- use o CSS correto

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  ArcElement,
  Tooltip,
  Legend
);

// --- Utilitários ---

const formatDate = (date) => {
  if (!date) return "";
  const d = date instanceof Date ? date : date?.toDate?.() || new Date();
  return d.toLocaleDateString();
};

const formatDateTime = (date) => {
  if (!date) return "";
  const d = date instanceof Date ? date : date?.toDate?.() || new Date();
  return d.toLocaleString();
};

const compareDateOnly = (date, start, end) => {
  // Compara só o ano, mês, dia, ignorando horas
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const s = start ? new Date(start.getFullYear(), start.getMonth(), start.getDate()) : null;
  const e = end ? new Date(end.getFullYear(), end.getMonth(), end.getDate()) : null;

  if (s && e) return d >= s && d <= e;
  if (s) return d >= s;
  if (e) return d <= e;
  return true;
};

const statusColorMap = {
  "pedido aceito": "#22c55e",
  "pedido recusado": "#dc2626",
  "em análise": "#2563eb",
};

const statusLabels = {
  "pedido aceito": "Aprovado",
  "pedido recusado": "Recusado",
  "em análise": "Em Análise",
};

const IconMap = {
  pedidos: <FaChartBar />,
  aprovados: <FaCheckCircle />,
  recusados: <FaTimesCircle />,
  pontuacao: <FaTrophy />,
  funcionario: <FaUserTie />,
  reset: <FaRedo />,
};

// --- Componente Card para KPIs ---
const KpiCard = ({ icon, title, value, color }) => (
  <div className="dashboard-kpi-card" aria-label={`${title}: ${value}`}>
    <span style={{ fontSize: 28, color }}>{icon}</span>
    <span className="dashboard-kpi-title">{title}</span>
    <span className="dashboard-kpi-value" style={{ color }}>{value}</span>
  </div>
);

// --- Componente de Filtros ---
const FilterSection = ({
  dataInicio,
  dataFim,
  setDataInicio,
  setDataFim,
  usuarios,
  usuarioSelecionado,
  setUsuarioSelecionado,
  onReset,
}) => (
  <fieldset>
    <legend>Filtros de análise</legend>
    <label>
      Data Início
      <input
        type="date"
        value={dataInicio ? dataInicio.toISOString().slice(0, 10) : ""}
        onChange={e => setDataInicio(e.target.value ? new Date(e.target.value) : null)}
        aria-label="Data de início do filtro"
      />
    </label>
    <label>
      Data Fim
      <input
        type="date"
        value={dataFim ? dataFim.toISOString().slice(0, 10) : ""}
        onChange={e => setDataFim(e.target.value ? new Date(e.target.value) : null)}
        aria-label="Data de fim do filtro"
      />
    </label>
    <label style={{ display: "flex", paddingBottom: 12  }}>
      Funcionário
      <select
        value={usuarioSelecionado}
        onChange={e => setUsuarioSelecionado(e.target.value)}
        aria-label="Selecionar funcionário para análise"
      >
        <option value="">-- Todos --</option>
        {usuarios.map((u) => (
          <option key={u.id} value={u.nomeUsuario || u.nome || u.id}>
            {u.nomeUsuario || u.nome || "Sem nome"}
          </option>
        ))}
      </select>
    </label>
    <button type="button" onClick={onReset} aria-label="Resetar filtros" title="Resetar filtros">
      {IconMap.reset} Limpar filtros
    </button>
  </fieldset>
);

// --- Função que filtra pedidos com base nos filtros aplicados ---
function aplicarFiltros(pedidos, usuarioSelecionado, dataInicio, dataFim) {
  return pedidos.filter((p) => {
    // Filtra por usuário
    if (usuarioSelecionado && p.nomeUsuario !== usuarioSelecionado) return false;

    // Filtra por data
    const dataPedido = p.data?.toDate ? p.data.toDate() : new Date();
    if (!compareDateOnly(dataPedido, dataInicio, dataFim)) return false;

    return true;
  });
}

// --- Dashboard detalhado para um funcionário ---
function DashboardFuncionario({
  pedidos,
  usuarioSelecionado,
  dataInicio,
  dataFim,
}) {
  // Filtra os pedidos já na memo para performance
  const pedidosFiltrados = useMemo(
    () => aplicarFiltros(pedidos, usuarioSelecionado, dataInicio, dataFim),
    [pedidos, usuarioSelecionado, dataInicio, dataFim]
  );

  // Cálculos de KPIs
  const totalPedidos = pedidosFiltrados.length;
  const totalAprovados = pedidosFiltrados.filter(
    (p) => p.status === "pedido aceito"
  ).length;
  const totalRecusados = pedidosFiltrados.filter(
    (p) => p.status === "pedido recusado"
  ).length;

  const pontuacaoTotal = pedidosFiltrados.reduce((acc, p) => {
    if (p.status === "pedido aceito") return acc + Number(p.pontuacao || 0);
    return acc;
  }, 0);

  // Proporção status para gráfico de pizza
  const statusCount = { aceito: 0, recusado: 0, analise: 0 };
  pedidosFiltrados.forEach((p) => {
    if (p.status === "pedido aceito") statusCount.aceito++;
    else if (p.status === "pedido recusado") statusCount.recusado++;
    else statusCount.analise++;
  });

  const proporcaoStatus = {
    labels: ["Aprovados", "Recusados", "Em Análise"],
    datasets: [
      {
        data: [statusCount.aceito, statusCount.recusado, statusCount.analise],
        backgroundColor: ["#22c55e", "#dc2626", "#2563eb"],
        hoverOffset: 20,
      },
    ],
  };

  // Evolução de pedidos (contagem diária)
  const evolucaoMap = {};
  pedidosFiltrados.forEach((p) => {
    const d = p.data?.toDate ? p.data.toDate() : new Date();
    const key = d.toISOString().slice(0, 10); // yyyy-mm-dd
    evolucaoMap[key] = (evolucaoMap[key] || 0) + 1;
  });

  const evolucaoPedidos = {
    labels: Object.keys(evolucaoMap).sort(),
    datasets: [
      {
        label: "Pedidos Enviados",
        data: Object.keys(evolucaoMap)
          .sort()
          .map((k) => evolucaoMap[k]),
        fill: false,
        borderColor: "#6366f1",
        backgroundColor: "#6366f1",
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  // Radar: Distribuição pontuação por regra (nomeRegra)
  const pontuacaoPorRegra = {};
  pedidosFiltrados.forEach((p) => {
    if (p.status === "pedido aceito") {
      pontuacaoPorRegra[p.nomeRegra] =
        (pontuacaoPorRegra[p.nomeRegra] || 0) + Number(p.pontuacao || 0);
    }
  });

  // Ordena as regras por pontuação (top 7)
  const sortedRegras = Object.entries(pontuacaoPorRegra)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7);

  const radarData = {
    labels: sortedRegras.map(([nome]) => nome),
    datasets: [
      {
        label: "Pontuação por Regra",
        data: sortedRegras.map(([, pts]) => pts),
        fill: true,
        backgroundColor: "rgba(99, 102, 241, 0.3)",
        borderColor: "#6366f1",
        pointBackgroundColor: "#6366f1",
        pointHoverRadius: 8,
        pointRadius: 5,
      },
    ],
  };

  // Últimos pedidos (8 mais recentes)
  const ultimosPedidos = [...pedidosFiltrados]
    .sort((a, b) => (b.data?.seconds || 0) - (a.data?.seconds || 0))
    .slice(0, 8);

  return (
    <>
      <section
        aria-label={`Resumo do funcionário ${usuarioSelecionado}`}
        style={{
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <KpiCard
          icon={IconMap.pedidos}
          title="Pedidos no período"
          value={totalPedidos}
          color="#4f46e5"
        />
        <KpiCard
          icon={IconMap.aprovados}
          title="Pedidos Aprovados"
          value={totalAprovados}
          color="#22c55e"
        />
        <KpiCard
          icon={IconMap.recusados}
          title="Pedidos Recusados"
          value={totalRecusados}
          color="#dc2626"
        />
        <KpiCard
          icon={IconMap.pontuacao}
          title="Pontuação Total"
          value={pontuacaoTotal}
          color="#f59e0b"
        />
      </section>

      <section
        aria-label="Gráficos de análise"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 32,
          justifyContent: "space-between",
          marginBottom: 32,
        }}
      >
        {/* Gráfico de pizza: Status */}
        <article
          style={{
            flex: "1 1 320px",
            background: "white",
            borderRadius: 12,
            padding: 24,
            boxShadow: "0 1px 5px rgb(0 0 0 / 0.1)",
            minWidth: 320,
          }}
          aria-label="Proporção de status dos pedidos"
        >
          <h3 style={{ color: "#4338ca", marginBottom: 12 }}>
            Proporção de Status
          </h3>
          <Pie data={proporcaoStatus} />
        </article>

        {/* Gráfico de linha: Evolução */}
        <article
          style={{
            flex: "2 1 600px",
            background: "white",
            borderRadius: 12,
            padding: 24,
            boxShadow: "0 1px 5px rgb(0 0 0 / 0.1)",
            minWidth: 320,
          }}
          aria-label="Evolução de pedidos ao longo do tempo"
        >
          <h3 style={{ color: "#4338ca", marginBottom: 12 }}>Evolução de Pedidos</h3>
          <Line data={evolucaoPedidos} />
        </article>

        {/* Gráfico radar: Pontuação por regra */}
        <article
          style={{
            flex: "1 1 320px",
            background: "white",
            borderRadius: 12,
            padding: 24,
            boxShadow: "0 1px 5px rgb(0 0 0 / 0.1)",
            minWidth: 320,
          }}
          aria-label="Distribuição da pontuação por regra"
        >
          <h3 style={{ color: "#4338ca", marginBottom: 12 }}>
            Pontuação por Regra (Top 7)
          </h3>
          {radarData.labels.length > 0 ? (
            <Radar data={radarData} />
          ) : (
            <p style={{ color: "#64748b" }}>Sem dados suficientes para exibir</p>
          )}
        </article>
      </section>

      {/* Últimos pedidos */}
      <section
        aria-label="Últimos pedidos enviados"
        style={{
          background: "white",
          borderRadius: 12,
          boxShadow: "0 1px 5px rgb(0 0 0 / 0.1)",
          padding: 24,
          marginBottom: 24,
        }}
      >
        <h3 style={{ color: "#4338ca", marginBottom: 12 }}>Últimos Pedidos</h3>
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 14,
              color: "#334155",
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: "#e0e7ff",
                  textAlign: "left",
                  borderBottom: "2px solid #c7d2fe",
                }}
              >
                <th style={{ padding: "0.75rem" }}>Checklist</th>
                <th style={{ padding: "0.75rem" }}>Pontuação</th>
                <th style={{ padding: "0.75rem" }}>Status</th>
                <th style={{ padding: "0.75rem" }}>Data</th>
              </tr>
            </thead>
            <tbody>
              {ultimosPedidos.length > 0 ? (
                ultimosPedidos.map((p) => (
                  <tr
                    key={p.id}
                    style={{
                      borderBottom: "1px solid #e2e8f0",
                      backgroundColor: "#f9fafb",
                    }}
                  >
                    <td style={{ padding: "0.75rem" }}>{p.nomeRegra}</td>
                    <td style={{ padding: "0.75rem" }}>{p.pontuacao}</td>
                    <td
                      style={{
                        padding: "0.75rem",
                        fontWeight: "600",
                        color: statusColorMap[p.status] || "#64748b",
                        textTransform: "capitalize",
                      }}
                    >
                      {statusLabels[p.status] || p.status}
                    </td>
                    <td style={{ padding: "0.75rem" }}>
                      {formatDateTime(p.data)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: 16 }}>
                    Nenhum pedido encontrado para o filtro atual.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

// --- Componente principal ---
export function DashboardGestorProfissional() {
  const [pedidos, setPedidos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  // filtros
  const [dataInicio, setDataInicio] = useState(null);
  const [dataFim, setDataFim] = useState(null);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState("");

  // Dados para dashboard geral (quando não seleciona funcionário)
  const pedidosFiltradosGeral = useMemo(
    () => aplicarFiltros(pedidos, "", dataInicio, dataFim),
    [pedidos, dataInicio, dataFim]
  );

  // KPIs gerais
  const totalPedidosGeral = pedidosFiltradosGeral.length;
  const totalAprovadosGeral = pedidosFiltradosGeral.filter(
    (p) => p.status === "pedido aceito"
  ).length;
  const totalRecusadosGeral = pedidosFiltradosGeral.filter(
    (p) => p.status === "pedido recusado"
  ).length;
  const pontuacaoTotalGeral = pedidosFiltradosGeral.reduce((acc, p) => {
    if (p.status === "pedido aceito") return acc + Number(p.pontuacao || 0);
    return acc;
  }, 0);

  // Pontuação por funcionário (bar chart)
  const pontuacaoPorFuncionario = {};
  pedidosFiltradosGeral.forEach((p) => {
    if (p.status === "pedido aceito") {
      pontuacaoPorFuncionario[p.nomeUsuario] =
        (pontuacaoPorFuncionario[p.nomeUsuario] || 0) + Number(p.pontuacao || 0);
    }
  });
  const barChartData = {
    labels: Object.keys(pontuacaoPorFuncionario),
    datasets: [
      {
        label: "Pontuação",
        data: Object.values(pontuacaoPorFuncionario),
        backgroundColor: "#6366f1",
      },
    ],
  };

  // Status proporção geral
  const statusCountGeral = { aceito: 0, recusado: 0, analise: 0 };
  pedidosFiltradosGeral.forEach((p) => {
    if (p.status === "pedido aceito") statusCountGeral.aceito++;
    else if (p.status === "pedido recusado") statusCountGeral.recusado++;
    else statusCountGeral.analise++;
  });

  const proporcaoStatusGeral = {
    labels: ["Aprovados", "Recusados", "Em Análise"],
    datasets: [
      {
        data: [
          statusCountGeral.aceito,
          statusCountGeral.recusado,
          statusCountGeral.analise,
        ],
        backgroundColor: ["#22c55e", "#dc2626", "#2563eb"],
        hoverOffset: 20,
      },
    ],
  };

  // Evolução de pedidos geral (contagem diária)
  const evolucaoMapGeral = {};
  pedidosFiltradosGeral.forEach((p) => {
    const d = p.data?.toDate ? p.data.toDate() : new Date();
    const key = d.toISOString().slice(0, 10);
    evolucaoMapGeral[key] = (evolucaoMapGeral[key] || 0) + 1;
  });
  const evolucaoPedidosGeral = {
    labels: Object.keys(evolucaoMapGeral).sort(),
    datasets: [
      {
        label: "Pedidos Enviados",
        data: Object.keys(evolucaoMapGeral)
          .sort()
          .map((k) => evolucaoMapGeral[k]),
        fill: false,
        borderColor: "#6366f1",
        backgroundColor: "#6366f1",
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  // Últimos pedidos geral
  const ultimosPedidosGeral = [...pedidosFiltradosGeral]
    .sort((a, b) => (b.data?.seconds || 0) - (a.data?.seconds || 0))
    .slice(0, 8);

  // Reset filtros
  const resetFiltros = () => {
    setDataInicio(null);
    setDataFim(null);
    setUsuarioSelecionado("");
  };

  // Dados de loading e fetch
  useEffect(() => {
    async function fetchDados() {
      setLoading(true);
      try {
        const pedidosSnap = await getDocs(collection(db, "pedidos_de_validacao"));
        const usuariosSnap = await getDocs(collection(db, "usuarios"));
        const pedidosData = pedidosSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        const usuariosData = usuariosSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPedidos(pedidosData);
        setUsuarios(usuariosData);
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDados();
  }, []);

  // Novo: Encontrar usuário com mais pontos
  const usuarioMaisPontos = useMemo(() => {
    if (!pedidosFiltradosGeral.length) return null;
    // Soma pontos por usuário
    const pontosPorUsuario = {};
    pedidosFiltradosGeral.forEach((p) => {
      if (p.status === "pedido aceito") {
        pontosPorUsuario[p.nomeUsuario] =
          (pontosPorUsuario[p.nomeUsuario] || 0) + Number(p.pontuacao || 0);
      }
    });
    // Encontra o usuário com mais pontos
    let maxUsuario = null;
    let maxPontos = -Infinity;
    Object.entries(pontosPorUsuario).forEach(([nome, pontos]) => {
      if (pontos > maxPontos) {
        maxUsuario = nome;
        maxPontos = pontos;
      }
    });
    if (!maxUsuario) return null;
    return { nome: maxUsuario, pontos: maxPontos };
  }, [pedidosFiltradosGeral]);

  return (
    <main className="criarusuario-container">
      <div className="dashboard-title">
        <FaChartBar />
        <h1 style={{ margin: 0 }}>Dashboard de Análise de Funcionário</h1>
      </div>

      <FilterSection
        dataInicio={dataInicio}
        dataFim={dataFim}
        setDataInicio={setDataInicio}
        setDataFim={setDataFim}
        usuarios={usuarios}
        usuarioSelecionado={usuarioSelecionado}
        setUsuarioSelecionado={setUsuarioSelecionado}
        onReset={resetFiltros}
      />

      {loading ? (
        <p style={{ textAlign: "center", color: "#64748b", fontSize: 18 }}>
          Carregando dados...
        </p>
      ) : usuarioSelecionado ? (
        <DashboardFuncionario
          pedidos={pedidos}
          usuarioSelecionado={usuarioSelecionado}
          dataInicio={dataInicio}
          dataFim={dataFim}
        />
      ) : (
        <>
          {/* KPIs gerais */}
          <section className="dashboard-kpis" aria-label="Resumo geral dos pedidos">
            <KpiCard icon={IconMap.pedidos} title="Pedidos no período" value={totalPedidosGeral} color="#4f46e5" />
            <KpiCard icon={IconMap.aprovados} title="Pedidos Aprovados" value={totalAprovadosGeral} color="#22c55e" />
            <KpiCard icon={IconMap.recusados} title="Pedidos Recusados" value={totalRecusadosGeral} color="#dc2626" />
            <KpiCard icon={IconMap.pontuacao} title="Pontuação Total" value={pontuacaoTotalGeral} color="#f59e0b" />
            {/* Novo KPI: Usuário com mais pontos */}
            {usuarioMaisPontos && (
              <KpiCard
                icon={IconMap.funcionario}
                title="Usuário com mais pontos"
                value={`${usuarioMaisPontos.nome} (${usuarioMaisPontos.pontos})`}
                color="#a21caf"
              />
            )}
          </section>

          {/* Gráficos gerais */}
          <section className="dashboard-charts" aria-label="Gráficos gerais">
            <article aria-label="Pontuação por funcionário">
              <h3 style={{ color: "#4338ca", marginBottom: 12 }}>Pontuação por Funcionário</h3>
              {barChartData.labels.length > 0 ? (
                <Bar
                  data={barChartData}
                  options={{
                    plugins: {
                      legend: { display: false },
                      tooltip: { mode: "index", intersect: false },
                    },
                    responsive: true,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1 },
                      },
                    },
                  }}
                />
              ) : (
                <p style={{ color: "#64748b" }}>Nenhum dado disponível para exibir.</p>
              )}
            </article>
            <article aria-label="Proporção de status dos pedidos">
              <h3 style={{ color: "#4338ca", marginBottom: 12 }}>Proporção de Status</h3>
              <Pie data={proporcaoStatusGeral} />
            </article>
            <article aria-label="Evolução de pedidos ao longo do tempo">
              <h3 style={{ color: "#4338ca", marginBottom: 12 }}>Evolução de Pedidos</h3>
              <Line data={evolucaoPedidosGeral} />
            </article>
          </section>

          {/* Últimos pedidos gerais */}
          <section className="dashboard-section" aria-label="Últimos pedidos enviados">
            <h3 className="dashboard-title" style={{ color: "#4338ca", marginBottom: 12 }}>
              Últimos Pedidos
            </h3>
            <div className="dashboard-table-wrapper">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Funcionário</th>
                    <th>Checklist</th>
                    <th>Pontuação</th>
                    <th>Status</th>
                    <th>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {ultimosPedidosGeral.length > 0 ? (
                    ultimosPedidosGeral.map((p) => (
                      <tr key={p.id}>
                        <td>{p.nomeUsuario}</td>
                        <td>{p.nomeRegra}</td>
                        <td>{p.pontuacao}</td>
                        <td style={{
                          fontWeight: "600",
                          color: statusColorMap[p.status] || "#64748b",
                          textTransform: "capitalize",
                        }}>
                          {statusLabels[p.status] || p.status}
                        </td>
                        <td>{formatDateTime(p.data)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center", padding: 16 }}>
                        Nenhum pedido encontrado para o filtro atual.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </main>
  );
}

export default DashboardGestorProfissional;

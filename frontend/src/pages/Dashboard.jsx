import { useState, useEffect } from "react";
import useAuth from "../hooks/useAuth.js";
import api from "../services/api.js";

const StatCard = ({ icon, label, value, color = "#1a365d" }) => (
  <div style={{
    background: "#fff",
    borderRadius: 16,
    padding: "24px 28px",
    boxShadow: "0 2px 16px rgba(26,54,93,0.07)",
    display: "flex",
    alignItems: "center",
    gap: 18,
    flex: 1,
    minWidth: 180,
  }}>
    <div style={{
      width: 52, height: 52,
      borderRadius: 14,
      background: `${color}18`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 26,
    }}>
      {icon}
    </div>
    <div>
      <p style={{ margin: 0, fontSize: 13, color: "#a0aec0", fontWeight: 500 }}>{label}</p>
      <p style={{ margin: "4px 0 0", fontSize: 28, fontWeight: 800, color, letterSpacing: "-0.02em" }}>
        {value ?? "—"}
      </p>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({ students: 0, teachers: 0, classes: 0, enrollments: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [sRes, uRes, cRes, eRes] = await Promise.all([
          api.get("/students", { params: { limit: 1 } }),
          api.get("/users",    { params: { limit: 1, role: "TEACHER" } }),
          api.get("/classes",  { params: { limit: 1 } }),
          api.get("/enrollments", { params: { limit: 1 } }),
        ]);
        if (!cancelled) {
          setStats({
            students:    sRes.data.total ?? 0,
            teachers:    uRes.data.total ?? 0,
            classes:     cRes.data.total ?? 0,
            enrollments: eRes.data.total ?? 0,
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 32 }}>
        <StatCard icon="🎓" label="Total de Alunos"    value={loading ? "..." : stats.students}    color="#1a365d" />
        <StatCard icon="👨‍🏫" label="Professores"        value={loading ? "..." : stats.teachers}    color="#2b6cb0" />
        <StatCard icon="📚" label="Turmas"              value={loading ? "..." : stats.classes}     color="#6b46c1" />
        <StatCard icon="📋" label="Matrículas"          value={loading ? "..." : stats.enrollments} color="#276749" />
      </div>

      <div style={{ background: "#fff", borderRadius: 16, padding: "24px 28px", boxShadow: "0 2px 16px rgba(26,54,93,0.07)" }}>
        <h2 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 700, color: "#1a365d" }}>Acesso Rápido</h2>
        <p style={{ margin: 0, color: "#718096", fontSize: 14 }}>Use o menu lateral para gerenciar usuários, turmas e matrículas.</p>
      </div>
    </>
  );
};

const TeacherDashboard = ({ user }) => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const { data } = await api.get("/classes", { params: { limit: 50 } });
        if (!cancelled) setClasses(data.classes ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <>
      <div style={{ background: "#fff", borderRadius: 16, padding: "24px 28px", marginBottom: 24, boxShadow: "0 2px 16px rgba(26,54,93,0.07)" }}>
        <p style={{ margin: 0, fontSize: 14, color: "#718096" }}>Bem-vindo de volta,</p>
        <h2 style={{ margin: "4px 0 0", fontSize: 22, fontWeight: 800, color: "#1a365d" }}>{user?.name} 👋</h2>
      </div>

      <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "#2d3748" }}>Suas Turmas</h3>

      {loading ? (
        <p style={{ color: "#a0aec0" }}>Carregando turmas...</p>
      ) : classes.length === 0 ? (
        <p style={{ color: "#a0aec0" }}>Nenhuma turma encontrada.</p>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
          {classes.map((c) => (
            <div key={c.id} style={{
              background: "#fff",
              borderRadius: 14,
              padding: "20px 24px",
              boxShadow: "0 2px 16px rgba(26,54,93,0.07)",
              minWidth: 200,
              borderLeft: "4px solid #1a365d",
            }}>
              <p style={{ margin: 0, fontWeight: 700, color: "#1a365d", fontSize: 15 }}>{c.name}</p>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "#718096" }}>{c.subject}</p>
              <p style={{ margin: "8px 0 0", fontSize: 12, color: "#a0aec0" }}>
                {c.enrollmentCount ?? 0} aluno(s)
              </p>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

const StudentDashboard = ({ user }) => {
  const [grades, setGrades]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const { data } = await api.get("/grades", { params: { limit: 50 } });
        if (!cancelled) setGrades(data.grades ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const STATUS_STYLE = {
    Aprovado:     { bg: "#c6f6d5", color: "#276749" },
    Recuperação:  { bg: "#fefcbf", color: "#744210" },
    Reprovado:    { bg: "#fed7d7", color: "#9b2c2c" },
  };

  return (
    <>
      <div style={{ background: "#fff", borderRadius: 16, padding: "24px 28px", marginBottom: 24, boxShadow: "0 2px 16px rgba(26,54,93,0.07)" }}>
        <p style={{ margin: 0, fontSize: 14, color: "#718096" }}>Bem-vindo,</p>
        <h2 style={{ margin: "4px 0 0", fontSize: 22, fontWeight: 800, color: "#1a365d" }}>{user?.name} 🎵</h2>
      </div>

      <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "#2d3748" }}>Suas Notas</h3>

      {loading ? (
        <p style={{ color: "#a0aec0" }}>Carregando notas...</p>
      ) : grades.length === 0 ? (
        <p style={{ color: "#a0aec0" }}>Nenhuma nota lançada ainda.</p>
      ) : (
        <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 16px rgba(26,54,93,0.07)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'DM Sans', sans-serif" }}>
            <thead>
              <tr style={{ background: "#1a365d" }}>
                {["Matéria", "Professor", "Período", "Nota", "Status"].map((h) => (
                  <th key={h} style={{ padding: "12px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#90cdf4", letterSpacing: "0.08em", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grades.map((g, i) => {
                const s = STATUS_STYLE[g.status] ?? STATUS_STYLE.Reprovado;
                return (
                  <tr key={g.id} style={{ background: i % 2 === 0 ? "#fff" : "#f7f9fc", borderBottom: "1px solid #edf2f7" }}>
                    <td style={{ padding: "13px 20px", fontSize: 14, color: "#2d3748", fontWeight: 600 }}>{g.class?.name ?? "—"}</td>
                    <td style={{ padding: "13px 20px", fontSize: 14, color: "#2d3748" }}>{g.teacher?.name ?? "—"}</td>
                    <td style={{ padding: "13px 20px", fontSize: 14, color: "#718096" }}>{g.period}</td>
                    <td style={{ padding: "13px 20px", fontSize: 16, fontWeight: 800, color: "#1a365d" }}>{g.formattedValue}</td>
                    <td style={{ padding: "13px 20px" }}>
                      <span style={{ background: s.bg, color: s.color, borderRadius: 20, padding: "3px 11px", fontSize: 12, fontWeight: 700 }}>
                        {g.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const role = user?.role?.toUpperCase();

  return (
    <div style={pageStyle}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={h1Style}>Dashboard</h1>
        <p style={{ margin: 0, color: "#718096", fontSize: 14 }}>
          {role === "ADMIN"   && "Visão geral da plataforma."}
          {role === "TEACHER" && "Suas turmas e atividades."}
          {role === "STUDENT" && "Seu desempenho acadêmico."}
        </p>
      </div>

      {role === "ADMIN"   && <AdminDashboard />}
      {role === "TEACHER" && <TeacherDashboard user={user} />}
      {role === "STUDENT" && <StudentDashboard user={user} />}
    </div>
  );
};

const pageStyle = { padding: "32px 40px", fontFamily: "'DM Sans', 'Segoe UI', sans-serif", maxWidth: 1100, margin: "0 auto" };
const h1Style   = { margin: 0, fontSize: 26, fontWeight: 800, color: "#1a365d", letterSpacing: "-0.02em" };

export default Dashboard;
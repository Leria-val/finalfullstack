import { useState, useEffect } from "react";
import useAuth from "../hooks/useAuth.js";
import api from "../services/api.js";

/* ── StatCard ──────────────────────────────────────────────────── */
const StatCard = ({ icon, label, value }) => (
  <div className="stat-card">
    <div className="stat-icon-wrapper" aria-hidden="true">
      {icon}
    </div>
    <div>
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value ?? "—"}</p>
    </div>
  </div>
);

/* ── AdminDashboard ────────────────────────────────────────────── */
const AdminDashboard = () => {
  const [stats, setStats] = useState({ students: 0, teachers: 0, classes: 0, enrollments: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [sRes, uRes, cRes, eRes] = await Promise.all([
          api.get("/students",    { params: { limit: 1 } }),
          api.get("/users",       { params: { limit: 1, role: "TEACHER" } }),
          api.get("/classes",     { params: { limit: 1 } }),
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

  const v = (n) => (loading ? "..." : n);

  return (
    <>
      <div className="stat-grid">
        <StatCard icon="🎓" label="Total de Alunos" value={v(stats.students)} />
        <StatCard icon="👨‍🏫" label="Professores"      value={v(stats.teachers)} />
        <StatCard icon="📚" label="Turmas"            value={v(stats.classes)} />
        <StatCard icon="📋" label="Matrículas"        value={v(stats.enrollments)} />
      </div>

      <div className="panel">
        <h2 className="panel-title">Acesso Rápido</h2>
        <p className="panel-text">Use o menu lateral para gerenciar usuários, turmas e matrículas.</p>
      </div>
    </>
  );
};

/* ── TeacherDashboard ──────────────────────────────────────────── */
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
      <div className="welcome-panel">
        <p className="welcome-greeting">Bem-vindo de volta,</p>
        <h2 className="welcome-name">{user?.name} 👋</h2>
      </div>

      <h3 className="section-heading">Suas Turmas</h3>

      {loading ? (
        <p className="loading-text">Carregando turmas...</p>
      ) : classes.length === 0 ? (
        <p className="empty-state">Nenhuma turma encontrada.</p>
      ) : (
        <div className="class-grid">
          {classes.map((c) => (
            <div key={c.id} className="class-card">
              <p className="class-card-name">{c.name}</p>
              <p className="class-card-subject">{c.subject}</p>
              <p className="class-card-count">{c.enrollmentCount ?? 0} aluno(s)</p>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

/* ── StudentDashboard ──────────────────────────────────────────── */
const BADGE_CLASS = {
  aprovado:    "badge badge--approved",
  recuperação: "badge badge--recovery",
  reprovado:   "badge badge--failed",
};

const getBadgeClass = (status) =>
  BADGE_CLASS[status?.toLowerCase()] ?? "badge badge--approved";

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

  return (
    <>
      <div className="welcome-panel">
        <p className="welcome-greeting">Bem-vindo,</p>
        <h2 className="welcome-name">{user?.name} 🎵</h2>
      </div>

      <h3 className="section-heading">Suas Notas</h3>

      {loading ? (
        <p className="loading-text">Carregando notas...</p>
      ) : grades.length === 0 ? (
        <p className="empty-state">Nenhuma nota lançada ainda.</p>
      ) : (
        <div className="grades-table-wrapper">
          <table className="grades-table">
            <thead>
              <tr>
                {["Matéria", "Professor", "Período", "Nota", "Status"].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grades.map((g) => (
                <tr key={g.id}>
                  <td className="td-bold">{g.class?.name ?? "—"}</td>
                  <td>{g.teacher?.name ?? "—"}</td>
                  <td>{g.period}</td>
                  <td className="td-grade">{g.formattedValue}</td>
                  <td>
                    <span className={getBadgeClass(g.status)}>
                      {g.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

/* ── Dashboard (root) ──────────────────────────────────────────── */
const SUBTITLE = {
  ADMIN:   "Visão geral da plataforma.",
  TEACHER: "Suas turmas e atividades.",
  STUDENT: "Seu desempenho acadêmico.",
};

const Dashboard = () => {
  const { user } = useAuth();
  const role = user?.role?.toUpperCase();

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">{SUBTITLE[role] ?? ""}</p>
      </div>

      {role === "ADMIN"   && <AdminDashboard />}
      {role === "TEACHER" && <TeacherDashboard user={user} />}
      {role === "STUDENT" && <StudentDashboard user={user} />}
    </div>
  );
};

export default Dashboard;
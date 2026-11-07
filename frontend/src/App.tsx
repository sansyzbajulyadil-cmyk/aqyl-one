import { useState, useEffect } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  BookOpen,
  BrainCircuit,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  LayoutDashboard,
  Lightbulb,
  LogOut,
  Menu,
  MessageCircle,
  MoreHorizontal,
  Send,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  X,
  Zap,
} from "lucide-react";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"
).replace(/\/$/, "");

type Page = "dashboard" | "knowledge" | "tutor" | "planner" | "progress";

const topics = [
  { name: "Множества", value: 92, status: "Освоено", color: "blue" },
  { name: "Математическая логика", value: 78, status: "Хорошо", color: "blue" },
  { name: "Бинарные отношения", value: 61, status: "В процессе", color: "cyan" },
  { name: "Функции", value: 43, status: "Нужно повторить", color: "orange" },
  { name: "Композиция функций", value: 27, status: "Слабая тема", color: "red" },
  { name: "Булева алгебра", value: 69, status: "В процессе", color: "cyan" },
];

const initialTasks = [
  { id: 1, time: "09:00", title: "Повторить бинарные отношения", detail: "Дискретная математика · 15 минут", done: true },
  { id: 2, time: "16:00", title: "Композиция функций с AQYL", detail: "AI Tutor · 25 минут", done: false },
  { id: 3, time: "18:30", title: "Решить практические задачи", detail: "Дискретная математика · 20 минут", done: false },
  { id: 4, time: "20:00", title: "Короткий тест по функциям", detail: "Проверка знаний · 10 минут", done: false },
];

const navItems: { id: Page; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Главная", icon: LayoutDashboard },
  { id: "knowledge", label: "Карта знаний", icon: BrainCircuit },
  { id: "tutor", label: "AI Tutor", icon: MessageCircle },
  { id: "planner", label: "Учебный план", icon: CalendarDays },
  { id: "progress", label: "Мой прогресс", icon: TrendingUp },
];

interface ChatMessage {
  role: string;
  content: string;
}

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem("aqyl_token"));
  const [userEmail, setUserEmail] = useState<string>(localStorage.getItem("aqyl_user_email") || "demo@aqyl.one");
  
  // Auth Form State
  const [isRegistering, setIsRegistering] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // App State
  const [page, setPage] = useState<Page>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tasks, setTasks] = useState(initialTasks);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Привет! Я AQYL — твой персональный учебный наставник на базе Gemini. Чем могу помочь тебе по дискретной математике сегодня?",
    },
  ]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("Дискретная математика");
  const [showNotifications, setShowNotifications] = useState(false);

  const completedTasks = tasks.filter((task) => task.done).length;

  const pageTitles: Record<Page, string> = {
    dashboard: "Главная",
    knowledge: "Карта знаний",
    tutor: "AI Tutor",
    planner: "Учебный план",
    progress: "Мой прогресс",
  };

  useEffect(() => {
    async function fetchChatHistory() {
      if (!token) return;
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/chat/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const history: ChatMessage[] = await response.json();
          if (history && history.length > 0) {
            setMessages(history.map((m) => ({ role: m.role, text: m.content })));
          }
        }
      } catch (e) {
        console.error("Ошибка загрузки истории сообщений:", e);
      }
    }

    fetchChatHistory();
  }, [token]);

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    try {
      if (isRegistering) {
        const regRes = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: emailInput, password: passwordInput }),
        });

        if (!regRes.ok) {
          const errData = await regRes.json();
          let errorMessage = "Ошибка регистрации";
          if (typeof errData.detail === "string") {
            errorMessage = errData.detail;
          } else if (Array.isArray(errData.detail)) {
            errorMessage = errData.detail.map((d: unknown) => (d as { msg?: string }).msg || "").join(", ");
          }
          throw new Error(errorMessage);
        }
      }

      let loginRes = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          username: emailInput,
          password: passwordInput,
        }),
      });

      if (loginRes.status === 422) {
        loginRes = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: emailInput, password: passwordInput }),
        });
      }

      if (!loginRes.ok) {
        const errData = await loginRes.json();
        let errorMessage = "Неверный email или пароль";
        if (typeof errData.detail === "string") {
          errorMessage = errData.detail;
        } else if (Array.isArray(errData.detail)) {
          errorMessage = errData.detail.map((d: unknown) => (d as { msg?: string }).msg || "").join(", ");
        }
        throw new Error(errorMessage);
      }

      const data = await loginRes.json();
      const accessToken = data.access_token || data.token;

      if (!accessToken) {
        throw new Error("Токен авторизации не получен от сервера");
      }

      localStorage.setItem("aqyl_token", accessToken);
      localStorage.setItem("aqyl_user_email", emailInput);
      setToken(accessToken);
      setUserEmail(emailInput);
      setIsRegistering(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setAuthError(err.message);
      } else {
        setAuthError(String(err));
      }
    } finally {
      setAuthLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("aqyl_token");
    localStorage.removeItem("aqyl_user_email");
    setToken(null);
  }

  function navigate(nextPage: Page) {
    setPage(nextPage);
    setSidebarOpen(false);
  }

  function toggleTask(id: number) {
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task
      )
    );
  }

  async function sendMessage() {
    const value = message.trim();
    if (!value || isLoading || !token) return;

    setMessages((current) => [...current, { role: "user", text: value }]);
    setMessage("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/chat/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: value }),
      });

      if (response.status === 401) {
        handleLogout();
        throw new Error("Сессия истекла. Авторизуйтесь снова.");
      }

      if (!response.ok) {
        throw new Error("Ошибка бэкенда");
      }

      const data = await response.json();
      setMessages((current) => [
        ...current,
        { role: "assistant", text: data.content },
      ]);
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : "Ошибка связи с Gemini.";
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: `⚠️ ${errorMsg}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  if (!token) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0b0f17",
        color: "#ffffff",
        fontFamily: "sans-serif"
      }}>
        <div style={{
          width: "100%",
          maxWidth: "400px",
          padding: "32px",
          borderRadius: "16px",
          backgroundColor: "#161b26",
          border: "1px solid #232a3b",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)"
        }}>
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <div style={{ display: "inline-flex", padding: "12px", borderRadius: "12px", backgroundColor: "#2563eb", marginBottom: "12px" }}>
              <BrainCircuit size={32} />
            </div>
            <h2 style={{ margin: "8px 0 4px", fontSize: "24px" }}>AQYL ONE</h2>
            <p style={{ margin: 0, color: "#8b949e", fontSize: "14px" }}>
              {isRegistering ? "Создание учетной записи" : "Войдите для доступа к платформе"}
            </p>
          </div>

          {authError && (
            <div style={{
              padding: "12px",
              borderRadius: "8px",
              backgroundColor: "rgba(239, 68, 68, 0.15)",
              border: "1px solid #ef4444",
              color: "#f87171",
              fontSize: "14px",
              marginBottom: "16px"
            }}>
              {authError}
            </div>
          )}

          <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", color: "#8b949e", marginBottom: "6px" }}>Email</label>
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="demo@aqyl.one"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #2d3748",
                  backgroundColor: "#0d1117",
                  color: "#fff",
                  boxSizing: "border-box"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", color: "#8b949e", marginBottom: "6px" }}>Пароль</label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #2d3748",
                  backgroundColor: "#0d1117",
                  color: "#fff",
                  boxSizing: "border-box"
                }}
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                backgroundColor: "#2563eb",
                color: "#fff",
                border: "none",
                fontWeight: 600,
                cursor: "pointer",
                marginTop: "8px"
              }}
            >
              {authLoading ? "Загрузка..." : isRegistering ? "Зарегистрироваться" : "Войти"}
            </button>
          </form>

          <div style={{ marginTop: "20px", textAlign: "center", fontSize: "14px", color: "#8b949e" }}>
            {isRegistering ? "Уже есть аккаунт?" : "Нет аккаунта?"}{" "}
            <button
              onClick={() => { setIsRegistering(!isRegistering); setAuthError(""); }}
              style={{ background: "none", border: "none", color: "#60a5fa", cursor: "pointer", fontWeight: 600 }}
            >
              {isRegistering ? "Войти" : "Зарегистрироваться"}
            </button>
          </div>
          
          <div style={{ marginTop: "16px", padding: "10px", backgroundColor: "#0d1117", borderRadius: "8px", fontSize: "12px", color: "#6e7681", textAlign: "center" }}>
            Демо аккаунт: <b>demo@aqyl.one</b> / пароль: <b>AqylDemo2026!</b>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      {sidebarOpen && (
        <button
          className="mobile-overlay"
          aria-label="Закрыть меню"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-symbol"><BrainCircuit size={23} /></div>
          <div>
            <div className="brand-name">aqyl<span>one</span></div>
            <div className="brand-caption">LEARNING INTELLIGENCE</div>
          </div>
          <button className="icon-button sidebar-close" onClick={() => setSidebarOpen(false)}>
            <X size={19} />
          </button>
        </div>

        <div className="workspace-label">WORKSPACE</div>

        <nav className="navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`nav-item ${page === item.id ? "nav-active" : ""}`}
              >
                <Icon size={19} strokeWidth={1.8} />
                <span>{item.label}</span>
                {item.id === "tutor" && <span className="nav-ai-dot" />}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-divider" />

        <div className="workspace-label">МОЁ ОБУЧЕНИЕ</div>
        <div className="subject-mini">
          <div className="subject-mini-icon"><BookOpen size={17} /></div>
          <div className="subject-mini-text">
            <strong>Дискретная математика</strong>
            <span>6 учебных тем</span>
          </div>
          <ChevronRight size={15} className="muted-icon" />
        </div>

        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <div className="tip-icon"><Sparkles size={17} /></div>
            <strong>Маленькие шаги — большой прогресс.</strong>
            <span>Продолжай учиться каждый день.</span>
          </div>
          <button className="profile-row" onClick={handleLogout} title="Нажмите, чтобы выйти">
            <div className="avatar">{userEmail[0].toUpperCase()}</div>
            <div className="profile-info">
              <strong style={{ fontSize: "13px" }}>{userEmail}</strong>
              <span style={{ color: "#ef4444", display: "flex", alignItems: "center", gap: "4px" }}><LogOut size={12} /> Выйти</span>
            </div>
          </button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-button mobile-menu" onClick={() => setSidebarOpen(true)}>
              <Menu size={21} />
            </button>
            <div className="breadcrumb">Workspace <ChevronRight size={14} /> <strong>{pageTitles[page]}</strong></div>
          </div>
          <div className="topbar-right">
            <div className="status-pill"><span /> Авторизован</div>
            <button className="icon-button notification-button" onClick={() => setShowNotifications(!showNotifications)}>
              <Bell size={19} />
              <i />
            </button>
            {showNotifications && (
              <div className="notification-popover">
                <strong>Уведомления</strong>
                <p>У тебя есть незавершённая учебная цель на сегодня.</p>
                <button onClick={() => { setShowNotifications(false); navigate("planner"); }}>Открыть план <ArrowRight size={14} /></button>
              </div>
            )}
            <div className="top-avatar" title={userEmail}>{userEmail[0].toUpperCase()}</div>
          </div>
        </header>

        <div className="page-content">
          {page === "dashboard" && (
            <Dashboard
              navigate={navigate}
              tasks={tasks}
              toggleTask={toggleTask}
              completedTasks={completedTasks}
              userEmail={userEmail}
            />
          )}
          {page === "knowledge" && (
            <KnowledgeMap
              selectedSubject={selectedSubject}
              setSelectedSubject={setSelectedSubject}
              navigate={navigate}
            />
          )}
          {page === "tutor" && (
            <Tutor
              messages={messages}
              message={message}
              setMessage={setMessage}
              sendMessage={sendMessage}
              isLoading={isLoading}
            />
          )}
          {page === "planner" && (
            <Planner tasks={tasks} toggleTask={toggleTask} completedTasks={completedTasks} />
          )}
          {page === "progress" && <Progress />}
        </div>

        <footer className="footer">
          <span>© 2026 AQYL ONE</span>
          <span>Твой путь к знаниям начинается здесь <Sparkles size={13} /></span>
        </footer>
      </main>
    </div>
  );
}

function SectionHeading({ eyebrow, title, description, action }: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="section-heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}

function Dashboard({ navigate, tasks, toggleTask, completedTasks, userEmail }: {
  navigate: (page: Page) => void;
  tasks: typeof initialTasks;
  toggleTask: (id: number) => void;
  completedTasks: number;
  userEmail: string;
}) {
  return (
    <>
      <SectionHeading
        eyebrow="ПЯТНИЦА, 06 НОЯБРЯ 2026"
        title={`Добрый день, ${userEmail.split("@")[0]} 👋`}
        description="Каждый день — возможность стать немного сильнее в знаниях."
        action={<button className="secondary-button" onClick={() => navigate("planner")}><CalendarDays size={16} /> Мой план</button>}
      />

      <section className="welcome-card">
        <div className="welcome-content">
          <div className="welcome-tag"><Sparkles size={14} /> YOUR PERSONAL LEARNING INTELLIGENCE</div>
          <h2>Учись осознанно.<br /><span>Расти уверенно.</span></h2>
          <p>AQYL анализирует твой прогресс, находит пробелы в знаниях и помогает выстроить персональный путь обучения.</p>
          <button className="primary-button" onClick={() => navigate("tutor")}>Продолжить с AQYL <ArrowRight size={17} /></button>
        </div>
        <div className="welcome-visual">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="orbit-core"><BrainCircuit size={52} strokeWidth={1.25} /></div>
          <div className="orbit-label orbit-label-one"><span className="pulse-dot" /> KNOWLEDGE ENGINE</div>
          <div className="orbit-label orbit-label-two">AI LEARNING SYSTEM</div>
        </div>
        <div className="welcome-glow" />
      </section>

      <div className="stats-grid">
        <StatCard icon={<Target size={19} />} label="Общий прогресс" value="68%" note="+8% за неделю" trend="up" />
        <StatCard icon={<BookOpen size={19} />} label="Изучаемые предметы" value="3" note="В активном обучении" />
        <StatCard icon={<Zap size={19} />} label="Учебная серия" value="7 дней" note="Продолжай в том же духе" trend="up" />
        <StatCard icon={<Trophy size={19} />} label="Выполнено заданий" value="24" note="За последние 30 дней" />
      </div>

      <div className="dashboard-grid">
        <section className="panel knowledge-panel">
          <div className="panel-heading">
            <div>
              <div className="eyebrow">ACADEMIC INTELLIGENCE</div>
              <h3>Карта твоих знаний</h3>
              <p>Дискретная математика</p>
            </div>
            <button className="text-button" onClick={() => navigate("knowledge")}>Подробнее <ArrowRight size={15} /></button>
          </div>
          <div className="topic-list">
            {topics.slice(0, 5).map((topic) => (
              <div className="topic-row" key={topic.name}>
                <div className="topic-meta">
                  <span>{topic.name}</span>
                  <strong>{topic.value}%</strong>
                </div>
                <div className="progress-track">
                  <div className={`progress-fill ${topic.color}`} style={{ width: `${topic.value}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="panel-bottom-note"><Lightbulb size={16} /> AQYL обнаружил 2 темы, требующие дополнительного внимания.</div>
        </section>

        <section className="panel ai-insight-panel">
          <div className="panel-heading">
            <div>
              <div className="eyebrow">AQYL INSIGHT</div>
              <h3>Рекомендация наставника</h3>
            </div>
            <div className="ai-icon"><Sparkles size={19} /></div>
          </div>
          <div className="insight-highlight">
            <span className="warning-dot" />
            <span>ЗОНА РОСТА</span>
          </div>
          <h4>Композиция функций</h4>
          <p>Текущий уровень освоения — 27%. Эта тема является основой для понимания обратных функций.</p>
          <div className="insight-action">
            <div><Clock3 size={15} /> 25 минут</div>
            <button className="primary-button small" onClick={() => navigate("tutor")}>Начать обучение <ArrowRight size={15} /></button>
          </div>
        </section>
      </div>

      <div className="dashboard-grid lower-grid">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <div className="eyebrow">DAILY ROUTINE</div>
              <h3>План на сегодня</h3>
              <p>{completedTasks} из {tasks.length} задач выполнено</p>
            </div>
            <button className="text-button" onClick={() => navigate("planner")}>Все задачи <ArrowRight size={15} /></button>
          </div>
          <div className="task-list compact">
            {tasks.slice(0, 3).map((task) => (
              <div className={`task-row ${task.done ? "task-done" : ""}`} key={task.id}>
                <button className={`task-check ${task.done ? "checked" : ""}`} onClick={() => toggleTask(task.id)}>
                  {task.done && <Check size={13} />}
                </button>
                <div className="task-time">{task.time}</div>
                <div className="task-description"><strong>{task.title}</strong><span>{task.detail}</span></div>
                {task.done && <CheckCircle2 size={17} className="task-success" />}
              </div>
            ))}
          </div>
        </section>

        <section className="panel subject-panel">
          <div className="panel-heading">
            <div>
              <div className="eyebrow">YOUR LEARNING</div>
              <h3>Активные предметы</h3>
              <p>Твой учебный фокус</p>
            </div>
            <BookOpen size={20} className="muted-icon" />
          </div>
          <div className="subject-card">
            <div className="subject-icon blue-subject"><span>∑</span></div>
            <div className="subject-details"><strong>Дискретная математика</strong><span>6 тем · 68% освоено</span></div>
            <ChevronRight size={17} className="muted-icon" />
          </div>
          <div className="subject-card">
            <div className="subject-icon purple-subject"><span>Py</span></div>
            <div className="subject-details"><strong>Программирование Python</strong><span>8 тем · 74% освоено</span></div>
            <ChevronRight size={17} className="muted-icon" />
          </div>
          <div className="subject-card">
            <div className="subject-icon cyan-subject"><span>⌘</span></div>
            <div className="subject-details"><strong>Компьютерные сети</strong><span>5 тем · 62% освоено</span></div>
            <ChevronRight size={17} className="muted-icon" />
          </div>
        </section>
      </div>
    </>
  );
}

function StatCard({ icon, label, value, note, trend }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  note: string;
  trend?: string;
}) {
  return (
    <div className="stat-card">
      <div className="stat-top"><div className="stat-icon">{icon}</div>{trend && <span className="trend"><ArrowUpRight size={14} /> Рост</span>}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-note">{note}</div>
    </div>
  );
}

function KnowledgeMap({ selectedSubject, setSelectedSubject, navigate }: {
  selectedSubject: string;
  setSelectedSubject: (value: string) => void;
  navigate: (page: Page) => void;
}) {
  return (
    <>
      <SectionHeading
        eyebrow="KNOWLEDGE INTELLIGENCE"
        title="Карта знаний"
        description="Посмотри, что ты уже освоил и какие темы требуют внимания."
        action={<div className="select-wrap"><select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}><option>Дискретная математика</option><option>Программирование Python</option><option>Компьютерные сети</option></select><ChevronDown size={15} /></div>}
      />
      <div className="knowledge-summary">
        <div className="knowledge-summary-main"><span>ТЕКУЩИЙ УРОВЕНЬ ОСВОЕНИЯ</span><strong>68<small>%</small></strong><p>На основе результатов диагностики и практических заданий</p></div>
        <div className="knowledge-summary-stat"><span className="legend-dot mastered" /> <strong>1</strong><span>Освоено</span></div>
        <div className="knowledge-summary-stat"><span className="legend-dot learning" /> <strong>3</strong><span>В процессе</span></div>
        <div className="knowledge-summary-stat"><span className="legend-dot weak" /> <strong>2</strong><span>Требуют внимания</span></div>
      </div>
      <section className="panel knowledge-full-panel">
        <div className="panel-heading"><div><div className="eyebrow">TOPIC ANALYSIS</div><h3>Уровень освоения тем</h3><p>Данные учебного профиля студента</p></div></div>
        <div className="knowledge-table">
          {topics.map((topic, index) => (
            <div className="knowledge-table-row" key={topic.name}>
              <div className="topic-index">{String(index + 1).padStart(2, "0")}</div>
              <div className="knowledge-topic-name"><strong>{topic.name}</strong><span>{topic.status}</span></div>
              <div className="knowledge-table-bar"><div className="progress-track"><div className={`progress-fill ${topic.color}`} style={{ width: `${topic.value}%` }} /></div></div>
              <strong className="knowledge-percent">{topic.value}%</strong>
              <button className="icon-button topic-action" title="Изучить тему" onClick={() => navigate("tutor")}><ArrowUpRight size={17} /></button>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function Tutor({ messages, message, setMessage, sendMessage, isLoading }: {
  messages: { role: string; text: string }[];
  message: string;
  setMessage: (value: string) => void;
  sendMessage: () => void;
  isLoading: boolean;
}) {
  return (
    <>
      <SectionHeading eyebrow="YOUR PERSONAL AI MENTOR" title="AI Tutor" description="Не просто ответы. Понимание, практика и развитие." />
      <div className="tutor-layout">
        <section className="panel tutor-main">
          <div className="tutor-header">
            <div className="tutor-avatar"><BrainCircuit size={23} /></div>
            <div><strong>AQYL</strong><span><i /> Персональный наставник</span></div>
            <div className="tutor-header-right"><span className="ai-live">GEMINI ACTIVE</span><MoreHorizontal size={20} /></div>
          </div>
          <div className="tutor-context"><div><BookOpen size={15} /> Дискретная математика</div><span>Тема: Композиция функций</span></div>
          <div className="chat-messages">
            {messages.map((item, index) => (
              <div className={`chat-message ${item.role === "user" ? "user-message" : ""}`} key={index}>
                {item.role === "assistant" && <div className="chat-avatar"><Sparkles size={15} /></div>}
                <div className="message-content">
                  <span>{item.role === "assistant" ? "AQYL" : "ТЫ"}</span>
                  <p style={{ whiteSpace: "pre-wrap" }}>{item.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="chat-message">
                <div className="chat-avatar"><Sparkles size={15} /></div>
                <div className="message-content">
                  <span>AQYL</span>
                  <p className="muted-text"><i>Печатает ответ с помощью Gemini...</i></p>
                </div>
              </div>
            )}
          </div>
          <div className="suggested-prompts">
            <span>Попробуй спросить:</span>
            <button onClick={() => setMessage("Объясни композицию функций простыми словами")}>Объясни проще</button>
            <button onClick={() => setMessage("Дай мне практическую задачу по бинарным отношениям")}>Дай задачу</button>
          </div>
          <form className="chat-input-area" onSubmit={(e) => { e.preventDefault(); sendMessage(); }}>
            <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Спроси AQYL о чём угодно..." disabled={isLoading} />
            <button type="submit" disabled={!message.trim() || isLoading}><Send size={18} /></button>
          </form>
          <div className="chat-disclaimer" style={{ color: "#10b981" }}>🟢 Защищенный сеанс · Локальная Gemini</div>
        </section>
        <aside className="tutor-aside">
          <section className="panel current-lesson">
            <div className="eyebrow">ТВОЙ УРОК</div><h3>Композиция функций</h3><p>Сегодняшняя учебная цель</p>
            <div className="lesson-progress"><div><span>Прогресс урока</span><strong>0%</strong></div><div className="progress-track"><div className="progress-fill blue" style={{ width: "0%" }} /></div></div>
            <div className="lesson-meta"><span><Clock3 size={15} /> 25 минут</span><span><Target size={15} /> 5 заданий</span></div>
          </section>
        </aside>
      </div>
    </>
  );
}

function Planner({ tasks, toggleTask, completedTasks }: {
  tasks: typeof initialTasks;
  toggleTask: (id: number) => void;
  completedTasks: number;
}) {
  return (
    <>
      <SectionHeading eyebrow="SMART STUDY PLANNER" title="Учебный план" description="Планируй обучение небольшими шагами и отслеживай выполнение." action={<button className="secondary-button"><CalendarDays size={16} /> Сегодня, 6 ноября</button>} />
      <div className="planner-summary">
        <div><span>ЗАДАЧИ НА СЕГОДНЯ</span><strong>{tasks.length}</strong></div>
        <div><span>ВЫПОЛНЕНО</span><strong>{completedTasks}</strong></div>
        <div><span>ОСТАЛОСЬ</span><strong>{tasks.length - completedTasks}</strong></div>
      </div>
      <section className="panel planner-panel" style={{ marginTop: "24px" }}>
        <div className="panel-heading">
          <div>
            <div className="eyebrow">LEARNING ROUTINE</div>
            <h3>Твой день обучения</h3>
            <p>Отмечай задачи по мере выполнения</p>
          </div>
        </div>
        <div className="task-list">
          {tasks.map((task) => (
            <div className={`task-row ${task.done ? "task-done" : ""}`} key={task.id} style={{ display: "flex", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #232a3b" }}>
              <button className={`task-check ${task.done ? "checked" : ""}`} onClick={() => toggleTask(task.id)} style={{ marginRight: "16px", cursor: "pointer" }}>
                {task.done && <Check size={13} />}
              </button>
              <div className="task-time" style={{ marginRight: "16px", color: "#8b949e" }}>{task.time}</div>
              <div className="task-description" style={{ flex: 1 }}><strong>{task.title}</strong><span style={{ display: "block", fontSize: "12px", color: "#8b949e" }}>{task.detail}</span></div>
              {task.done && <CheckCircle2 size={17} className="task-success" style={{ color: "#10b981" }} />}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function Progress() {
  return (
    <>
      <SectionHeading eyebrow="LEARNING ANALYTICS" title="Мой прогресс" description="Смотри, как меняются твои знания и учебные привычки." />
    </>
  );
}

export default App;
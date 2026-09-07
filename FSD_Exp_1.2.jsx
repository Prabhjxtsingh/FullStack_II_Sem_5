import React, { useReducer, useEffect, useRef, useState, useCallback } from "react";

/**
 * Draft Management System
 * -------------------------------------------------------------
 * A self-contained frontend module for saving, retrieving, editing
 * and deleting post drafts.
 *
 * Concepts demonstrated (mapped to the lab objectives):
 *  1. Draft data modeled and owned entirely by frontend state (useReducer)
 *  2. Full CRUD: create, read (list + view), update, delete
 *  3. Async workflows: a mock API layer that returns Promises with
 *     artificial latency and occasional simulated failure, driving
 *     loading / success / error UI states
 *  4. Optional persistence to localStorage so drafts survive a refresh
 *
 * Swap `mockApi` for real fetch() calls later -- every function
 * already returns a Promise, so the rest of the app doesn't change.
 * -------------------------------------------------------------
 */

// ---------------------------------------------------------------
// 1. Mock API layer -- simulates network latency and failure so the
//    UI has to handle real async states, not just instant state sets.
// ---------------------------------------------------------------
const NETWORK_DELAY = 600;
const FAILURE_RATE = 0.12; // ~1 in 8 calls "fails", to exercise error handling

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function maybeFail(actionLabel) {
  if (Math.random() < FAILURE_RATE) {
    throw new Error(`${actionLabel} failed -- the server took too long to respond.`);
  }
}

const STORAGE_KEY = "draft-manager:drafts";

function readFromStorage() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeToStorage(drafts) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
  } catch {
    // localStorage can fail in private-browsing contexts; fail silently,
    // the in-memory state still works for the session.
  }
}

const mockApi = {
  async fetchDrafts() {
    await delay(NETWORK_DELAY);
    maybeFail("Loading drafts");
    return readFromStorage();
  },

  async saveDraft(draft) {
    await delay(NETWORK_DELAY);
    maybeFail("Saving draft");
    const all = readFromStorage();
    const now = new Date().toISOString();
    let saved;
    const existingIndex = all.findIndex((d) => d.id === draft.id);

    if (existingIndex >= 0) {
      saved = { ...all[existingIndex], ...draft, updatedAt: now };
      all[existingIndex] = saved;
    } else {
      saved = {
        ...draft,
        id: draft.id || `draft-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        createdAt: now,
        updatedAt: now,
      };
      all.unshift(saved);
    }
    writeToStorage(all);
    return saved;
  },

  async deleteDraft(id) {
    await delay(NETWORK_DELAY);
    maybeFail("Deleting draft");
    const all = readFromStorage().filter((d) => d.id !== id);
    writeToStorage(all);
    return id;
  },
};

// ---------------------------------------------------------------
// 2. Draft state reducer -- the single source of truth on the frontend.
// ---------------------------------------------------------------
const initialState = {
  drafts: [],
  status: "idle", // idle | loading | ready | error
  error: null,
};

function draftsReducer(state, action) {
  switch (action.type) {
    case "LOAD_START":
      return { ...state, status: "loading", error: null };
    case "LOAD_SUCCESS":
      return { ...state, status: "ready", drafts: action.payload, error: null };
    case "LOAD_ERROR":
      return { ...state, status: "error", error: action.payload };
    case "UPSERT_DRAFT": {
      const exists = state.drafts.some((d) => d.id === action.payload.id);
      const drafts = exists
        ? state.drafts.map((d) => (d.id === action.payload.id ? action.payload : d))
        : [action.payload, ...state.drafts];
      return { ...state, drafts, status: "ready" };
    }
    case "REMOVE_DRAFT":
      return {
        ...state,
        drafts: state.drafts.filter((d) => d.id !== action.payload),
        status: "ready",
      };
    default:
      return state;
  }
}

// ---------------------------------------------------------------
// 3. Small helpers
// ---------------------------------------------------------------
function wordCount(text) {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

function timeAgo(iso) {
  if (!iso) return "";
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return `${days}d ago`;
}

const EMPTY_DRAFT = { id: null, title: "", body: "" };

// ---------------------------------------------------------------
// 4. Main component
// ---------------------------------------------------------------
export default function DraftManager() {
  const [state, dispatch] = useReducer(draftsReducer, initialState);
  const [activeDraft, setActiveDraft] = useState(EMPTY_DRAFT);
  const [saveState, setSaveState] = useState("idle"); // idle | saving | saved | error
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const showToast = useCallback((message, tone = "default") => {
    setToast({ message, tone });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  }, []);

  // Initial load -- simulates fetching drafts from a backend.
  useEffect(() => {
    let cancelled = false;
    dispatch({ type: "LOAD_START" });
    mockApi
      .fetchDrafts()
      .then((drafts) => {
        if (!cancelled) dispatch({ type: "LOAD_SUCCESS", payload: drafts });
      })
      .catch((err) => {
        if (!cancelled) dispatch({ type: "LOAD_ERROR", payload: err.message });
      });
    return () => {
      cancelled = true;
      clearTimeout(toastTimer.current);
    };
  }, []);

  const retryLoad = () => {
    dispatch({ type: "LOAD_START" });
    mockApi
      .fetchDrafts()
      .then((drafts) => dispatch({ type: "LOAD_SUCCESS", payload: drafts }))
      .catch((err) => dispatch({ type: "LOAD_ERROR", payload: err.message }));
  };

  const handleNewDraft = () => {
    setActiveDraft(EMPTY_DRAFT);
    setSaveState("idle");
  };

  const handleSelectDraft = (draft) => {
    setActiveDraft(draft);
    setSaveState("idle");
  };

  const handleSave = async () => {
    if (!activeDraft.title.trim() && !activeDraft.body.trim()) {
      showToast("Write a title or some content before saving.", "error");
      return;
    }
    setSaveState("saving");
    try {
      const saved = await mockApi.saveDraft(activeDraft);
      dispatch({ type: "UPSERT_DRAFT", payload: saved });
      setActiveDraft(saved);
      setSaveState("saved");
      showToast("Draft saved.");
    } catch (err) {
      setSaveState("error");
      showToast(err.message, "error");
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await mockApi.deleteDraft(id);
      dispatch({ type: "REMOVE_DRAFT", payload: id });
      if (activeDraft.id === id) {
        setActiveDraft(EMPTY_DRAFT);
        setSaveState("idle");
      }
      showToast("Draft deleted.");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setDeletingId(null);
    }
  };

  const updateField = (field, value) => {
    setActiveDraft((prev) => ({ ...prev, [field]: value }));
    if (saveState !== "idle") setSaveState("idle");
  };

  const sortedDrafts = [...state.drafts].sort(
    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
  );

  return (
    <div style={styles.page}>
      <style>{fontImport}</style>

      <header style={styles.header}>
        <div>
          <p style={styles.eyebrow}>Draft manager</p>
          <h1 style={styles.title}>Your unfinished words, kept safe</h1>
        </div>
        <button style={styles.newButton} onClick={handleNewDraft}>
          + New draft
        </button>
      </header>

      <div style={styles.layout}>
        {/* ---------------- Sidebar: draft list ---------------- */}
        <aside style={styles.sidebar}>
          <div style={styles.sidebarHead}>
            <span style={styles.sidebarLabel}>Saved drafts</span>
            <span style={styles.sidebarCount}>{sortedDrafts.length}</span>
          </div>

          {state.status === "loading" && (
            <div style={styles.centerMsg}>
              <Spinner /> <span>Loading drafts…</span>
            </div>
          )}

          {state.status === "error" && (
            <div style={styles.errorBox}>
              <p style={{ margin: 0 }}>{state.error}</p>
              <button style={styles.retryButton} onClick={retryLoad}>
                Try again
              </button>
            </div>
          )}

          {state.status === "ready" && sortedDrafts.length === 0 && (
            <div style={styles.emptyBox}>
              <p style={styles.emptyTitle}>No drafts yet</p>
              <p style={styles.emptyBody}>
                Start writing on the right and save it -- it'll show up here.
              </p>
            </div>
          )}

          {state.status === "ready" &&
            sortedDrafts.map((draft) => (
              <button
                key={draft.id}
                onClick={() => handleSelectDraft(draft)}
                style={{
                  ...styles.draftItem,
                  ...(activeDraft.id === draft.id ? styles.draftItemActive : {}),
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={styles.draftItemTitle}>
                    {draft.title.trim() || "Untitled draft"}
                  </p>
                  <p style={styles.draftItemMeta}>
                    {wordCount(draft.body)} words · {timeAgo(draft.updatedAt)}
                  </p>
                </div>
                <span
                  role="button"
                  tabIndex={0}
                  aria-label="Delete draft"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(draft.id);
                  }}
                  style={styles.deleteIcon}
                >
                  {deletingId === draft.id ? <Spinner small /> : "✕"}
                </span>
              </button>
            ))}
        </aside>

        {/* ---------------- Editor ---------------- */}
        <main style={styles.editor}>
          <input
            style={styles.titleInput}
            placeholder="Give it a title"
            value={activeDraft.title}
            onChange={(e) => updateField("title", e.target.value)}
          />
          <textarea
            style={styles.bodyInput}
            placeholder="Start writing..."
            value={activeDraft.body}
            onChange={(e) => updateField("body", e.target.value)}
          />

          <div style={styles.editorFooter}>
            <span style={styles.wordCount}>{wordCount(activeDraft.body)} words</span>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <SaveStatus state={saveState} />
              <button
                style={{
                  ...styles.saveButton,
                  opacity: saveState === "saving" ? 0.7 : 1,
                }}
                onClick={handleSave}
                disabled={saveState === "saving"}
              >
                {saveState === "saving" ? "Saving…" : "Save draft"}
              </button>
            </div>
          </div>
        </main>
      </div>

      {toast && (
        <div
          style={{
            ...styles.toast,
            ...(toast.tone === "error" ? styles.toastError : {}),
          }}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------
// 5. Tiny presentational pieces
// ---------------------------------------------------------------
function SaveStatus({ state }) {
  if (state === "saved")
    return <span style={{ ...styles.statusPill, ...styles.statusSaved }}>Saved</span>;
  if (state === "error")
    return <span style={{ ...styles.statusPill, ...styles.statusFailed }}>Couldn't save</span>;
  return null;
}

function Spinner({ small }) {
  const size = small ? 12 : 16;
  return (
    <span
      style={{
        display: "inline-block",
        width: size,
        height: size,
        borderRadius: "50%",
        border: `2px solid ${COLORS.borderStrong}`,
        borderTopColor: COLORS.accent,
        animation: "draft-spin 0.7s linear infinite",
        verticalAlign: "middle",
      }}
    />
  );
}

// ---------------------------------------------------------------
// 6. Styles -- an "editor's desk" palette: warm paper, ink-navy text,
//    an ochre accent for the primary action, brick for destructive.
// ---------------------------------------------------------------
const COLORS = {
  paper: "#F2EEE3",
  paperRaised: "#FBF9F3",
  ink: "#26313D",
  inkSoft: "#5B6773",
  accent: "#B8792F",
  accentDeep: "#8A5A1F",
  danger: "#AE4A34",
  success: "#3F6D50",
  border: "#DCD5C2",
  borderStrong: "#C8BF9F",
};

const fontImport = `
@import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;600&family=Inter:wght@400;500;600&display=swap');
@keyframes draft-spin { to { transform: rotate(360deg); } }
`;

const styles = {
  page: {
    fontFamily: "'Inter', system-ui, sans-serif",
    background: COLORS.paper,
    color: COLORS.ink,
    minHeight: "100vh",
    padding: "32px 40px",
    boxSizing: "border-box",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 28,
    flexWrap: "wrap",
    gap: 16,
  },
  eyebrow: {
    margin: 0,
    fontSize: 13,
    color: COLORS.accentDeep,
    fontWeight: 600,
  },
  title: {
    margin: "4px 0 0",
    fontFamily: "'Source Serif 4', Georgia, serif",
    fontSize: 28,
    fontWeight: 600,
    maxWidth: 480,
    lineHeight: 1.25,
  },
  newButton: {
    background: COLORS.ink,
    color: COLORS.paperRaised,
    border: "none",
    borderRadius: 8,
    padding: "10px 18px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "280px 1fr",
    gap: 20,
    alignItems: "start",
  },
  sidebar: {
    background: COLORS.paperRaised,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 12,
    padding: 14,
    display: "flex",
    flexDirection: "column",
    gap: 6,
    maxHeight: "70vh",
    overflowY: "auto",
  },
  sidebarHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "2px 6px 10px",
    borderBottom: `1px solid ${COLORS.border}`,
    marginBottom: 6,
  },
  sidebarLabel: { fontSize: 13, fontWeight: 600, color: COLORS.inkSoft },
  sidebarCount: {
    fontSize: 12,
    color: COLORS.accentDeep,
    background: "#EFE1C8",
    borderRadius: 999,
    padding: "2px 8px",
    fontWeight: 600,
  },
  centerMsg: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 13,
    color: COLORS.inkSoft,
    padding: "18px 8px",
  },
  errorBox: {
    background: "#F6E5DF",
    border: `1px solid ${COLORS.danger}`,
    color: COLORS.danger,
    borderRadius: 8,
    padding: 12,
    fontSize: 13,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  retryButton: {
    alignSelf: "flex-start",
    background: "transparent",
    border: `1px solid ${COLORS.danger}`,
    color: COLORS.danger,
    borderRadius: 6,
    padding: "5px 10px",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
  },
  emptyBox: { padding: "18px 8px", color: COLORS.inkSoft },
  emptyTitle: { margin: "0 0 4px", fontWeight: 600, color: COLORS.ink, fontSize: 14 },
  emptyBody: { margin: 0, fontSize: 13, lineHeight: 1.5 },
  draftItem: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    width: "100%",
    textAlign: "left",
    background: "transparent",
    border: "none",
    borderRadius: 8,
    padding: "8px 8px",
    cursor: "pointer",
  },
  draftItemActive: { background: "#EFE9D8" },
  draftItemTitle: {
    margin: 0,
    fontSize: 14,
    fontWeight: 600,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  draftItemMeta: { margin: "2px 0 0", fontSize: 12, color: COLORS.inkSoft },
  deleteIcon: {
    fontSize: 13,
    color: COLORS.inkSoft,
    padding: 4,
    borderRadius: 6,
    cursor: "pointer",
    flexShrink: 0,
  },
  editor: {
    background: COLORS.paperRaised,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 12,
    padding: "20px 24px",
    display: "flex",
    flexDirection: "column",
    minHeight: "70vh",
  },
  titleInput: {
    border: "none",
    outline: "none",
    background: "transparent",
    fontFamily: "'Source Serif 4', Georgia, serif",
    fontSize: 24,
    fontWeight: 600,
    color: COLORS.ink,
    marginBottom: 10,
  },
  bodyInput: {
    border: "none",
    outline: "none",
    background: "transparent",
    resize: "none",
    flex: 1,
    fontFamily: "'Source Serif 4', Georgia, serif",
    fontSize: 16,
    lineHeight: 1.7,
    color: COLORS.ink,
    minHeight: 320,
  },
  editorFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 14,
    marginTop: 14,
    borderTop: `1px solid ${COLORS.border}`,
  },
  wordCount: { fontSize: 13, color: COLORS.inkSoft },
  saveButton: {
    background: COLORS.accent,
    color: "#FFF8EC",
    border: "none",
    borderRadius: 8,
    padding: "9px 18px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  statusPill: {
    fontSize: 12,
    fontWeight: 600,
    borderRadius: 999,
    padding: "3px 10px",
  },
  statusSaved: { background: "#E1EBE3", color: COLORS.success },
  statusFailed: { background: "#F6E5DF", color: COLORS.danger },
  toast: {
    position: "fixed",
    bottom: 24,
    left: "50%",
    transform: "translateX(-50%)",
    background: COLORS.ink,
    color: "#FFF",
    padding: "10px 18px",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 500,
    boxShadow: "0 6px 20px rgba(0,0,0,0.18)",
  },
  toastError: { background: COLORS.danger },
};

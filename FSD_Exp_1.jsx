import { useState, useMemo } from "react";

/* -----------------------------------------------------------
   Platform rule set
   Each platform defines its own constraints. Adding a new
   platform later only means adding one entry here.
----------------------------------------------------------- */
const PLATFORMS = {
  twitter: {
    label: "X (Twitter)",
    color: "#000000",
    charLimit: 280,
    maxMedia: 4,
    hashtagLimit: 3,
    hint: "Short and punchy. Max 4 images, 3 recommended hashtags.",
  },
  instagram: {
    label: "Instagram",
    color: "#C13584",
    charLimit: 2200,
    maxMedia: 10,
    requiresMedia: true,
    hashtagLimit: 30,
    hint: "Needs at least one image. Up to 10 media items, 30 hashtags.",
  },
  linkedin: {
    label: "LinkedIn",
    color: "#0A66C2",
    charLimit: 3000,
    maxMedia: 9,
    hashtagLimit: 5,
    hint: "Professional tone. Keep hashtags under 5 for reach.",
  },
  facebook: {
    label: "Facebook",
    color: "#1877F2",
    charLimit: 63206,
    softLimit: 500,
    maxMedia: 10,
    hashtagLimit: 10,
    hint: "Technically huge limit, but posts under 500 chars perform best.",
  },
};

const WARN_RATIO = 0.9; // show a warning once 90% of the limit is used

function countHashtags(text) {
  const matches = text.match(/#[\w]+/g);
  return matches ? matches.length : 0;
}

function validatePost(text, mediaCount, platformKey) {
  const rules = PLATFORMS[platformKey];
  const issues = [];
  const length = text.length;
  const limit = rules.charLimit;
  const ratio = limit ? length / limit : 0;

  if (length === 0) {
    issues.push({ level: "info", message: "Nothing written yet." });
  } else if (length > limit) {
    issues.push({
      level: "error",
      message: `${length - limit} characters over the ${limit}-character limit.`,
    });
  } else if (rules.softLimit && length > rules.softLimit) {
    issues.push({
      level: "warning",
      message: `Over the ${rules.softLimit}-character recommended length for best engagement.`,
    });
  } else if (ratio >= WARN_RATIO) {
    issues.push({
      level: "warning",
      message: `Approaching the ${limit}-character limit (${length}/${limit}).`,
    });
  }

  if (rules.requiresMedia && mediaCount === 0) {
    issues.push({ level: "error", message: "This platform requires at least one image." });
  }
  if (mediaCount > rules.maxMedia) {
    issues.push({
      level: "error",
      message: `${mediaCount}/${rules.maxMedia} media items attached — remove ${
        mediaCount - rules.maxMedia
      }.`,
    });
  }

  const tags = countHashtags(text);
  if (tags > rules.hashtagLimit) {
    issues.push({
      level: "warning",
      message: `${tags} hashtags used — ${rules.hashtagLimit} or fewer is recommended.`,
    });
  }

  const hasError = issues.some((i) => i.level === "error");
  return { issues, length, limit, ratio: Math.min(ratio, 1), hasError };
}

function StatusPill({ level }) {
  const styles = {
    error: { bg: "#FDECEC", fg: "#B3261E", label: "Error" },
    warning: { bg: "#FFF4E0", fg: "#8A5A00", label: "Warning" },
    info: { bg: "#EEF1F4", fg: "#5B6472", label: "Info" },
    ok: { bg: "#E7F6EC", fg: "#1E7B3A", label: "Ready" },
  }[level];
  return (
    <span
      style={{
        background: styles.bg,
        color: styles.fg,
        padding: "2px 9px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {styles.label}
    </span>
  );
}

export default function PostComposer() {
  const [text, setText] = useState(
    "Excited to share our latest update with the community! #launch"
  );
  const [mediaCount, setMediaCount] = useState(1);
  const [selected, setSelected] = useState(["twitter", "instagram"]);

  const togglePlatform = (key) => {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );
  };

  const results = useMemo(() => {
    const out = {};
    selected.forEach((key) => {
      out[key] = validatePost(text, mediaCount, key);
    });
    return out;
  }, [text, mediaCount, selected]);

  const anyBlocking = selected.some((key) => results[key]?.hasError);
  const canPublish = selected.length > 0 && !anyBlocking;

  return (
    <div
      style={{
        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        maxWidth: 720,
        margin: "0 auto",
        padding: 20,
        color: "#1A1D21",
      }}
    >
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
        Compose a post
      </h2>
      <p style={{ fontSize: 13, color: "#6B7280", marginTop: 0, marginBottom: 16 }}>
        Select platforms, write once, and see constraints validated live.
      </p>

      {/* Platform selection */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 16,
        }}
      >
        {Object.entries(PLATFORMS).map(([key, p]) => {
          const active = selected.includes(key);
          return (
            <button
              key={key}
              onClick={() => togglePlatform(key)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 999,
                border: active ? `1.5px solid ${p.color}` : "1.5px solid #E2E5E9",
                background: active ? `${p.color}14` : "#FFFFFF",
                color: active ? p.color : "#4B5563",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: p.color,
                  display: "inline-block",
                }}
              />
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Composer */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        placeholder="What do you want to share?"
        style={{
          width: "100%",
          boxSizing: "border-box",
          resize: "vertical",
          padding: 12,
          fontSize: 14,
          lineHeight: 1.5,
          borderRadius: 10,
          border: "1.5px solid #E2E5E9",
          fontFamily: "inherit",
          outline: "none",
        }}
        onFocus={(e) => (e.target.style.border = "1.5px solid #5B6472")}
        onBlur={(e) => (e.target.style.border = "1.5px solid #E2E5E9")}
      />

      {/* Media control (simulated attachments) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginTop: 10,
          marginBottom: 20,
          fontSize: 13,
        }}
      >
        <span style={{ color: "#6B7280" }}>Attached media:</span>
        <button
          onClick={() => setMediaCount((c) => Math.max(0, c - 1))}
          style={roundBtnStyle}
        >
          −
        </button>
        <span style={{ fontWeight: 700, minWidth: 14, textAlign: "center" }}>
          {mediaCount}
        </span>
        <button onClick={() => setMediaCount((c) => c + 1)} style={roundBtnStyle}>
          +
        </button>
      </div>

      {/* Per-platform validation cards */}
      {selected.length === 0 && (
        <div
          style={{
            padding: 16,
            border: "1.5px dashed #E2E5E9",
            borderRadius: 10,
            fontSize: 13,
            color: "#6B7280",
            textAlign: "center",
          }}
        >
          Select at least one platform to see validation.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {selected.map((key) => {
          const p = PLATFORMS[key];
          const r = results[key];
          const topLevel = r.hasError
            ? "error"
            : r.issues.some((i) => i.level === "warning")
            ? "warning"
            : r.length === 0
            ? "info"
            : "ok";

          return (
            <div
              key={key}
              style={{
                border: "1.5px solid #E2E5E9",
                borderRadius: 10,
                padding: 14,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: p.color,
                      display: "inline-block",
                    }}
                  />
                  <strong style={{ fontSize: 14 }}>{p.label}</strong>
                </div>
                <StatusPill level={topLevel} />
              </div>

              {/* char progress bar */}
              <div
                style={{
                  height: 6,
                  borderRadius: 999,
                  background: "#EEF1F4",
                  overflow: "hidden",
                  marginBottom: 6,
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${r.ratio * 100}%`,
                    background: r.hasError
                      ? "#DC2626"
                      : r.ratio >= WARN_RATIO
                      ? "#D97706"
                      : p.color,
                    transition: "width 0.15s ease",
                  }}
                />
              </div>
              <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 8 }}>
                {r.length}/{r.limit === 63206 ? "63,206" : r.limit} characters ·{" "}
                {mediaCount}/{p.maxMedia} media
              </div>

              {r.issues.length > 0 && (
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5 }}>
                  {r.issues.map((issue, i) => (
                    <li
                      key={i}
                      style={{
                        color:
                          issue.level === "error"
                            ? "#B3261E"
                            : issue.level === "warning"
                            ? "#8A5A00"
                            : "#6B7280",
                        marginBottom: 2,
                      }}
                    >
                      {issue.message}
                    </li>
                  ))}
                </ul>
              )}
              <div style={{ fontSize: 11.5, color: "#9AA1AB", marginTop: 6 }}>
                {p.hint}
              </div>
            </div>
          );
        })}
      </div>

      <button
        disabled={!canPublish}
        style={{
          marginTop: 20,
          width: "100%",
          padding: "12px 0",
          borderRadius: 10,
          border: "none",
          fontSize: 14,
          fontWeight: 700,
          cursor: canPublish ? "pointer" : "not-allowed",
          background: canPublish ? "#1A1D21" : "#E2E5E9",
          color: canPublish ? "#FFFFFF" : "#9AA1AB",
        }}
        onClick={() => alert("Post published (simulated) to: " + selected.join(", "))}
      >
        {selected.length === 0
          ? "Select a platform to continue"
          : anyBlocking
          ? "Resolve errors to publish"
          : `Publish to ${selected.length} platform${selected.length > 1 ? "s" : ""}`}
      </button>
    </div>
  );
}

const roundBtnStyle = {
  width: 24,
  height: 24,
  borderRadius: "50%",
  border: "1.5px solid #E2E5E9",
  background: "#FFFFFF",
  fontSize: 14,
  lineHeight: 1,
  cursor: "pointer",
};

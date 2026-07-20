// Bring-your-own-key LLM client for the Design Thinking Canvas.
// The API key is stored only in this browser's localStorage and sent only
// to the selected provider's API. Never use a shared computer with your key.

const LLM_CONFIG_KEY = "dtc-llm-config-v1";

const LLM_PROVIDERS = {
  anthropic: {
    label: "Anthropic (Claude)",
    defaultModel: "claude-sonnet-4-5",
    keyHint: "sk-ant-…",
    models: ["claude-sonnet-4-5", "claude-opus-4-1", "claude-haiku-4-5"],
  },
  openai: {
    label: "OpenAI (GPT)",
    defaultModel: "gpt-4o-mini",
    keyHint: "sk-…",
    models: ["gpt-4o-mini", "gpt-4o", "gpt-4.1-mini", "gpt-4.1"],
  },
  gemini: {
    label: "Google (Gemini)",
    defaultModel: "gemini-2.0-flash",
    keyHint: "AIza…",
    models: ["gemini-2.0-flash", "gemini-2.5-flash", "gemini-2.5-pro"],
  },
  openrouter: {
    label: "OpenRouter (any model)",
    defaultModel: "openai/gpt-4o-mini",
    keyHint: "sk-or-…",
    models: [
      "openai/gpt-4o-mini",
      "anthropic/claude-sonnet-4.5",
      "google/gemini-2.0-flash-001",
      "meta-llama/llama-3.3-70b-instruct",
    ],
  },
};

function loadLLMConfig() {
  try {
    return JSON.parse(localStorage.getItem(LLM_CONFIG_KEY)) || {};
  } catch {
    return {};
  }
}

function saveLLMConfig(cfg) {
  localStorage.setItem(LLM_CONFIG_KEY, JSON.stringify(cfg));
}

function llmConfigured() {
  const cfg = loadLLMConfig();
  return Boolean(cfg.provider && cfg.key);
}

/** Send a system + user prompt to the configured provider. Returns text. */
async function llmComplete(system, user) {
  const cfg = loadLLMConfig();
  if (!cfg.provider || !cfg.key) {
    throw new Error("No LLM configured. Open AI settings and add your API key.");
  }
  const model = cfg.model || LLM_PROVIDERS[cfg.provider].defaultModel;

  if (cfg.provider === "anthropic") {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": cfg.key,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model,
        max_tokens: 6000,
        system,
        messages: [{ role: "user", content: user }],
      }),
    });
    if (!r.ok) throw new Error(`Anthropic API error ${r.status}: ${await errText(r)}`);
    const d = await r.json();
    return (d.content || []).map((b) => b.text || "").join("");
  }

  if (cfg.provider === "openai" || cfg.provider === "openrouter") {
    const endpoint =
      cfg.provider === "openrouter"
        ? "https://openrouter.ai/api/v1/chat/completions"
        : "https://api.openai.com/v1/chat/completions";
    const r = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${cfg.key}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
    if (!r.ok) throw new Error(`${cfg.provider === "openrouter" ? "OpenRouter" : "OpenAI"} API error ${r.status}: ${await errText(r)}`);
    const d = await r.json();
    return d.choices?.[0]?.message?.content || "";
  }

  if (cfg.provider === "gemini") {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(cfg.key)}`;
    const r = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ parts: [{ text: user }] }],
      }),
    });
    if (!r.ok) throw new Error(`Gemini API error ${r.status}: ${await errText(r)}`);
    const d = await r.json();
    return (d.candidates?.[0]?.content?.parts || []).map((p) => p.text || "").join("");
  }

  throw new Error(`Unknown provider: ${cfg.provider}`);
}

async function errText(r) {
  try {
    const t = await r.text();
    return t.slice(0, 300);
  } catch {
    return "(no details)";
  }
}

/** Pull the first JSON array or object out of an LLM response. */
function llmExtractJSON(text) {
  const cleaned = text.replace(/```(?:json)?/gi, "").trim();
  let parsed = null;
  try {
    parsed = JSON.parse(cleaned);
  } catch { /* fall through */ }
  if (parsed === null) {
    for (const re of [/\[[\s\S]*\]/, /\{[\s\S]*\}/]) {
      const m = cleaned.match(re);
      if (m) {
        try {
          parsed = JSON.parse(m[0]);
          break;
        } catch { /* keep trying */ }
      }
    }
  }
  if (parsed === null) throw new Error("Could not parse the LLM's response as JSON.");
  // Some models wrap the requested array in an object, e.g. {"rephrasings": [...]}.
  if (!Array.isArray(parsed) && typeof parsed === "object") {
    const arrays = Object.values(parsed).filter(Array.isArray);
    if (arrays.length === 1) return arrays[0];
  }
  return parsed;
}

/** The user's display name from settings (empty string if unset). */
function llmUserName() {
  return (loadLLMConfig().name || "").trim();
}

/* ---- OpenRouter live model catalog (public endpoint, no key needed) ---- */

const OPENROUTER_MODELS_KEY = "dtc-openrouter-models-v1";
let _openrouterModels = null;

/** All model ids currently offered by OpenRouter, cached for 1 hour. */
async function llmOpenRouterModels() {
  if (_openrouterModels) return _openrouterModels;
  try {
    const cached = JSON.parse(localStorage.getItem(OPENROUTER_MODELS_KEY) || "null");
    if (cached && Array.isArray(cached.ids) && Date.now() - cached.at < 3600 * 1000) {
      return (_openrouterModels = cached.ids);
    }
  } catch { /* refetch */ }
  const r = await fetch("https://openrouter.ai/api/v1/models");
  if (!r.ok) throw new Error(`Could not load the OpenRouter model list (${r.status}).`);
  const d = await r.json();
  const ids = (d.data || []).map((m) => m.id).filter(Boolean).sort();
  if (ids.length === 0) throw new Error("OpenRouter returned an empty model list.");
  _openrouterModels = ids;
  try {
    localStorage.setItem(OPENROUTER_MODELS_KEY, JSON.stringify({ at: Date.now(), ids }));
  } catch { /* cache is optional */ }
  return ids;
}

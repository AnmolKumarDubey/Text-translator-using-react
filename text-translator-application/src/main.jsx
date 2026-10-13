import React from "react";
import { createRoot } from "react-dom/client";
import { Check, Clipboard, Languages, Loader2, RotateCcw, Sparkles } from "lucide-react";
import "./styles.css";

const LANGUAGES = [
  { code: "hi", name: "Hindi", greeting: "Namaste" },
  { code: "es", name: "Spanish", greeting: "Hola" },
  { code: "fr", name: "French", greeting: "Bonjour" },
  { code: "de", name: "German", greeting: "Hallo" },
  { code: "it", name: "Italian", greeting: "Ciao" },
  { code: "ja", name: "Japanese", greeting: "Konnichiwa" },
  { code: "ko", name: "Korean", greeting: "Annyeong" },
  { code: "pt", name: "Portuguese", greeting: "Ola" },
  { code: "ar", name: "Arabic", greeting: "Marhaba" },
  { code: "zh-CN", name: "Chinese Simplified", greeting: "Ni hao" },
  { code: "ru", name: "Russian", greeting: "Privet" },
  { code: "tr", name: "Turkish", greeting: "Merhaba" },
  { code: "bn", name: "Bengali", greeting: "Nomoskar" },
  { code: "ta", name: "Tamil", greeting: "Vanakkam" },
  { code: "te", name: "Telugu", greeting: "Namaskaram" }
];

const DEFAULT_TEXT = "Good morning! I am building a text translator with React and Tailwind.";

function extractTranslation(payload) {
  if (!payload || typeof payload !== "object") return "";

  const candidates = [
    payload.responseData?.translatedText,
    payload.trans,
    payload.translatedText,
    payload.translation,
    payload.result,
    payload.text,
    payload.data?.translatedText,
    payload.data?.translation,
    payload.data?.translations?.[0]?.translatedText,
    payload.translations?.[0]?.translatedText,
    payload.translated_text
  ];

  return candidates.find((value) => typeof value === "string" && value.trim()) || "";
}

async function translateText({ text, targetLanguage }) {
  const apiUrl = import.meta.env.VITE_RAPIDAPI_URL || "https://api.mymemory.translated.net/get";
  const requestUrl = new URL(apiUrl);
  requestUrl.searchParams.set("q", text);
  requestUrl.searchParams.set("langpair", `en|${targetLanguage}`);

  const response = await fetch(requestUrl.toString());

  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload.responseStatus >= 400) {
    const message = payload.message || payload.error || `Translation failed with status ${response.status}.`;
    throw new Error(message);
  }

  const translated = extractTranslation(payload);

  if (!translated) {
    throw new Error("The API responded, but the translated text field was not recognized.");
  }

  return translated;
}

function App() {
  const [sourceText, setSourceText] = React.useState(DEFAULT_TEXT);
  const [targetLanguage, setTargetLanguage] = React.useState("hi");
  const [translatedText, setTranslatedText] = React.useState("");
  const [status, setStatus] = React.useState("idle");
  const [error, setError] = React.useState("");
  const [copied, setCopied] = React.useState(false);
  const [history, setHistory] = React.useState([]);

  const selectedLanguage = LANGUAGES.find((language) => language.code === targetLanguage);
  const characterCount = sourceText.trim().length;
  const canTranslate = characterCount > 0 && status !== "loading";

  async function handleTranslate(event) {
    event.preventDefault();
    if (!canTranslate) return;

    setStatus("loading");
    setError("");
    setCopied(false);

    try {
      const result = await translateText({ text: sourceText.trim(), targetLanguage });
      setTranslatedText(result);
      setStatus("success");
      setHistory((items) => [
        {
          id: crypto.randomUUID(),
          input: sourceText.trim(),
          output: result,
          language: selectedLanguage?.name || targetLanguage
        },
        ...items
      ].slice(0, 4));
    } catch (err) {
      setStatus("error");
      setError(err.message || "Something went wrong while translating.");
    }
  }

  async function handleCopy() {
    if (!translatedText) return;
    await navigator.clipboard.writeText(translatedText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  function handleReset() {
    setSourceText("");
    setTranslatedText("");
    setError("");
    setCopied(false);
    setStatus("idle");
  }

  return (
    <main className="min-h-screen bg-[#f6f3ee] text-slate-950">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-5 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
              <Languages className="h-4 w-4" />
              React + RapidAPI
            </div>
            <h1 className="mt-2 text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">
              Text Translator
            </h1>
          </div>
          <div className="rounded-md border border-slate-200 bg-[#f6f3ee] px-4 py-3 text-sm text-slate-700">
            English to <span className="font-semibold text-slate-950">{selectedLanguage?.name}</span>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-5 py-8 lg:grid-cols-[1.2fr_0.8fr]">
        <form onSubmit={handleTranslate} className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Input</p>
              <h2 className="mt-1 text-xl font-semibold">Write in English</h2>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
              title="Clear text"
              aria-label="Clear text"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          <textarea
            value={sourceText}
            onChange={(event) => setSourceText(event.target.value)}
            className="mt-5 min-h-48 w-full resize-y rounded-md border border-slate-200 bg-slate-50 p-4 text-base leading-7 outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-100"
            placeholder="Type any English sentence here..."
          />

          <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Favorite language</span>
              <select
                value={targetLanguage}
                onChange={(event) => setTargetLanguage(event.target.value)}
                className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-medium outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
              >
                {LANGUAGES.map((language) => (
                  <option key={language.code} value={language.code}>
                    {language.name} - {language.greeting}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="submit"
              disabled={!canTranslate}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Translate
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
            <span>Source language: English</span>
            <span>{characterCount} characters</span>
          </div>
        </form>

        <aside className="rounded-lg border border-slate-200 bg-[#10231f] p-5 text-white shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-200">Output</p>
              <h2 className="mt-1 text-xl font-semibold">{selectedLanguage?.name} translation</h2>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              disabled={!translatedText}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/15 text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              title="Copy translation"
              aria-label="Copy translation"
            >
              {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
            </button>
          </div>

          <div className="mt-5 min-h-48 rounded-md border border-white/10 bg-white/8 p-4">
            {status === "error" ? (
              <p className="text-sm leading-6 text-red-100">{error}</p>
            ) : translatedText ? (
              <p className="whitespace-pre-wrap text-lg leading-8">{translatedText}</p>
            ) : (
              <p className="text-sm leading-6 text-slate-300">
                Your translated text will appear here after RapidAPI returns a response.
              </p>
            )}
          </div>

          <div className="mt-5 rounded-md bg-emerald-300 px-4 py-3 text-sm font-semibold text-slate-950">
            {copied ? "Copied to clipboard" : "Ready for your favorite language"}
          </div>
        </aside>
      </section>

      {history.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 pb-8">
          <h2 className="text-lg font-semibold">Recent translations</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {history.map((item) => (
              <article key={item.id} className="rounded-lg border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{item.language}</p>
                <p className="mt-2 line-clamp-2 text-sm text-slate-600">{item.input}</p>
                <p className="mt-3 line-clamp-3 text-base font-semibold text-slate-950">{item.output}</p>
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

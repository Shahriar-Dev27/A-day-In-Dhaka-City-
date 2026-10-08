// Renders every spoken Bangla line (lib/voice.ts) with the local Byakto TTS, then masters it.
//
//   npm run audio:generate -- "E:\Professional\Web\claude\bangla-tts" [--only s2-o0,s5-n]
//   npm run audio:master                       (re-master the saved raw clips; no TTS needed)
//
// Raw clips are kept in .audio-raw/ (git-ignored); mastered clips go to public/audio/voice/.
// scripts/pronunciation.json maps a clip id to the text the TTS should read instead of the caption.
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { VOICE_CLIPS } from "../lib/voice.ts";
import { masterVoice, readWav, writeWav } from "./master-voice.mjs";

const SETTINGS = { engine: "Byakto / bangla-tts", speed: 0.85, iterations: Number(process.env.BANGLA_TTS_ITERS) || 200, pauseScale: 1.2 };

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const rawDir = path.join(root, ".audio-raw");
const outDir = path.join(root, "public/audio/voice");
const pronunciation = JSON.parse(readFileSync(path.join(root, "scripts/pronunciation.json"), "utf8"));

const args = process.argv.slice(2);
const onlyIndex = args.indexOf("--only");
const only = onlyIndex >= 0 ? new Set(args.splice(onlyIndex, 2)[1]?.split(",")) : null;
const ttsRoot = args[0] || process.env.BANGLA_TTS_DIR;
const masterOnly = process.env.npm_lifecycle_event === "audio:master" || args.includes("--master-only");

const spoken = (clip) => pronunciation[clip.id] ?? clip.bn;

function master() {
  mkdirSync(outDir, { recursive: true });
  const manifest = [];
  for (const clip of VOICE_CLIPS) {
    const rawPath = path.join(rawDir, `${clip.id}.wav`);
    if (!existsSync(rawPath)) throw new Error(`Missing raw clip ${clip.id}; run audio:generate first.`);
    const mastered = masterVoice(readWav(readFileSync(rawPath)));
    writeFileSync(path.join(outDir, `${clip.id}.wav`), writeWav(mastered.samples, mastered.rate));
    manifest.push({ id: clip.id, scene: clip.scene, kind: clip.kind, who: clip.who, text: clip.bn, ...(spoken(clip) !== clip.bn && { spoken: spoken(clip) }), file: `voice/${clip.id}.wav`, seconds: mastered.seconds });
  }
  // Drop clips for lines that no longer exist, including the old scene-N.wav files.
  const keep = new Set(VOICE_CLIPS.map((clip) => `${clip.id}.wav`));
  for (const file of readdirSync(outDir)) if (!keep.has(file)) rmSync(path.join(outDir, file));
  for (const file of readdirSync(path.join(root, "public/audio"))) if (/^scene-\d+\.wav$/.test(file)) rmSync(path.join(root, "public/audio", file));
  writeFileSync(path.join(root, "public/audio/narration.json"), JSON.stringify({ ...SETTINGS, clips: manifest }, null, 2) + "\n");
  writeReview(manifest);
  const total = manifest.reduce((sum, clip) => sum + clip.seconds, 0);
  console.log(`Mastered ${manifest.length} clips (${total.toFixed(1)}s) into public/audio/voice.`);
}

function writeReview(manifest) {
  const rows = manifest.map((clip) => `| ${clip.id} | ${clip.who} | ${clip.text} | ${clip.spoken ?? ""} | ${clip.seconds.toFixed(2)} | |`);
  writeFileSync(path.join(root, "docs/narration-review.md"), [
    "# Narration review",
    "",
    "Listen to each clip in `public/audio/voice/<id>.wav` and note any wrong pronunciation in the last column.",
    "To fix one, add `\"<id>\": \"respelled text\"` to `scripts/pronunciation.json`, then run",
    "`npm run audio:generate -- <tts folder> --only <id>`.",
    "",
    "| Clip | Speaker | Caption | Spoken as (override) | Seconds | Notes |",
    "|---|---|---|---|---|---|",
    ...rows,
    "",
  ].join("\n"));
}

function render() {
  if (!ttsRoot) {
    console.error('Usage: npm run audio:generate -- "E:\\Professional\\Web\\claude\\bangla-tts" [--only id,id]');
    process.exit(1);
  }
  const source = path.resolve(ttsRoot);
  const python = process.env.BANGLA_TTS_PYTHON || path.join(source, ".venv", process.platform === "win32" ? "Scripts/python.exe" : "bin/python");
  if (!existsSync(path.join(source, "bangla_tts.py")) || !existsSync(python)) {
    console.error("Cannot find bangla_tts.py or its virtualenv Python. Set BANGLA_TTS_PYTHON if needed.");
    process.exit(1);
  }
  const jobs = VOICE_CLIPS.filter((clip) => !only || only.has(clip.id)).map((clip) => ({ id: clip.id, text: spoken(clip) }));
  if (!jobs.length) {
    console.error("No clips match --only.");
    process.exit(1);
  }
  mkdirSync(rawDir, { recursive: true });
  const child = spawn(python, ["-B", "-u", path.join(root, "scripts/generate-narration.py"), source, rawDir, String(SETTINGS.iterations)], {
    cwd: source,
    stdio: ["pipe", "inherit", "inherit"],
    env: { ...process.env, PYTHONIOENCODING: "utf-8", PYTHONWARNINGS: "ignore" },
  });
  child.stdin.on("error", () => {}); // A failed Python startup is reported by its exit code.
  child.on("error", (error) => { console.error(error.message); process.exitCode = 1; });
  child.on("exit", (code) => {
    if (code !== 0) { process.exitCode = code ?? 1; return; }
    master();
  });
  child.stdin.end(JSON.stringify(jobs));
}

if (masterOnly) master();
else render();

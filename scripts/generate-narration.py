"""Offline adapter for the user's Python 3.6 Byakto TTS environment.

Reads [{"id", "text"}] from stdin and writes raw (unmastered) clips to the output folder as
<id>.wav. scripts/generate-narration.mjs masters them into public/audio/voice.
"""
import os
from pathlib import Path
import sys
import json
import wave

source = Path(sys.argv[1]).resolve()
output = Path(sys.argv[2]).resolve()
iters = int(sys.argv[3]) if len(sys.argv) > 3 else 200
sys.path.insert(0, str(source))
clips = json.loads(sys.stdin.buffer.read().decode("utf-8"))

# Fail before importing the engine if weights are absent; generation never downloads them.
for folder, name in [
    ("model1", "model_gs_301k.data-00000-of-00001"),
    ("model2", "model_gs_300k.data-00000-of-00001"),
]:
    if not (source / folder / name).is_file():
        raise RuntimeError("Missing local model weights: " + str(source / folder / name))

from bangla_tts import generate_long

output.mkdir(parents=True, exist_ok=True)
for number, clip in enumerate(clips, 1):
    target = output / (clip["id"] + ".wav")
    temporary = output / (clip["id"] + ".partial.wav")
    print("[{}/{}] {}: {}".format(number, len(clips), clip["id"], clip["text"]), flush=True)
    try:
        generate_long(clip["text"], save_path=str(temporary), speed=0.85, iters=iters, pause_scale=1.2)
        with wave.open(str(temporary), "rb") as audio:
            if audio.getnframes() == 0 or audio.getsampwidth() != 2:
                raise RuntimeError("TTS did not produce nonempty 16-bit PCM audio")
            seconds = audio.getnframes() / audio.getframerate()
        os.replace(str(temporary), str(target))
    finally:
        if temporary.exists():
            temporary.unlink()
    print("raw {} ({:.2f}s)".format(target.name, seconds), flush=True)

print("All raw clips generated.", flush=True)

import { flushSync } from "react-dom";

// Streaming helper for /v1/images/generations SSE responses.
// Calls onFrame(dataUrl, isFinal) as partial and final images arrive.
export async function streamImage(
  endpoint: string,
  prompt: string,
  onFrame: (dataUrl: string, isFinal: boolean) => void,
) {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  if (!res.ok || !res.body) {
    throw new Error(`Image stream failed: ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";

  const handleEvent = (raw: string) => {
    const dataLines = raw
      .split("\n")
      .filter((l) => l.startsWith("data:"))
      .map((l) => l.slice(5).trim());
    if (!dataLines.length) return;
    const payload = dataLines.join("");
    if (payload === "[DONE]") return;
    try {
      const evt = JSON.parse(payload);
      const b64 =
        evt?.b64_json ??
        evt?.data?.[0]?.b64_json ??
        evt?.partial_image_b64 ??
        evt?.image?.b64_json;
      if (!b64) return;
      const isFinal =
        evt?.type === "image_generation.completed" ||
        evt?.type === "image.completed" ||
        evt?.status === "completed" ||
        evt?.data?.[0]?.b64_json !== undefined;
      const url = `data:image/png;base64,${b64}`;
      // flushSync so partial frames actually paint between chunks
      flushSync(() => onFrame(url, !!isFinal));
    } catch {
      /* ignore parse errors on keep-alive lines */
    }
  };

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    let idx;
    while ((idx = buf.indexOf("\n\n")) !== -1) {
      const chunk = buf.slice(0, idx);
      buf = buf.slice(idx + 2);
      handleEvent(chunk);
    }
  }
  if (buf.trim()) handleEvent(buf);
}

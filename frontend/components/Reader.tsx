"use client";

import { useEffect, useRef, useState } from "react";
import type { Chapter } from "@/lib/library";

export default function Reader({ bookId, chapters, language }: { bookId: string; chapters: Chapter[]; language: string }) {
  const [part, setPart] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [rate, setRate] = useState(1);
  const [supported, setSupported] = useState(true);
  const run = useRef(0);

  useEffect(() => { setSupported("speechSynthesis" in window); const saved = Number(localStorage.getItem(`voxa-part-${bookId}`)); if (Number.isInteger(saved) && saved >= 0 && saved < chapters.length) setPart(saved); return () => { run.current++; window.speechSynthesis?.cancel(); }; }, [bookId, chapters.length]);
  function stop() { run.current++; window.speechSynthesis?.cancel(); setPlaying(false); }
  function select(index: number) { stop(); setPart(index); localStorage.setItem(`voxa-part-${bookId}`, String(index)); }
  function play() {
    if (!supported) return;
    if (playing) { stop(); return; }
    stop();
    const current = ++run.current;
    const text = chapters[part].text;
    const segments = text.match(/[\s\S]{1,180}/g) ?? [text];
    let index = 0;
    const speakNext = () => {
      if (current !== run.current) return;
      if (index >= segments.length) { setPlaying(false); return; }
      const utterance = new SpeechSynthesisUtterance(segments[index++]);
      utterance.rate = rate;
      utterance.lang = language.toLowerCase().startsWith("french") ? "fr" : language.toLowerCase().startsWith("spanish") ? "es" : "en";
      utterance.onend = speakNext;
      utterance.onerror = () => setPlaying(false);
      window.speechSynthesis.speak(utterance);
    };
    setPlaying(true); speakNext();
  }
  return <div className="reader"><div className="reader-top"><span className="eyebrow">Now listening</span><span>{part + 1} / {chapters.length}</span></div><h2>{chapters[part]?.title}</h2><div className="reader-controls"><button className="play-button" onClick={play} disabled={!supported} aria-label={playing ? "Stop reading" : "Play chapter"}>{playing ? "■" : "▶"}</button><div><strong>{playing ? "Reading aloud" : "Ready to listen"}</strong><small>{supported ? "Your browser reads this book aloud" : "This browser does not support speech playback"}</small></div><label className="speed-label">Speed <select value={rate} onChange={(event) => { stop(); setRate(Number(event.target.value)); }}><option value="0.75">0.75×</option><option value="1">1×</option><option value="1.25">1.25×</option><option value="1.5">1.5×</option><option value="2">2×</option></select></label></div><div className="part-nav"><button onClick={() => select(Math.max(0, part - 1))} disabled={part === 0}>← Previous</button><button onClick={() => select(Math.min(chapters.length - 1, part + 1))} disabled={part === chapters.length - 1}>Next part →</button></div><details className="chapter-text"><summary>Read along</summary><p>{chapters[part]?.text}</p></details></div>;
}

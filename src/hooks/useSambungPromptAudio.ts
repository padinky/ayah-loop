import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import {
  attachPromptAutoplay,
  noteAudioUserGesture,
  playAudioUrl,
} from "@/lib/audioPlayback";

export function useSambungPromptAudio(
  audioRef: RefObject<HTMLAudioElement | null>,
  roundKey: string | null,
  promptAudioUrl: string | undefined
) {
  const [promptAudioBlocked, setPromptAudioBlocked] = useState(false);

  const noteGesture = useCallback(() => {
    setPromptAudioBlocked(false);
    noteAudioUserGesture(audioRef.current);
  }, [audioRef]);

  const playPrompt = useCallback(
    async (url: string) => {
      const el = audioRef.current;
      if (!el) return false;
      try {
        await playAudioUrl(el, url);
        setPromptAudioBlocked(false);
        return true;
      } catch {
        setPromptAudioBlocked(true);
        return false;
      }
    },
    [audioRef]
  );

  useEffect(() => {
    if (!roundKey || !promptAudioUrl || !audioRef.current) return;
    setPromptAudioBlocked(false);
    return attachPromptAutoplay(audioRef.current, promptAudioUrl, () =>
      setPromptAudioBlocked(true)
    );
  }, [audioRef, roundKey, promptAudioUrl]);

  return { noteGesture, playPrompt, promptAudioBlocked };
}

/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useRef, memo, useEffect } from "react";
import { useAtom, useAtomValue } from "jotai";
import { settingAtom } from "@/components/atoms/setting-atom";
import { Word } from "@/types/word-type";
import { audioStatusAtom } from "@/components/atoms/audio-atom";
import { hafsFont, mequranFont } from "@/pages/_app";

interface WordComponentProps {
  verse: Word;
  isLast: boolean;
  highlight: boolean;
}

function WordComponent({ verse, isLast, highlight }: WordComponentProps) {
  const [isHover, setHover] = useState(false);
  const [globalPlay, setGlobalPlay] = useAtom(audioStatusAtom);
  const [playing, setPlay] = useState(false);
  const setting = useAtomValue(settingAtom);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    return () => {
      if (playing) {
        audioRef.current?.pause();
        setGlobalPlay(false);
      }
    };
  }, [playing]);

  const togglePlay = () => {
    if (playing || globalPlay || isLast) return;
    audioRef.current?.play();
    setPlay(true);
    setGlobalPlay(true);
  };

  return (
    <div
      onClick={() => {
        if (!isLast) togglePlay();
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`cursor-pointer flex flex-col items-center max-w-[130px] text-center ${(isHover || playing || highlight) && "text-sec-color-light text-glow"} ${
        (setting.wordByWord.translation || setting.wordByWord.transliteration) && setting.wordByWord.display.inline ? "p-2 ml-1 mb-2" : " ml-1 mb-5"
      }`}
    >
      <span dir="rtl" lang="ar" className={`${isLast ? `${hafsFont.className} hover:text-glow font-bold sm:text-3xl text-[6vw]` : mequranFont.className + " sm:text-2xl text-[5vw]"}`}>
        {verse.text}
      </span>
      {setting.wordByWord.transliteration && setting.wordByWord.display.inline && <p className="mt-1 text-[0.85rem] leading-5 font-normal">{verse.transliteration}</p>}
      {setting.wordByWord.translation && setting.wordByWord.display.inline && <p className="mt-1 text-[0.85rem] leading-5 font-normal">{verse.translation}</p>}
      <audio
        ref={audioRef}
        src={verse.audio_url}
        preload="none"
        onEnded={() => {
          setPlay(false);
          setGlobalPlay(false);
          
        }}
        onError={() => {
          setPlay(false);
          setGlobalPlay(false);
          
        }}
      ></audio>
      {isHover && !isLast && setting.wordByWord.display.tooltip && (setting.wordByWord.transliteration || setting.wordByWord.translation) && (
        <div className="z-10 absolute flex flex-col justify-center items-center -translate-y-[4.25rem] bg-gray-700 dark:bg-white text-white dark:text-pri-color-dark p-2 rounded before:w-7 before:h-7 before:absolute before:-bottom-1 before:rotate-45 before:bg-gray-700 dark:before:bg-white before:-z-[1] before:rounded">
          {setting.wordByWord.transliteration && <p className="text-[0.85rem] leading-5 font-normal">{verse.transliteration}</p>}
          {setting.wordByWord.translation && <p className="mt-1 text-[0.85rem] leading-5 font-normal">{verse.translation}</p>}
        </div>
      )}
    </div>
  );
}

const WordComponentMemo = memo(WordComponent);
export default WordComponentMemo;

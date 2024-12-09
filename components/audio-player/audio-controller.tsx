import { memo } from "react";
import Button from "../Surah-Page/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBackward, faForward, faPause, faPlay } from "@fortawesome/free-solid-svg-icons";
import { Timestamp } from "@/types/timestamps";
import { useAtom } from "jotai";
import { surahInfoAtom } from "../atoms/surah-info-atom";
import { audioStatusAtom, highlightAtom } from "../atoms/audio-atom";

function AudioControllerWithoutMemo({ playToggle, timestamp }: { playToggle: () => void; timestamp: Timestamp }) {
  const [surahInfo] = useAtom(surahInfoAtom);
  const [highlight] = useAtom(highlightAtom);
  const [audioPlay] = useAtom(audioStatusAtom);

  const wardHandler = (maxVerses: number, operator: number) => {
    let verseIndex = parseInt(highlight.split(":")[1]);
    if (verseIndex == maxVerses || !timestamp) return;
    const audio = document.querySelector<HTMLAudioElement>(".audio");
    if (!audio) return; //Jika audio tidak ada, keluar dari fungsi
    if (!timestamp || !timestamp.verse_timings) return; //Pastikan timeStamp dan verse_timings ada
    const index = verseIndex + operator - 2; //hitung index yang ingin diakses
    // Pastikan index valid
    if (index < 0 || index >= timestamp.verse_timings.length) return;
    const verseTiming = timestamp.verse_timings[index]; //ambil verse timings berdasarkan index
    // Pastikan verseTimings ada dan timestamp_from tidak undefined
           if (verseTiming && verseTiming.timestamp_from !== undefined) {
      audio.currentTime = verseTiming.timestamp_from * 0.001; //set current time Jika semua valid
    }
  };

  return (
    <div className="w-fit flex gap-4 text-xl">
      {surahInfo && (
        <>
          <Button onClick={() => wardHandler(1, -1)}>
            <FontAwesomeIcon icon={faBackward} />
          </Button>
          <Button onClick={playToggle}>{audioPlay ? <FontAwesomeIcon icon={faPause} /> : <FontAwesomeIcon icon={faPlay} />}</Button>
          <Button onClick={() => wardHandler(surahInfo?.ayahs, 1)}>
            <FontAwesomeIcon icon={faForward} />
          </Button>
        </>
      )}
    </div>
  );
}

const AudioController = memo(AudioControllerWithoutMemo);
export default AudioController;

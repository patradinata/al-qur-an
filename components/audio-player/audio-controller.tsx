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
  const [highlight, setHighlight] = useAtom(highlightAtom);
  const [audioPlay] = useAtom(audioStatusAtom);

  // Fungsi untuk navigasi Next & Previous
  const wardHandler = (operator: number) => {
    if (!highlight.includes(":")) return;

    let verseIndex = parseInt(highlight.split(":")[1]); // Ambil indeks ayat saat ini
    // console.log("Current Verse Index:", verseIndex);

    if (!timestamp || !timestamp.verse_timings) {
      return;
    }

    const maxVerses = surahInfo?.ayahs || timestamp.verse_timings.length; // Ambil jumlah ayat
    let newIndex = verseIndex + operator; // Hitung indeks baru

    if (newIndex < 1 || newIndex > maxVerses) {
      // console.log("New index out of range:", newIndex);
      return;
    }

    // Ambil waktu mulai ayat baru
    const verseTiming = timestamp.verse_timings[newIndex - 1];
    if (verseTiming && verseTiming.timestamp_from !== undefined) {
      // console.log("Seeking to:", verseTiming.timestamp_from);
      const audio = document.querySelector<HTMLAudioElement>(".audio");
      if (audio) {
        audio.currentTime = verseTiming.timestamp_from * 0.001; // Set waktu baru
      }
      setHighlight(`${verseTiming.verse_key}:1`); // Perbarui highlight ke ayat baru
    }
  };

  return (
    <div className="w-fit flex gap-4 text-xl">
      {surahInfo && (
        <>
          {/* Tombol Previous */}
          <Button
            onClick={() => {
              console.log("Prev button clicked");
              wardHandler(-1);
            }}
          >
            <FontAwesomeIcon icon={faBackward} />
          </Button>

          {/* Tombol Play/Pause */}
          <Button aria-describedby="Putar audio" onClick={playToggle}>
            {audioPlay ? <FontAwesomeIcon icon={faPause} /> : <FontAwesomeIcon icon={faPlay} />}
          </Button>

          {/* Tombol Next */}
          <Button
            onClick={() => {
              console.log("Next button clicked");
              wardHandler(1);
            }}
          >
            <FontAwesomeIcon icon={faForward} />
          </Button>
        </>
      )}
    </div>
  );
}

const AudioController = memo(AudioControllerWithoutMemo);
export default AudioController;

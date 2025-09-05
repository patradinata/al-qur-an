/* eslint-disable react-hooks/exhaustive-deps */
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faTimesCircle, faMicrophone, faMicrophoneSlash } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState, useRef } from "react";
import { CSSTransition } from "react-transition-group";
import { SurahInfo } from "@/types/surah-info-type";
import Link from "next/link";
import Fuse from "fuse.js";

// Type definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

// Fungsi untuk highlight kata yang dicari di teks
function highlightText(text: string, query: string) {
  if (!query) return text;
  const regex = new RegExp(`(${query.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-yellow-300 text-black">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export default function Search({ quranList }: { quranList: SurahInfo[] }) {
  const [searchQuery, setQuery] = useState("");
  const [isFocus, setFocus] = useState(false);
  const [isHover, setHover] = useState(false);
  const [searchResult, setResult] = useState<SurahInfo[]>([]);
  const [highlightIndex, setHighlightIndex] = useState<number>(-1);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Initialize SpeechRecognition
  useEffect(() => {
    if (typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
      const initializeRecognition = () => {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = "id-ID"; // Set language to Indonesian, adjust as needed

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = Array.from(event.results)
            .map((result) => result[0].transcript)
            .join("");
          setQuery(transcript);
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error("Speech recognition error:", event.error, event.message);
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        return recognition;
      };

      recognitionRef.current = initializeRecognition();
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setResult([]);
      setHighlightIndex(-1);
      setLoading(false);
      return;
    }

    setLoading(true);
    const delayDebounce = setTimeout(() => {
      const fuseResults = fuse.search(searchQuery.trim());
      const results = fuseResults.slice(0, 10).map((res) => res.item);
      setResult(results);
      setHighlightIndex(-1);
      setLoading(false);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, quranList]);

  const fuse = new Fuse(quranList, {
    keys: ["name"],
    threshold: 0.4,
    ignoreLocation: true,
  });

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (searchResult.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) => (prev < searchResult.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) => (prev > 0 ? prev - 1 : searchResult.length - 1));
    } else if (e.key === "Enter") {
      if (highlightIndex >= 0 && highlightIndex < searchResult.length) {
        const surahNumber = searchResult[highlightIndex].surah_number;
        window.location.href = `/${surahNumber}`;
      } else if (searchResult.length > 0) {
        window.location.href = `/${searchResult[0].surah_number}`;
      }
    } else if (e.key === "Escape") {
      setFocus(false);
      setHighlightIndex(-1);
      inputRef.current?.blur();
    }
  };

  const toggleSpeechRecognition = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      // Stop any existing recognition and reinitialize
      recognitionRef.current.stop();
      recognitionRef.current = null;

      // Reinitialize recognition
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "id-ID";

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join("");
        setQuery(transcript);
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error:", event.error, event.message);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };

      try {
        recognitionRef.current.start();
        setIsRecording(true);
        inputRef.current?.focus();
      } catch (error) {
        console.error("Failed to start speech recognition:", error);
        setIsRecording(false);
      }
    }
  };

  return (
    <>
      <div className="flex items-center relative w-full m-auto mb-3 text-gray-700 sm:w-4/6 md:w-3/6 p-2 sm:p-0">
        <div className="relative w-11/12">
          <input
            ref={inputRef}
            autoComplete="off"
            placeholder="Surah apa yang ingin kamu baca ?"
            type="search"
            name="search"
            id="search"
            enterKeyHint="enter"
            aria-describedby="Cari surah"
            title="cari surah"
            className="relative search-query p-3 pl-16 pr-16 rounded-l-full h-14 border-2 border-gray-200 w-full outline-none focus:border-blue-400 focus:ring-1 transition-all duration-200 ease-in-out"
            onBlur={() => {
              setTimeout(() => setFocus(false), 150);
            }}
            onFocus={() => {
              setFocus(true);
            }}
            onInput={(e) => {
              setQuery(e.currentTarget.value);
            }}
            onKeyDown={onKeyDown}
            value={searchQuery}
            aria-autocomplete="list"
            aria-controls="search-suggestion-list"
            aria-activedescendant={highlightIndex >= 0 ? `search-suggestion-${searchResult[highlightIndex].surah_number}` : undefined}
            role="combobox"
            aria-expanded={isFocus && searchQuery !== ""}
          />
          {/* Microphone button */}
          <button
            type="button"
            aria-label={isRecording ? "Stop recording" : "Start voice search"}
            onClick={toggleSpeechRecognition}
            className={`absolute left-3 top-1/2 -translate-y-1/2 focus:outline-none ${isRecording ? "text-red-500" : "text-gray-400 hover:text-gray-600"}`}
          >
            <FontAwesomeIcon icon={isRecording ? faMicrophoneSlash : faMicrophone} size="lg" />
          </button>
          {/* Clear button */}
          {searchQuery && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                setQuery("");
                setResult([]);
                setHighlightIndex(-1);
                inputRef.current?.focus();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <FontAwesomeIcon icon={faTimesCircle} size="lg" />
            </button>
          )}
          {/* Loading indicator */}
          {loading && (
            <div className="absolute right-10 top-1/2 -translate-y-1/2 animate-spin text-blue-500">
              <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
            </div>
          )}
        </div>

        <CSSTransition in={searchQuery !== "" && isFocus} unmountOnExit timeout={100} classNames={"search-suggest"}>
          <div id="search-suggestion-list" role="listbox" className="z-[5] absolute top-[70px] sm:top-16 drop-shadow-[0_0_3px_rgba(0,0,0,0.5)] w-[95%] max-h-[15rem] overflow-auto bg-white rounded-lg flex flex-col sm:w-[87%]">
            {searchResult.length > 0 ? (
              searchResult.map((e, i) => (
                <Link
                  id={`search-suggestion-${e.surah_number}`}
                  role="option"
                  aria-selected={highlightIndex === i}
                  className={`p-2 rounded cursor-pointer hover:bg-gray-200 ${highlightIndex === i ? "bg-blue-400 text-white" : ""}`}
                  key={e.surah_number}
                  href={`/${e.surah_number}`}
                  onMouseEnter={() => setHighlightIndex(i)}
                  onMouseLeave={() => setHighlightIndex(-1)}
                  onClick={() => setFocus(false)}
                >
                  {highlightText(e.name, searchQuery)}
                </Link>
              ))
            ) : (
              <p className="p-2 text-red-500">Tidak ditemukan hasil pencarian!</p>
            )}
          </div>
        </CSSTransition>

        <Link
          aria-label="cari-surah"
          href={searchResult.length > 0 && searchQuery != "" ? `/${searchResult[0].surah_number}` : ""}
          onMouseEnter={() => {
            setHover(true);
          }}
          onMouseLeave={() => {
            setHover(false);
          }}
          className={`z-[1] flex items-center justify-center overflow-hidden border-[3px] border-white hover:cursor-pointer w-20 h-14 rounded-r-full duration-500 ease-in-out transition-all search ring-0 focus:outline-none search from-sec-color-light dark:from-sec-color-dark dark:to-white to-white from-50% to-50% bg-gradient-to-r bg-clip-border ${
            isHover ? "search-100" : "search-0"
          }`}
        >
          <FontAwesomeIcon className={`duration-300 delay ease-in-out ${isHover ? "text-white" : "text-sec-color-light dark:text-pri-color-dark"}`} icon={faSearch} size={"lg"} />
        </Link>
      </div>
    </>
  );
}

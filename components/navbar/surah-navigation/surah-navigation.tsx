/* eslint-disable react-hooks/exhaustive-deps */
import { SurahInfo } from "@/types/surah-info-type";
import { useAtom } from "jotai";
import { surahInfoAtom } from "@/components/atoms/surah-info-atom";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import Fuse from "fuse.js";

function Highlight({ text, highlight }: { text: string; highlight: string }) {
  if (!highlight.trim()) return <>{text}</>;

  const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-yellow-300 dark:bg-yellow-600">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

export default function SurahNav({ quran }: { quran: Array<SurahInfo> | undefined }) {
  const [surahInfo] = useAtom(surahInfoAtom);
  const [searchResult, setResult] = useState<SurahInfo[]>([]);
  const [searchQuery, setQuery] = useState("");

  // Inisialisasi Fuse.js
  const fuse = useMemo(() => {
    if (!quran) return null;
    return new Fuse(quran, {
      keys: ["name", "surah_number"],
      threshold: 0.3,
      ignoreLocation: true,
      includeScore: true,
    });
  }, [quran]);

  useEffect(() => {
    if (!fuse || searchQuery.trim() === "") {
      setResult(quran || []);
      return;
    }
    const results = fuse.search(searchQuery);
    setResult(results.map((r) => r.item));
  }, [searchQuery, fuse, quran]);

  if (!quran || !surahInfo) return null;

  return (
    <div className="w-44">
      <div className="mb-2">
        <input
          type="search"
          placeholder="Cari Surah"
          value={searchQuery}
          onChange={(e) => setQuery(e.currentTarget.value)}
          className="w-full p-2 rounded-md border border-sec-color-light dark:border-gray-600 focus:outline-none focus:ring-1  dark:bg-gray-800 dark:text-white"
        />
      </div>

      <div className="max-h-80 overflow-y-auto flex flex-col">
        {searchResult.length === 0 ? (
          <div className="p-2 text-gray-500 dark:text-gray-400">Tidak ada hasil ditemukan</div>
        ) : (
          searchResult.map((e) => (
            <Link
              key={e.surah_number}
              href={`/${e.surah_number}`}
              className={`p-2 rounded-md  hover:bg-slate-100 dark:hover:bg-pri-color-dark cursor-pointer ${surahInfo.name === e.name ? "font-semibold bg-slate-100 dark:bg-pri-color-dark" : ""}`}
            >
              <Highlight text={`${e.surah_number}. ${e.name}`} highlight={searchQuery} />
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

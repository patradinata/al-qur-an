/* eslint-disable react-hooks/exhaustive-deps */
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { CSSTransition } from "react-transition-group";
import { SurahInfo } from "@/types/surah-info-type";
import { search } from "@/utils/search";
import Link from "next/link";

// Komponen Search
export default function Search({ quranList }: { quranList: SurahInfo[] }) {
  const [searchQuery, setQuery] = useState("");
  const [isFocus, setFocus] = useState(false);
  const [isHover, setHover] = useState(false);
  const [searchResult, setResult] = useState<SurahInfo[]>([]);

  useEffect(() => {
    // Fungsi debounce
    const delayDebounce = setTimeout(() => {
      // Melakukan filter pada daftar surah berdasarkan query pencarian
      setResult(quranList.filter((e) => search(e.name.toLowerCase(), searchQuery.toLowerCase())));
    }, 300); //Debounce selama 300ms

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, quranList]);

  return (
    <>
      <div className="flex items-center relative w-full m-auto mb-3 text-gray-700 sm:w-4/6 md:w-3/6 p-2 sm:p-0">
        <input
          autoComplete="off"
          placeholder="Surah apa yang ingin kamu baca ?"
          type="search"
          name="search"
          id="search"
          enterKeyHint="enter"
          aria-describedby="Cari surah"
          title="cari surah"
          className="relative search-query p-3 pl-8 rounded-l-full h-14 border-2 border-gray-200 w-11/12 outline-none focus:border-blue-400 focus:ring-1 transition-all duration-200 ease-in-out"
          onBlur={() => {
            setFocus(false);
          }}
          onFocus={() => {
            setFocus(true);
          }}
          onInput={(e) => {
            setQuery(e.currentTarget.value);
          }}
          value={searchQuery}
          // onKeyDown={(e) => {
          //   if (e.key === "Enter" && searchResult.length > 0) {
          //     window.location.href = `/${searchResult[0].surah_number}`;
          //   }
          // }}
        />
        <CSSTransition in={searchQuery !== "" && isFocus} unmountOnExit timeout={100} classNames={"search-suggest"}>
          <div className="z-[5] absolute top-[70px] sm:top-16 drop-shadow-[0_0_3px_rgba(0,0,0,0.5)] w-[95%] max-h-[15rem] overflow-hidden bg-white rounded-lg flex flex-col sm:w-[87%]">
            {searchResult.length > 0 ? (
              searchResult.map((e) => (
                <Link className="p-2 rounded cursor-pointer hover:bg-gray-200" key={e.surah_number} href={`/${e.surah_number}`}>
                  {e.name}
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

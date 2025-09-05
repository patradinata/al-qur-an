/* eslint-disable react-hooks/exhaustive-deps */
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState, useMemo } from "react";
import { CSSTransition } from "react-transition-group";
import { SurahInfo } from "@/types/surah-info-type";
import Fuse from "fuse.js";
import Link from "next/link";

export default function Search({ quranList }: { quranList: SurahInfo[] }) {
  const [searchQuery, setQuery] = useState("");
  const [isFocus, setFocus] = useState(false);
  const [isHover, setHover] = useState(false);
  const [searchResult, setResult] = useState<SurahInfo[]>([]);
  const [isLoading, setLoading] = useState(false);

  const fuse = useMemo(() => {
    return new Fuse(quranList, {
      keys: ["name"],
      threshold: 0.3,
      ignoreLocation: true,
    });
  }, [quranList]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setResult([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Simulasi delay pencarian agar loading terlihat
    const timeoutId = setTimeout(() => {
      const results = fuse.search(searchQuery);
      setResult(results.map((res) => res.item));
      setLoading(false);
    }, 500); // 300ms delay, sesuaikan jika perlu

    return () => clearTimeout(timeoutId);
  }, [searchQuery, fuse]);

  return (
    <>
      <div className="flex relative items-center w-full m-auto mb-2 text-gray-700 sm:w-4/6 md:w-3/6 p-2 sm:p-0">
        <input
          autoComplete="off"
          placeholder="Cari Nama Surah"
          type="search"
          name="search"
          id="search"
          className="relative search-query rounded-l-full p-2 pl-4 h-14 w-11/12 outline-none"
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
        />
        <CSSTransition in={searchQuery !== "" && isFocus} unmountOnExit timeout={100} classNames={"search-suggest"}>
          <div className="z-[5] absolute top-[70px] sm:top-16 drop-shadow-[0_0_3px_rgba(0,0,0,0.5)] w-[95%] max-h-[15rem] overflow-hidden bg-white rounded-lg flex flex-col sm:w-[87%]">
            {isLoading ? (
              <div className="flex justify-center items-center p-4 text-gray-500">
                <FontAwesomeIcon icon={faSpinner} spin size="lg" />
                <span className="ml-2">Loading...</span>
              </div>
            ) : searchResult.length > 0 ? (
              searchResult.map((e) => (
                <Link className="p-2 rounded cursor-pointer hover:bg-gray-200" key={e.surah_number} href={`/${e.surah_number}`}>
                  {e.name}
                </Link>
              ))
            ) : (
              <div className="p-2 text-gray-500">Tidak ada hasil ditemukan</div>
            )}
          </div>
        </CSSTransition>
        <Link
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

import { currentVerseAtom } from "@/components/atoms/nav-atom";
import { recentlyReadAtom } from "@/components/atoms/recently-read-atom";
import { surahInfoAtom } from "@/components/atoms/surah-info-atom";
import scrollToElement from "@/utils/scrollToElement";
import { useAtom } from "jotai";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import VerseBox from "./verse-box";

export default function versesContainner() {
  const router = useRouter();
  const [pages, setPages] = useState<undefined[]>();
  const [surahInfo] = useAtom(surahInfoAtom);
  const [currentVerse] = useAtom(currentVerseAtom);
  const [recentlyRead, setRecentlyRead] = useAtom(recentlyReadAtom);

  useEffect(() => {
    const verse = router.query.verse;
    if (!verse) return;

    setTimeout(() => {
      const verseElement = document.getElementById(`${surahInfo?.surah_number}: ${verse}`);
      if (!verseElement) return;

      scrollToElement(verseElement);
    }, 400);
  }, [router.isReady, surahInfo]);

  useEffect(() => {
    if (!surahInfo || recentlyRead.length >= 10) {
      recentlyRead.pop();
    }

    setRecentlyRead([
      {
        surahInfo,
        ayah: currentVerse,
      },
      ...recentlyRead,
    ]);
  }, [router.asPath]);

  useEffect(() => {
    if (!recentlyRead || currentVerse == "1") return;

    recentlyRead.splice(0, 1, {
      surahInfo,
      ayah: currentVerse,
    });

    setRecentlyRead(recentlyRead);
  }, [currentVerse]);

  useEffect(() => {
    if (!surahInfo) return;

    setPages(Array.from({ length: Math.ceil(surahInfo?.ayahs / 6) }, (_, i) => undefined));
  }, [surahInfo]);

  return <div>{pages && pages.map((e, i) => <VerseBox id={i + 1} key={i} />)}</div>;
}

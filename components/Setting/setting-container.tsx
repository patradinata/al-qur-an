import { useImmerAtom } from "jotai-immer";
import Translation from "./Setting-Sections/translation";
import WordByWord from "./Setting-Sections/wordByWord";
import { settingAtom } from "../atoms/setting-atom";
import { useEffect } from "react";

export default function SettingContainer() {
  const [setting, setSetting] = useImmerAtom(settingAtom);

  // 🔥 Gunakan useEffect agar `data-theme` berubah saat tema berubah
  useEffect(() => {
    if (setting.theme === 0) {
      document.documentElement.setAttribute("data-theme", "light");
    } else if (setting.theme === 1) {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.setAttribute("data-theme", "sepia");
    }
  }, [setting.theme]);

  return (
    <div className="p-2 w-full max-h-96 overflow-y-scroll">
      <div className="font-semibold text-base mb-2">Tema</div>

      <div className="flex relative rounded-full bg-slate-100 dark:bg-pri-color-dark text-sm p-2">
        <div
          className={`bg-white dark:bg-sec-color-dark h-9 w-[33%] absolute z-10 rounded-full drop-shadow-md transition duration-300 ease-in-out
            ${setting.theme === 1 ? "translate-x-[100%]" : setting.theme === 2 ? "translate-x-[200%]" : "translate-x-[0%]"}`}
        ></div>

        <button
          onClick={() =>
            setSetting((draft) => {
              draft.theme = 0;
            })
          }
          className="w-[33%] z-10 p-2"
        >
          Terang
        </button>
        <button
          onClick={() =>
            setSetting((draft) => {
              draft.theme = 1;
            })
          }
          className="w-[33%] z-10"
        >
          Gelap
        </button>
        <button
          onClick={() =>
            setSetting((draft) => {
              draft.theme = 2;
            })
          }
          className="w-[33%] z-10"
        >
          Sepia
        </button>
      </div>

      {/* 🔥 Garis pemisah */}
      <div className="w-full h-[1.5px] rounded-full bg-gray-700 dark:bg-zinc-300 my-4" />

      {/* 🔥 Bagian lainnya */}
      <WordByWord />
      <Translation />
      {/* <AdzanToggle /> */}
    </div>
  );
}

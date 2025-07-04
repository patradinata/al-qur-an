import SwitchButton from "../switch-button";

export default function WordByWord() {
  return (
    <>
      <div className="font-semibold text-base mb-2">Kata Demi Kata</div>
      <div className="flex flex-col font-normal">
        <SwitchButton
          text="Terjemahan"
          changeHandler={(setting) => {
            setting.wordByWord.translation = !setting.wordByWord.translation;
            return setting;
          }}
          checked={(setting) => setting.wordByWord.translation}
        />
        <SwitchButton
          text="Latin"
          changeHandler={(setting) => {
            setting.wordByWord.transliteration = !setting.wordByWord.transliteration;
            return setting;
          }}
          checked={(setting) => setting.wordByWord.transliteration}
        />
        <p className="text-sm my-3 font-medium">
          pembaca: <span className="font-bold italic">syeikh wisam syarief</span> klik pada kata untuk mendengarkan bacaannya.
        </p>
        <p className="text-xs font-medium">
          Sumber terjemahan kata demi kata :{" "}
          <a className="link font-semibold text-sky-400" href="https://quranwbw.com/">
            quranwbw
          </a>
        </p>
      </div>
      <div className="w-full h-[1.5px] rounded-full bg-zinc-300 my-4" />
      <div className="font-normal">
        <div>
          <div className="font-semibold text-base">Tampilan</div>
          <div className="flex flex-col">
            <SwitchButton
              text="In-Line"
              changeHandler={(setting) => {
                setting.wordByWord.display.inline = !setting.wordByWord.display.inline;
                return setting;
              }}
              checked={(setting) => setting.wordByWord.display.inline}
            />
            <SwitchButton
              text="Tooltip"
              changeHandler={(setting) => {
                setting.wordByWord.display.tooltip = !setting.wordByWord.display.tooltip;
                return setting;
              }}
              checked={(setting) => setting.wordByWord.display.tooltip}
            />
          </div>
        </div>
      </div>
      <div className="w-full h-[1.6px] rounded-full bg-gray-700 dark:bg-zinc-300 my-4" />
    </>
  );
}

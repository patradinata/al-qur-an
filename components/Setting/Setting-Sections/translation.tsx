import { checkCustomRoutes } from "next/dist/lib/load-custom-routes";
import SwitchButton from "../switch-button";
export default function Translation() {
  return (
    <>
      <div className="font-semibold text-base mb-3">Terjemahan</div>
      <div className="flex flex-col">
        <SwitchButton
          text="Latin"
          changeHandler={(setting) => {
            setting.translation.latin = !setting.translation.latin;
            return setting;
          }}
          checked={(setting) => setting.translation.latin}
        />
        <SwitchButton
          text="Terjemahan Bahasa Indonesia"
          changeHandler={(setting) => {
            setting.translation.id = !setting.translation.id;
            return setting;
          }}
          checked={(setting) => setting.translation.id}
        />
      </div>
    </>
  );
}

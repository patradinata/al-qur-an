/* eslint-disable react/no-unescaped-entities */
import Image from "next/image";
import Search from "./search";
import { SurahInfo } from "@/types/surah-info-type";
import { useAtom } from "jotai";
import { settingAtom } from "./atoms/setting-atom";
import Link from "next/link";

const NewLink = ({ children, href }: { children: React.ReactNode; href: string }) => {
  return (
    <Link href={href} className="w-fit py-2 px-3 bg-white rounded-full text-indigo-400   text-base hover:text-rose-400 hover:bg-slate-100 hover:glow">
      {children}
    </Link>
  );
};

export const recommendations = [
  {
    name: "Ayat Kursi",
    href: "/2?verse=255",
  },
  {
    name: "Surah Yasin",
    href: "/36",
  },
  {
    name: "Surah Al-Mulk",
    href: "/67",
  },
  {
    name: "Surah Al-Kahf",
    href: "/18",
  },
  // {
  //   name: "Surah Al-isra",
  //   href: "/17",
  // },
  // {
  //   name: "Surah Ar-Rahman",
  //   href: "/55",
  // },
];

export default function Header({ data }: { data: SurahInfo[] }) {
  const [settings] = useAtom(settingAtom);
  // setting header
  return (
    <header className=" bg-gradient-to-br dark:from-sec-color-dark dark:to-pri-color-dark from-pri-color-light to-thr-color-light flex-col p-2 pt-14 pb-8 flex">
      <div className="p-2 md:px-8">
        <div className="text-center">
          <div className="m-auto my-8 w-36 bg-white p-8 rounded-full relative top-2">
            <Image src={`${settings.theme ? "/quran-dark.svg" : "/quran.svg"}`} alt="qur'an logo" width={1000} height={1000} />
          </div>
        </div>
      </div>
      <Search quranList={data} />
      <div className="flex flex-wrap justify-center gap-3 w-full sm:w-4/6 md:w-3/6 pt-6 m-auto">
        <NewLink href={"/tentang-alquran"}>Apa Itu Al-Quran</NewLink>
        {recommendations.map(({ name, href }, i) => (
          <NewLink key={i} href={href}>
            {name}
          </NewLink>
        ))}
      </div>
    </header>
  );
}

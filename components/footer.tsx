import Link from "next/link";

const recommendations = [
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
    name: "Surah Ar-Rahman",
    href: "/55",
  },
  {
    name: "Surah Al-Waqi'ah",
    href: "/56",
  },
  {
    name: "Surah Al-Kahf",
    href: "/18",
  },
  {
    name: "Surah Al-Muzammil",
    href: "/73",
  },
  {
    name: "Surah Al-'Alaq",
    href: "/96",
  },
];

export default function Footer() {
  return (
    <div className="text-sm sm:text-base p-5 m-auto md:w-11/12 sm:flex sm:gap-32 mb-12 dark:border-zinc-300 border-t-2">
      <div className="flex-1 mb-10">
        <h1 className="text-xl font-semibold">Al-Quran</h1>
        <h2 className="text-sm sm:text-base font-bold my-2">Al-Quran dengan terjemahan dan tafsir bahasa Indonesia</h2>
        <p>
          Proyek ini terinspirasi dari website{" "}
          <a className="hover:text-sec-color-light underline hover:text-glow" href="https://quran.com">
            quran.com
          </a>
          .<br />
          Jika ada kesalahan pada terjemahan, pengetikan atau tampilan <a className="hover:text-sec-color-light underline hover:text-glow" href="#"></a> pada proyek ini silakan hubungi saya lewat{" "}
          <a className="hover:text-sec-color-light underline hover:text-glow" href="https://www.instagram.com/patra_dinata">
            IG
          </a>
          .
          <br />
        </p>
        <p className="text-xs font-medium sm:text-sm">
          &copy; 2024 Patra-Dinata |{" "}
          <a href="#" className="font-normal text-sm hover:text-sec-color-light hover:text-glow">
            Al-quran.App
          </a>{" "}
          All rights reserved.
        </p>
        <p className="font-medium hover:text-blue-400">Hak cipta dilindungi undang-undang</p>
      </div>
      <div className="flex-1">
        <h1 className="text-sm sm:text-base mb-2 font-semibold">Rekomendasi</h1>
        <div className="flex flex-wrap gap-3">
          {recommendations.map(({ name, href }, i) => (
            <Link className="p-2 border-[1.5px] rounded w-fit hover:text-sec-color-light hover:border-sec-color-light hover:glow" key={i} href={href}>
              {name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

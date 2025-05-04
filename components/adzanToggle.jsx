import { useEffect, useState } from "react";

const AdzanToggle = () => {
  const [isAdzanEnabled, setIsAdzanEnabled] = useState(typeof window !== "undefined" && localStorage.getItem("adzan_enabled") === "true");
  const [jadwal, setJadwal] = useState({});
  const [playedToday, setPlayedToday] = useState([]);
  const [nextSholat, setNextSholat] = useState("");
  const [countdown, setCountDown] = useState("");

  // Request permission untuk notifikasi sekali saat komponen mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  // Ambil jadwal sholat dari API
  useEffect(() => {
    const getJadwal = async () => {
      const url = `https://api.aladhan.com/v1/timingsByCity?city=Lampung&country=Indonesia&method=5`;
      try {
        const response = await fetch(url);
        const data = await response.json();
        setJadwal(data.data.timings);
      } catch (err) {
        console.error("Gagal mengambil jadwal:", err);
      }
    };
    getJadwal();
  }, []);

  // Simpan toggle ke localStorage
  useEffect(() => {
    localStorage.setItem("adzan_enabled", isAdzanEnabled);
  }, [isAdzanEnabled]);

  // Hitung countdown ke sholat berikutnya
  useEffect(() => {
    const interval = setInterval(() => {
      if (!jadwal) return;

      const now = new Date();
      const waktuSholat = [
        { nama: "Subuh", waktu: jadwal.Fajr },
        { nama: "Dzuhur", waktu: jadwal.Dhuhr },
        { nama: "Ashar", waktu: jadwal.Asr },
        { nama: "Maghrib", waktu: jadwal.Maghrib },
        { nama: "Isya", waktu: jadwal.Isha },
      ];

      for (let { nama, waktu } of waktuSholat) {
        if (!waktu) continue;

        const [h, m] = waktu.split(":");
        const waktuDate = new Date();
        waktuDate.setHours(parseInt(h), parseInt(m), 0, 0);

        if (now < waktuDate) {
          setNextSholat(nama);

          const diff = waktuDate - now;
          const hours = String(Math.floor(diff / 1000 / 60 / 60)).padStart(2, "0");
          const minutes = String(Math.floor((diff / 1000 / 60) % 60)).padStart(2, "0");
          const seconds = String(Math.floor((diff / 1000) % 60)).padStart(2, "0");

          setCountDown(`${hours}:${minutes}:${seconds}`);
          return;
        }
      }

      setNextSholat("-");
      setCountDown("00:00:00");
    }, 1000);

    return () => clearInterval(interval);
  }, [jadwal]);

  // Cek waktu setiap menit untuk adzan
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isAdzanEnabled || !jadwal) return;

      const now = new Date();
      const timeNow = now.toTimeString().slice(0, 5); // HH:MM
      const waktuSholat = [jadwal.Fajr, jadwal.Dhuhr, jadwal.Asr, jadwal.Maghrib, jadwal.Isha];

      waktuSholat.forEach((waktu) => {
        if (timeNow === waktu && !playedToday.includes(waktu)) {
          // Notifikasi
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("Waktu Shalat", {
              body: `Sudah masuk waktu shalat: ${waktu}`,
              icon: "/icons/azan.png",
            });
          }

          // Putar audio adzan
          const audio = new Audio("/audio/adzan_jiharkah.mp3");
          audio.play().catch((e) => console.log("Audio gagal diputar:", e));

          // Tandai sudah diputar
          setPlayedToday((prev) => [...prev, waktu]);
        }
      });

      // Reset harian
      if (timeNow === "00:00") {
        setPlayedToday([]);
      }
    }, 60000); // setiap 1 menit

    return () => clearInterval(interval);
  }, [isAdzanEnabled, jadwal, playedToday]);

  // Tombol Tes Adzan
  const playTestAdzan = () => {
    const audio = new Audio("/audio/adzan_jiharkah.mp3");
    audio.play().catch((e) => console.log("Gagal tes adzan:", e));
  };

  return (
    <div className="flex flex-col gap-2 mt-4">
      <label className="cursor-pointer flex items-center gap-2">
        <input type="checkbox" checked={isAdzanEnabled} onChange={(e) => setIsAdzanEnabled(e.target.checked)} />
        <span className="text-sm text-gray-700 dark:text-gray-300">Adzan Otomatis</span>
      </label>

      <button onClick={playTestAdzan} className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
        Tes Adzan Sekarang
      </button>

      {nextSholat && (
        <div className="text-sm text-gray-700 dark:text-gray-300">
          Sholat berikutnya: <strong>{nextSholat}</strong> dalam <span className="font-mono">{countdown}</span>
        </div>
      )}
    </div>
  );
};

export default AdzanToggle;

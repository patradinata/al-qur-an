import { useEffect, useState } from "react";
import * as Select from "@radix-ui/react-select";
import { CheckIcon, ChevronDownIcon, PlayIcon, PauseIcon, StopIcon } from "@radix-ui/react-icons";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const adzanToggle = () => {
  // State management
  const [isAdzanEnabled, setIsAdzanEnabled] = useState(false);
  const [selectedAdzan, setSelectedAdzan] = useState("jiharkah");
  const [jadwal, setJadwal] = useState(null);
  const [playedToday, setPlayedToday] = useState([]);
  const [nextSholat, setNextSholat] = useState("-");
  const [countdown, setCountDown] = useState("00:00:00");
  const [isLoading, setIsLoading] = useState(true);
  const [audioInstance, setAudioInstance] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Initialize from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsAdzanEnabled(localStorage.getItem("adzan_enabled") === "true");
      setSelectedAdzan(localStorage.getItem("selected_adzan") || "jiharkah");

      if ("Notification" in window && Notification.permission !== "granted") {
        Notification.requestPermission();
      }
    }
  }, []);

  // Fetch prayer times
  useEffect(() => {
    const fetchJadwal = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=Lampung&country=Indonesia&method=5`);
        const data = await res.json();
        setJadwal(data.data?.timings || {});
      } catch (error) {
        toast.error("Gagal mengambil jadwal sholat");
      } finally {
        setIsLoading(false);
      }
    };

    fetchJadwal();
    const interval = setInterval(fetchJadwal, 3600000); // Refresh hourly
    return () => clearInterval(interval);
  }, []);

  // Save settings
  useEffect(() => {
    localStorage.setItem("adzan_enabled", isAdzanEnabled);
    localStorage.setItem("selected_adzan", selectedAdzan);
  }, [isAdzanEnabled, selectedAdzan]);

  // Calculate next prayer time
  useEffect(() => {
    if (!jadwal) return;

    const updateCountdown = () => {
      const now = new Date();
      const currentTime = now.getTime(); // Waktu saat ini dalam milidetik

      const prayers = [
        { name: "Subuh", time: jadwal.Fajr },
        { name: "Dzuhur", time: jadwal.Dhuhr },
        { name: "Ashar", time: jadwal.Asr },
        { name: "Maghrib", time: jadwal.Maghrib },
        { name: "Isya", time: jadwal.Isha },
      ];

      // Cari sholat berikutnya
      let nextPrayer = null;
      let smallestDiff = Infinity;

      prayers.forEach((prayer) => {
        const [hours, minutes] = prayer.time.split(":").map(Number);
        const prayerTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes).getTime();

        // Jika waktu sholat sudah lewat hari ini, tambahkan 1 hari
        const diff = prayerTime > currentTime ? prayerTime - currentTime : prayerTime + 86400000 - currentTime;

        if (diff < smallestDiff) {
          smallestDiff = diff;
          nextPrayer = {
            name: prayer.name,
            time: diff,
          };
        }
      });

      if (nextPrayer) {
        setNextSholat(nextPrayer.name);

        // Konversi milidetik ke jam, menit, detik
        const totalSeconds = Math.floor(nextPrayer.time / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        setCountDown(`${String(hours).padStart(2, "0")}:` + `${String(minutes).padStart(2, "0")}:` + `${String(seconds).padStart(2, "0")}`);
      } else {
        setNextSholat("-");
        setCountDown("00:00:00");
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [jadwal]);

  // Auto-play adzan at prayer times
  useEffect(() => {
    if (!isAdzanEnabled || !jadwal) return;

    const checkPrayerTime = () => {
      const now = new Date();
      const timeNow = now.toTimeString().slice(0, 5);

      if (timeNow === "00:00") {
        setPlayedToday([]);
        return;
      }

      const prayers = [
        { name: "Subuh", time: jadwal.Fajr },
        { name: "Dzuhur", time: jadwal.Dhuhr },
        { name: "Ashar", time: jadwal.Asr },
        { name: "Maghrib", time: jadwal.Maghrib },
        { name: "Isya", time: jadwal.Isha },
      ];

      prayers.forEach(({ name, time }) => {
        if (timeNow === time && !playedToday.includes(time)) {
          playAdzan();
          setPlayedToday((prev) => [...prev, time]);

          if (Notification.permission === "granted") {
            new Notification(`Waktu Shalat ${name}`, {
              body: `Sudah masuk waktu shalat ${name}`,
            });
          }

          toast.info(`🕌 Waktu Shalat ${name} Telah Tiba!`);
        }
      });
    };

    const interval = setInterval(checkPrayerTime, 30000);
    return () => clearInterval(interval);
  }, [isAdzanEnabled, jadwal, playedToday, selectedAdzan]);

  // Audio control functions
  const playAdzan = () => {
    stopAdzan(); // Stop any currently playing audio

    const audio = new Audio(`/audio/adzan_${selectedAdzan}.mp3`);
    setAudioInstance(audio);

    audio
      .play()
      .then(() => setIsPlaying(true))
      .catch((e) => {
        console.error("Gagal memutar adzan:", e);
        toast.error("Gagal memutar adzan");
      });

    audio.onended = () => setIsPlaying(false);
  };

  const handleChangeAdzan = (value) => {
    stopAdzan(); // Hentikan audio saat mengganti pilihan
    setSelectedAdzan(value);

    toast.success(`Suara adzan diubah ke ${value === "jiharkah" ? "Adzan Jiharkah" : "Adzan Kurdi"}`, {
      position: "top-center",
      autoClose: 2000,
    });
  };

  const pauseAdzan = () => {
    if (audioInstance && isPlaying) {
      audioInstance.pause();
      setIsPlaying(false);
      toast.info("⏸ Adzan dijeda");
    }
  };

  const stopAdzan = () => {
    if (audioInstance) {
      audioInstance.pause();
      audioInstance.currentTime = 0;
      setIsPlaying(false);
    }
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioInstance) {
        audioInstance.pause();
        audioInstance.currentTime = 0;
      }
    };
  }, [audioInstance]);

  return (
    <div className="flex flex-col gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow max-w-md mx-auto">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-lg text-gray-800 dark:text-white">Pengaturan Adzan</h3>
        {isLoading && <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded animate-pulse">Memuat jadwal...</span>}
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-3 cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              className="sr-only"
              checked={isAdzanEnabled}
              onChange={(e) => {
                setIsAdzanEnabled(e.target.checked);
                toast.success(e.target.checked ? "🔔 Notifikasi adzan diaktifkan" : "🔕 Notifikasi adzan dimatikan");
              }}
            />
            <div className={`block w-10 h-6 rounded-full transition-colors ${isAdzanEnabled ? "bg-green-500" : "bg-gray-400"}`} />
            <div className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform ${isAdzanEnabled ? "transform translate-x-4" : ""}`} />
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{isAdzanEnabled ? "Adzan Aktif" : "Adzan Nonaktif"}</span>
        </label>

        <div className="flex gap-2">
          <button onClick={playAdzan} disabled={isPlaying} className="p-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50" title="Play">
            <PlayIcon />
          </button>
          <button onClick={pauseAdzan} disabled={!isPlaying} className="p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50" title="Pause">
            <PauseIcon />
          </button>
          <button onClick={stopAdzan} disabled={!audioInstance} className="p-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50" title="Stop">
            <StopIcon />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Pilih Suara Adzan</label>
        <Select.Root value={selectedAdzan} onValueChange={handleChangeAdzan} disabled={isLoading}>
          <Select.Trigger className="inline-flex items-center justify-between w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50">
            <Select.Value placeholder="Pilih Adzan" />
            <Select.Icon>
              <ChevronDownIcon />
            </Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Content className="z-50 bg-white dark:bg-gray-800 rounded-md shadow-lg">
              <Select.Viewport className="p-1">
                <Select.Item value="jiharkah" className="flex items-center justify-between px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                  <Select.ItemText>Adzan Jiharkah</Select.ItemText>
                  <Select.ItemIndicator>
                    <CheckIcon />
                  </Select.ItemIndicator>
                </Select.Item>
                <Select.Item value="kurdi" className="flex items-center justify-between px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                  <Select.ItemText>Adzan Kurdi</Select.ItemText>
                  <Select.ItemIndicator>
                    <CheckIcon />
                  </Select.ItemIndicator>
                </Select.Item>
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      </div>

      {jadwal && (
        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <span className="block">Sholat berikutnya:</span>
            <strong className="text-lg font-medium text-blue-600 dark:text-blue-400">{nextSholat}</strong>
            <span className="block mt-1 font-mono text-xl font-bold">{countdown}</span>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="colored" />
    </div>
  );
};

export default adzanToggle;

import { useEffect, useState } from "react";
import * as Select from "@radix-ui/react-select";
import { CheckIcon, ChevronDownIcon, PlayIcon, PauseIcon, StopIcon } from "@radix-ui/react-icons";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface PrayerTimes {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  [key: string]: string;
}

interface LocationData {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
}

interface Prayer {
  name: string;
  timeDiff: number;
}

interface PrayerTimeEntry {
  name: string;
  time: string;
}

const AdzanToggle = () => {
  // State management
  const [isAdzanEnabled, setIsAdzanEnabled] = useState<boolean>(false);
  const [selectedAdzan, setSelectedAdzan] = useState<string>("jiharkah");
  const [jadwal, setJadwal] = useState<PrayerTimes | null>(null);
  const [playedToday, setPlayedToday] = useState<string[]>([]);
  const [nextSholat, setNextSholat] = useState<string>("-");
  const [countdown, setCountDown] = useState<string>("00:00:00");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [audioInstance, setAudioInstance] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLocationLoading, setIsLocationLoading] = useState<boolean>(false);

  // Get user location
  const getGeoLocation = () => {
    setIsLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          await reverseGeocode(latitude, longitude);
        },
        (error) => {
          console.error("Geolocation Error", error);
          toast.error("Gagal mendapatkan lokasi, Menggunakan lokasi default");
          setDefaultLocation();
          setIsLocationLoading(false);
        },
        {
          timeout: 1000,
        }
      );
    } else {
      toast.warn("Browser tidak mendukung geolokasi. Menggunakan lokasi default");
      setDefaultLocation();
      setIsLocationLoading(false);
    }
  };

  const reverseGeocode = async (lat: number, lng: number): Promise<void> => {
    try {
      const API_KEY = "34f73417c2334613ae64481871f1f91c";
      const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${API_KEY}&language=en&pretty=1`);
      const data = await response.json();

      if (data.results?.length > 0) {
        const components = data.results[0].components;
        const locationData: LocationData = {
          city: components.city || components.town || components.village || "Lampung",
          country: components.country || "Indonesia",
          latitude: lat,
          longitude: lng,
        };
        setLocation(locationData);
        toast.success(`Lokasi terdeteksi: ${locationData.city}, ${locationData.country}`);
      } else {
        throw new Error("Lokasi tidak ditemukan");
      }
    } catch (error) {
      console.error("Reverse geocoding error", error);
      toast.error("Gagal mendapatkan lokasi, Menggunakan kordinat saja");
      setLocation({
        city: "Lampung",
        country: "Indonesia",
        latitude: lat,
        longitude: lng,
      });
    } finally {
      setIsLocationLoading(false);
    }
  };

  // set default lokasi
  const setDefaultLocation = (): void => {
    setLocation({
      city: "Lampung",
      country: "Indonesia",
      latitude: -5.45,
      longitude: 105.26667,
    });
  };

  // inisialisasi local storage dan get location
  useEffect(() => {
    const loadSettings = (): void => {
      if (typeof window !== "undefined") {
        setIsAdzanEnabled(localStorage.getItem("adzan_enabled") === "true");
        setSelectedAdzan(localStorage.getItem("adzan") || "jiharkah");

        if ("Notification" in window && Notification.permission !== "granted") {
          Notification.requestPermission().then((permission) => {
            if (permission !== "granted") {
              toast.warn("Izin lokasi ditolak, anda tidak akan menerima pemberitahuan adzan");
            }
          });
        }
      }
    };

    loadSettings();
    getGeoLocation();
  }, []);

  // Fetch prayer times based on location
  const fetchPrayerTimes = async (): Promise<void> => {
    if (!location) return;

    setIsLoading(true);
    try {
      const response = await fetch(`https://api.aladhan.com/v1/timings?latitude=${location.latitude}&longitude=${location.longitude}&method=5`);
      const data = await response.json();

      if (data.data?.timings) {
        setJadwal(data.data.timings);
        toast.success(`Jadwal sholat diperbarui untuk ${location.city}`);
      } else {
        throw new Error("Format jadwal tidak valid");
      }
    } catch (error) {
      console.error("Gagal mengambil jadwal", error);
      toast.error("Gagal memuat jadwal sholat, coba lagi nanti ");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (location) {
      fetchPrayerTimes();
      const interval = setInterval(fetchPrayerTimes, 3600000); //refresh every hour
      return () => clearInterval(interval);
    }
  }, [location]);

  // Calculate next prayer time with countdown
  useEffect(() => {
    if (!jadwal) return;

    const updateCountDown = (): void => {
      const now = new Date();
      const currentTime = now.getTime(); // Waktu saat ini dalam milidetik

      const prayers: PrayerTimeEntry[] = [
        { name: "Subuh", time: jadwal.Fajr },
        { name: "Dzuhur", time: jadwal.Dhuhr },
        { name: "Ashar", time: jadwal.Asr },
        { name: "Maghrib", time: jadwal.Maghrib },
        { name: "Isya", time: jadwal.Isha },
      ];

      let nextPrayer: Prayer | null = null;
      let smallestTimeDiff = Infinity;

      for (const prayer of prayers) {
        const timeparts = prayer.time.split(":");
        const hours = parseInt(timeparts[0], 10);
        const minutes = parseInt(timeparts[1], 10);
        const prayerTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes).getTime();

        const timeDiff = prayerTime > currentTime ? prayerTime - currentTime : prayerTime + 86400000 - currentTime; // Waktu selisih dalam milidetik
        if (timeDiff < smallestTimeDiff) {
          smallestTimeDiff = timeDiff;
          nextPrayer = {
            name: prayer.name,
            timeDiff: timeDiff,
          };
        }
      }

      if (nextPrayer) {
        setNextSholat(nextPrayer.name);
        const totalSeconds = Math.floor(nextPrayer.timeDiff / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        setCountDown(`${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`);
      } else {
        setNextSholat("-");
        setCountDown("00:00:00");
      }
    };

    updateCountDown();
    const interval = setInterval(updateCountDown, 1000);
    return () => clearInterval(interval);
  }, [jadwal]);

  // Auto-play adzan at prayer times
  useEffect(() => {
    if (!isAdzanEnabled || !jadwal) return;

    const checkPrayerTime = (): void => {
      const now = new Date();
      const timeNow = now.toTimeString().slice(0, 5);

      if (timeNow === "00:00") {
        setPlayedToday([]); // reset played today
        return;
      }

      const prayers: PrayerTimeEntry[] = [
        { name: "Subuh", time: jadwal.Fajr },
        { name: "Dzuhur", time: jadwal.Dhuhr },
        { name: "Ashar", time: jadwal.Asr },
        { name: "Maghrib", time: jadwal.Maghrib },
        { name: "Isha", time: jadwal.Isha },
      ];

      for (const prayer of prayers) {
        if (timeNow === prayer.time && !playedToday.includes(prayer.time)) {
          playAdzan();
          setPlayedToday((prev) => [...prev, prayer.time]);

          if (Notification.permission === "granted") {
            new Notification(`Waktu shalat ${prayer.name}`, {
              body: `Sudah masuk waktu shalat ${prayer.name}`,
              icon: "/icons/azan.png",
            });
          }

          toast.info(`Waktu sholat ${prayer.name} telah tiba!`, {
            position: "top-center",
            autoClose: 1000,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            theme: "colored",
          });
        }
      }
    };

    const interval = setInterval(checkPrayerTime, 2000);
    return () => clearInterval(interval);
  }, [isAdzanEnabled, jadwal, playedToday, selectedAdzan]);

  // audio controls function
  const playAdzan = (): void => {
    stopAdzan();
    const audio = new Audio(`/audio/adzan_${selectedAdzan}.mp3`);
    setAudioInstance(audio);

    audio
      .play()
      .then(() => setIsPlaying(true))
      .catch((error) => {
        console.error("Gagal memutar adzan", error);
        toast.error("Gagal memutar adzan, pastikan file audio tersedia");
      });

    audio.onended = () => setIsPlaying(false);
  };

  const pauseAdzan = (): void => {
    if (audioInstance && isPlaying) {
      audioInstance.pause();
      setIsPlaying(false);
      toast.info("⏸ Adzan dijeda", {
        position: "top-right",
        autoClose: 1000,
      });
    }
  };

  const stopAdzan = (): void => {
    if (audioInstance) {
      audioInstance.pause();
      audioInstance.currentTime = 0;
      setIsPlaying(false);
      toast.info("⏹ Adzan dihentikan", {
        position: "top-right",
        autoClose: 2000,
      });
    }
  };

  const handleChangeAdzan = (value: string): void => {
    stopAdzan(); //hentikan audio saat mengganti pilihan
    setSelectedAdzan(value);
    localStorage.setItem("adzan", value);
    toast.success(`Suara adzan diubah ke ${value === "jiharkah" ? "adzan jiharkah" : "adzan kurdi"}`, {
      position: "top-right",
      autoClose: 2000,
    });
  };

  // Clean up audio component
  useEffect(() => {
    return () => {
      if (audioInstance) {
        audioInstance.pause();
        audioInstance.currentTime = 0;
      }
    };
  }, [audioInstance]);

  return (
    <div className="max-h-screen  rounded-lg bg-white">
      {/* Location info */}
      <div className="p-3 bg-slate-300 dark:bg-sec-color-dark rounded-lg">
        {isLocationLoading ? (
          <div className="flex items-center gap-3">
            <span className="animate-spin">Mendeteksi Lokasi....</span>
          </div>
        ) : location ? (
          <div className="text-sm text-slate-500 dark:text-white flex flex-col justify-center w-full md:items-center">
            <span className="font-bold">Lokasi: </span>
            {location.city}, {location.country}
            <button onClick={getGeoLocation} className="text-sm m-2 bg-pri-color-dark px-4 py-2 text-white rounded-md hover:text-slate-100 dark:text-white">
              Perbarui
            </button>
          </div>
        ) : (
          <div className="text-sm text-amber-300 dark:text-amber-400">Lokasi tidak tersedia!</div>
        )}
      </div>

      <div className="flex items-center justify-evenly py-2">
        <h3 className="font-bold text-lg text-slate-600 dark:text-slate-300">Pengaturan adzan</h3>
        {isLoading && <span className="text-xs px-2 py-1 bg-sky-400 text-amber-300  rounded animate-pulse">memuat jadwal shalat...</span>}
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-3 cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              className="sr-only"
              checked={isAdzanEnabled}
              onChange={(e) => {
                const enabled = e.target.checked;
                setIsAdzanEnabled(enabled);
                localStorage.setItem("adzan_enabled", enabled.toString());
                toast.success(enabled ? "🔔 Notifikasi adzan diaktifkan" : "🔕 Notifikasi adzan dimatikan", { position: "top-right", autoClose: 3000 });
              }}
            />
            <div className={`block w-10 h-6 rounded-full transition-colors ${isAdzanEnabled ? "bg-green-500" : "bg-gray-500"}`} />
            <div className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform ${isAdzanEnabled ? "transform translate-x-4" : ""}`} />
          </div>
          <span className="text-xs font-medium p-0 flex-1 text-gray-700 dark:text-gray-300">{isAdzanEnabled ? "Adzan Aktif" : "Adzan Nonaktif"}</span>
        </label>

        <div className="flex gap-4">
          <button onClick={playAdzan} disabled={isPlaying} className="p-2 bg-amber-400 text-white rounded-full hover:bg-amber-300 disabled:opacity-60" title="Putar adzan">
            <PlayIcon />
          </button>
          <button onClick={pauseAdzan} disabled={!isPlaying} className="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-400 disabled:opacity-50" title="Jeda adzan">
            <PauseIcon />
          </button>
          <button onClick={stopAdzan} disabled={!isPlaying} className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-400 disabled:opacity-50" title="Hentikan adzan">
            <StopIcon />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Pilih Suara Adzan</label>
        <Select.Root value={selectedAdzan} onValueChange={handleChangeAdzan} disabled={isLoading}>
          <Select.Trigger className="flex items-center justify-between w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-400 dark:border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-1 focus:ring-sky-400 focus:border-sky-600  dark:focus:ring-sky-300 dark:focus:border-sky-300 disabled:opacity-50">
            <Select.Value placeholder="Pilih Suara Adzan" />
            <Select.Icon>
              <ChevronDownIcon />
            </Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Content className="z-50 bg-white dark:bg-gray-800 rounded-md shadow-lg">
              <Select.Viewport className="p-1">
                <Select.Item value="jiharkah" className="flex items-center justify-between px-3 py-2 text-sm cursor-pointer hover:bg-pri-color-light dark:text-white rounded-md ">
                  <Select.ItemText>Adzan Jiharkah</Select.ItemText>
                  <Select.ItemIndicator>
                    <CheckIcon />
                  </Select.ItemIndicator>
                </Select.Item>
                <Select.Item value="kurdi" className="flex items-center justify-between px-3 py-2 text-sm cursor-pointer hover:bg-pri-color-light dark:text-white  rounded-md">
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
        <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg space-y-2">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <span className="block">Sholat Berikutnya:</span>
            <strong className="text-lg font-medium text-slate-500 dark:text-slate-600">{nextSholat}</strong>
            <span className="block mt-1 font-sans text-xl font-bold">{countdown}</span>
          </div>
        </div>
      )}

      <ToastContainer
        position="top-left"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        toastClassName="!w-[90vw] sm:!w-[320px] !max-w-full text-sm p-3 rounded shadow-lg"
      />
    </div>
  );
};

export default AdzanToggle;

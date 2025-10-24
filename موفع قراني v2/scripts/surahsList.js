import { listOfSurahs, getAyatOfSurah } from "../data/data.js";
let currentSurahNumber = null; 
// دالة تحذف التشكيل من النص
function removeTashkeel(str) {
  return str.normalize("NFD").replace(/[\u064B-\u0652]/g, "");
}

function renderQuransList() {
  const surahList = document.getElementById("surah-list");
  let html = "";

  listOfSurahs.forEach((surah) => {
    html += `
      <div id="surah-list-div" class="flex items-center justify-between cursor-pointer p-2 hover:bg-gray-100 rounded-lg surah-btn"
           data-surah-number="${surah.number}"
           data-revelation-place="${surah.revelationType}"
           
           >
        <div class="font-bold text-lg">${surah.name}</div>
        <div class="text-sm text-gray-500">
          ${surah.revelationType === "Medinan" ? "مدنية" : "مكية"} — ${
      surah.numberOfAyahs
    } آية
        </div>
        <div class="text-gray-400 text-sm">${surah.number}</div>
      </div>
    `;
  });

  surahList.innerHTML = html;
  // انسخ نفس القائمة للموبايل
const mobileList = document.getElementById("mobile-surah-list");
const desktopList = document.getElementById("surah-list");

if (mobileList && desktopList) {
  mobileList.innerHTML = desktopList.innerHTML;
}
  showSurah();
}

function searchQuaransList() {
  const searchInput = document.getElementById("search");
  const surahList = document.getElementById("surah-list");

  searchInput.addEventListener("input", () => {
    const searchValue = removeTashkeel(searchInput.value.trim().toLowerCase());
    let filtered = [];

    if (searchValue === "") {
      filtered = listOfSurahs;
    } else {
      filtered = listOfSurahs.filter((surah) => {
        const cleanName = removeTashkeel(surah.name.toLowerCase());
        return cleanName.includes(searchValue);
      });
    }

    if (filtered.length === 0) {
      surahList.innerHTML = `<div class="text-center text-gray-400 mt-4">لا توجد نتائج مطابقة</div>`;
      return;
    }

    let html = "";
    filtered.forEach((surah) => {
      html += `
        <div class="flex items-center justify-between cursor-pointer p-2 hover:bg-gray-100 rounded-lg surah-btn"
             data-surah-number="${surah.number}"
             data-revelation-place="${surah.revelationType}">
          <div class="font-bold text-lg">${surah.name}</div>
          <div class="text-sm text-gray-500">
            ${surah.revelationType === "Medinan" ? "مدنية" : "مكية"} — ${
        surah.numberOfAyahs
      } آية
          </div>
          <div class="text-gray-400 text-sm">${surah.number}</div>
        </div>
      `;
    });

    surahList.innerHTML = html;
    showSurah();
  });
}


function showSurah() {
  const surahBtns = document.querySelectorAll(".surah-btn");
  const versesContainer = document.getElementById("verses");
  const titleEl = document.getElementById("surah-title");
  const infoEl = document.getElementById("surah-info");
  const toggleTranslation = document.getElementById("toggle-translation");

  surahBtns.forEach((button) => {
    button.addEventListener("click", async () => {
      const surahNumber = button.dataset.surahNumber;
      const reciter = document.getElementById("reciter").value;

      // نجلب السورة والترجمة
      const { ayatOfSurah, dataTranslation } = await getAyatOfSurah(surahNumber, reciter);

      // تحديث العنوان والمعلومات
      titleEl.innerHTML = `
        <h2 class="text-2xl font-bold text-center text-green-700 mb-4">
          ${ayatOfSurah.name}
        </h2>
      `;
      infoEl.innerHTML = `عدد الآيات: ${ayatOfSurah.numberOfAyahs} | 
        مكان النزول: ${ayatOfSurah.revelationType === "Medinan" ? "مدنية" : "مكية"}
      `;

      // عرض الآيات
      let html = "";
      ayatOfSurah.ayahs.forEach((aya, i) => {
        const translationText = dataTranslation.ayahs[i]?.text || "ترجمة غير متوفرة";
        html += `
          <div class="bg-white dark:bg-gray-800 p-4 mb-3 rounded-xl shadow-sm hover:shadow-md transition-all">
            <p class="text-xl text-gray-800 dark:text-gray-100 leading-loose text-right">
              ${aya.text}
              <span class="text-green-600 text-sm ml-1">﴿${aya.numberInSurah}﴾</span>
            </p>
            <p class="translation text-gray-600 dark:text-gray-300 mt-2 ${
              toggleTranslation.checked ? "" : "hidden"
            }">
              <i>— ${translationText}</i>
            </p>
          </div>
        `;
      });

      versesContainer.innerHTML = html;

      // تشغيل الصوت
      audioPlayer(ayatOfSurah);
    });
  });

  // تحديث الترجمة عند تغيير الحالة
  toggleTranslation.addEventListener("change", () => {
    document.querySelectorAll(".translation").forEach((el) => {
      el.classList.toggle("hidden", !toggleTranslation.checked);
    });
  });
}
document.getElementById('reciter').addEventListener('change', async (e) => {
  if (currentSurahNumber) {
    const newReciter = e.target.value;
    const ayatOfSurah = await getAyatOfSurah(currentSurahNumber, newReciter);
    
    audioPlayer(ayatOfSurah);
  }
});

function audioPlayer(ayatOfSurah) {
  const audio = document.getElementById("audio-player");
  let currentIndex = 0; // رقم الآية الحالية

  // دالة لتشغيل الآية الحالية
  function playCurrentAya() {
    audio.src = ayatOfSurah.ayahs[currentIndex].audio;
    audio.play();
  }

  // لما تكمل الآية، انتقل للي بعدها
  audio.addEventListener("ended", () => {
    currentIndex++;
    if (currentIndex < ayatOfSurah.ayahs.length) {
      playCurrentAya();
    } else {
      console.log("انتهت السورة ✅");
    }
  });

  // نبدأ التشغيل من أول آية
  playCurrentAya();
}


renderQuransList();
searchQuaransList();

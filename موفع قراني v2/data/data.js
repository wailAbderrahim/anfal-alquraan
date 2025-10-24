
async function getListOfSurahs() {
  const response = await fetch(`https://api.alquran.cloud/v1/surah`);
  const data = await response.json();

  const listOfSurahs = data.data
  return listOfSurahs
}

export async function getAyatOfSurah(number= 1, reciter = 'ar.alafasy'){
  const response = await fetch(`https://api.alquran.cloud/v1/surah/${number}/${reciter}`);
  const data = await response.json();
  const responseTranslation = await fetch(`https://api.alquran.cloud/v1/surah/${number}/en.asad`);
  const dataTranslation = await responseTranslation.json();

  const ayatOfSurah = data.data;
  const translatedaAyatOfSurah = dataTranslation.data
  return {
    ayatOfSurah:ayatOfSurah,
    dataTranslation: translatedaAyatOfSurah

  }
}

export const listOfSurahs =  await getListOfSurahs();


 
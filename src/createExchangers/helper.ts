export function splitReadable(word: string): string {
  // --- 1️⃣ Транслитерация кириллицы ---
  const translitMap: Record<string, string> = {
    а: "a",
    б: "b",
    в: "v",
    г: "g",
    д: "d",
    е: "e",
    ё: "e",
    ж: "zh",
    з: "z",
    и: "i",
    й: "y",
    к: "k",
    л: "l",
    м: "m",
    н: "n",
    о: "o",
    п: "p",
    р: "r",
    с: "s",
    т: "t",
    у: "u",
    ф: "f",
    х: "kh",
    ц: "ts",
    ч: "ch",
    ш: "sh",
    щ: "shch",
    ы: "y",
    э: "e",
    ю: "yu",
    я: "ya",
    ъ: "",
    ь: "",
    А: "A",
    Б: "B",
    В: "V",
    Г: "G",
    Д: "D",
    Е: "E",
    Ё: "E",
    Ж: "Zh",
    З: "Z",
    И: "I",
    Й: "Y",
    К: "K",
    Л: "L",
    М: "M",
    Н: "N",
    О: "O",
    П: "P",
    Р: "R",
    С: "S",
    Т: "T",
    У: "U",
    Ф: "F",
    Х: "Kh",
    Ц: "Ts",
    Ч: "Ch",
    Ш: "Sh",
    Щ: "Shch",
    Ы: "Y",
    Э: "E",
    Ю: "Yu",
    Я: "Ya",
    Ъ: "",
    Ь: "",
  };

  word = word.replace(/[А-яЁё]/g, (char) => translitMap[char] ?? "");

  // --- 2️⃣ Разбиваем если нет пробелов или дефиса ---
  if (!/[\s-]/.test(word)) {
    word = word
      .replace(/([A-Z]+)(?=[A-Z][a-z]|[0-9]|$)/g, " $1")
      .replace(/([0-9]+)/g, " $1 ")
      .replace(/([a-z])([A-Z])/g, (_, p1, p2) => `${p1} ${p2.toUpperCase()}`)
      .replace(/\s+/g, " ")
      .trim();
  }

  // --- 3️⃣ Фильтруем недопустимые символы ---
  word = word.replace(/[^A-Za-z0-9\s-]/g, "");

  // --- 4️⃣ CapitalCase для слов и частей с дефисом ---
  let words = word.split(" ").map((w) => {
    if (w.includes("-")) {
      return w
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("-");
    }
    return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
  });

  // --- 5️⃣ Если слово короче 2 букв, присоединяем к следующему ---
  const mergedWords: string[] = [];
  for (let i = 0; i < words.length; i++) {
    if (words[i].length < 2 && i < words.length - 1) {
      mergedWords.push(words[i] + words[i + 1]);
      i++;
    } else {
      mergedWords.push(words[i]);
    }
  }

  return mergedWords.join(" ").trim();
}

export interface ExtraSection {
  title: string;
  type: "list" | "text";
  items?: string[];
  content?: string;
}

export interface ParsedScholarship {
  name: string;
  name_en: string;
  id: string;
  country: string;
  flag: string;
  degree: string;
  language: string;
  open: boolean;
  open_date: string;
  deadline: string;
  description: string;
  benefits: string[];
  requirements: string[];
  majors: string[];
  requiredFiles: string[];
  optionalFiles: string[];
  link: string;
  groupLink: string;
  discussionLink: string;
  notes: string;
  extraSections: ExtraSection[];
  warnings: string[];
}

const COUNTRY_MAP: Record<string, string> = {
  مصر: "eg",
  "جمهورية مصر العربية": "eg",
  السعودية: "sa",
  "المملكة العربية السعودية": "sa",
  الإمارات: "ae",
  "الإمارات العربية المتحدة": "ae",
  امارات: "ae",
  تركيا: "tr",
  المجر: "hu",
  ألمانيا: "de",
  المانيا: "de",
  بريطانيا: "gb",
  "المملكة المتحدة": "gb",
  إنجلترا: "gb",
  انجلترا: "gb",
  أمريكا: "us",
  امريكا: "us",
  "الولايات المتحدة": "us",
  "الولايات المتحدة الأمريكية": "us",
  كندا: "ca",
  روسيا: "ru",
  الصين: "cn",
  اليابان: "jp",
  فرنسا: "fr",
  إيطاليا: "it",
  ايطاليا: "it",
  إسبانيا: "es",
  اسبانيا: "es",
  ماليزيا: "my",
  قطر: "qa",
  الكويت: "kw",
  البحرين: "bh",
  عمان: "om",
  عُمان: "om",
  "سلطنة عمان": "om",
  اليمن: "ye",
  العراق: "iq",
  سوريا: "sy",
  لبنان: "lb",
  فلسطين: "ps",
  تونس: "tn",
  الجزائر: "dz",
  المغرب: "ma",
  "كوريا الجنوبية": "kr",
  كوريا: "kr",
  أستراليا: "au",
  استراليا: "au",
  نيوزيلندا: "nz",
  هولندا: "nl",
  بلجيكا: "be",
  سويسرا: "ch",
  النمسا: "at",
  السويد: "se",
  النرويج: "no",
  الدنمارك: "dk",
  فنلندا: "fi",
  إندونيسيا: "id",
  اندونيسيا: "id",
  الهند: "in",
  باكستان: "pk",
  بروناي: "bn",
  أذربيجان: "az",
  اذربيجان: "az",
  رومانيا: "ro",
  بولندا: "pl",
  قبرص: "cy",
  اليونان: "gr",
  الأردن: "jo",
  الاردن: "jo",
};

const ISO_TO_STANDARD_ARABIC: Record<string, string> = {
  eg: "مصر",
  sa: "السعودية",
  ae: "الإمارات",
  tr: "تركيا",
  hu: "المجر",
  de: "ألمانيا",
  gb: "بريطانيا",
  us: "أمريكا",
  ca: "كندا",
  ru: "روسيا",
  cn: "الصين",
  jp: "اليابان",
  fr: "فرنسا",
  it: "إيطاليا",
  es: "إسبانيا",
  my: "ماليزيا",
  qa: "قطر",
  kw: "الكويت",
  bh: "البحرين",
  om: "عمان",
  ye: "اليمن",
  iq: "العراق",
  sy: "سوريا",
  lb: "لبنان",
  ps: "فلسطين",
  tn: "تونس",
  dz: "الجزائر",
  ma: "المغرب",
  kr: "كوريا الجنوبية",
  au: "أستراليا",
  nz: "نيوزيلندا",
  nl: "هولندا",
  be: "بلجيكا",
  ch: "سويسرا",
  at: "النمسا",
  se: "السويد",
  no: "النرويج",
  dk: "الدنمارك",
  fi: "فنلندا",
  id: "إندونيسيا",
  in: "الهند",
  pk: "باكستان",
  bn: "بروناي",
  az: "أذربيجان",
  ro: "رومانيا",
  pl: "بولندا",
  cy: "قبرص",
  gr: "اليونان",
  jo: "الأردن",
};

const MONTHS_MAP: Record<string, string> = {
  يناير: "01",
  فبراير: "02",
  مارس: "03",
  أبريل: "04",
  ابريل: "04",
  مايو: "05",
  يونيو: "06",
  يونية: "06",
  يوليو: "07",
  يولية: "07",
  أغسطس: "08",
  اغسطس: "08",
  سبتمبر: "09",
  أكتوبر: "10",
  اكتوبر: "10",
  نوفمبر: "11",
  ديسمبر: "12",
};

function parseArabicDate(str: string): string {
  if (!str) return "";
  const isoMatch = str.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (isoMatch) {
    const y = isoMatch[1];
    const m = isoMatch[2].padStart(2, "0");
    const d = isoMatch[3].padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  const dmyMatch = str.match(/(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (dmyMatch) {
    const d = dmyMatch[1].padStart(2, "0");
    const m = dmyMatch[2].padStart(2, "0");
    const y = dmyMatch[3];
    return `${y}-${m}-${d}`;
  }

  for (const [mName, mNum] of Object.entries(MONTHS_MAP)) {
    if (str.includes(mName)) {
      const dayMatch = str.match(/(\d{1,2})/);
      const yearMatch = str.match(/(20\d{2})/);
      if (dayMatch && yearMatch) {
        const d = dayMatch[1].padStart(2, "0");
        const y = yearMatch[1];
        return `${y}-${mNum}-${d}`;
      }
    }
  }

  return "";
}

function cleanDecorations(str: string): string {
  if (!str) return "";
  return str
    .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}\u25A0-\u25FF\u2600-\u26FF\u2700-\u27BF✦◈═🔷️🟠🏛🔗📣📝📌🎁📚📂📋💬•\-\*]/gu, "")
    .replace(/[\uFE0F\u200B-\u200D\uFEFF]/gu, "")
    .replace(/^[\s:—–\-\*\•\+]+|[\s:—–\-\*\•\+]+$/g, "")
    .trim();
}

function stripItemBullet(str: string): string {
  if (!str) return "";
  return str
    .replace(/^[\s\uFE0F\u200B-\u200D]*[\p{Emoji_Presentation}\p{Extended_Pictographic}\u25A0-\u25FF\u2600-\u26FF\u2700-\u27BF✦◈═🔷️🟠🏛🔗📣📝📌🎁📚📂📋💬•\-\*\+]+\s*/gu, "")
    .replace(/^[\s\uFE0F\u200B-\u200D]*[\-\*\•\+✦]\s*/g, "")
    .replace(/^[\s\uFE0F\u200B-\u200D\uFEFF]+/gu, "")
    .trim();
}

function generateSlug(enTitle: string, arTitle: string): string {
  if (enTitle && enTitle.trim()) {
    const slug = enTitle
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "")
      .replace(/-+/g, "-");
    if (slug) return slug;
  }
  if (arTitle && arTitle.trim()) {
    const slug = arTitle
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "")
      .replace(/-+/g, "-");
    if (slug) return slug;
  }
  return `scholarship-${Date.now()}`;
}

/**
 * يحدد الفئة "المعروفة" لعنوان قسم (أو null لو مش من القائمة المعروفة).
 * الغرض منها: منع العناوين الفرعية التابعة لنفس الفئة (مثل "المستندات
 * الإجبارية" جوه "المستندات") من التقطّع لبلوك مستقل ومنفصل عن أبيه —
 * وهو السبب الأساسي وراء أخطاء المستندات والتخصصات.
 */
function matchCategory(title: string): string | null {
  if (/^(المعلومات العامة|معلومات المنحة)/.test(title)) return "info";
  if (/^(المراحل الدراسية|المرحلة الدراسية)/.test(title)) return "degree";
  if (/^(لغة الدراسة|اللغة)/.test(title)) return "language";
  if (/^(حالة التقديم|حالة المنحة)/.test(title)) return "status";
  if (/^(موعد فتح|بداية التقديم|تاريخ البدء)/.test(title)) return "open_date";
  if (/^(موعد إغلاق|تاريخ إغلاق|آخر موعد|انتهاء التقديم)/.test(title)) return "deadline";
  if (/^(الدولة|اختر دولة المنحة|دولة المنحة)/.test(title)) return "country";
  if (/^(المميزات|التمويل|الفوائد)/.test(title)) return "benefits";
  if (/^(الشروط|المعايير|المتطلبات)/.test(title)) return "requirements";
  if (/^(التخصصات)/.test(title)) return "majors";
  if (/^(المستندات|الملفات|الوثائق)/.test(title)) return "documents";
  if (/^(رابط التقديم|الموقع الرسمي)/.test(title)) return "link";
  if (/^(قناة المنحة|رابط قناة)/.test(title)) return "group";
  if (/^(مناقشة المنحة|رابط مناقشة)/.test(title)) return "discussion";
  if (/^(ملاحظات|تنبيهات|تفاصيل إضافية)/.test(title)) return "notes";
  return null;
}

export function parseScholarshipText(rawText: string): ParsedScholarship {
  const warnings: string[] = [];
  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);

  let name = "";
  let name_en = "";

  if (lines.length > 0) {
    const firstLine = lines[0];
    const cleanFirstLine = firstLine.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}\u25A0-\u25FF\u2600-\u26FF\u2700-\u27BF]/gu, "").trim();

    if (cleanFirstLine.includes("|")) {
      const parts = cleanFirstLine.split("|").map((p) => p.trim());
      const p0HasEn = /[a-zA-Z]/.test(parts[0]);
      const p1HasEn = /[a-zA-Z]/.test(parts[1]);
      if (p0HasEn && !p1HasEn) {
        name_en = parts[0];
        name = parts[1];
      } else {
        name = parts[0];
        name_en = parts[1];
      }
    } else if (cleanFirstLine.includes("/")) {
      const parts = cleanFirstLine.split("/").map((p) => p.trim());
      const p0HasEn = /[a-zA-Z]/.test(parts[0]);
      const p1HasEn = /[a-zA-Z]/.test(parts[1]);
      if (p0HasEn && !p1HasEn) {
        name_en = parts[0];
        name = parts[1];
      } else {
        name = parts[0];
        name_en = parts[1];
      }
    } else {
      name = cleanFirstLine;
    }
  }

  name = cleanDecorations(name);
  name_en = cleanDecorations(name_en);

  const id = generateSlug(name_en, name);

  const isSeparatorLine = (l: string) => /^[═◈─_\-\*\s]{3,}$/.test(l);

  const isSectionHeader = (l: string) => {
    if (isSeparatorLine(l)) return false;
    const clean = cleanDecorations(l);
    if (!clean) return false;
    if (l.length > 80 && !l.includes(":")) return false;

    const knownHeaderRegex = /^(المعلومات العامة|المميزات|الشروط|المعايير|التخصصات|المستندات|الملفات|الوثائق|ملاحظات|تفاصيل إضافية|رابط التقديم|رابط قناة|قناة المنحة|مناقشة المنحة|رابط مناقشة|المراحل الدراسية|لغة الدراسة|حالة التقديم|موعد فتح|موعد إغلاق|تاريخ إغلاق|الجدول الزمني|شروط اختبار|الدولة|اختر دولة المنحة)/i;

    if (l.endsWith(":") || l.endsWith("：")) return true;
    if (knownHeaderRegex.test(clean)) return true;
    if (/^[🟠🏛🔗📣📝🎁]\s*/.test(l) && l.length < 60) return true;

    return false;
  };

  interface RawBlock {
    title: string;
    lines: string[];
  }

  const blocks: RawBlock[] = [];
  let currentBlock: RawBlock | null = null;
  let activeCategory: string | null = null;
  let descriptionLines: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];

    if (isSeparatorLine(line)) continue;

    if (isSectionHeader(line)) {
      const cleanTitle = cleanDecorations(line);
      const cat = matchCategory(cleanTitle);

      // لو العنوان ده نفس فئة القسم الحالي (مثال: "المستندات الاختيارية"
      // جوه "المستندات"، أو عنوان جامعة جوه "التخصصات") — سيبه سطر عادي
      // جوه نفس البلوك بدل ما يتقطّع لقسم مستقل وتضيع بياناته.
      if (cat !== null && cat === activeCategory && currentBlock) {
        currentBlock.lines.push(line);
        continue;
      }

      currentBlock = { title: cleanTitle, lines: [] };
      blocks.push(currentBlock);
      activeCategory = cat;
    } else if (currentBlock) {
      currentBlock.lines.push(line);
    } else {
      descriptionLines.push(line);
    }
  }

  const description = descriptionLines.map(stripItemBullet).join(" ").trim();

  let country = "";
  let countryRaw = "";
  let flag = "";
  let degree = "";
  let language = "";
  let open = true;
  let open_date = "";
  let deadline = "";
  let link = "";
  let groupLink = "";
  let discussionLink = "";
  let notes = "";
  let hasSetNotes = false;

  const benefits: string[] = [];
  const requirements: string[] = [];
  const majors: string[] = [];
  const requiredFiles: string[] = [];
  const optionalFiles: string[] = [];

  const extraSections: ExtraSection[] = [];

  // Mechanical Field Extractor Helper
  const extractMechanicalFromLine = (line: string) => {
    const cleanL = cleanDecorations(line);
    const itemVal = stripItemBullet(line);

    if (cleanL.includes("اختر دولة المنحة") || cleanL.includes("دولة المنحة") || cleanL.includes("الدولة")) {
      const val = cleanL.split(/[:：]/)[1];
      if (val && val.trim()) countryRaw = val.trim();
      else if (itemVal) countryRaw = itemVal;
      return true;
    }
    if (cleanL.includes("المراحل الدراسية") || cleanL.includes("المرحلة الدراسية")) {
      const val = cleanL.split(/[:：]/)[1];
      if (val && val.trim()) degree = val.trim();
      return true;
    }
    if (cleanL.includes("لغة الدراسة") || cleanL.includes("اللغة")) {
      const val = cleanL.split(/[:：]/)[1];
      if (val && val.trim()) language = val.trim();
      return true;
    }
    if (cleanL.includes("حالة التقديم") || cleanL.includes("حالة المنحة")) {
      const val = cleanL.split(/[:：]/)[1];
      if (val && val.trim()) {
        open = !val.includes("مغلق");
      } else if (itemVal.includes("مغلق")) {
        open = false;
      }
      return true;
    }
    if (cleanL.includes("موعد فتح") || cleanL.includes("بداية التقديم") || cleanL.includes("تاريخ البدء")) {
      const parsed = parseArabicDate(cleanL) || parseArabicDate(itemVal);
      if (parsed) open_date = parsed;
      return true;
    }
    if (cleanL.includes("موعد إغلاق") || cleanL.includes("تاريخ إغلاق") || cleanL.includes("آخر موعد") || cleanL.includes("انتهاء التقديم")) {
      const parsed = parseArabicDate(cleanL) || parseArabicDate(itemVal);
      if (parsed) deadline = parsed;
      return true;
    }
    return false;
  };

  for (const block of blocks) {
    const bTitle = block.title;

    if (extractMechanicalFromLine(bTitle)) {
      const items = block.lines.map(stripItemBullet).filter(Boolean);
      if ((bTitle.includes("الدولة") || bTitle.includes("دولة المنحة")) && items.length > 0 && !countryRaw) {
        countryRaw = items.join("، ");
      }
      if (bTitle.includes("المراحل") && items.length > 0) degree = items.join("، ");
      if (bTitle.includes("لغة") && items.length > 0) language = items.join("، ");
      if (bTitle.includes("حالة")) {
        if (items.some((it) => it.includes("مغلق"))) open = false;
      }
      if (bTitle.includes("فتح") && items.length > 0) {
        const parsed = parseArabicDate(items.join(" "));
        if (parsed) open_date = parsed;
      }
      if (bTitle.includes("إغلاق") && items.length > 0) {
        const parsed = parseArabicDate(items.join(" "));
        if (parsed) deadline = parsed;
      }
      continue;
    }

    if (bTitle.includes("المعلومات العامة") || bTitle.includes("معلومات المنحة")) {
      let currentMechanicalField = "";
      for (const line of block.lines) {
        const cleanL = cleanDecorations(line);
        const itemVal = stripItemBullet(line);

        if (cleanL.includes("اختر دولة المنحة") || cleanL.includes("دولة المنحة") || cleanL.includes("الدولة")) {
          currentMechanicalField = "country";
          const val = cleanL.split(/[:：]/)[1];
          if (val && val.trim()) countryRaw = val.trim();
        } else if (cleanL.includes("المراحل الدراسية")) {
          currentMechanicalField = "degree";
          const val = cleanL.split(/[:：]/)[1];
          if (val && val.trim()) degree = val.trim();
        } else if (cleanL.includes("لغة الدراسة")) {
          currentMechanicalField = "language";
          const val = cleanL.split(/[:：]/)[1];
          if (val && val.trim()) language = val.trim();
        } else if (cleanL.includes("حالة التقديم")) {
          currentMechanicalField = "status";
          const val = cleanL.split(/[:：]/)[1];
          if (val && val.trim()) open = !val.includes("مغلق");
        } else if (cleanL.includes("موعد فتح")) {
          currentMechanicalField = "open_date";
          const parsed = parseArabicDate(cleanL);
          if (parsed) open_date = parsed;
        } else if (cleanL.includes("موعد إغلاق")) {
          currentMechanicalField = "deadline";
          const parsed = parseArabicDate(cleanL);
          if (parsed) deadline = parsed;
        } else if (currentMechanicalField && itemVal) {
          if (currentMechanicalField === "country" && !countryRaw) {
            countryRaw = itemVal;
          } else if (currentMechanicalField === "degree") {
            degree = degree ? `${degree}، ${itemVal}` : itemVal;
          } else if (currentMechanicalField === "language") {
            language = language ? `${language}، ${itemVal}` : itemVal;
          } else if (currentMechanicalField === "status") {
            if (itemVal.includes("مغلق")) open = false;
          } else if (currentMechanicalField === "open_date" && !open_date) {
            const parsed = parseArabicDate(itemVal);
            if (parsed) open_date = parsed;
          } else if (currentMechanicalField === "deadline" && !deadline) {
            const parsed = parseArabicDate(itemVal);
            if (parsed) deadline = parsed;
          }
        }
      }
    } else if (bTitle.includes("المميزات") || bTitle.includes("التمويل") || bTitle.includes("الفوائد")) {
      const items = block.lines.map(stripItemBullet).filter(Boolean);
      benefits.push(...items);
    } else if (bTitle.includes("الشروط") || bTitle.includes("المعايير") || bTitle.includes("المتطلبات")) {
      const items = block.lines.map(stripItemBullet).filter(Boolean);
      requirements.push(...items);
    } else if (bTitle.includes("التخصصات")) {
      const rawLines = block.lines;
      const hasSubHeaders = rawLines.some((l) => /[:：]\s*$/.test(l.trim()));
      const hasBulletMarkers = rawLines.some((l) =>
        /^[\s\uFE0F\u200B-\u200D]*[✦\-\*\+•]/.test(l)
      );

      if (hasSubHeaders) {
        // قسم تخصصات مقسّم حسب فئة/جامعة — نحافظ على السياق بدل ما نضيعه
        let currentGroup = "";
        const collected: string[] = [];
        for (const line of rawLines) {
          const trimmed = line.trim();
          if (/[:：]\s*$/.test(trimmed)) {
            currentGroup = cleanDecorations(trimmed).replace(/[:：]\s*$/, "").trim();
            continue;
          }
          const itemVal = stripItemBullet(line);
          if (!itemVal) continue;
          collected.push(currentGroup ? `${currentGroup}: ${itemVal}` : itemVal);
        }
        majors.push(...collected);
      } else if (hasBulletMarkers) {
        const items = rawLines.map(stripItemBullet).filter(Boolean);
        majors.push(...items);
      } else {
        // فقرة وصفية متصلة بدون تعداد نقطي — عنصر واحد، إلا لو فيها فواصل واضحة
        const joined = rawLines.map(stripItemBullet).filter(Boolean).join(" ").trim();
        if (joined.includes(",") || joined.includes("،")) {
          const splitMajors = joined.split(/[,،]/).map((s) => s.trim()).filter(Boolean);
          majors.push(...splitMajors);
        } else if (joined) {
          majors.push(joined);
        }
      }
    } else if (bTitle.includes("المستندات") || bTitle.includes("الملفات") || bTitle.includes("الوثائق")) {
      // نبدأ من عنوان البلوك نفسه (احتياطًا)، وبعدين نطبّق التبديل حسب
      // العناوين الفرعية المدمجة جوه نفس البلوك (بعد إصلاح التقطيع أعلاه)
      let curTarget: "required" | "optional" = cleanDecorations(bTitle).includes("اختيار") ? "optional" : "required";
      for (const line of block.lines) {
        const cleanL = cleanDecorations(line);
        const itemVal = stripItemBullet(line);
        if (cleanL.includes("إجبار") || cleanL.includes("مطلوب")) {
          curTarget = "required";
        } else if (cleanL.includes("اختيار")) {
          curTarget = "optional";
        } else if (itemVal) {
          if (curTarget === "required") requiredFiles.push(itemVal);
          else optionalFiles.push(itemVal);
        }
      }
    } else if (bTitle.includes("رابط التقديم") || bTitle.includes("الموقع الرسمي")) {
      const urlMatch = block.lines.join(" ").match(/https?:\/\/[^\s]+/);
      if (urlMatch) link = urlMatch[0];
    } else if (bTitle.includes("قناة المنحة") || bTitle.includes("رابط قناة")) {
      const urlMatch = block.lines.join(" ").match(/https?:\/\/t\.me\/[^\s]+/);
      if (urlMatch) groupLink = urlMatch[0];
    } else if (bTitle.includes("مناقشة المنحة") || bTitle.includes("رابط مناقشة")) {
      const urlMatch = block.lines.join(" ").match(/https?:\/\/t\.me\/[^\s]+/);
      if (urlMatch) discussionLink = urlMatch[0];
    } else if (bTitle.includes("ملاحظات") || bTitle.includes("تنبيهات")) {
      if (!hasSetNotes) {
        notes = block.lines.map(stripItemBullet).join("\n").trim();
        hasSetNotes = true;
      } else {
        const items = block.lines.map(stripItemBullet).filter(Boolean);
        extraSections.push({
          title: bTitle,
          type: items.length > 1 ? "list" : "text",
          items: items.length > 1 ? items : undefined,
          content: items.length <= 1 ? items.join("\n") : undefined,
        });
      }
    } else {
      const items = block.lines.map(stripItemBullet).filter(Boolean);
      extraSections.push({
        title: bTitle,
        type: items.length > 1 ? "list" : "text",
        items: items.length > 1 ? items : undefined,
        content: items.length <= 1 ? items.join("\n") : undefined,
      });
    }
  }

  if (!link) {
    const linkMatch = rawText.match(/رابط التقديم[^\n]*\n\s*(https?:\/\/[^\s]+)/i) || rawText.match(/https?:\/\/(?!t\.me)[^\s]+/i);
    if (linkMatch) link = linkMatch[1] || linkMatch[0];
  }
  if (!groupLink) {
    const tGroupMatch = rawText.match(/https?:\/\/t\.me\/[^\s]+/i);
    if (tGroupMatch) groupLink = tGroupMatch[0];
  }

  // استخراج الدولة: أولوية للحقل الصريح "اختر دولة المنحة" اللي جمعناه
  // أثناء التحليل. نلجأ للمسح العام (fallback) بس لو الحقل ده مش موجود،
  // ومحصور في الاسم + الوصف فقط (مش النص كامل) عشان ما نلقط دول
  // مذكورة عرضيًا في الشروط أو الملاحظات أو التخصصات.
  if (countryRaw) {
    let matchedIso = "";
    let matchedAlias = "";
    for (const [alias, iso] of Object.entries(COUNTRY_MAP)) {
      if (countryRaw.includes(alias) && alias.length > matchedAlias.length) {
        matchedAlias = alias;
        matchedIso = iso;
      }
    }
    if (matchedIso) {
      country = ISO_TO_STANDARD_ARABIC[matchedIso] || matchedAlias;
      flag = `https://flagcdn.com/w40/${matchedIso}.png`;
    } else {
      // فيه قيمة صريحة بس مش موجودة بجدول الدول — نحتفظ بالنص الخام
      // ونطلب من المستخدم مراجعتها بدل ما نفشل الحفظ بصمت
      country = countryRaw;
      warnings.push("تم العثور على اسم دولة صريح بالنص لكنه غير موجود بقائمة الدول المعروفة، فلم يتم تحديد العلم تلقائيًا. يرجى المراجعة.");
    }
  } else {
    const scanText = `${name} ${description}`;
    let bestIndex = Infinity;
    let bestIso = "";
    let bestAlias = "";
    for (const [alias, iso] of Object.entries(COUNTRY_MAP)) {
      const idx = scanText.indexOf(alias);
      if (idx !== -1 && (idx < bestIndex || (idx === bestIndex && alias.length > bestAlias.length))) {
        bestIndex = idx;
        bestIso = iso;
        bestAlias = alias;
      }
    }
    if (bestIso) {
      country = ISO_TO_STANDARD_ARABIC[bestIso] || bestAlias;
      flag = `https://flagcdn.com/w40/${bestIso}.png`;
    }
  }

  if (!name) {
    warnings.push("تعذّر استخراج اسم المنحة من النص تلقائيًا.");
  }
  if (!country) {
    warnings.push("تعذّر استخراج دولة المنحة تلقائيًا. يرجى تحديدها من القائمة.");
  }

  return {
    name,
    name_en,
    id,
    country,
    flag,
    degree,
    language,
    open,
    open_date,
    deadline,
    description,
    benefits,
    requirements,
    majors,
    requiredFiles,
    optionalFiles,
    link,
    groupLink,
    discussionLink,
    notes,
    extraSections,
    warnings,
  };
}
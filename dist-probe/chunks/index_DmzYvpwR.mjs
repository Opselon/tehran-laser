globalThis.process ??= {};
globalThis.process.env ??= {};
import { n as __exportAll } from "./rolldown-runtime_BDykq6kg.mjs";
import { _ as addAttribute, h as maybeRenderHead, m as renderTemplate, s as renderComponent } from "./console_B-OutPbu.mjs";
import { t as createComponent } from "./compiler_DMFKJ3NJ.mjs";
import { t as $$Icon } from "./Icon_DVKJJmpb.mjs";
import { r as createBreadcrumbSchema, t as $$PublicLayout } from "./PublicLayout_DPqDRWxM.mjs";
import { r as resolveCanonicalOrigin } from "./canonical_ssJtZI0c.mjs";
import { x as listPublicServices } from "./repositories_B3hzhjEm.mjs";
import { env } from "cloudflare:workers";
//#region src/pages/services/index.astro
var services_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Index,
	file: () => $$file,
	url: () => $$url
});
var $$Index = createComponent(async ($$result, $$props, $$slots) => {
	const defaultServices = [
		{
			id: "svc_full_body",
			name: "کل بدن (فول بادی طلایی)",
			slug: "full-body",
			category: "packages",
			categoryName: "پکیج طلایی",
			shortDescription: "دست کامل، پا کامل، زیر بغل، بیکینی، خط باسن، شکم و خط ناف",
			description: "کامل‌ترین و محبوب‌ترین پکیج لیزر بانوان با دستگاه کندلا جنتل‌مکس پرو ۲۰۲۴ اصل آمریکا با شات نامحدود و سیستم خنک‌کننده کرایو DCD بدون درد.",
			durationMinutes: 60,
			femalePrice: 2290,
			femalePromoPrice: 1940,
			malePriceText: "استعلام حضوری بر اساس تراکم و وسعت",
			wavelength: "Dual Wavelength",
			wavelengthLabel: "الکساندرایت ۷۵۵nm + ان‌دی‌یاگ ۱۰۶۴nm",
			recommendedSessions: "۶ تا ۸ جلسه",
			sessionInterval: "۶ تا ۸ هفته",
			isPromo: true,
			promoBadge: "۱۵٪ تخفیف ویژه رزرو سایت",
			features: [
				"شات نامحدود واقعی",
				"کولینگ منهای ۳۰ درجه بدون ژل",
				"سری شخصی یکبار مصرف"
			]
		},
		{
			id: "svc_underarm",
			name: "زیر بغل",
			slug: "underarm",
			category: "upper",
			categoryName: "بالاتنه",
			shortDescription: "پوشش هر دو زیر بغل با رفع تیرگی ناشی از شیو",
			description: "لیزر موهای زائد هر دو زیر بغل با طول موج الکساندرایت ۷۵۵ نانومتر کندلا با سیستم کولینگ مبرد پویا.",
			durationMinutes: 20,
			femalePrice: 390,
			malePriceText: "استعلام تلفنی / پذیرش در لاین آقایان",
			maleEstimatedPrice: 490,
			wavelength: "Alexandrite 755nm",
			wavelengthLabel: "الکساندرایت ۷۵۵nm",
			recommendedSessions: "۶ تا ۸ جلسه",
			sessionInterval: "۵ تا ۶ هفته",
			features: [
				"روشن‌سازی تدریجی پوست",
				"پیشگیری از کیست مویی",
				"زمان کوتاه جلسه"
			]
		},
		{
			id: "svc_bikini",
			name: "بیکینی و خط مایو",
			slug: "bikini",
			category: "lower",
			categoryName: "پایین‌تنه",
			shortDescription: "ناحیه کامل بیکینی و خط مایو با سری کاملاً استریل",
			description: "لیزر تخصصی ناحیه حساس بیکینی با بالاترین پروتکل‌های بهداشتی، بدون درد با خنک‌کننده اسپری کرایو DCD.",
			durationMinutes: 25,
			femalePrice: 590,
			malePriceText: "لاین اختصاصی ندارد",
			wavelength: "Alexandrite 755nm",
			wavelengthLabel: "الکساندرایت ۷۵۵nm",
			recommendedSessions: "۶ تا ۸ جلسه",
			sessionInterval: "۶ تا ۸ هفته",
			features: [
				"سری کاملاً اختصاصی",
				"حفظ صددرصد بهداشت",
				"حذف موهای زیرپوستی"
			]
		},
		{
			id: "svc_full_legs",
			name: "پا کامل",
			slug: "full-legs",
			category: "lower",
			categoryName: "پایین‌تنه",
			shortDescription: "هر دو پا از ران تا مچ و انگشتان پا",
			description: "لیزر کامل پاها با اسپات سایز بزرگ ۲۲ الی ۲۴ میلی‌متری کندلا آمریکایی برای حداکثر سرعت و پوشش یکنواخت.",
			durationMinutes: 45,
			femalePrice: 790,
			malePriceText: "استعلام قیمت تلفنی بر اساس وسعت",
			maleEstimatedPrice: 990,
			wavelength: "Alexandrite 755nm",
			wavelengthLabel: "الکساندرایت ۷۵۵nm",
			recommendedSessions: "۶ تا ۸ جلسه",
			sessionInterval: "۶ تا ۸ هفته",
			features: [
				"اسپات سایز ۲۴mm فوق سریع",
				"بدون سوزش و سوختگی",
				"پوشش ران تا مچ پا"
			]
		},
		{
			id: "svc_full_arms",
			name: "دست کامل",
			slug: "full-arms",
			category: "upper",
			categoryName: "بالاتنه",
			shortDescription: "هر دو دست از سرشانه تا انگشتان",
			description: "لیزر کامل هر دو دست با تنظیم انرژی اختصاصی برای موهای نازک بازو و موهای ضخیم‌تر ساعد.",
			durationMinutes: 35,
			femalePrice: 570,
			malePriceText: "استعلام قیمت بر اساس تراکم موها",
			maleEstimatedPrice: 750,
			wavelength: "Alexandrite 755nm",
			wavelengthLabel: "الکساندرایت ۷۵۵nm",
			recommendedSessions: "۶ تا ۸ جلسه",
			sessionInterval: "۵ تا ۷ هفته",
			features: [
				"شات یکدست تا سرشانه",
				"تنظیم فرکانس هوشمند",
				"پوست لطیف و بدون لک"
			]
		},
		{
			id: "svc_face",
			name: "صورت کامل",
			slug: "face",
			category: "face",
			categoryName: "صورت و گردن",
			shortDescription: "گونه‌ها، چانه، پیشانی، شقیقه‌ها و پشت لب",
			description: "لیزر تخصصی پوست حساس صورت با عینک محافظ استاندارد و نظارت دقیق پزشک کلینیک.",
			durationMinutes: 30,
			femalePrice: 320,
			malePriceText: "آنکارد ریش و گونه آقایان: ۳۹۰/۰۰۰ تومان",
			maleEstimatedPrice: 390,
			wavelength: "Alexandrite 755nm",
			wavelengthLabel: "الکساندرایت ۷۵۵nm",
			recommendedSessions: "۶ تا ۸ جلسه",
			sessionInterval: "۴ تا ۵ هفته",
			features: [
				"عینک محافظ فوتونیک",
				"تنظیم انرژی موهای ریز صورت",
				"تحت نظارت پزشک"
			]
		},
		{
			id: "svc_upper_lip",
			name: "پشت لب",
			slug: "upper-lip",
			category: "face",
			categoryName: "صورت و گردن",
			shortDescription: "حذف دقیق موهای زائد بالای لب",
			description: "لیزر سریع ناحیه پشت لب با خنک‌کننده قوی بدون کوچک‌ترین احساس درد در ۵ الی ۱۰ دقیقه.",
			durationMinutes: 15,
			femalePrice: 90,
			malePriceText: "شامل پکیج آنکارد ریش آقایان",
			wavelength: "Alexandrite 755nm",
			wavelengthLabel: "الکساندرایت ۷۵۵nm",
			recommendedSessions: "۶ تا ۸ جلسه",
			sessionInterval: "۴ هفته",
			features: [
				"انجام سریع در ۵ دقیقه",
				"کولینگ مبرد نقطه به نقطه",
				"حذف موهای مقاوم"
			]
		},
		{
			id: "svc_chin",
			name: "چانه",
			slug: "chin",
			category: "face",
			categoryName: "صورت و گردن",
			shortDescription: "ریشه‌کنی موهای هورمونی و ضخیم چانه",
			description: "لیزر عمیق ریشه‌های ضخیم و هورمونی چانه با قدرت نفوذ بالای دستگاه کندلا اصل آمریکا.",
			durationMinutes: 15,
			femalePrice: 145,
			malePriceText: "شامل پکیج آنکارد ریش آقایان",
			wavelength: "Dual Wavelength",
			wavelengthLabel: "الکساندرایت + ان‌دی‌یاگ",
			recommendedSessions: "۶ تا ۸ جلسه",
			sessionInterval: "۴ تا ۵ هفته",
			features: [
				"نفوذ بالا در موهای هورمونی",
				"جلوگیری از ضخیم شدن موها",
				"پوست صاف و یکدست"
			]
		},
		{
			id: "svc_neck",
			name: "گردن",
			slug: "neck",
			category: "face",
			categoryName: "صورت و گردن",
			shortDescription: "جلو و پشت گردن با خط‌گیری منظم",
			description: "لیزر دقیق ناحیه گردن با حفظ یکنواختی خط ریش و مو و پیشگیری از فولیکولیت بعد از شیو.",
			durationMinutes: 20,
			femalePrice: 190,
			malePriceText: "خط گردن و زیر ریش آقایان: ۲۹۰/۰۰۰ تومان",
			maleEstimatedPrice: 290,
			wavelength: "Alexandrite 755nm",
			wavelengthLabel: "الکساندرایت ۷۵۵nm",
			recommendedSessions: "۶ تا ۸ جلسه",
			sessionInterval: "۵ تا ۶ هفته",
			features: [
				"خط‌گیری هندسی دقیق",
				"رفع جوش‌های التهابی گردن",
				"تنظیم خط رشد مو"
			]
		},
		{
			id: "svc_forearm",
			name: "ساق دست (ساعد)",
			slug: "forearm",
			category: "upper",
			categoryName: "بالاتنه",
			shortDescription: "از آرنج تا مچ هر دو دست",
			description: "لیزر سریع و مؤثر موهای ساعد با پوشش ۳۶۰ درجه‌ای و کولینگ پیوسته کندلا.",
			durationMinutes: 25,
			femalePrice: 320,
			malePriceText: "استعلام قیمت تلفنی بر اساس وسعت",
			maleEstimatedPrice: 420,
			wavelength: "Alexandrite 755nm",
			wavelengthLabel: "الکساندرایت ۷۵۵nm",
			recommendedSessions: "۶ تا ۸ جلسه",
			sessionInterval: "۵ تا ۶ هفته",
			features: [
				"پوشش کامل مچ تا آرنج",
				"بدون پوسته شدن یا سوزش",
				"نتیجه‌گیری سریع"
			]
		},
		{
			id: "svc_upper_arm",
			name: "بازو",
			slug: "upper-arm",
			category: "upper",
			categoryName: "بالاتنه",
			shortDescription: "بازوی هر دو دست از سرشانه تا بالای آرنج",
			description: "تنظیم فرکانس هوشمند برای پیشگیری از تحریک ریشه‌های کرکی بازو با طول موج الکساندرایت.",
			durationMinutes: 25,
			femalePrice: 370,
			malePriceText: "استعلام قیمت تلفنی",
			maleEstimatedPrice: 480,
			wavelength: "Alexandrite 755nm",
			wavelengthLabel: "الکساندرایت ۷۵۵nm",
			recommendedSessions: "۶ تا ۸ جلسه",
			sessionInterval: "۶ تا ۷ هفته",
			features: [
				"تنظیم مخصوص موهای کرکی",
				"بدون تحریک ریشه‌های خفته",
				"حفظ لطافت بازو"
			]
		},
		{
			id: "svc_chest",
			name: "دور سینه",
			slug: "chest",
			category: "upper",
			categoryName: "بالاتنه",
			shortDescription: "ناحیه دور هاله سینه با ملایمت بالا",
			description: "لیزر ایمن موهای زائد دور سینه با کولینگ بهینه و عایق‌بندی حرارتی برای حفظ سلامت بافت.",
			durationMinutes: 20,
			femalePrice: 145,
			malePriceText: "سینه کامل آقایان: ۵۹۰/۰۰۰ تومان",
			maleEstimatedPrice: 590,
			wavelength: "Alexandrite 755nm",
			wavelengthLabel: "الکساندرایت ۷۵۵nm",
			recommendedSessions: "۶ تا ۸ جلسه",
			sessionInterval: "۵ تا ۶ هفته",
			features: [
				"حفظ کامل سلامت بافت سینه",
				"کولینگ بسیار ملایم",
				"رفع ریشه‌های زبر"
			]
		},
		{
			id: "svc_abdomen",
			name: "شکم کامل",
			slug: "abdomen",
			category: "upper",
			categoryName: "بالاتنه",
			shortDescription: "پوشش کامل سطح پوست شکم",
			description: "لیزر یکدست ناحیه شکم با شات‌های متوالی و سرعت بالای پرتاب پالس دستگاه جنتل‌مکس پرو.",
			durationMinutes: 30,
			femalePrice: 470,
			malePriceText: "شکم کامل آقایان: ۵۵۰/۰۰۰ تومان",
			maleEstimatedPrice: 550,
			wavelength: "Alexandrite 755nm",
			wavelengthLabel: "الکساندرایت ۷۵۵nm",
			recommendedSessions: "۶ تا ۸ جلسه",
			sessionInterval: "۶ تا ۸ هفته",
			features: [
				"پوشش یکنواخت و بدون جاافتادگی",
				"خنک‌سازی پیوسته با گاز کرایو",
				"تخریب قطعی پیاز مو"
			]
		},
		{
			id: "svc_navel_line",
			name: "خط ناف",
			slug: "navel-line",
			category: "upper",
			categoryName: "بالاتنه",
			shortDescription: "خط باریک و عمودی بین ناف و بیکینی",
			description: "لیزر دقیق خط ناف در کمتر از ۱۰ دقیقه با بازدهی بسیار بالا از جلسات ابتدایی.",
			durationMinutes: 15,
			femalePrice: 190,
			malePriceText: "استعلام قیمت تلفنی",
			maleEstimatedPrice: 250,
			wavelength: "Alexandrite 755nm",
			wavelengthLabel: "الکساندرایت ۷۵۵nm",
			recommendedSessions: "۶ تا ۸ جلسه",
			sessionInterval: "۵ تا ۶ هفته",
			features: [
				"انجام سریع در کمتر از ۱۰ دقیقه",
				"خط‌کشی قرینه و منظم",
				"تخفیف در ترکیب با بیکینی"
			]
		},
		{
			id: "svc_back",
			name: "کمر کامل",
			slug: "back",
			category: "upper",
			categoryName: "بالاتنه",
			shortDescription: "پوشش کامل ناحیه پشت و گودی کمر",
			description: "لیزر وسیع کمر با اسپات سایز ۲۴ میلی‌متری و بدون ایجاد جوش‌های چرکی بعد از لیزر.",
			durationMinutes: 35,
			femalePrice: 540,
			malePriceText: "کمر کامل آقایان: ۷۵۰/۰۰۰ تومان",
			maleEstimatedPrice: 750,
			wavelength: "Dual Wavelength",
			wavelengthLabel: "الکساندرایت + ان‌دی‌یاگ",
			recommendedSessions: "۶ تا ۸ جلسه",
			sessionInterval: "۶ تا ۸ هفته",
			features: [
				"پوشش سریع با اسپات ۲۴mm",
				"خنک‌سازی منهای ۳۰ درجه",
				"پیشگیری از جوش‌های ناحیه پشت"
			]
		},
		{
			id: "svc_buttocks",
			name: "باسن",
			slug: "buttocks",
			category: "lower",
			categoryName: "پایین‌تنه",
			shortDescription: "پوشش کامل هر دو سمت باسن",
			description: "لیزر بهداشتی و آرامش‌بخش باسن با حفظ کامل محرمانگی و حریم خصوصی در اتاق‌های ایزوله.",
			durationMinutes: 25,
			femalePrice: 380,
			malePriceText: "استعلام تلفنی در کلینیک",
			maleEstimatedPrice: 490,
			wavelength: "Alexandrite 755nm",
			wavelengthLabel: "الکساندرایت ۷۵۵nm",
			recommendedSessions: "۶ تا ۸ جلسه",
			sessionInterval: "۶ تا ۸ هفته",
			features: [
				"رعایت صددرصد پروتکل‌های بهداشتی",
				"کاهش زبری و جوش پوستی",
				"محیط کاملاً خصوصی"
			]
		},
		{
			id: "svc_gluteal_line",
			name: "خط باسن (شیار باسن)",
			slug: "gluteal-line",
			category: "lower",
			categoryName: "پایین‌تنه",
			shortDescription: "لیزر دقیق خط میانی باسن با سری باریک",
			description: "حذف موهای زائد خط باسن با سری بهداشتی و زاویه پرتاب کنترل‌شده با ملایمت کامل.",
			durationMinutes: 15,
			femalePrice: 240,
			malePriceText: "استعلام تلفنی در کلینیک",
			maleEstimatedPrice: 320,
			wavelength: "Alexandrite 755nm",
			wavelengthLabel: "الکساندرایت ۷۵۵nm",
			recommendedSessions: "۶ تا ۸ جلسه",
			sessionInterval: "۶ تا ۸ هفته",
			features: [
				"سری یکبار مصرف ضدعفونی‌شده",
				"دقت شات فوق‌العاده بالا",
				"بدون کمترین احساس درد"
			]
		},
		{
			id: "svc_thigh",
			name: "ران پا",
			slug: "thigh",
			category: "lower",
			categoryName: "پایین‌تنه",
			shortDescription: "ران هر دو پا از بالای زانو تا خط لگن",
			description: "پوشش وسیع و پرقدرت ران‌ها با تنظیم فرکانس برای موهای نرم‌تر جلوی ران و ضخیم‌تر پشت ران.",
			durationMinutes: 30,
			femalePrice: 570,
			malePriceText: "استعلام قیمت تلفنی بر اساس وسعت",
			maleEstimatedPrice: 690,
			wavelength: "Alexandrite 755nm",
			wavelengthLabel: "الکساندرایت ۷۵۵nm",
			recommendedSessions: "۶ تا ۸ جلسه",
			sessionInterval: "۶ تا ۸ هفته",
			features: [
				"اسپات بزرگ و سرعت عمل بالا",
				"خنک‌کنندگی عالی بدون سوختگی",
				"پوشش یکدست جلو و پشت ران"
			]
		},
		{
			id: "svc_inner_thigh",
			name: "کشاله ران",
			slug: "inner-thigh",
			category: "lower",
			categoryName: "پایین‌تنه",
			shortDescription: "ناحیه داخلی ران با پیشگیری از تیرگی",
			description: "رفع موهای زائد کشاله ران جهت جلوگیری از عرق‌سوز شدن و تیرگی اصطکاکی پوست.",
			durationMinutes: 20,
			femalePrice: 390,
			malePriceText: "استعلام تلفنی در کلینیک",
			maleEstimatedPrice: 480,
			wavelength: "Alexandrite 755nm",
			wavelengthLabel: "الکساندرایت ۷۵۵nm",
			recommendedSessions: "۶ تا ۸ جلسه",
			sessionInterval: "۶ تا ۸ هفته",
			features: [
				"رفع تیرگی ناشی از اصطکاک",
				"جلوگیری از التهاب و سوزش",
				"خنک‌کننده پیوسته"
			]
		},
		{
			id: "svc_lower_leg",
			name: "ساق پا",
			slug: "lower-leg",
			category: "lower",
			categoryName: "پایین‌تنه",
			shortDescription: "هر دو پا از زانو تا مچ پا و روی انگشتان",
			description: "لیزر پرطرفدار ساق پا با حذف قطعی موهای ریشه‌دار و رهایی همیشگی از شیو هفتگی.",
			durationMinutes: 30,
			femalePrice: 480,
			malePriceText: "استعلام تلفنی در کلینیک",
			maleEstimatedPrice: 590,
			wavelength: "Alexandrite 755nm",
			wavelengthLabel: "الکساندرایت ۷۵۵nm",
			recommendedSessions: "۶ تا ۸ جلسه",
			sessionInterval: "۶ تا ۸ هفته",
			features: [
				"تخریب قطعی ریشه‌های سیاه و ضخیم",
				"بدون درد روی استخوان ساق پا",
				"پوستی شفاف و درخشان"
			]
		}
	];
	let services = [...defaultServices];
	try {
		if (env && env.DB) {
			const dbServices = await listPublicServices(env.DB);
			if (dbServices && dbServices.length > 0) services = defaultServices.map((def) => {
				const match = dbServices.find((s) => s.slug === def.slug);
				if (!match) return def;
				const fPrice = match.prices.find((p) => p.pricingCategory === "female");
				const mPrice = match.prices.find((p) => p.pricingCategory === "male");
				return {
					...def,
					name: match.name || def.name,
					shortDescription: match.shortDescription || def.shortDescription,
					description: match.description || def.description,
					durationMinutes: match.durationMinutes || def.durationMinutes,
					femalePrice: fPrice ? fPrice.amount : def.femalePrice,
					malePriceText: mPrice ? `${(mPrice.amount * 1e3).toLocaleString("fa-IR")} تومان` : def.malePriceText
				};
			});
		}
	} catch (e) {
		console.warn("Using clinical fallback service catalogue:", e);
	}
	function formatToman(amountInThousands) {
		return (amountInThousands * 1e3).toLocaleString("fa-IR");
	}
	const origin = resolveCanonicalOrigin();
	const priceListJsonLd = {
		"@context": "https://schema.org",
		"@type": ["CollectionPage", "MedicalWebPage"],
		"@id": `${origin}/services#prices`,
		url: `${origin}/services`,
		name: "تعرفه‌های مصوب لیزر موهای زائد کندلا جنتل مکس پرو",
		inLanguage: "fa-IR",
		mainEntity: { "@id": `${origin}/#clinic` },
		isPartOf: { "@id": `${origin}/#website` },
		about: {
			"@type": "OfferCatalog",
			name: "تعرفه‌های مصوب لیزر کندلا جنتل‌مکس پرو",
			itemListElement: services.map((s, idx) => ({
				"@type": "Offer",
				position: idx + 1,
				itemOffered: {
					"@type": "MedicalProcedure",
					name: `لیزر ${s.name}`,
					description: s.shortDescription
				},
				price: (s.femalePromoPrice || s.femalePrice) * 1e3,
				priceCurrency: "IRR",
				availability: "https://schema.org/InStock"
			}))
		}
	};
	const breadcrumbJsonLd = createBreadcrumbSchema([{
		name: "صفحه اصلی",
		url: "/"
	}, {
		name: "خدمات و تعرفه‌ها",
		url: "/services"
	}]);
	return renderTemplate`${renderComponent($$result, "PublicLayout", $$PublicLayout, {
		"title": "تعرفه لیزر موهای زائد ۱۴۰۵ — بانوان و آقایان | کلینیک تهران لیزر پاسداران",
		"description": "مشاهده لیست کامل تعرفه‌های لیزر موهای زائد بانوان و آقایان در کلینیک تهران لیزر پاسداران. مجهز به دستگاه کندلا جنتل‌مکس پرو آمریکا با ۱۵٪ تخفیف رزرو آنلاین پکیج طلایی.",
		"canonicalUrl": "/services",
		"keywords": [
			"قیمت لیزر موهای زائد تهران",
			"تعرفه لیزر پاسداران",
			"قیمت لیزر فول بادی بانوان",
			"لیزر بانوان و آقایان کندلا"
		],
		"jsonLd": [priceListJsonLd, breadcrumbJsonLd],
		"data-astro-cid-7a6hbtlg": true
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<section class="services-hero" data-astro-cid-7a6hbtlg><div class="container hero-container" data-astro-cid-7a6hbtlg><div class="hero-badge" data-astro-cid-7a6hbtlg>${renderComponent($$result, "Icon", $$Icon, {
		"name": "sparkles",
		"size": 15,
		"data-astro-cid-7a6hbtlg": true
	})}<span data-astro-cid-7a6hbtlg>تضمین تعرفه مصوب کلینیکال و شفافیت صددرصدی</span></div><h1 class="hero-title" data-astro-cid-7a6hbtlg>تعرفه‌های مصوب خدمات تخصصی <span class="gold-gradient" data-astro-cid-7a6hbtlg>تهران لیزر</span></h1><p class="hero-subtitle" data-astro-cid-7a6hbtlg>تمامی تعرفه‌ها بر اساس مصوبه رسمی کلینیک تهران لیزر (پاسداران) و با بهره‌گیری از قدرتمندترین دستگاه لیزر جهان<strong data-astro-cid-7a6hbtlg>Candela GentleMax Pro 2024 اصل آمریکا</strong> بدون شات محدود و با کولینگ گاز مبرد DCD ارائه می‌گردد.</p><!-- Candela GentleMax Pro Technology Badges --><div class="tech-badges-strip" data-astro-cid-7a6hbtlg><div class="tech-badge" data-astro-cid-7a6hbtlg>${renderComponent($$result, "Icon", $$Icon, {
		"name": "lightning",
		"size": 16,
		"data-astro-cid-7a6hbtlg": true
	})}<span data-astro-cid-7a6hbtlg>کندلا جنتل‌مکس پرو ۲۰۲۴ (Candela USA)</span></div><div class="tech-badge" data-astro-cid-7a6hbtlg>${renderComponent($$result, "Icon", $$Icon, {
		"name": "shield",
		"size": 16,
		"data-astro-cid-7a6hbtlg": true
	})}<span data-astro-cid-7a6hbtlg>طول موج الکساندرایت ۷۵۵nm + ان‌دی‌یاگ ۱۰۶۴nm</span></div><div class="tech-badge" data-astro-cid-7a6hbtlg>${renderComponent($$result, "Icon", $$Icon, {
		"name": "snowflake",
		"size": 16,
		"data-astro-cid-7a6hbtlg": true
	})}<span data-astro-cid-7a6hbtlg>کولینگ هوشمند کرایو DCD منهای ۳۰ درجه بدون درد</span></div><div class="tech-badge" data-astro-cid-7a6hbtlg>${renderComponent($$result, "Icon", $$Icon, {
		"name": "award",
		"size": 16,
		"data-astro-cid-7a6hbtlg": true
	})}<span data-astro-cid-7a6hbtlg>تحت نظارت مستقیم پزشک و اپراتورهای دارای مدرک بین‌المللی</span></div></div></div></section><section class="section category-switch-section" data-astro-cid-7a6hbtlg><div class="container" data-astro-cid-7a6hbtlg><div class="category-toggle-wrapper" data-astro-cid-7a6hbtlg><div class="category-toggle-pills" role="tablist" aria-label="انتخاب بخش بانوان یا آقایان" data-astro-cid-7a6hbtlg><button type="button" class="toggle-pill active" id="tab-female" role="tab" aria-selected="true" aria-controls="panel-female" data-target="female" data-astro-cid-7a6hbtlg>${renderComponent($$result, "Icon", $$Icon, {
		"name": "sparkles",
		"size": 18,
		"data-astro-cid-7a6hbtlg": true
	})}<span class="pill-label" data-astro-cid-7a6hbtlg>تعرفه و پکیج‌های بانوان</span><span class="pill-discount-badge" data-astro-cid-7a6hbtlg>۱۵٪ تخفیف سایت</span></button><button type="button" class="toggle-pill" id="tab-male" role="tab" aria-selected="false" aria-controls="panel-male" data-target="male" data-astro-cid-7a6hbtlg>${renderComponent($$result, "Icon", $$Icon, {
		"name": "users",
		"size": 18,
		"data-astro-cid-7a6hbtlg": true
	})}<span class="pill-label" data-astro-cid-7a6hbtlg>لاین اختصاصی آقایان</span><span class="pill-note-badge" data-astro-cid-7a6hbtlg>اپراتور آقا + فضای مجزا</span></button></div></div><!-- ============================================================== --><!-- PANEL 1: WOMEN'S PRICING & PACKAGES --><!-- ============================================================== --><div id="panel-female" class="tab-panel active" role="tabpanel" aria-labelledby="tab-female" data-astro-cid-7a6hbtlg><!-- Curated Packages Grid --><div class="packages-header mb-4" data-astro-cid-7a6hbtlg><div class="packages-title-wrap" data-astro-cid-7a6hbtlg><span class="badge-gold" data-astro-cid-7a6hbtlg>${renderComponent($$result, "Icon", $$Icon, {
		"name": "gem",
		"size": 14,
		"data-astro-cid-7a6hbtlg": true
	})}<span data-astro-cid-7a6hbtlg>پکیج‌های اقتصادی و طلایی</span></span><h2 class="section-h2" data-astro-cid-7a6hbtlg>محبوب‌ترین پکیج‌های تخفیف‌دار بانوان</h2></div><p class="section-desc" data-astro-cid-7a6hbtlg>پکیج‌های تلفیقی با تخفیف ویژه در رزرو آنلاین سایت، شات نامحدود واقعی و دستگاه کندلا جنتل‌مکس پرو</p></div><div class="packages-grid" data-astro-cid-7a6hbtlg><!-- Package 1: Full Body Golden (Featured 3D Card) --><div class="package-card package-card-golden featured-3d" data-astro-cid-7a6hbtlg><div class="card-ribbon" data-astro-cid-7a6hbtlg>${renderComponent($$result, "Icon", $$Icon, {
		"name": "star",
		"size": 13,
		"data-astro-cid-7a6hbtlg": true
	})}<span data-astro-cid-7a6hbtlg>پیشنهاد طلایی ۱۵٪ تخفیف</span></div><div class="package-header" data-astro-cid-7a6hbtlg><span class="package-badge-tag" data-astro-cid-7a6hbtlg>کامل‌ترین پکیج کلینیک</span><h3 class="package-title" data-astro-cid-7a6hbtlg>پکیج طلایی کل بدن (Full Body)</h3><p class="package-subtitle" data-astro-cid-7a6hbtlg>شامل: دست کامل، پا کامل، زیر بغل، بیکینی، خط باسن، شکم و خط ناف با شات نامحدود</p></div><div class="package-specs" data-astro-cid-7a6hbtlg><div class="spec-item" data-astro-cid-7a6hbtlg>${renderComponent($$result, "Icon", $$Icon, {
		"name": "clock",
		"size": 16,
		"data-astro-cid-7a6hbtlg": true
	})}<span data-astro-cid-7a6hbtlg>مدت هر جلسه: <strong data-astro-cid-7a6hbtlg>۶۰ دقیقه</strong></span></div><div class="spec-item" data-astro-cid-7a6hbtlg>${renderComponent($$result, "Icon", $$Icon, {
		"name": "calendar",
		"size": 16,
		"data-astro-cid-7a6hbtlg": true
	})}<span data-astro-cid-7a6hbtlg>تعداد جلسات: <strong data-astro-cid-7a6hbtlg>۶ الی ۸ جلسه</strong></span></div><div class="spec-item" data-astro-cid-7a6hbtlg>${renderComponent($$result, "Icon", $$Icon, {
		"name": "snowflake",
		"size": 16,
		"data-astro-cid-7a6hbtlg": true
	})}<span data-astro-cid-7a6hbtlg>کولینگ: <strong data-astro-cid-7a6hbtlg>گاز کرایو DCD بدون درد</strong></span></div><div class="spec-item" data-astro-cid-7a6hbtlg>${renderComponent($$result, "Icon", $$Icon, {
		"name": "shield",
		"size": 16,
		"data-astro-cid-7a6hbtlg": true
	})}<span data-astro-cid-7a6hbtlg>طول موج: <strong data-astro-cid-7a6hbtlg>الکساندرایت ۷۵۵nm اصل کندلا</strong></span></div></div><div class="package-pricing-box" data-astro-cid-7a6hbtlg><div class="price-row-old" data-astro-cid-7a6hbtlg><span class="label" data-astro-cid-7a6hbtlg>تعرفه مصوب:</span><span class="old-amount strikethrough" data-astro-cid-7a6hbtlg>۲/۲۹۰/۰۰۰ تومان</span></div><div class="price-row-final" data-astro-cid-7a6hbtlg><span class="final-amount" data-astro-cid-7a6hbtlg>۱/۹۴۰/۰۰۰</span><span class="unit" data-astro-cid-7a6hbtlg>تومان / هر جلسه</span></div><div class="save-tag" data-astro-cid-7a6hbtlg>${renderComponent($$result, "Icon", $$Icon, {
		"name": "percent",
		"size": 14,
		"data-astro-cid-7a6hbtlg": true
	})}<span data-astro-cid-7a6hbtlg>۳۵۰/۰۰۰ تومان صرفه‌جویی در هر جلسه</span></div></div><div class="package-actions" data-astro-cid-7a6hbtlg><a href="/booking?service=full-body" class="btn-3d-gold btn-block" data-astro-cid-7a6hbtlg>${renderComponent($$result, "Icon", $$Icon, {
		"name": "calendar",
		"size": 18,
		"data-astro-cid-7a6hbtlg": true
	})}<span data-astro-cid-7a6hbtlg>رزرو نوبت پکیج طلایی با تخفیف</span></a><a href="/services/full-body" class="btn-3d-subtle btn-block mt-2" data-astro-cid-7a6hbtlg><span data-astro-cid-7a6hbtlg>مشاهده جزئیات کامل و مراقبت‌ها</span>${renderComponent($$result, "Icon", $$Icon, {
		"name": "chevronLeft",
		"size": 16,
		"data-astro-cid-7a6hbtlg": true
	})}</a></div></div><!-- Package 2: Practical Essentials --><div class="package-card" data-astro-cid-7a6hbtlg><div class="package-header" data-astro-cid-7a6hbtlg><span class="package-badge-tag" data-astro-cid-7a6hbtlg>پکیج اقتصادی و پرکاربرد</span><h3 class="package-title" data-astro-cid-7a6hbtlg>پکیج کاربردی (Essential Body)</h3><p class="package-subtitle" data-astro-cid-7a6hbtlg>شامل: ساق دست، ساق پا، زیر بغل و بیکینی کامل — انتخابی سریع و بدون درد</p></div><div class="package-specs" data-astro-cid-7a6hbtlg><div class="spec-item" data-astro-cid-7a6hbtlg>${renderComponent($$result, "Icon", $$Icon, {
		"name": "clock",
		"size": 16,
		"data-astro-cid-7a6hbtlg": true
	})}<span data-astro-cid-7a6hbtlg>مدت جلسه: <strong data-astro-cid-7a6hbtlg>۴۰ دقیقه</strong></span></div><div class="spec-item" data-astro-cid-7a6hbtlg>${renderComponent($$result, "Icon", $$Icon, {
		"name": "calendar",
		"size": 16,
		"data-astro-cid-7a6hbtlg": true
	})}<span data-astro-cid-7a6hbtlg>توصیه بالینی: <strong data-astro-cid-7a6hbtlg>۶ الی ۸ جلسه</strong></span></div><div class="spec-item" data-astro-cid-7a6hbtlg>${renderComponent($$result, "Icon", $$Icon, {
		"name": "snowflake",
		"size": 16,
		"data-astro-cid-7a6hbtlg": true
	})}<span data-astro-cid-7a6hbtlg>سیستم مبرد: <strong data-astro-cid-7a6hbtlg>اسپری داینامیک DCD</strong></span></div></div><div class="package-pricing-box" data-astro-cid-7a6hbtlg><div class="price-row-old" data-astro-cid-7a6hbtlg><span class="label" data-astro-cid-7a6hbtlg>مجموع تک‌ناحیه‌ای:</span><span class="old-amount strikethrough" data-astro-cid-7a6hbtlg>۱/۸۰۰/۰۰۰ تومان</span></div><div class="price-row-final" data-astro-cid-7a6hbtlg><span class="final-amount" data-astro-cid-7a6hbtlg>۱/۴۹۰/۰۰۰</span><span class="unit" data-astro-cid-7a6hbtlg>تومان / جلسه</span></div><div class="save-tag" data-astro-cid-7a6hbtlg>${renderComponent($$result, "Icon", $$Icon, {
		"name": "tag",
		"size": 14,
		"data-astro-cid-7a6hbtlg": true
	})}<span data-astro-cid-7a6hbtlg>۱۷٪ تخفیف بسته تلفیقی</span></div></div><div class="package-actions" data-astro-cid-7a6hbtlg><a href="/booking?service=underarm" class="btn-3d-gold btn-block" data-astro-cid-7a6hbtlg>${renderComponent($$result, "Icon", $$Icon, {
		"name": "calendar",
		"size": 18,
		"data-astro-cid-7a6hbtlg": true
	})}<span data-astro-cid-7a6hbtlg>رزرو پکیج کاربردی</span></a></div></div><!-- Package 3: Poolside Duo --><div class="package-card" data-astro-cid-7a6hbtlg><div class="package-header" data-astro-cid-7a6hbtlg><span class="package-badge-tag" data-astro-cid-7a6hbtlg>پکیج سریع و استخری</span><h3 class="package-title" data-astro-cid-7a6hbtlg>پکیج استخری (Duo Sensitive)</h3><p class="package-subtitle" data-astro-cid-7a6hbtlg>شامل: زیر بغل کامل + بیکینی و خط باسن با رعایت بالاترین استانداردهای بهداشتی</p></div><div class="package-specs" data-astro-cid-7a6hbtlg><div class="spec-item" data-astro-cid-7a6hbtlg>${renderComponent($$result, "Icon", $$Icon, {
		"name": "clock",
		"size": 16,
		"data-astro-cid-7a6hbtlg": true
	})}<span data-astro-cid-7a6hbtlg>مدت جلسه: <strong data-astro-cid-7a6hbtlg>۳۰ دقیقه</strong></span></div><div class="spec-item" data-astro-cid-7a6hbtlg>${renderComponent($$result, "Icon", $$Icon, {
		"name": "calendar",
		"size": 16,
		"data-astro-cid-7a6hbtlg": true
	})}<span data-astro-cid-7a6hbtlg>توصیه بالینی: <strong data-astro-cid-7a6hbtlg>۶ الی ۸ جلسه</strong></span></div><div class="spec-item" data-astro-cid-7a6hbtlg>${renderComponent($$result, "Icon", $$Icon, {
		"name": "shield",
		"size": 16,
		"data-astro-cid-7a6hbtlg": true
	})}<span data-astro-cid-7a6hbtlg>پروتکل: <strong data-astro-cid-7a6hbtlg>سری کاملاً شخصی و استریل</strong></span></div></div><div class="package-pricing-box" data-astro-cid-7a6hbtlg><div class="price-row-old" data-astro-cid-7a6hbtlg><span class="label" data-astro-cid-7a6hbtlg>مجموع تک‌ناحیه‌ای:</span><span class="old-amount strikethrough" data-astro-cid-7a6hbtlg>۱/۲۲۰/۰۰۰ تومان</span></div><div class="price-row-final" data-astro-cid-7a6hbtlg><span class="final-amount" data-astro-cid-7a6hbtlg>۹۸۰/۰۰۰</span><span class="unit" data-astro-cid-7a6hbtlg>تومان / جلسه</span></div><div class="save-tag" data-astro-cid-7a6hbtlg>${renderComponent($$result, "Icon", $$Icon, {
		"name": "tag",
		"size": 14,
		"data-astro-cid-7a6hbtlg": true
	})}<span data-astro-cid-7a6hbtlg>۲۰٪ تخفیف ویژه پکیج</span></div></div><div class="package-actions" data-astro-cid-7a6hbtlg><a href="/booking?service=bikini" class="btn-3d-gold btn-block" data-astro-cid-7a6hbtlg>${renderComponent($$result, "Icon", $$Icon, {
		"name": "calendar",
		"size": 18,
		"data-astro-cid-7a6hbtlg": true
	})}<span data-astro-cid-7a6hbtlg>رزرو پکیج استخری</span></a></div></div></div><!-- Filter & View Controls --><div class="catalog-controls-bar mt-5" data-astro-cid-7a6hbtlg><div class="filter-pills" role="tablist" aria-label="فیلتر نواحی لیزر" data-astro-cid-7a6hbtlg><button type="button" class="filter-btn active" data-filter="all" data-astro-cid-7a6hbtlg>${renderComponent($$result, "Icon", $$Icon, {
		"name": "sparkles",
		"size": 15,
		"data-astro-cid-7a6hbtlg": true
	})}<span data-astro-cid-7a6hbtlg>همه ۲۰ ناحیه تخصصی</span></button><button type="button" class="filter-btn" data-filter="face" data-astro-cid-7a6hbtlg>${renderComponent($$result, "Icon", $$Icon, {
		"name": "star",
		"size": 15,
		"data-astro-cid-7a6hbtlg": true
	})}<span data-astro-cid-7a6hbtlg>صورت و گردن</span></button><button type="button" class="filter-btn" data-filter="upper" data-astro-cid-7a6hbtlg>${renderComponent($$result, "Icon", $$Icon, {
		"name": "shield",
		"size": 15,
		"data-astro-cid-7a6hbtlg": true
	})}<span data-astro-cid-7a6hbtlg>دست و بالاتنه</span></button><button type="button" class="filter-btn" data-filter="lower" data-astro-cid-7a6hbtlg>${renderComponent($$result, "Icon", $$Icon, {
		"name": "gem",
		"size": 15,
		"data-astro-cid-7a6hbtlg": true
	})}<span data-astro-cid-7a6hbtlg>پا و پایین‌تنه</span></button></div><div class="view-switch-btns" data-astro-cid-7a6hbtlg><button type="button" class="view-toggle-btn active" id="viewCardsBtn" aria-label="نمایش کارتی" data-astro-cid-7a6hbtlg>${renderComponent($$result, "Icon", $$Icon, {
		"name": "gem",
		"size": 16,
		"data-astro-cid-7a6hbtlg": true
	})}<span data-astro-cid-7a6hbtlg>نمایش کارتی</span></button><button type="button" class="view-toggle-btn" id="viewTableBtn" aria-label="نمایش جدول تعرفه‌ها" data-astro-cid-7a6hbtlg>${renderComponent($$result, "Icon", $$Icon, {
		"name": "list",
		"size": 16,
		"data-astro-cid-7a6hbtlg": true
	})}<span data-astro-cid-7a6hbtlg>جدول تعرفه‌ها</span></button></div></div><!-- 3D Obsidian-Gold Cards Grid --><div id="servicesCardGrid" class="services-3d-grid mt-4" data-astro-cid-7a6hbtlg>${services.map((service) => {
		const isFullBody = service.slug === "full-body";
		const price = isFullBody ? service.femalePromoPrice : service.femalePrice;
		return renderTemplate`<div${addAttribute(`service-obsidian-card ${isFullBody ? "border-gold-glow" : ""}`, "class")}${addAttribute(service.category, "data-category")} data-astro-cid-7a6hbtlg><div class="card-top-row" data-astro-cid-7a6hbtlg><span class="category-chip" data-astro-cid-7a6hbtlg>${service.categoryName}</span><div class="duration-chip" data-astro-cid-7a6hbtlg>${renderComponent($$result, "Icon", $$Icon, {
			"name": "clock",
			"size": 14,
			"data-astro-cid-7a6hbtlg": true
		})}<span data-astro-cid-7a6hbtlg>${service.durationMinutes} دقیقه</span></div></div><h3 class="service-card-title" data-astro-cid-7a6hbtlg><a${addAttribute(`/services/${service.slug}`, "href")} data-astro-cid-7a6hbtlg>${service.name}</a>${isFullBody && renderTemplate`<span class="promo-tag-mini" data-astro-cid-7a6hbtlg>${renderComponent($$result, "Icon", $$Icon, {
			"name": "star",
			"size": 12,
			"data-astro-cid-7a6hbtlg": true
		})}<span data-astro-cid-7a6hbtlg>۱۵٪ تخفیف</span></span>`}</h3><p class="service-card-desc" data-astro-cid-7a6hbtlg>${service.shortDescription}</p><!-- Candela GentleMax Pro Wavelength Badge --><div class="card-wavelength-tag" data-astro-cid-7a6hbtlg>${renderComponent($$result, "Icon", $$Icon, {
			"name": "lightning",
			"size": 13,
			"data-astro-cid-7a6hbtlg": true
		})}<span data-astro-cid-7a6hbtlg>${service.wavelengthLabel}</span></div><!-- Session Recommendation Pill --><div class="card-sessions-hint" data-astro-cid-7a6hbtlg>${renderComponent($$result, "Icon", $$Icon, {
			"name": "calendar",
			"size": 13,
			"data-astro-cid-7a6hbtlg": true
		})}<span data-astro-cid-7a6hbtlg>توصیه بالینی: ${service.recommendedSessions} (فواصل ${service.sessionInterval})</span></div><div class="service-card-pricing" data-astro-cid-7a6hbtlg><span class="price-title" data-astro-cid-7a6hbtlg>تعرفه مصوب جلسه:</span><div class="price-value-box" data-astro-cid-7a6hbtlg>${isFullBody && renderTemplate`<span class="strikethrough-price" data-astro-cid-7a6hbtlg>${formatToman(service.femalePrice)}</span>`}<span class="bold-price" data-astro-cid-7a6hbtlg>${formatToman(price)}</span><span class="price-currency" data-astro-cid-7a6hbtlg>تومان</span></div></div><div class="service-card-footer" data-astro-cid-7a6hbtlg><a${addAttribute(`/booking?service=${service.slug}`, "href")} class="btn-3d-primary-sm"${addAttribute(`رزرو نوبت ${service.name}`, "aria-label")} data-astro-cid-7a6hbtlg>${renderComponent($$result, "Icon", $$Icon, {
			"name": "calendar",
			"size": 15,
			"data-astro-cid-7a6hbtlg": true
		})}<span data-astro-cid-7a6hbtlg>رزرو نوبت</span></a><a${addAttribute(`/services/${service.slug}`, "href")} class="btn-3d-outline-sm"${addAttribute(`جزئیات ${service.name}`, "aria-label")} data-astro-cid-7a6hbtlg><span data-astro-cid-7a6hbtlg>جزئیات</span>${renderComponent($$result, "Icon", $$Icon, {
			"name": "chevronLeft",
			"size": 14,
			"data-astro-cid-7a6hbtlg": true
		})}</a></div></div>`;
	})}</div><!-- Responsive Structured Table View --><div id="servicesTableView" class="table-responsive-wrapper mt-4 hidden" data-astro-cid-7a6hbtlg><table class="table-obsidian-pricing" role="table" data-astro-cid-7a6hbtlg><thead data-astro-cid-7a6hbtlg><tr data-astro-cid-7a6hbtlg><th scope="col" class="th-num" data-astro-cid-7a6hbtlg>ردیف</th><th scope="col" data-astro-cid-7a6hbtlg>ناحیه خدمت</th><th scope="col" data-astro-cid-7a6hbtlg>دستگاه و طول موج</th><th scope="col" data-astro-cid-7a6hbtlg>مدت جلسه</th><th scope="col" data-astro-cid-7a6hbtlg>جلسات پیشنهادی</th><th scope="col" data-astro-cid-7a6hbtlg>تعرفه بانوان</th><th scope="col" data-astro-cid-7a6hbtlg>لاین آقایان</th><th scope="col" class="th-action" data-astro-cid-7a6hbtlg>عملیات رزرو</th></tr></thead><tbody data-astro-cid-7a6hbtlg>${services.map((service, index) => {
		const isFullBody = service.slug === "full-body";
		const price = isFullBody ? service.femalePromoPrice : service.femalePrice;
		return renderTemplate`<tr${addAttribute(isFullBody ? "highlight-row" : "", "class")}${addAttribute(service.category, "data-category")} data-astro-cid-7a6hbtlg><td class="td-num" data-astro-cid-7a6hbtlg>${(index + 1).toLocaleString("fa-IR")}</td><td class="td-service" data-astro-cid-7a6hbtlg><a${addAttribute(`/services/${service.slug}`, "href")} class="service-table-link" data-astro-cid-7a6hbtlg>${service.name}</a>${isFullBody && renderTemplate`<span class="badge-promo-inline" data-astro-cid-7a6hbtlg>${renderComponent($$result, "Icon", $$Icon, {
			"name": "star",
			"size": 11,
			"data-astro-cid-7a6hbtlg": true
		})}<span data-astro-cid-7a6hbtlg>۱۵٪ تخفیف</span></span>`}<div class="service-subtext" data-astro-cid-7a6hbtlg>${service.shortDescription}</div></td><td class="td-tech" data-astro-cid-7a6hbtlg><span class="badge-wavelength-cell" data-astro-cid-7a6hbtlg>${renderComponent($$result, "Icon", $$Icon, {
			"name": "lightning",
			"size": 12,
			"data-astro-cid-7a6hbtlg": true
		})}<span data-astro-cid-7a6hbtlg>${service.wavelengthLabel}</span></span></td><td class="td-duration" data-astro-cid-7a6hbtlg><div class="duration-badge-table" data-astro-cid-7a6hbtlg>${renderComponent($$result, "Icon", $$Icon, {
			"name": "clock",
			"size": 13,
			"data-astro-cid-7a6hbtlg": true
		})}<span data-astro-cid-7a6hbtlg>${service.durationMinutes} دقیقه</span></div></td><td class="td-sessions" data-astro-cid-7a6hbtlg><span class="sessions-text" data-astro-cid-7a6hbtlg>${service.recommendedSessions}</span></td><td class="td-price" data-astro-cid-7a6hbtlg>${isFullBody ? renderTemplate`<div data-astro-cid-7a6hbtlg><span class="strikethrough-mini" data-astro-cid-7a6hbtlg>${formatToman(service.femalePrice)}</span><span class="price-highlight" data-astro-cid-7a6hbtlg>${formatToman(price)} تومان</span></div>` : renderTemplate`<span class="price-highlight" data-astro-cid-7a6hbtlg>${formatToman(price)} تومان</span>`}</td><td class="td-male" data-astro-cid-7a6hbtlg><span class="male-note-cell" data-astro-cid-7a6hbtlg>${service.maleEstimatedPrice ? `از ${formatToman(service.maleEstimatedPrice)} تومان` : service.malePriceText}</span></td><td class="td-action" data-astro-cid-7a6hbtlg><a${addAttribute(`/booking?service=${service.slug}`, "href")} class="btn-table-book" data-astro-cid-7a6hbtlg>${renderComponent($$result, "Icon", $$Icon, {
			"name": "calendar",
			"size": 14,
			"data-astro-cid-7a6hbtlg": true
		})}<span data-astro-cid-7a6hbtlg>رزرو</span></a></td></tr>`;
	})}</tbody></table></div><!-- Clinical Session Recommendations Accordion & Guidance --><div class="clinical-guidance-card mt-5" data-astro-cid-7a6hbtlg><div class="guidance-header" data-astro-cid-7a6hbtlg><div class="icon-circle-gold" data-astro-cid-7a6hbtlg>${renderComponent($$result, "Icon", $$Icon, {
		"name": "award",
		"size": 22,
		"data-astro-cid-7a6hbtlg": true
	})}</div><div data-astro-cid-7a6hbtlg><h3 class="guidance-title" data-astro-cid-7a6hbtlg>راهنمای بالینی و توصیه‌های متخصصین تهران لیزر</h3><p class="guidance-subtitle" data-astro-cid-7a6hbtlg>پروتکل‌های درمانی استاندارد برای دستیابی به حداکثر بازدهی (کاهش دائمی ۸۵٪ الی ۹۵٪ موهای زائد)</p></div></div><div class="guidance-grid" data-astro-cid-7a6hbtlg><div class="guidance-col" data-astro-cid-7a6hbtlg><div class="guidance-box" data-astro-cid-7a6hbtlg><div class="box-title" data-astro-cid-7a6hbtlg>${renderComponent($$result, "Icon", $$Icon, {
		"name": "calendar",
		"size": 16,
		"data-astro-cid-7a6hbtlg": true
	})}<span data-astro-cid-7a6hbtlg>تعداد و فواصل جلسات بانوان</span></div><p data-astro-cid-7a6hbtlg>برای پاسخ‌دهی کامل فولیکول‌ها، به طور میانگین به <strong data-astro-cid-7a6hbtlg>۶ الی ۸ جلسه</strong> نیاز است. فواصل جلسات برای ناحیه صورت <strong data-astro-cid-7a6hbtlg>۴ الی ۵ هفته</strong> و برای نواحی بدن <strong data-astro-cid-7a6hbtlg>۶ الی ۸ هفته</strong> تنظیم می‌گردد تا چرخه رشد مو (فاز آناژن) به طور کامل پوشش داده شود.</p></div></div><div class="guidance-col" data-astro-cid-7a6hbtlg><div class="guidance-box" data-astro-cid-7a6hbtlg><div class="box-title" data-astro-cid-7a6hbtlg>${renderComponent($$result, "Icon", $$Icon, {
		"name": "snowflake",
		"size": 16,
		"data-astro-cid-7a6hbtlg": true
	})}<span data-astro-cid-7a6hbtlg>تکنولوژی خنک‌کننده کرایو DCD</span></div><p data-astro-cid-7a6hbtlg>دستگاه Candela GentleMax Pro با اسپری گاز برودتی منهای ۳۰ درجه، چند میلی‌ثانیه قبل از هر شات لیزر پوست را کاملاً بی‌حس و خنک می‌کند. نیازی به استفاده از ژل‌های چسبناک سنتی نبوده و درد و ریسک سوختگی به صفر می‌رسد.</p></div></div><div class="guidance-col" data-astro-cid-7a6hbtlg><div class="guidance-box" data-astro-cid-7a6hbtlg><div class="box-title" data-astro-cid-7a6hbtlg>${renderComponent($$result, "Icon", $$Icon, {
		"name": "shield",
		"size": 16,
		"data-astro-cid-7a6hbtlg": true
	})}<span data-astro-cid-7a6hbtlg>بهداشت و سری‌های اختصاصی</span></div><p data-astro-cid-7a6hbtlg>کلیه خدمات با سری‌های شخصی و استریل یکبار مصرف برای هر مراجع انجام می‌پذیرد. همچنین ملحفه، عینک فوتونیک و محیط اتاق لیزر پس از هر مراجع به صورت کامل ضدعفونی می‌گردد.</p></div></div></div></div></div><!-- ============================================================== --><!-- PANEL 2: MEN'S PRICING & SPECIALIZED LINE --><!-- ============================================================== --><div id="panel-male" class="tab-panel hidden" role="tabpanel" aria-labelledby="tab-male" data-astro-cid-7a6hbtlg><!-- Men's Introduction Banner --><div class="mens-banner-card mb-5" data-astro-cid-7a6hbtlg><div class="mens-banner-content" data-astro-cid-7a6hbtlg><div class="badge-gold" data-astro-cid-7a6hbtlg>${renderComponent($$result, "Icon", $$Icon, {
		"name": "users",
		"size": 14,
		"data-astro-cid-7a6hbtlg": true
	})}<span data-astro-cid-7a6hbtlg>لاین تخصصی آقایان</span></div><h2 class="mens-banner-title" data-astro-cid-7a6hbtlg>خدمات لیزر آقایان با اپراتور مجرب آقا و فضای تفکیک‌شده</h2><p class="mens-banner-desc" data-astro-cid-7a6hbtlg>با توجه به اینکه ریشه موهای آقایان تراکم و ضخامت بیشتری دارد، دستگاه کندلا جنتل‌مکس پرو ۲۰۲۴ با بهره‌گیری از<strong data-astro-cid-7a6hbtlg>طول موج نفوذی ان‌دی‌یاگ (Nd:YAG 1064nm)</strong> عمیق‌ترین فولیکول‌ها را بدون سوختگی پوست درمان می‌کند. کلیه خدمات در فضایی کاملاً خصوصی با اپراتور آقا انجام می‌پذیرد.</p><div class="mens-features-row" data-astro-cid-7a6hbtlg><div class="m-feat" data-astro-cid-7a6hbtlg>${renderComponent($$result, "Icon", $$Icon, {
		"name": "checkCircle",
		"size": 16,
		"data-astro-cid-7a6hbtlg": true
	})}<span data-astro-cid-7a6hbtlg>اپراتور دارای گواهینامه پزشکی آقا</span></div><div class="m-feat" data-astro-cid-7a6hbtlg>${renderComponent($$result, "Icon", $$Icon, {
		"name": "checkCircle",
		"size": 16,
		"data-astro-cid-7a6hbtlg": true
	})}<span data-astro-cid-7a6hbtlg>فضای کاملاً مجزا و نوبت‌دهی خصوصی</span></div><div class="m-feat" data-astro-cid-7a6hbtlg>${renderComponent($$result, "Icon", $$Icon, {
		"name": "checkCircle",
		"size": 16,
		"data-astro-cid-7a6hbtlg": true
	})}<span data-astro-cid-7a6hbtlg>طول موج Nd:YAG 1064nm مناسب ریشه‌های متراکم</span></div><div class="m-feat" data-astro-cid-7a6hbtlg>${renderComponent($$result, "Icon", $$Icon, {
		"name": "checkCircle",
		"size": 16,
		"data-astro-cid-7a6hbtlg": true
	})}<span data-astro-cid-7a6hbtlg>کولینگ قوی بدون درد و بدون ژل</span></div></div></div><div class="mens-banner-cta-box" data-astro-cid-7a6hbtlg><span class="cta-box-title" data-astro-cid-7a6hbtlg>مشاوره و رزرو سریع بخش آقایان</span><p class="cta-box-text" data-astro-cid-7a6hbtlg>برای استعلام دقیق بر اساس تراکم و آنکارد با کارشناسان ما گفتگو کنید:</p><a href="tel:+989035555090" class="btn-3d-gold btn-block" data-astro-cid-7a6hbtlg>${renderComponent($$result, "Icon", $$Icon, {
		"name": "phone",
		"size": 18,
		"data-astro-cid-7a6hbtlg": true
	})}<span data-astro-cid-7a6hbtlg>تماس مستقیم: ۰۹۰۳ ۵۵۵ ۵۰۹۰</span></a><a href="/booking" class="btn-3d-subtle btn-block mt-2" data-astro-cid-7a6hbtlg>${renderComponent($$result, "Icon", $$Icon, {
		"name": "calendar",
		"size": 18,
		"data-astro-cid-7a6hbtlg": true
	})}<span data-astro-cid-7a6hbtlg>رزرو آنلاین نوبت مشاوره</span></a></div></div><!-- Men's Popular Packages Grid --><h3 class="section-h2 mb-4" data-astro-cid-7a6hbtlg>پکیج‌های پرطرفدار لیزر آقایان</h3><div class="packages-grid" data-astro-cid-7a6hbtlg><!-- Men Package 1: Beard Line --><div class="package-card featured-3d" data-astro-cid-7a6hbtlg><div class="package-header" data-astro-cid-7a6hbtlg><span class="package-badge-tag" data-astro-cid-7a6hbtlg>پرطرفدارترین لاین آقایان</span><h3 class="package-title" data-astro-cid-7a6hbtlg>آنکارد ریش و خط گردن (Beard Grooming)</h3><p class="package-subtitle" data-astro-cid-7a6hbtlg>تنظیم دقیق خط گونه، خط گردن، زیر ریش، پشت گردن و روی گوش‌ها با خط‌گیری منظم</p></div><div class="package-specs" data-astro-cid-7a6hbtlg><div class="spec-item" data-astro-cid-7a6hbtlg>${renderComponent($$result, "Icon", $$Icon, {
		"name": "clock",
		"size": 16,
		"data-astro-cid-7a6hbtlg": true
	})}<span data-astro-cid-7a6hbtlg>مدت جلسه: <strong data-astro-cid-7a6hbtlg>۲۰ دقیقه</strong></span></div><div class="spec-item" data-astro-cid-7a6hbtlg>${renderComponent($$result, "Icon", $$Icon, {
		"name": "lightning",
		"size": 16,
		"data-astro-cid-7a6hbtlg": true
	})}<span data-astro-cid-7a6hbtlg>طول موج: <strong data-astro-cid-7a6hbtlg>Nd:YAG 1064nm</strong></span></div><div class="spec-item" data-astro-cid-7a6hbtlg>${renderComponent($$result, "Icon", $$Icon, {
		"name": "shield",
		"size": 16,
		"data-astro-cid-7a6hbtlg": true
	})}<span data-astro-cid-7a6hbtlg>نتیجه: <strong data-astro-cid-7a6hbtlg>رهایی همیشگی از تیغ و جوش زیر ریش</strong></span></div></div><div class="package-pricing-box" data-astro-cid-7a6hbtlg><div class="price-row-final" data-astro-cid-7a6hbtlg><span class="final-amount" data-astro-cid-7a6hbtlg>۴۹۰/۰۰۰</span><span class="unit" data-astro-cid-7a6hbtlg>تومان / جلسه</span></div><div class="save-tag" data-astro-cid-7a6hbtlg>${renderComponent($$result, "Icon", $$Icon, {
		"name": "checkCircle",
		"size": 14,
		"data-astro-cid-7a6hbtlg": true
	})}<span data-astro-cid-7a6hbtlg>شامل خط گونه + خط گردن و گوش</span></div></div><div class="package-actions" data-astro-cid-7a6hbtlg><a href="/booking?service=face" class="btn-3d-gold btn-block" data-astro-cid-7a6hbtlg>${renderComponent($$result, "Icon", $$Icon, {
		"name": "calendar",
		"size": 18,
		"data-astro-cid-7a6hbtlg": true
	})}<span data-astro-cid-7a6hbtlg>رزرو آنلاین آنکارد ریش</span></a></div></div><!-- Men Package 2: Athletic Upper Body --><div class="package-card" data-astro-cid-7a6hbtlg><div class="package-header" data-astro-cid-7a6hbtlg><span class="package-badge-tag" data-astro-cid-7a6hbtlg>پکیج ویژه ورزشکاران</span><h3 class="package-title" data-astro-cid-7a6hbtlg>بالاتنه ورزشکاری (Athletic Upper)</h3><p class="package-subtitle" data-astro-cid-7a6hbtlg>شامل: سینه کامل، شکم، خط سرشانه و کول‌ها — نمایش حداکثری تفکیک عضلات</p></div><div class="package-specs" data-astro-cid-7a6hbtlg><div class="spec-item" data-astro-cid-7a6hbtlg>${renderComponent($$result, "Icon", $$Icon, {
		"name": "clock",
		"size": 16,
		"data-astro-cid-7a6hbtlg": true
	})}<span data-astro-cid-7a6hbtlg>مدت جلسه: <strong data-astro-cid-7a6hbtlg>۴۰ دقیقه</strong></span></div><div class="spec-item" data-astro-cid-7a6hbtlg>${renderComponent($$result, "Icon", $$Icon, {
		"name": "calendar",
		"size": 16,
		"data-astro-cid-7a6hbtlg": true
	})}<span data-astro-cid-7a6hbtlg>توصیه بالینی: <strong data-astro-cid-7a6hbtlg>۸ الی ۱۰ جلسه</strong></span></div><div class="spec-item" data-astro-cid-7a6hbtlg>${renderComponent($$result, "Icon", $$Icon, {
		"name": "snowflake",
		"size": 16,
		"data-astro-cid-7a6hbtlg": true
	})}<span data-astro-cid-7a6hbtlg>کولینگ: <strong data-astro-cid-7a6hbtlg>کرایو گاز مبرد پویا</strong></span></div></div><div class="package-pricing-box" data-astro-cid-7a6hbtlg><div class="price-row-final" data-astro-cid-7a6hbtlg><span class="final-amount" data-astro-cid-7a6hbtlg>۸۹۰/۰۰۰</span><span class="unit" data-astro-cid-7a6hbtlg>تومان / جلسه</span></div><div class="save-tag" data-astro-cid-7a6hbtlg>${renderComponent($$result, "Icon", $$Icon, {
		"name": "tag",
		"size": 14,
		"data-astro-cid-7a6hbtlg": true
	})}<span data-astro-cid-7a6hbtlg>تعرفه پکیج ترکیبی بالاتنه</span></div></div><div class="package-actions" data-astro-cid-7a6hbtlg><a href="/booking?service=chest" class="btn-3d-gold btn-block" data-astro-cid-7a6hbtlg>${renderComponent($$result, "Icon", $$Icon, {
		"name": "calendar",
		"size": 18,
		"data-astro-cid-7a6hbtlg": true
	})}<span data-astro-cid-7a6hbtlg>رزرو بالاتنه آقایان</span></a></div></div><!-- Men Package 3: Back & Shoulders --><div class="package-card" data-astro-cid-7a6hbtlg><div class="package-header" data-astro-cid-7a6hbtlg><span class="package-badge-tag" data-astro-cid-7a6hbtlg>تخفیف ویژه لاین آقایان</span><h3 class="package-title" data-astro-cid-7a6hbtlg>کمر، شانه و کول (Back & Shoulders)</h3><p class="package-subtitle" data-astro-cid-7a6hbtlg>پوشش کامل کمر از گردن تا گودی کمر، پشت شانه و کتف‌ها بدون ایجاد جوش</p></div><div class="package-specs" data-astro-cid-7a6hbtlg><div class="spec-item" data-astro-cid-7a6hbtlg>${renderComponent($$result, "Icon", $$Icon, {
		"name": "clock",
		"size": 16,
		"data-astro-cid-7a6hbtlg": true
	})}<span data-astro-cid-7a6hbtlg>مدت جلسه: <strong data-astro-cid-7a6hbtlg>۳۵ دقیقه</strong></span></div><div class="spec-item" data-astro-cid-7a6hbtlg>${renderComponent($$result, "Icon", $$Icon, {
		"name": "calendar",
		"size": 16,
		"data-astro-cid-7a6hbtlg": true
	})}<span data-astro-cid-7a6hbtlg>توصیه بالینی: <strong data-astro-cid-7a6hbtlg>۸ الی ۱۰ جلسه</strong></span></div><div class="spec-item" data-astro-cid-7a6hbtlg>${renderComponent($$result, "Icon", $$Icon, {
		"name": "shield",
		"size": 16,
		"data-astro-cid-7a6hbtlg": true
	})}<span data-astro-cid-7a6hbtlg>اسپات سایز: <strong data-astro-cid-7a6hbtlg>۲۴ میلی‌متری فوق سریع</strong></span></div></div><div class="package-pricing-box" data-astro-cid-7a6hbtlg><div class="price-row-final" data-astro-cid-7a6hbtlg><span class="final-amount" data-astro-cid-7a6hbtlg>۷۹۰/۰۰۰</span><span class="unit" data-astro-cid-7a6hbtlg>تومان / جلسه</span></div><div class="save-tag" data-astro-cid-7a6hbtlg>${renderComponent($$result, "Icon", $$Icon, {
		"name": "tag",
		"size": 14,
		"data-astro-cid-7a6hbtlg": true
	})}<span data-astro-cid-7a6hbtlg>شات عمیق و یکدست</span></div></div><div class="package-actions" data-astro-cid-7a6hbtlg><a href="/booking?service=back" class="btn-3d-gold btn-block" data-astro-cid-7a6hbtlg>${renderComponent($$result, "Icon", $$Icon, {
		"name": "calendar",
		"size": 18,
		"data-astro-cid-7a6hbtlg": true
	})}<span data-astro-cid-7a6hbtlg>رزرو پکیج کمر و کتف</span></a></div></div></div><!-- Men's Clinical Advice Card --><div class="mens-advice-card mt-5" data-astro-cid-7a6hbtlg><div class="guidance-header" data-astro-cid-7a6hbtlg><div class="icon-circle-gold" data-astro-cid-7a6hbtlg>${renderComponent($$result, "Icon", $$Icon, {
		"name": "info",
		"size": 22,
		"data-astro-cid-7a6hbtlg": true
	})}</div><div data-astro-cid-7a6hbtlg><h3 class="guidance-title" data-astro-cid-7a6hbtlg>نکات مهم لیزر موهای زائد آقایان</h3><p class="guidance-subtitle" data-astro-cid-7a6hbtlg>پاسخ به سوالات پرتکرار مراجعین آقایان در کلینیک تهران لیزر</p></div></div><div class="guidance-grid" data-astro-cid-7a6hbtlg><div class="guidance-col" data-astro-cid-7a6hbtlg><div class="guidance-box" data-astro-cid-7a6hbtlg><div class="box-title" data-astro-cid-7a6hbtlg>${renderComponent($$result, "Icon", $$Icon, {
		"name": "clock",
		"size": 16,
		"data-astro-cid-7a6hbtlg": true
	})}<span data-astro-cid-7a6hbtlg>تعداد جلسات آقایان (۸ الی ۱۰ جلسه)</span></div><p data-astro-cid-7a6hbtlg>به دلیل ترشح هورمون‌های مردانه (تستوسترون) و عمق بیشتر ریشه موها، آقایان عموماً به ۸ تا ۱۰ جلسه با فواصل ۶ الی ۸ هفته نیاز دارند. پس از پایان دوره، جلسات شارژ سالانه ۱ الی ۲ بار توصیه می‌گردد.</p></div></div><div class="guidance-col" data-astro-cid-7a6hbtlg><div class="guidance-box" data-astro-cid-7a6hbtlg><div class="box-title" data-astro-cid-7a6hbtlg>${renderComponent($$result, "Icon", $$Icon, {
		"name": "lightning",
		"size": 16,
		"data-astro-cid-7a6hbtlg": true
	})}<span data-astro-cid-7a6hbtlg>چرا طول موج Nd:YAG برای آقایان؟</span></div><p data-astro-cid-7a6hbtlg>طول موج ۱۰۶۴ نانومتر عمق نفوذ بالاتری دارد و انرژی را مستقیماً به پاپیلا و فولیکول‌های ضخیم ریش، سینه و کمر می‌رساند بدون اینکه ملانین سطحی پوست را بسوزاند؛ بنابراین برای پوست‌های گندمی و سبزه آقایان ۱۰۰٪ ایمن است.</p></div></div><div class="guidance-col" data-astro-cid-7a6hbtlg><div class="guidance-box" data-astro-cid-7a6hbtlg><div class="box-title" data-astro-cid-7a6hbtlg>${renderComponent($$result, "Icon", $$Icon, {
		"name": "phone",
		"size": 16,
		"data-astro-cid-7a6hbtlg": true
	})}<span data-astro-cid-7a6hbtlg>تعیین وقت و استعلام قیمت اختصاصی</span></div><p data-astro-cid-7a6hbtlg>در صورتی که ناحیه خاصی مانند دست کامل، پا کامل یا کل بدن مد نظرتان است، می‌توانید قبل از مراجعه با شماره<a href="tel:+989035555090" class="gold-link" dir="ltr" data-astro-cid-7a6hbtlg>۰۹۰۳ ۵۵۵ ۵۰۹۰</a>تماس حاصل فرموده و با اپراتور ارشد آقا مشورت فرمایید.</p></div></div></div></div></div></div></section><script>
    // Tab switching: Female vs Male
    const tabFemale = document.getElementById('tab-female');
    const tabMale = document.getElementById('tab-male');
    const panelFemale = document.getElementById('panel-female');
    const panelMale = document.getElementById('panel-male');

    function setActiveCategory(cat) {
      if (cat === 'male') {
        tabMale?.classList.add('active');
        tabMale?.setAttribute('aria-selected', 'true');
        tabFemale?.classList.remove('active');
        tabFemale?.setAttribute('aria-selected', 'false');
        panelMale?.classList.remove('hidden');
        panelMale?.classList.add('active');
        panelFemale?.classList.add('hidden');
        panelFemale?.classList.remove('active');
      } else {
        tabFemale?.classList.add('active');
        tabFemale?.setAttribute('aria-selected', 'true');
        tabMale?.classList.remove('active');
        tabMale?.setAttribute('aria-selected', 'false');
        panelFemale?.classList.remove('hidden');
        panelFemale?.classList.add('active');
        panelMale?.classList.add('hidden');
        panelMale?.classList.remove('active');
      }
    }

    tabFemale?.addEventListener('click', () => setActiveCategory('female'));
    tabMale?.addEventListener('click', () => setActiveCategory('male'));

    // Filter Buttons (Women's section)
    const filterBtns = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.service-obsidian-card');
    const tableRows = document.querySelectorAll('.table-obsidian-pricing tbody tr');

    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        filterBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.getAttribute('data-filter') || 'all';

        // Filter cards
        cards.forEach((card) => {
          const cardCat = card.getAttribute('data-category');
          if (filter === 'all' || cardCat === filter) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });

        // Filter table rows
        tableRows.forEach((row) => {
          const rowCat = row.getAttribute('data-category');
          if (filter === 'all' || rowCat === filter) {
            row.style.display = '';
          } else {
            row.style.display = 'none';
          }
        });
      });
    });

    // View Switch: Cards vs Table
    const viewCardsBtn = document.getElementById('viewCardsBtn');
    const viewTableBtn = document.getElementById('viewTableBtn');
    const cardGrid = document.getElementById('servicesCardGrid');
    const tableView = document.getElementById('servicesTableView');

    viewCardsBtn?.addEventListener('click', () => {
      viewCardsBtn.classList.add('active');
      viewTableBtn?.classList.remove('active');
      cardGrid?.classList.remove('hidden');
      tableView?.classList.add('hidden');
    });

    viewTableBtn?.addEventListener('click', () => {
      viewTableBtn.classList.add('active');
      viewCardsBtn?.classList.remove('active');
      tableView?.classList.remove('hidden');
      cardGrid?.classList.add('hidden');
    });
  <\/script>` })}`;
}, "C:/Users/Capsizer/Desktop/TehranLasser/src/pages/services/index.astro", void 0);
var $$file = "C:/Users/Capsizer/Desktop/TehranLasser/src/pages/services/index.astro";
var $$url = "/services";
//#endregion
//#region \0virtual:astro:page:src/pages/services/index@_@astro
var page = () => services_exports;
//#endregion
export { page };

export interface ZakatAyah {
  reference: string;
  translation: string;
  translator: string;
}

export const zakatAyat: ZakatAyah[] = [
  {
    reference: "Surah Al-Baqarah 2:43",
    translation: "And establish prayer and give zakah and bow with those who bow [in worship and obedience].",
    translator: "Sahih International"
  },
  {
    reference: "Surah At-Tawbah 9:60",
    translation: "Zakah expenditures are only for the poor and for the needy and for those employed to collect [zakah] and for bringing hearts together [for Islam] and for freeing captives [or slaves] and for those in debt and for the cause of Allah and for the [stranded] traveler - an obligation [imposed] by Allah. And Allah is Knowing and Wise.",
    translator: "Sahih International"
  },
  {
    reference: "Surah At-Tawbah 9:103",
    translation: "Take, [O Muhammad], from their wealth a charity by which you purify them and cause them increase, and invoke [Allah's blessings] upon them. Indeed, your invocations are reassurance for them. And Allah is Hearing and Knowing.",
    translator: "Sahih International"
  },
  {
    reference: "Surah Al-Baqarah 2:267",
    translation: "O you who have believed, spend from the good things which you have earned and from that which We have produced for you from the earth. And do not aim toward the defective therefrom, spending [from that] while you would not take it [yourself] except with closed eyes. And know that Allah is Free of need and Praiseworthy.",
    translator: "Sahih International"
  },
  {
    reference: "Surah Al-Ma'arij 70:24-25",
    translation: "And those within whose wealth is a known right, for the petitioner and the deprived -",
    translator: "Sahih International"
  },
  {
    reference: "Surah Ar-Rum 30:39",
    translation: "And whatever you give for interest to increase within the wealth of people will not increase with Allah. But what you give in zakah, desiring the face [i.e., approval] of Allah - those are the multipliers.",
    translator: "Sahih International"
  }
];

export function getRandomZakatAyah(): ZakatAyah {
  const randomIndex = Math.floor(Math.random() * zakatAyat.length);
  return zakatAyat[randomIndex];
}

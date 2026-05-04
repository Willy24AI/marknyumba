import type { UgandaRegion } from "@/types/property";

export type UgandaRegionOption = {
  value: UgandaRegion;
  label: string;
  description: string;
  towns: string[];
};

export const ugandaRegions: UgandaRegionOption[] = [
  {
    value: "central",
    label: "Central Uganda",
    description: "Kampala, Wakiso, Mukono, Entebbe, Masaka, and nearby towns.",
    towns: [
      "Kampala",
      "Wakiso",
      "Entebbe",
      "Mukono",
      "Masaka",
      "Mityana",
      "Mubende",
      "Luwero",
      "Nakasongola",
      "Kayunga",
      "Mpigi",
      "Kalangala",
      "Rakai",
      "Kyotera",
      "Lugazi",
      "Nansana",
      "Kira",
      "Makindye",
      "Rubaga",
      "Ntinda",
      "Kololo",
      "Muyenga",
      "Naalya",
      "Namugongo",
      "Kajjansi",
      "Kitende",
    ],
  },
  {
    value: "eastern",
    label: "Eastern Uganda",
    description: "Jinja, Mbale, Tororo, Soroti, Busia, Iganga, and eastern growth towns.",
    towns: [
      "Jinja",
      "Mbale",
      "Tororo",
      "Soroti",
      "Busia",
      "Iganga",
      "Kamuli",
      "Pallisa",
      "Kumi",
      "Kapchorwa",
      "Sironko",
      "Budaka",
      "Bududa",
      "Bugiri",
      "Mayuge",
      "Manafwa",
      "Namutumba",
      "Busembatia",
      "Malaba",
      "Pakwach",
      "Moroto",
      "Kotido",
      "Nakapiripirit",
    ],
  },
  {
    value: "northern",
    label: "Northern Uganda",
    description: "Gulu, Lira, Arua, Kitgum, Hoima corridor access, and northern towns.",
    towns: [
      "Gulu",
      "Lira",
      "Arua",
      "Kitgum",
      "Pader",
      "Apac",
      "Nebbi",
      "Adjumani",
      "Moyo",
      "Yumbe",
      "Koboko",
      "Paidha",
      "Amuru",
      "Nwoya",
      "Oyam",
      "Dokolo",
      "Amolatar",
      "Kaabong",
      "Pakwach",
    ],
  },
  {
    value: "western",
    label: "Western Uganda",
    description: "Mbarara, Fort Portal, Hoima, Masindi, Kabale, Kasese, and western towns.",
    towns: [
      "Mbarara",
      "Fort Portal",
      "Hoima",
      "Masindi",
      "Kabale",
      "Kasese",
      "Bushenyi",
      "Ntungamo",
      "Ibanda",
      "Rukungiri",
      "Kanungu",
      "Kisoro",
      "Kyenjojo",
      "Kyegegwa",
      "Buliisa",
      "Kagadi",
      "Kibaale",
      "Bundibugyo",
      "Kamwenge",
      "Lyantonde",
      "Mpondwe",
    ],
  },
];

export const ugandaTownOptions = Array.from(
  new Set(ugandaRegions.flatMap((region) => region.towns))
).sort((a, b) => a.localeCompare(b));

export function regionLabel(region: UgandaRegion | string | null | undefined) {
  return ugandaRegions.find((r) => r.value === region)?.label ?? "Uganda";
}

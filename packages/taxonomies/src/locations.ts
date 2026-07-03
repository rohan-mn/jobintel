import type { Location } from "./schemas.js";

const countryId = (countryCode: string): string =>
  `location:country:${countryCode.toLowerCase()}`;

const admin1Id = (countryCode: string, subdivisionCode: string): string =>
  `location:admin1:${countryCode.toLowerCase()}-${subdivisionCode.toLowerCase()}`;

const defineCountries = (
  entries: readonly (readonly [countryCode: string, slug: string, label: string])[],
): readonly Location[] =>
  Object.freeze(
    entries.map(([countryCode, slug, label]) => ({
      id: countryId(countryCode),
      slug,
      label,
      level: "country" as const,
      countryCode,
      subdivisionCode: null,
      parentId: null,
      status: "active" as const,
    })),
  );

const defineAdmin1 = (
  countryCode: string,
  entries: readonly (readonly [subdivisionCode: string, slug: string, label: string])[],
): readonly Location[] =>
  Object.freeze(
    entries.map(([subdivisionCode, slug, label]) => ({
      id: admin1Id(countryCode, subdivisionCode),
      slug,
      label,
      level: "admin1" as const,
      countryCode,
      subdivisionCode,
      parentId: countryId(countryCode),
      status: "active" as const,
    })),
  );

const defineCities = (
  countryCode: string,
  subdivisionCode: string | null,
  entries: readonly (readonly [slug: string, label: string])[],
): readonly Location[] =>
  Object.freeze(
    entries.map(([slug, label]) => ({
      id:
        subdivisionCode === null
          ? `location:city:${countryCode.toLowerCase()}-${slug}`
          : `location:city:${countryCode.toLowerCase()}-${subdivisionCode.toLowerCase()}-${slug}`,
      slug,
      label,
      level: "city" as const,
      countryCode,
      subdivisionCode,
      parentId:
        subdivisionCode === null
          ? countryId(countryCode)
          : admin1Id(countryCode, subdivisionCode),
      status: "active" as const,
    })),
  );

export const LOCATIONS: readonly Location[] = Object.freeze([
  ...defineCountries([
    ["IN", "india", "India"],
    ["AE", "united-arab-emirates", "United Arab Emirates"],
    ["SA", "saudi-arabia", "Saudi Arabia"],
    ["US", "united-states", "United States"],
    ["GB", "united-kingdom", "United Kingdom"],
    ["CA", "canada", "Canada"],
    ["DE", "germany", "Germany"],
    ["NL", "netherlands", "Netherlands"],
    ["SG", "singapore", "Singapore"],
    ["AU", "australia", "Australia"],
    ["IE", "ireland", "Ireland"],
    ["FR", "france", "France"],
    ["ES", "spain", "Spain"],
    ["SE", "sweden", "Sweden"],
    ["CH", "switzerland", "Switzerland"],
    ["PL", "poland", "Poland"],
    ["JP", "japan", "Japan"],
    ["KR", "south-korea", "South Korea"],
    ["IL", "israel", "Israel"],
    ["NZ", "new-zealand", "New Zealand"],
  ] as const),
  ...defineAdmin1(
    "IN",
    [
      ["KA", "karnataka", "Karnataka"],
      ["MH", "maharashtra", "Maharashtra"],
      ["TS", "telangana", "Telangana"],
      ["TN", "tamil-nadu", "Tamil Nadu"],
      ["DL", "delhi", "Delhi"],
      ["HR", "haryana", "Haryana"],
      ["UP", "uttar-pradesh", "Uttar Pradesh"],
      ["KL", "kerala", "Kerala"],
      ["WB", "west-bengal", "West Bengal"],
      ["GJ", "gujarat", "Gujarat"],
      ["RJ", "rajasthan", "Rajasthan"],
    ] as const,
  ),
  ...defineAdmin1(
    "AE",
    [
      ["DU", "dubai", "Dubai"],
      ["AZ", "abu-dhabi", "Abu Dhabi"],
      ["SH", "sharjah", "Sharjah"],
      ["AJ", "ajman", "Ajman"],
    ] as const,
  ),
  ...defineAdmin1(
    "SA",
    [
      ["01", "riyadh-province", "Riyadh Province"],
      ["02", "makkah-province", "Makkah Province"],
      ["04", "eastern-province", "Eastern Province"],
      ["03", "madinah-province", "Madinah Province"],
    ] as const,
  ),
  ...defineAdmin1(
    "US",
    [
      ["CA", "california", "California"],
      ["NY", "new-york", "New York"],
      ["WA", "washington", "Washington"],
      ["TX", "texas", "Texas"],
      ["MA", "massachusetts", "Massachusetts"],
      ["IL", "illinois", "Illinois"],
      ["GA", "georgia", "Georgia"],
      ["NC", "north-carolina", "North Carolina"],
      ["VA", "virginia", "Virginia"],
      ["CO", "colorado", "Colorado"],
      ["FL", "florida", "Florida"],
      ["OR", "oregon", "Oregon"],
    ] as const,
  ),
  ...defineAdmin1(
    "GB",
    [
      ["ENG", "england", "England"],
      ["SCT", "scotland", "Scotland"],
      ["WLS", "wales", "Wales"],
      ["NIR", "northern-ireland", "Northern Ireland"],
    ] as const,
  ),
  ...defineAdmin1(
    "CA",
    [
      ["ON", "ontario", "Ontario"],
      ["BC", "british-columbia", "British Columbia"],
      ["QC", "quebec", "Quebec"],
      ["AB", "alberta", "Alberta"],
      ["NS", "nova-scotia", "Nova Scotia"],
    ] as const,
  ),
  ...defineAdmin1(
    "DE",
    [
      ["BE", "berlin", "Berlin"],
      ["BY", "bavaria", "Bavaria"],
      ["HE", "hesse", "Hesse"],
      ["HH", "hamburg", "Hamburg"],
      ["NW", "north-rhine-westphalia", "North Rhine-Westphalia"],
      ["BW", "baden-wurttemberg", "Baden-Württemberg"],
      ["SN", "saxony", "Saxony"],
    ] as const,
  ),
  ...defineAdmin1(
    "NL",
    [
      ["NH", "north-holland", "North Holland"],
      ["ZH", "south-holland", "South Holland"],
      ["UT", "utrecht", "Utrecht"],
      ["NB", "north-brabant", "North Brabant"],
      ["GE", "gelderland", "Gelderland"],
    ] as const,
  ),
  ...defineAdmin1(
    "AU",
    [
      ["NSW", "new-south-wales", "New South Wales"],
      ["VIC", "victoria", "Victoria"],
      ["QLD", "queensland", "Queensland"],
      ["WA", "western-australia", "Western Australia"],
      ["ACT", "australian-capital-territory", "Australian Capital Territory"],
      ["SA", "south-australia", "South Australia"],
    ] as const,
  ),
  ...defineCities(
    "IN",
    "KA",
    [
      ["bengaluru", "Bengaluru"],
      ["mysuru", "Mysuru"],
    ] as const,
  ),
  ...defineCities(
    "IN",
    "MH",
    [
      ["mumbai", "Mumbai"],
      ["pune", "Pune"],
      ["nagpur", "Nagpur"],
    ] as const,
  ),
  ...defineCities(
    "IN",
    "TS",
    [
      ["hyderabad", "Hyderabad"],
    ] as const,
  ),
  ...defineCities(
    "IN",
    "TN",
    [
      ["chennai", "Chennai"],
      ["coimbatore", "Coimbatore"],
    ] as const,
  ),
  ...defineCities(
    "IN",
    "DL",
    [
      ["new-delhi", "New Delhi"],
      ["delhi", "Delhi"],
    ] as const,
  ),
  ...defineCities(
    "IN",
    "HR",
    [
      ["gurugram", "Gurugram"],
    ] as const,
  ),
  ...defineCities(
    "IN",
    "UP",
    [
      ["noida", "Noida"],
    ] as const,
  ),
  ...defineCities(
    "IN",
    "KL",
    [
      ["kochi", "Kochi"],
      ["thiruvananthapuram", "Thiruvananthapuram"],
    ] as const,
  ),
  ...defineCities(
    "IN",
    "WB",
    [
      ["kolkata", "Kolkata"],
    ] as const,
  ),
  ...defineCities(
    "IN",
    "GJ",
    [
      ["ahmedabad", "Ahmedabad"],
    ] as const,
  ),
  ...defineCities(
    "IN",
    "RJ",
    [
      ["jaipur", "Jaipur"],
    ] as const,
  ),
  ...defineCities(
    "AE",
    "DU",
    [
      ["dubai", "Dubai"],
    ] as const,
  ),
  ...defineCities(
    "AE",
    "AZ",
    [
      ["abu-dhabi", "Abu Dhabi"],
      ["al-ain", "Al Ain"],
    ] as const,
  ),
  ...defineCities(
    "AE",
    "SH",
    [
      ["sharjah", "Sharjah"],
    ] as const,
  ),
  ...defineCities(
    "AE",
    "AJ",
    [
      ["ajman", "Ajman"],
    ] as const,
  ),
  ...defineCities(
    "SA",
    "01",
    [
      ["riyadh", "Riyadh"],
    ] as const,
  ),
  ...defineCities(
    "SA",
    "02",
    [
      ["jeddah", "Jeddah"],
      ["makkah", "Makkah"],
    ] as const,
  ),
  ...defineCities(
    "SA",
    "04",
    [
      ["dammam", "Dammam"],
      ["al-khobar", "Al Khobar"],
      ["dhahran", "Dhahran"],
    ] as const,
  ),
  ...defineCities(
    "SA",
    "03",
    [
      ["madinah", "Madinah"],
    ] as const,
  ),
  ...defineCities(
    "US",
    "CA",
    [
      ["san-francisco", "San Francisco"],
      ["san-jose", "San Jose"],
      ["los-angeles", "Los Angeles"],
      ["san-diego", "San Diego"],
      ["sacramento", "Sacramento"],
    ] as const,
  ),
  ...defineCities(
    "US",
    "NY",
    [
      ["new-york-city", "New York City"],
      ["buffalo", "Buffalo"],
    ] as const,
  ),
  ...defineCities(
    "US",
    "WA",
    [
      ["seattle", "Seattle"],
      ["bellevue", "Bellevue"],
    ] as const,
  ),
  ...defineCities(
    "US",
    "TX",
    [
      ["austin", "Austin"],
      ["dallas", "Dallas"],
      ["houston", "Houston"],
    ] as const,
  ),
  ...defineCities(
    "US",
    "MA",
    [
      ["boston", "Boston"],
      ["cambridge", "Cambridge"],
    ] as const,
  ),
  ...defineCities(
    "US",
    "IL",
    [
      ["chicago", "Chicago"],
    ] as const,
  ),
  ...defineCities(
    "US",
    "GA",
    [
      ["atlanta", "Atlanta"],
    ] as const,
  ),
  ...defineCities(
    "US",
    "NC",
    [
      ["raleigh", "Raleigh"],
      ["charlotte", "Charlotte"],
    ] as const,
  ),
  ...defineCities(
    "US",
    "VA",
    [
      ["arlington", "Arlington"],
      ["reston", "Reston"],
    ] as const,
  ),
  ...defineCities(
    "US",
    "CO",
    [
      ["denver", "Denver"],
      ["boulder", "Boulder"],
    ] as const,
  ),
  ...defineCities(
    "US",
    "FL",
    [
      ["miami", "Miami"],
      ["tampa", "Tampa"],
    ] as const,
  ),
  ...defineCities(
    "US",
    "OR",
    [
      ["portland", "Portland"],
    ] as const,
  ),
  ...defineCities(
    "GB",
    "ENG",
    [
      ["london", "London"],
      ["manchester", "Manchester"],
      ["cambridge", "Cambridge"],
      ["bristol", "Bristol"],
      ["birmingham", "Birmingham"],
      ["leeds", "Leeds"],
    ] as const,
  ),
  ...defineCities(
    "GB",
    "SCT",
    [
      ["edinburgh", "Edinburgh"],
      ["glasgow", "Glasgow"],
    ] as const,
  ),
  ...defineCities(
    "GB",
    "WLS",
    [
      ["cardiff", "Cardiff"],
    ] as const,
  ),
  ...defineCities(
    "GB",
    "NIR",
    [
      ["belfast", "Belfast"],
    ] as const,
  ),
  ...defineCities(
    "CA",
    "ON",
    [
      ["toronto", "Toronto"],
      ["ottawa", "Ottawa"],
      ["waterloo", "Waterloo"],
    ] as const,
  ),
  ...defineCities(
    "CA",
    "BC",
    [
      ["vancouver", "Vancouver"],
      ["victoria", "Victoria"],
    ] as const,
  ),
  ...defineCities(
    "CA",
    "QC",
    [
      ["montreal", "Montreal"],
      ["quebec-city", "Quebec City"],
    ] as const,
  ),
  ...defineCities(
    "CA",
    "AB",
    [
      ["calgary", "Calgary"],
      ["edmonton", "Edmonton"],
    ] as const,
  ),
  ...defineCities(
    "CA",
    "NS",
    [
      ["halifax", "Halifax"],
    ] as const,
  ),
  ...defineCities(
    "DE",
    "BE",
    [
      ["berlin", "Berlin"],
    ] as const,
  ),
  ...defineCities(
    "DE",
    "BY",
    [
      ["munich", "Munich"],
      ["nuremberg", "Nuremberg"],
    ] as const,
  ),
  ...defineCities(
    "DE",
    "HE",
    [
      ["frankfurt", "Frankfurt"],
    ] as const,
  ),
  ...defineCities(
    "DE",
    "HH",
    [
      ["hamburg", "Hamburg"],
    ] as const,
  ),
  ...defineCities(
    "DE",
    "NW",
    [
      ["cologne", "Cologne"],
      ["dusseldorf", "Düsseldorf"],
    ] as const,
  ),
  ...defineCities(
    "DE",
    "BW",
    [
      ["stuttgart", "Stuttgart"],
      ["karlsruhe", "Karlsruhe"],
    ] as const,
  ),
  ...defineCities(
    "DE",
    "SN",
    [
      ["leipzig", "Leipzig"],
      ["dresden", "Dresden"],
    ] as const,
  ),
  ...defineCities(
    "NL",
    "NH",
    [
      ["amsterdam", "Amsterdam"],
    ] as const,
  ),
  ...defineCities(
    "NL",
    "ZH",
    [
      ["rotterdam", "Rotterdam"],
      ["the-hague", "The Hague"],
    ] as const,
  ),
  ...defineCities(
    "NL",
    "UT",
    [
      ["utrecht", "Utrecht"],
    ] as const,
  ),
  ...defineCities(
    "NL",
    "NB",
    [
      ["eindhoven", "Eindhoven"],
    ] as const,
  ),
  ...defineCities(
    "NL",
    "GE",
    [
      ["arnhem", "Arnhem"],
      ["nijmegen", "Nijmegen"],
    ] as const,
  ),
  ...defineCities(
    "AU",
    "NSW",
    [
      ["sydney", "Sydney"],
      ["newcastle", "Newcastle"],
    ] as const,
  ),
  ...defineCities(
    "AU",
    "VIC",
    [
      ["melbourne", "Melbourne"],
    ] as const,
  ),
  ...defineCities(
    "AU",
    "QLD",
    [
      ["brisbane", "Brisbane"],
      ["gold-coast", "Gold Coast"],
    ] as const,
  ),
  ...defineCities(
    "AU",
    "WA",
    [
      ["perth", "Perth"],
    ] as const,
  ),
  ...defineCities(
    "AU",
    "ACT",
    [
      ["canberra", "Canberra"],
    ] as const,
  ),
  ...defineCities(
    "AU",
    "SA",
    [
      ["adelaide", "Adelaide"],
    ] as const,
  ),
  ...defineCities(
    "SG",
    null,
    [
      ["singapore", "Singapore"],
    ] as const,
  ),
  ...defineCities(
    "IE",
    null,
    [
      ["dublin", "Dublin"],
      ["cork", "Cork"],
      ["galway", "Galway"],
    ] as const,
  ),
  ...defineCities(
    "FR",
    null,
    [
      ["paris", "Paris"],
      ["lyon", "Lyon"],
      ["toulouse", "Toulouse"],
    ] as const,
  ),
  ...defineCities(
    "ES",
    null,
    [
      ["madrid", "Madrid"],
      ["barcelona", "Barcelona"],
      ["valencia", "Valencia"],
    ] as const,
  ),
  ...defineCities(
    "SE",
    null,
    [
      ["stockholm", "Stockholm"],
      ["gothenburg", "Gothenburg"],
      ["malmo", "Malmö"],
    ] as const,
  ),
  ...defineCities(
    "CH",
    null,
    [
      ["zurich", "Zurich"],
      ["geneva", "Geneva"],
      ["basel", "Basel"],
    ] as const,
  ),
  ...defineCities(
    "PL",
    null,
    [
      ["warsaw", "Warsaw"],
      ["krakow", "Kraków"],
      ["wroclaw", "Wrocław"],
    ] as const,
  ),
  ...defineCities(
    "JP",
    null,
    [
      ["tokyo", "Tokyo"],
      ["osaka", "Osaka"],
      ["kyoto", "Kyoto"],
    ] as const,
  ),
  ...defineCities(
    "KR",
    null,
    [
      ["seoul", "Seoul"],
      ["busan", "Busan"],
    ] as const,
  ),
  ...defineCities(
    "IL",
    null,
    [
      ["tel-aviv", "Tel Aviv"],
      ["jerusalem", "Jerusalem"],
      ["haifa", "Haifa"],
    ] as const,
  ),
  ...defineCities(
    "NZ",
    null,
    [
      ["auckland", "Auckland"],
      ["wellington", "Wellington"],
      ["christchurch", "Christchurch"],
    ] as const,
  ),
]);

export const LOCATION_BY_ID: ReadonlyMap<string, Location> = new Map(
  LOCATIONS.map((location) => [location.id, location] as const),
);

export const getChildLocations = (parentId: string): readonly Location[] =>
  LOCATIONS.filter((location) => location.parentId === parentId);

export const getDescendantLocationIds = (locationId: string): readonly string[] => {
  if (!LOCATION_BY_ID.has(locationId)) {
    return [];
  }

  const descendantIds: string[] = [];
  const pendingParentIds: string[] = [locationId];

  while (pendingParentIds.length > 0) {
    const parentId = pendingParentIds.pop();
    if (parentId === undefined) {
      continue;
    }

    const children = getChildLocations(parentId);
    for (const child of children) {
      descendantIds.push(child.id);
      pendingParentIds.push(child.id);
    }
  }

  return descendantIds;
};

export const expandLocationFilter = (locationId: string): readonly string[] =>
  LOCATION_BY_ID.has(locationId)
    ? [locationId, ...getDescendantLocationIds(locationId)]
    : [];

// A more comprehensive list for demo purposes.
export const locations: Record<string, Record<string, string[]>> = {
  USA: {
    California: ['Los Angeles', 'San Francisco', 'San Diego', 'Sacramento', 'San Jose'],
    'New York': ['New York City', 'Buffalo', 'Rochester', 'Albany', 'Syracuse'],
    Texas: ['Houston', 'Dallas', 'Austin', 'San Antonio', 'Fort Worth'],
    Florida: ['Miami', 'Orlando', 'Tampa', 'Jacksonville', 'St. Petersburg'],
    Illinois: ['Chicago', 'Aurora', 'Naperville'],
    Washington: ['Seattle', 'Tacoma', 'Spokane'],
    Massachusetts: ['Boston', 'Worcester', 'Springfield'],
    Colorado: ['Denver', 'Colorado Springs', 'Aurora'],
    Arizona: ['Phoenix', 'Tucson', 'Mesa'],
    Pennsylvania: ['Philadelphia', 'Pittsburgh'],
  },
  India: {
    Maharashtra: ['Mumbai', 'Pune', 'Nagpur', 'Thane'],
    Delhi: ['New Delhi'],
    Karnataka: ['Bengaluru', 'Mysuru', 'Hubli'],
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai'],
    'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Agra'],
    'West Bengal': ['Kolkata', 'Howrah'],
    Gujarat: ['Ahmedabad', 'Surat'],
    Telangana: ['Hyderabad'],
  },
  Germany: {
    Berlin: ['Berlin'],
    Bavaria: ['Munich', 'Nuremberg', 'Augsburg'],
    'North Rhine-Westphalia': ['Cologne', 'Düsseldorf', 'Dortmund', 'Essen'],
    Hamburg: ['Hamburg'],
    Hesse: ['Frankfurt', 'Wiesbaden'],
  },
  France: {
    'Île-de-France': ['Paris'],
    'Provence-Alpes-Côte d\'Azur': ['Marseille', 'Nice'],
    'Auvergne-Rhône-Alpes': ['Lyon', 'Grenoble'],
    Occitanie: ['Toulouse', 'Montpellier'],
  },
  UK: {
    England: ['London', 'Manchester', 'Birmingham', 'Liverpool', 'Bristol'],
    Scotland: ['Glasgow', 'Edinburgh'],
    Wales: ['Cardiff'],
    'Northern Ireland': ['Belfast'],
  },
  Canada: {
    Ontario: ['Toronto', 'Ottawa', 'Mississauga', 'Hamilton'],
    Quebec: ['Montreal', 'Quebec City'],
    'British Columbia': ['Vancouver', 'Victoria', 'Surrey'],
    Alberta: ['Calgary', 'Edmonton'],
  },
  Australia: {
    'New South Wales': ['Sydney'],
    Victoria: ['Melbourne'],
    Queensland: ['Brisbane', 'Gold Coast'],
    'Western Australia': ['Perth'],
  },
  Japan: {
    Tokyo: ['Tokyo'],
    Osaka: ['Osaka'],
    Kanagawa: ['Yokohama'],
    Aichi: ['Nagoya'],
  },
  China: {
    Beijing: ['Beijing'],
    Shanghai: ['Shanghai'],
    Guangdong: ['Guangzhou', 'Shenzhen'],
    Sichuan: ['Chengdu'],
  },
  Brazil: {
    'São Paulo': ['São Paulo'],
    'Rio de Janeiro': ['Rio de Janeiro'],
    Bahia: ['Salvador'],
    'Distrito Federal': ['Brasília'],
  },
  Mexico: {
    'Mexico City': ['Mexico City'],
    Jalisco: ['Guadalajara'],
    'Nuevo León': ['Monterrey'],
  },
  Italy: {
    Lazio: ['Rome'],
    Lombardy: ['Milan'],
    Campania: ['Naples'],
    Piedmont: ['Turin'],
  },
  Spain: {
    'Community of Madrid': ['Madrid'],
    Catalonia: ['Barcelona'],
    Andalusia: ['Seville', 'Málaga'],
    Valencia: ['Valencia'],
  },
  Russia: {
    Moscow: ['Moscow'],
    'Saint Petersburg': ['Saint Petersburg'],
    'Novosibirsk Oblast': ['Novosibirsk'],
  },
  'South Africa': {
    Gauteng: ['Johannesburg', 'Pretoria'],
    'Western Cape': ['Cape Town'],
    'KwaZulu-Natal': ['Durban'],
  },
  Nigeria: {
    Lagos: ['Lagos'],
    FCT: ['Abuja'],
    Kano: ['Kano'],
  },
  Egypt: {
    Cairo: ['Cairo'],
    Alexandria: ['Alexandria'],
    Giza: ['Giza'],
  },
  'South Korea': {
    Seoul: ['Seoul'],
    Busan: ['Busan'],
    Incheon: ['Incheon'],
  },
  Argentina: {
    'Buenos Aires': ['Buenos Aires'],
    Córdoba: ['Córdoba'],
    'Santa Fe': ['Rosario'],
  },
  'New Zealand': {
    Auckland: ['Auckland'],
    Wellington: ['Wellington'],
    Canterbury: ['Christchurch'],
  },
};

export const countries = Object.keys(locations).sort();

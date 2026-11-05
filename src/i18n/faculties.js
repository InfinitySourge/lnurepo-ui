export const facultyNames = {
  'Біологічний факультет': 'Faculty of Biology',
  'Географічний факультет': 'Faculty of Geography',
  'Геологічний факультет': 'Faculty of Geology',
  'Економічний факультет': 'Faculty of Economics',
  'Історичний факультет': 'Faculty of History',
  'Механіко-математичний факультет': 'Faculty of Mechanics and Mathematics',
  'Факультет прикладної математики та інформатики': 'Faculty of Applied Mathematics and Informatics',
  'Факультет електроніки та комп’ютерних технологій': 'Faculty of Electronics and Computer Technologies',
  'Факультет журналістики': 'Faculty of Journalism',
  'Факультет іноземних мов': 'Faculty of Foreign Languages',
  'Факультет культури і мистецтв': 'Faculty of Culture and Arts',
  'Факультет міжнародних відносин': 'Faculty of International Relations',
  'Факультет педагогічної освіти': 'Faculty of Teacher Education',
  'Факультет управління фінансами та бізнесу': 'Faculty of Financial Management and Business',
  'Фізичний факультет': 'Faculty of Physics',
  'Філологічний факультет': 'Faculty of Philology',
  'Філософський факультет': 'Faculty of Philosophy',
  'Хімічний факультет': 'Faculty of Chemistry',
  'Юридичний факультет': 'Faculty of Law',
};
export function facultyLabel(value, language) {
  return language === 'en' && Object.hasOwn(facultyNames, value) ? facultyNames[value] : value;
}

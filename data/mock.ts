
import { TableRow, Column } from '../types';

export const COLUMNS: Column[] = [
  { id: 'name', label: 'Name', type: 'text', width: '180px' },
  { id: 'external', label: 'Ext', type: 'boolean', width: '50px' },
  { id: 'age', label: 'Age', type: 'number', unit: 'years', width: '70px' },
  { id: 'experience', label: 'Exp', type: 'number', unit: 'years', width: '70px' },
  { id: 'score', label: 'Score', type: 'number', unit: 'percent', width: '80px' },
  { id: 'birthday', label: 'Birthday', type: 'date', width: '110px' },
  { id: 'manager', label: 'Manager', type: 'person', width: '150px' },
  { id: 'company', label: 'Company', type: 'company', width: '160px' },
];

const MANAGERS = [
  { name: 'Ignacio Rau', initials: 'IR', avatar: 'https://picsum.photos/seed/1/40/40' },
  { name: 'Eva Hill', initials: 'EH', avatar: 'https://picsum.photos/seed/2/40/40' },
  { name: 'Darlene Konop', initials: 'DK', avatar: 'https://picsum.photos/seed/3/40/40' },
  { name: 'Loretta Stark', initials: 'LS', avatar: 'https://picsum.photos/seed/4/40/40' },
  { name: 'Randolph Price', initials: 'RP', avatar: 'https://picsum.photos/seed/5/40/40' },
];

const COMPANIES = [
  { name: 'Terry - Co', icon: '🏢' },
  { name: 'Simonis LLC', icon: '🌐' },
  { name: 'Sanford Inc', icon: '📉' },
  { name: 'Koch Group', icon: '💎' },
  { name: 'Schmeler Co', icon: '💠' },
];

const FIRST_NAMES = ['Armando', 'Elisa', 'Cristina', 'Belinda', 'Rex', 'Janice', 'Steven', 'Mario', 'Rhonda', 'Homer', 'Javier'];
const LAST_NAMES = ['Herman', 'Gusikowski', 'Olson', 'Bashir', 'Blanda', 'Gerlach', 'Kunde', 'Cole', 'Barton', 'Hand', 'Kutch'];

export const generateMockRows = (count: number): TableRow[] => {
  return Array.from({ length: count }, (_, i) => {
    const age = 20 + Math.floor(Math.random() * 40);
    return {
      id: `row-${i}`,
      name: `${FIRST_NAMES[i % FIRST_NAMES.length]} ${LAST_NAMES[i % LAST_NAMES.length]}`,
      external: Math.random() > 0.5,
      age: age,
      experience: Math.floor(Math.random() * (age - 18)), // Logic: can't have more exp than (age - adulthood)
      score: Math.floor(Math.random() * 100),
      birthday: `0${1 + (i % 9)}/0${1 + (i % 9)}/${1970 + (i % 30)}`,
      manager: MANAGERS[i % MANAGERS.length],
      company: COMPANIES[i % COMPANIES.length],
    };
  });
};

// ===== НАСТРОЙКИ КАРТИНОК =====
const IMG_EXT = '.png';
const IMG_FOLDER = 'images/';
const TOTAL_LEVELS = 61;

// ===== ДАННЫЕ УРОВНЕЙ =====
const GIFT_NAMES = [
  'Обычный', 'Синий', 'Зелёный', 'Золотой', 'Огненный',
  'Красный', 'Фиолетовый', 'Розовый', 'Золотой+', 'Легенда',
  'Мифический', 'Божественный', 'Кристалл', 'Плазма', 'Неон',
  'Лазер', 'Галактика', 'Космос', 'Вселенная', 'Портал',
  'Червоточина', 'Сингулярность', 'Кварк', 'Глюон', 'Бозон',
  'Фотон', 'Тахион', 'Гравитон', 'Магнетон', 'Электрон',
  'Протон', 'Нейтрон', 'Атом', 'Молекула', 'Клетка',
  'Орган', 'Система', 'Организм', 'Разум', 'Интеллект',
  'Мудрость', 'Просветление', 'Нирвана', 'Трансценденция', 'Абсолют',
  'Бесконечность', 'Вечность', 'Совершенство', 'Гармония', 'Равновесие',
  'Единство', 'Целостность', 'Сущность', 'Суть', 'Ядро',
  'Сердце', 'Душа', 'Дух', 'Сознание', 'Сверхразум',
  'Омега'
];

const GIFT_COLORS = [
  '#6B7280', '#3B82F6', '#22C55E', '#EAB308', '#F97316',
  '#EF4444', '#A855F7', '#EC4899', '#F59E0B', '#6366F1',
  '#8B5CF6', '#7C3AED', '#06B6D4', '#84CC16', '#F43F5E',
  '#10B981', '#8B5CF6', '#D946EF', '#F97316', '#3B82F6',
  '#22C55E', '#EAB308', '#EF4444', '#A855F7', '#EC4899',
  '#F59E0B', '#6366F1', '#8B5CF6', '#7C3AED', '#06B6D4',
  '#84CC16', '#F43F5E', '#10B981', '#3B82F6', '#22C55E',
  '#EAB308', '#EF4444', '#A855F7', '#EC4899', '#F59E0B',
  '#6366F1', '#8B5CF6', '#7C3AED', '#06B6D4', '#84CC16',
  '#F43F5E', '#10B981', '#3B82F6', '#22C55E', '#EAB308',
  '#EF4444', '#A855F7', '#EC4899', '#F59E0B', '#6366F1',
  '#8B5CF6', '#7C3AED', '#06B6D4', '#84CC16', '#F43F5E',
  '#10B981'
];

const GIFT_CLICKS = [
  10, 50, 150, 300, 500,
  800, 2000, 4000, 7890, 10000,
  25000, 50000, 75000, 100000, 150000,
  200000, 300000, 500000, 750000, 1000000,
  1500000, 2000000, 3000000, 5000000, 7500000,
  10000000, 15000000, 20000000, 30000000, 50000000,
  75000000, 100000000, 150000000, 200000000, 300000000,
  500000000, 750000000, 1000000000, 1500000000, 2000000000,
  3000000000, 5000000000, 7500000000, 10000000000, 15000000000,
  20000000000, 30000000000, 50000000000, 75000000000, 100000000000,
  150000000000, 200000000000, 300000000000, 500000000000, 750000000000,
  1000000000000, 1500000000000, 2000000000000, 3000000000000, 5000000000000,
  10000000000000
];

const GIFT_REWARDS = [
  50, 258, 800, 1650, 2833,
  4666, 12000, 24666, 49970, 65000,
  166666, 341666, 525000, 716666, 1100000,
  1500000, 2300000, 3916666, 6000000, 8166666,
  12499999, 17000000, 26000000, 44166666, 67500000,
  91666666, 140000000, 190000000, 290000000, 491666666,
  750000000, 1016666666, 1549999999, 2100000000, 3200000000,
  5416666666, 8250000000, 11166666666, 16999999999, 23000000000,
  35000000000, 59166666666, 90000000000, 121666666666, 184999999999,
  250000000000, 380000000000, 641666666666, 975000000000, 1316666666666,
  2000000000000, 2700000000000, 4100000000000, 6916666666666, 10500000000000,
  14166666666666, 21500000000000, 29000000000000, 44000000000000, 74166666666666,
  150000000000000
];

const GIFTS = [];
for (let i = 0; i < TOTAL_LEVELS; i++) {
  GIFTS.push({
    name: GIFT_NAMES[i],
    src: IMG_FOLDER + (i + 1) + IMG_EXT,
    color: GIFT_COLORS[i],
    clicks: GIFT_CLICKS[i],
    reward: GIFT_REWARDS[i]
  });
}

const UPGRADES = [
  {id:"power_1",group:"power",groupName:"Сила клика",level:1,maxLevel:10,icon:"⚡",name:"Сила клика",desc:"x2 монет за клик",price:100,type:"power",val:2},
  {id:"power_2",group:"power",groupName:"Сила клика",level:2,maxLevel:10,icon:"⚡",name:"Сила клика",desc:"x5 монет за клик",price:2000,type:"power",val:5},
  {id:"power_3",group:"power",groupName:"Сила клика",level:3,maxLevel:10,icon:"⚡",name:"Сила клика",desc:"x15 монет за клик",price:15000,type:"power",val:15},
  {id:"power_4",group:"power",groupName:"Сила клика",level:4,maxLevel:10,icon:"⚡",name:"Сила клика",desc:"x50 монет за клик",price:150000,type:"power",val:50},
  {id:"power_5",group:"power",groupName:"Сила клика",level:5,maxLevel:10,icon:"⚡",name:"Сила клика",desc:"x200 монет за клик",price:2000000,type:"power",val:200},
  {id:"power_6",group:"power",groupName:"Сила клика",level:6,maxLevel:10,icon:"💥",name:"Сила клика",desc:"x1000 монет за клик",price:25000000,type:"power",val:1000},
  {id:"power_7",group:"power",groupName:"Сила клика",level:7,maxLevel:10,icon:"💥",name:"Сила клика",desc:"x5000 монет за клик",price:250000000,type:"power",val:5000},
  {id:"power_8",group:"power",groupName:"Сила клика",level:8,maxLevel:10,icon:"🔥",name:"Сила клика",desc:"x25000 монет за клик",price:2500000000,type:"power",val:25000},
  {id:"power_9",group:"power",groupName:"Сила клика",level:9,maxLevel:10,icon:"🔥",name:"Сила клика",desc:"x100000 монет за клик",price:25000000000,type:"power",val:100000},
  {id:"power_10",group:"power",groupName:"Сила клика",level:10,maxLevel:10,icon:"👑",name:"Сила клика",desc:"x1000000 монет за клик",price:250000000000,type:"power",val:1000000},
  
  {id:"auto_1",group:"auto",groupName:"Автокликер",level:1,maxLevel:10,icon:"🤖",name:"Автокликер",desc:"+1 клик/сек",price:300,type:"auto",val:1},
  {id:"auto_2",group:"auto",groupName:"Автокликер",level:2,maxLevel:10,icon:"🤖",name:"Автокликер",desc:"+5 кликов/сек",price:5000,type:"auto",val:5},
  {id:"auto_3",group:"auto",groupName:"Автокликер",level:3,maxLevel:10,icon:"🤖",name:"Автокликер",desc:"+25 кликов/сек",price:50000,type:"auto",val:25},
  {id:"auto_4",group:"auto",groupName:"Автокликер",level:4,maxLevel:10,icon:"🤖",name:"Автокликер",desc:"+100 кликов/сек",price:500000,type:"auto",val:100},
  {id:"auto_5",group:"auto",groupName:"Автокликер",level:5,maxLevel:10,icon:"🤖",name:"Автокликер",desc:"+500 кликов/сек",price:10000000,type:"auto",val:500},
  {id:"auto_6",group:"auto",groupName:"Автокликер",level:6,maxLevel:10,icon:"⚙️",name:"Автокликер",desc:"+2500 кликов/сек",price:100000000,type:"auto",val:2500},
  {id:"auto_7",group:"auto",groupName:"Автокликер",level:7,maxLevel:10,icon:"⚙️",name:"Автокликер",desc:"+10000 кликов/сек",price:1000000000,type:"auto",val:10000},
  {id:"auto_8",group:"auto",groupName:"Автокликер",level:8,maxLevel:10,icon:"🔋",name:"Автокликер",desc:"+50000 кликов/сек",price:10000000000,type:"auto",val:50000},
  {id:"auto_9",group:"auto",groupName:"Автокликер",level:9,maxLevel:10,icon:"🔋",name:"Автокликер",desc:"+250000 кликов/сек",price:100000000000,type:"auto",val:250000},
  {id:"auto_10",group:"auto",groupName:"Автокликер",level:10,maxLevel:10,icon:"🚀",name:"Автокликер",desc:"+1000000 кликов/сек",price:1000000000000,type:"auto",val:1000000},
  
  {id:"luck_1",group:"luck",groupName:"Удача",level:1,maxLevel:10,icon:"🍀",name:"Удача",desc:"+5% шанс x2",price:1500,type:"luck",val:0.05},
  {id:"luck_2",group:"luck",groupName:"Удача",level:2,maxLevel:10,icon:"🍀",name:"Удача",desc:"+12% шанс x2",price:50000,type:"luck",val:0.12},
  {id:"luck_3",group:"luck",groupName:"Удача",level:3,maxLevel:10,icon:"🍀",name:"Удача",desc:"+22% шанс x2",price:500000,type:"luck",val:0.22},
  {id:"luck_4",group:"luck",groupName:"Удача",level:4,maxLevel:10,icon:"🍀",name:"Удача",desc:"+35% шанс x2",price:5000000,type:"luck",val:0.35},
  {id:"luck_5",group:"luck",groupName:"Удача",level:5,maxLevel:10,icon:"🌟",name:"Удача",desc:"+50% шанс x2",price:50000000,type:"luck",val:0.50},
  {id:"luck_6",group:"luck",groupName:"Удача",level:6,maxLevel:10,icon:"🌟",name:"Удача",desc:"+65% шанс x2",price:500000000,type:"luck",val:0.65},
  {id:"luck_7",group:"luck",groupName:"Удача",level:7,maxLevel:10,icon:"✨",name:"Удача",desc:"+78% шанс x2",price:5000000000,type:"luck",val:0.78},
  {id:"luck_8",group:"luck",groupName:"Удача",level:8,maxLevel:10,icon:"✨",name:"Удача",desc:"+88% шанс x2",price:50000000000,type:"luck",val:0.88},
  {id:"luck_9",group:"luck",groupName:"Удача",level:9,maxLevel:10,icon:"💎",name:"Удача",desc:"+95% шанс x2",price:500000000000,type:"luck",val:0.95},
  {id:"luck_10",group:"luck",groupName:"Удача",level:10,maxLevel:10,icon:"👑",name:"Удача",desc:"+100% шанс x2",price:5000000000000,type:"luck",val:1.0}
];

const POTION_COST = 15;
const POTION_DURATIONS = {luck:30000,power:60000,auto:30000};

function getPotionCost(){
  return POTION_COST;
}
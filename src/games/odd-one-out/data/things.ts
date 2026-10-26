import type { Words } from "../../../shared/language";
import type { CategorizedItem } from "../rounds";

export interface Category {
  id: string;
  /** What the three of a round are: "Це фрукти", "These are fruits". */
  these: Words;
  /** What a thing of it is, after the thing's name: "Яблуко — це фрукт", "The apple is a fruit". */
  isA: Words;
  /** The English after a plural name, as "The grapes are berries", where it differs from `isA`. */
  enPlural?: string;
}

export interface Thing extends CategorizedItem {
  /** The Ukrainian name, as the game says it: "яблуко". */
  uk: string;
  /** The English name, as the game says it after "the": "apple". */
  en: string;
  /** The English name is plural: "The jeans are clothing". */
  enIsPlural?: boolean;
}

export const CATEGORIES: readonly Category[] = [
  {
    id: "fruit",
    these: { uk: "Це фрукти", en: "These are fruits" },
    isA: { uk: "це фрукт", en: "a fruit" },
    enPlural: "fruits",
  },
  {
    id: "vegetables",
    these: { uk: "Це овочі", en: "These are vegetables" },
    isA: { uk: "це овоч", en: "a vegetable" },
    enPlural: "vegetables",
  },
  {
    id: "berries",
    these: { uk: "Це ягоди", en: "These are berries" },
    isA: { uk: "це ягода", en: "a berry" },
    enPlural: "berries",
  },
  {
    id: "sweets",
    these: { uk: "Це солодощі", en: "These are sweets" },
    isA: { uk: "це солодощі", en: "a sweet treat" },
    enPlural: "sweet treats",
  },
  {
    id: "vehicles",
    these: { uk: "Це транспорт", en: "These are vehicles" },
    isA: { uk: "це транспорт", en: "a vehicle" },
    enPlural: "vehicles",
  },
  {
    id: "domestic",
    these: { uk: "Це свійські тварини", en: "These are domestic animals" },
    isA: { uk: "це свійська тварина", en: "a domestic animal" },
    enPlural: "domestic animals",
  },
  {
    id: "forest",
    these: { uk: "Це лісові звірі", en: "These are forest animals" },
    isA: { uk: "це лісовий звір", en: "a forest animal" },
    enPlural: "forest animals",
  },
  {
    id: "hot",
    these: { uk: "Це тварини жарких країн", en: "These are animals from hot countries" },
    isA: { uk: "це тварина жарких країн", en: "an animal from hot countries" },
    enPlural: "animals from hot countries",
  },
  {
    id: "birds",
    these: { uk: "Це птахи", en: "These are birds" },
    isA: { uk: "це птах", en: "a bird" },
    enPlural: "birds",
  },
  {
    id: "insects",
    these: { uk: "Це комахи", en: "These are insects" },
    isA: { uk: "це комаха", en: "an insect" },
    enPlural: "insects",
  },
  {
    id: "sea",
    these: { uk: "Це мешканці моря", en: "These are sea animals" },
    isA: { uk: "це мешканець моря", en: "a sea animal" },
    enPlural: "sea animals",
  },
  {
    id: "clothes",
    these: { uk: "Це одяг", en: "These are clothes" },
    isA: { uk: "це одяг", en: "clothing" },
  },
  {
    id: "shoes",
    these: { uk: "Це взуття", en: "These are shoes" },
    isA: { uk: "це взуття", en: "footwear" },
  },
  {
    id: "kitchen",
    these: { uk: "Це посуд", en: "These are for the kitchen" },
    isA: { uk: "це посуд", en: "for the kitchen" },
  },
  {
    id: "tools",
    these: { uk: "Це інструменти", en: "These are tools" },
    isA: { uk: "це інструмент", en: "a tool" },
    enPlural: "tools",
  },
  {
    id: "music",
    these: { uk: "Це музичні інструменти", en: "These are musical instruments" },
    isA: { uk: "це музичний інструмент", en: "a musical instrument" },
    enPlural: "musical instruments",
  },
  {
    id: "school",
    these: { uk: "Це шкільне приладдя", en: "These are for school" },
    isA: { uk: "це шкільне приладдя", en: "for school" },
  },
  {
    id: "toys",
    these: { uk: "Це іграшки", en: "These are toys" },
    isA: { uk: "це іграшка", en: "a toy" },
    enPlural: "toys",
  },
  {
    id: "sport",
    these: { uk: "Це для спорту", en: "These are for sport" },
    isA: { uk: "для спорту", en: "for sport" },
  },
  {
    id: "flowers",
    these: { uk: "Це квіти", en: "These are flowers" },
    isA: { uk: "це квітка", en: "a flower" },
    enPlural: "flowers",
  },
  {
    id: "devices",
    these: { uk: "Це техніка", en: "These are devices" },
    isA: { uk: "це техніка", en: "a device" },
    enPlural: "devices",
  },
];

/**
 * The things, each with its picture in public/fluent-emoji/<id>.webp. A thing goes in `alsoIn`
 * of a category a kid could count it in as well, so it is never the odd one next to it.
 */
export const THINGS: readonly Thing[] = [
  { id: "apple", category: "fruit", uk: "яблуко", en: "apple" },
  { id: "pear", category: "fruit", uk: "груша", en: "pear" },
  { id: "banana", category: "fruit", uk: "банан", en: "banana" },
  { id: "orange", category: "fruit", uk: "апельсин", en: "orange" },
  { id: "lemon", category: "fruit", uk: "лимон", en: "lemon" },
  { id: "peach", category: "fruit", uk: "персик", en: "peach" },
  { id: "pineapple", category: "fruit", uk: "ананас", en: "pineapple" },
  { id: "kiwi", category: "fruit", uk: "ківі", en: "kiwi" },

  { id: "carrot", category: "vegetables", uk: "морква", en: "carrot" },
  { id: "cucumber", category: "vegetables", uk: "огірок", en: "cucumber" },
  { id: "tomato", category: "vegetables", uk: "помідор", en: "tomato" },
  { id: "potato", category: "vegetables", uk: "картопля", en: "potato" },
  { id: "onion", category: "vegetables", uk: "цибуля", en: "onion" },
  { id: "garlic", category: "vegetables", uk: "часник", en: "garlic" },
  { id: "aubergine", category: "vegetables", uk: "баклажан", en: "aubergine" },
  { id: "broccoli", category: "vegetables", uk: "броколі", en: "broccoli" },
  { id: "pepper", category: "vegetables", uk: "перець", en: "pepper" },

  // In English berries are fruit too.
  { id: "strawberry", category: "berries", alsoIn: ["fruit"], uk: "полуниця", en: "strawberry" },
  { id: "cherry", category: "berries", alsoIn: ["fruit"], uk: "вишня", en: "cherry" },
  { id: "blueberry", category: "berries", alsoIn: ["fruit"], uk: "чорниця", en: "blueberry" },
  {
    id: "grapes",
    category: "berries",
    alsoIn: ["fruit"],
    uk: "виноград",
    en: "grapes",
    enIsPlural: true,
  },

  { id: "sweet", category: "sweets", uk: "цукерка", en: "sweet" },
  { id: "lollipop", category: "sweets", uk: "льодяник", en: "lollipop" },
  { id: "chocolate", category: "sweets", uk: "шоколадка", en: "chocolate bar" },
  { id: "cake", category: "sweets", uk: "торт", en: "cake" },
  { id: "iceCream", category: "sweets", uk: "морозиво", en: "ice cream" },
  { id: "doughnut", category: "sweets", uk: "пончик", en: "doughnut" },
  { id: "biscuit", category: "sweets", uk: "печиво", en: "biscuit" },
  { id: "cupcake", category: "sweets", uk: "кекс", en: "cupcake" },

  { id: "car", category: "vehicles", uk: "машина", en: "car" },
  { id: "bus", category: "vehicles", uk: "автобус", en: "bus" },
  { id: "lorry", category: "vehicles", uk: "вантажівка", en: "lorry" },
  { id: "train", category: "vehicles", uk: "потяг", en: "train" },
  { id: "plane", category: "vehicles", uk: "літак", en: "plane" },
  { id: "helicopter", category: "vehicles", uk: "гелікоптер", en: "helicopter" },
  { id: "ship", category: "vehicles", uk: "корабель", en: "ship" },
  { id: "bicycle", category: "vehicles", alsoIn: ["sport"], uk: "велосипед", en: "bicycle" },
  { id: "tractor", category: "vehicles", uk: "трактор", en: "tractor" },
  { id: "motorbike", category: "vehicles", uk: "мотоцикл", en: "motorbike" },
  { id: "fireEngine", category: "vehicles", uk: "пожежна машина", en: "fire engine" },

  { id: "cow", category: "domestic", uk: "корова", en: "cow" },
  { id: "pig", category: "domestic", uk: "свиня", en: "pig" },
  { id: "horse", category: "domestic", uk: "кінь", en: "horse" },
  { id: "sheep", category: "domestic", uk: "вівця", en: "sheep" },
  { id: "goat", category: "domestic", uk: "коза", en: "goat" },
  { id: "dog", category: "domestic", uk: "собака", en: "dog" },
  { id: "cat", category: "domestic", uk: "кіт", en: "cat" },

  { id: "fox", category: "forest", uk: "лисиця", en: "fox" },
  { id: "wolf", category: "forest", uk: "вовк", en: "wolf" },
  { id: "bear", category: "forest", lookalikes: "bears", uk: "ведмідь", en: "bear" },
  { id: "hedgehog", category: "forest", uk: "їжак", en: "hedgehog" },
  { id: "deer", category: "forest", uk: "олень", en: "deer" },
  { id: "boar", category: "forest", uk: "кабан", en: "wild boar" },
  { id: "beaver", category: "forest", uk: "бобер", en: "beaver" },
  { id: "moose", category: "forest", uk: "лось", en: "moose" },
  { id: "squirrel", category: "forest", uk: "білка", en: "squirrel" },

  { id: "lion", category: "hot", uk: "лев", en: "lion" },
  { id: "tiger", category: "hot", uk: "тигр", en: "tiger" },
  { id: "elephant", category: "hot", uk: "слон", en: "elephant" },
  { id: "giraffe", category: "hot", uk: "жирафа", en: "giraffe" },
  { id: "zebra", category: "hot", uk: "зебра", en: "zebra" },
  { id: "monkey", category: "hot", uk: "мавпа", en: "monkey" },
  { id: "hippo", category: "hot", uk: "бегемот", en: "hippo" },
  { id: "rhino", category: "hot", uk: "носоріг", en: "rhino" },
  { id: "kangaroo", category: "hot", uk: "кенгуру", en: "kangaroo" },
  // Some crocodiles live in the sea.
  { id: "crocodile", category: "hot", alsoIn: ["sea"], uk: "крокодил", en: "crocodile" },

  // Many birds live in the forest, in hot countries, by the sea or on a farm.
  { id: "owl", category: "birds", alsoIn: ["forest"], uk: "сова", en: "owl" },
  { id: "eagle", category: "birds", alsoIn: ["forest"], uk: "орел", en: "eagle" },
  { id: "parrot", category: "birds", alsoIn: ["hot"], uk: "папуга", en: "parrot" },
  { id: "penguin", category: "birds", alsoIn: ["sea"], uk: "пінгвін", en: "penguin" },
  { id: "flamingo", category: "birds", alsoIn: ["hot"], uk: "фламінго", en: "flamingo" },
  { id: "swan", category: "birds", uk: "лебідь", en: "swan" },
  { id: "peacock", category: "birds", alsoIn: ["hot"], uk: "павич", en: "peacock" },
  { id: "dove", category: "birds", uk: "голуб", en: "dove" },
  { id: "rooster", category: "birds", alsoIn: ["domestic"], uk: "півень", en: "rooster" },
  { id: "duck", category: "birds", alsoIn: ["domestic"], uk: "качка", en: "duck" },
  { id: "goose", category: "birds", alsoIn: ["domestic"], uk: "гуска", en: "goose" },
  { id: "turkey", category: "birds", alsoIn: ["domestic"], uk: "індик", en: "turkey" },

  { id: "bee", category: "insects", uk: "бджола", en: "bee" },
  { id: "butterfly", category: "insects", uk: "метелик", en: "butterfly" },
  { id: "ladybird", category: "insects", uk: "сонечко", en: "ladybird" },
  { id: "ant", category: "insects", uk: "мураха", en: "ant" },
  { id: "beetle", category: "insects", uk: "жук", en: "beetle" },
  { id: "mosquito", category: "insects", uk: "комар", en: "mosquito" },
  { id: "fly", category: "insects", uk: "муха", en: "fly" },
  { id: "grasshopper", category: "insects", uk: "коник", en: "grasshopper" },

  { id: "fish", category: "sea", uk: "риба", en: "fish" },
  { id: "shark", category: "sea", uk: "акула", en: "shark" },
  { id: "whale", category: "sea", uk: "кит", en: "whale" },
  { id: "dolphin", category: "sea", uk: "дельфін", en: "dolphin" },
  { id: "octopus", category: "sea", uk: "восьминіг", en: "octopus" },
  { id: "crab", category: "sea", uk: "краб", en: "crab" },
  { id: "jellyfish", category: "sea", uk: "медуза", en: "jellyfish" },
  { id: "seal", category: "sea", uk: "тюлень", en: "seal" },

  { id: "tShirt", category: "clothes", uk: "футболка", en: "T-shirt" },
  { id: "jeans", category: "clothes", uk: "джинси", en: "jeans", enIsPlural: true },
  { id: "dress", category: "clothes", uk: "сукня", en: "dress" },
  { id: "coat", category: "clothes", uk: "пальто", en: "coat" },
  { id: "scarf", category: "clothes", uk: "шарф", en: "scarf" },
  { id: "gloves", category: "clothes", uk: "рукавички", en: "gloves", enIsPlural: true },
  { id: "socks", category: "clothes", uk: "шкарпетки", en: "socks", enIsPlural: true },
  { id: "shorts", category: "clothes", uk: "шорти", en: "shorts", enIsPlural: true },

  // Trainers are for sport too.
  {
    id: "trainers",
    category: "shoes",
    alsoIn: ["sport"],
    uk: "кросівки",
    en: "trainers",
    enIsPlural: true,
  },
  { id: "boot", category: "shoes", uk: "чобіт", en: "boot" },
  { id: "heels", category: "shoes", uk: "туфлі", en: "high heels", enIsPlural: true },
  { id: "flipFlops", category: "shoes", uk: "в'єтнамки", en: "flip-flops", enIsPlural: true },
  { id: "walkingBoot", category: "shoes", uk: "черевик", en: "walking boot" },

  { id: "spoon", category: "kitchen", uk: "ложка", en: "spoon" },
  {
    id: "knifeAndFork",
    category: "kitchen",
    uk: "ніж і виделка",
    en: "knife and fork",
    enIsPlural: true,
  },
  { id: "teapot", category: "kitchen", uk: "чайник", en: "teapot" },
  { id: "cup", category: "kitchen", uk: "чашка", en: "cup" },
  { id: "jar", category: "kitchen", uk: "банка", en: "jar" },
  { id: "bowl", category: "kitchen", uk: "миска", en: "bowl" },

  { id: "hammer", category: "tools", uk: "молоток", en: "hammer" },
  { id: "axe", category: "tools", uk: "сокира", en: "axe" },
  { id: "spanner", category: "tools", uk: "гайковий ключ", en: "spanner" },
  { id: "screwdriver", category: "tools", uk: "викрутка", en: "screwdriver" },
  { id: "saw", category: "tools", uk: "пилка", en: "saw" },

  { id: "guitar", category: "music", uk: "гітара", en: "guitar" },
  { id: "violin", category: "music", uk: "скрипка", en: "violin" },
  // Little kids play with a drum and maracas as toys.
  { id: "drum", category: "music", alsoIn: ["toys"], uk: "барабан", en: "drum" },
  { id: "trumpet", category: "music", uk: "труба", en: "trumpet" },
  { id: "saxophone", category: "music", uk: "саксофон", en: "saxophone" },
  { id: "accordion", category: "music", uk: "акордеон", en: "accordion" },
  {
    id: "maracas",
    category: "music",
    alsoIn: ["toys"],
    uk: "маракаси",
    en: "maracas",
    enIsPlural: true,
  },
  { id: "recorder", category: "music", uk: "сопілка", en: "recorder" },
  { id: "piano", category: "music", uk: "піаніно", en: "piano" },

  { id: "pencil", category: "school", uk: "олівець", en: "pencil" },
  { id: "pen", category: "school", uk: "ручка", en: "pen" },
  // Scissors and a ruler are tools too.
  {
    id: "scissors",
    category: "school",
    alsoIn: ["tools"],
    uk: "ножиці",
    en: "scissors",
    enIsPlural: true,
  },
  { id: "ruler", category: "school", alsoIn: ["tools"], uk: "лінійка", en: "ruler" },
  { id: "backpack", category: "school", uk: "рюкзак", en: "school bag" },
  { id: "book", category: "school", uk: "книжка", en: "book" },
  { id: "paintbrush", category: "school", uk: "пензлик", en: "paintbrush" },
  { id: "paperclip", category: "school", uk: "скріпка", en: "paper clip" },

  {
    id: "teddyBear",
    category: "toys",
    lookalikes: "bears",
    uk: "ведмедик",
    en: "teddy bear",
  },
  { id: "kite", category: "toys", uk: "повітряний змій", en: "kite" },
  { id: "yoYo", category: "toys", uk: "йо-йо", en: "yo-yo" },
  { id: "puzzle", category: "toys", uk: "пазл", en: "puzzle piece" },
  { id: "dice", category: "toys", uk: "кубик", en: "dice" },
  { id: "balloon", category: "toys", uk: "повітряна кулька", en: "balloon" },

  // A ball is a toy too, and skates and skis come with boots.
  { id: "football", category: "sport", alsoIn: ["toys"], uk: "м'яч", en: "football" },
  {
    id: "basketball",
    category: "sport",
    alsoIn: ["toys"],
    uk: "баскетбольний м'яч",
    en: "basketball",
  },
  { id: "tennisRacket", category: "sport", uk: "тенісна ракетка", en: "tennis racket" },
  {
    id: "skates",
    category: "sport",
    alsoIn: ["shoes"],
    uk: "ковзани",
    en: "ice skates",
    enIsPlural: true,
  },
  {
    id: "skis",
    category: "sport",
    alsoIn: ["shoes"],
    uk: "лижі",
    en: "skis",
    enIsPlural: true,
  },
  {
    id: "boxingGlove",
    category: "sport",
    alsoIn: ["clothes"],
    uk: "боксерська рукавичка",
    en: "boxing glove",
  },
  {
    id: "hockey",
    category: "sport",
    uk: "ключка й шайба",
    en: "hockey stick and puck",
    enIsPlural: true,
  },

  { id: "rose", category: "flowers", uk: "троянда", en: "rose" },
  { id: "tulip", category: "flowers", uk: "тюльпан", en: "tulip" },
  { id: "sunflower", category: "flowers", uk: "соняшник", en: "sunflower" },
  { id: "hyacinth", category: "flowers", uk: "гіацинт", en: "hyacinth" },

  { id: "phone", category: "devices", uk: "телефон", en: "phone" },
  { id: "laptop", category: "devices", uk: "ноутбук", en: "laptop" },
  { id: "computer", category: "devices", uk: "комп'ютер", en: "computer" },
  { id: "tv", category: "devices", uk: "телевізор", en: "TV" },
  { id: "camera", category: "devices", uk: "фотоапарат", en: "camera" },
  { id: "radio", category: "devices", uk: "радіо", en: "radio" },
];

const CATEGORIES_BY_ID = new Map(CATEGORIES.map((category) => [category.id, category]));
const THINGS_BY_ID = new Map(THINGS.map((thing) => [thing.id, thing]));

export function categoryById(id: string): Category {
  const category = CATEGORIES_BY_ID.get(id);
  if (!category) throw new Error(`No category ${id}`);
  return category;
}

export function thingById(id: string): Thing {
  const thing = THINGS_BY_ID.get(id);
  if (!thing) throw new Error(`No thing ${id}`);
  return thing;
}

export const pictureUrl = (id: string) => `/fluent-emoji/${id}.webp`;

/** The Fluent Emoji licence, shipped with the pictures. */
export const PICTURES_LICENSE_URL = "/fluent-emoji/LICENSE.txt";

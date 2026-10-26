import type { RoundItem } from "../../../shared/rounds";

/** How many animals each round shows. */
export const CHOICE_COUNT = 3;

/** Where a photo or a recording comes from, as its licence asks to say. */
export interface Credit {
  author: string;
  license: string;
  licenseUrl?: string;
  /** The file's page on Wikimedia Commons. */
  source: string;
}

export interface AnimalPhoto extends Credit {
  /** A 500 px Commons thumbnail (Commons serves standard widths only). */
  url: string;
  /** Which part of the photo a 4:3 card keeps, as CSS object-position; the centre if unset. */
  position?: string;
}

export interface AnimalSound extends Credit {
  /** An MP3: Commons' own transcode where the original is Ogg or WAV, as older iPhones need. */
  url: string;
  /** The part of a long recording to play, in seconds. */
  start?: number;
  end?: number;
}

export interface Animal extends RoundItem {
  /** The Ukrainian name, as the game asks: "Де корова?" */
  name: string;
  photo: AnimalPhoto;
  sound: AnimalSound;
}

/**
 * The animals, linked from Wikimedia Commons. Each photo was checked by eye to show the animal,
 * and each recording by two sound classifiers (see docs/animal-game/decisions.md).
 */
export const ANIMALS: Animal[] = [
  {
    id: "cat",
    name: "кіт",
    photo: {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Felis_catus-cat_on_snow.jpg/500px-Felis_catus-cat_on_snow.jpg",
      author: "Von.grzanka",
      license: "CC BY-SA 3.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
      source: "https://commons.wikimedia.org/wiki/File:Felis_catus-cat_on_snow.jpg",
    },
    sound: {
      url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/5/53/Felis_silvestris_catus_meows.ogg/Felis_silvestris_catus_meows.ogg.mp3",
      start: 0,
      end: 4,
      author: "Tobias Puderer",
      license: "CC BY-SA 3.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
      source: "https://commons.wikimedia.org/wiki/File:Felis_silvestris_catus_meows.ogg",
    },
  },
  {
    id: "dog",
    name: "собака",
    lookalikes: "dogs",
    photo: {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Labrador_Retriever_snow.jpg/500px-Labrador_Retriever_snow.jpg",
      position: "50% 10%",
      author: "Original author Hand, edit by Pharaoh Hound",
      license: "CC BY 2.5",
      licenseUrl: "https://creativecommons.org/licenses/by/2.5",
      source: "https://commons.wikimedia.org/wiki/File:Labrador_Retriever_snow.jpg",
    },
    sound: {
      url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/a/a2/Barking_of_a_dog.ogg/Barking_of_a_dog.ogg.mp3",
      author: "Amada44",
      license: "CC BY-SA 3.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
      source: "https://commons.wikimedia.org/wiki/File:Barking_of_a_dog.ogg",
    },
  },
  {
    id: "cow",
    name: "корова",
    photo: {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/HF_in_der_Rh%C3%B6n_auf_der_Weide.jpg/500px-HF_in_der_Rh%C3%B6n_auf_der_Weide.jpg",
      author: "Verum",
      license: "CC BY-SA 3.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
      source: "https://commons.wikimedia.org/wiki/File:HF_in_der_Rh%C3%B6n_auf_der_Weide.jpg",
    },
    sound: {
      url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/a/a5/Single_Cow_Moo.ogg/Single_Cow_Moo.ogg.mp3",
      author: "MichaeltheFox8621",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      source: "https://commons.wikimedia.org/wiki/File:Single_Cow_Moo.ogg",
    },
  },
  {
    id: "pig",
    name: "свиня",
    photo: {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/G%C3%B6ttinger_Minischwein_qtl1.jpg/500px-G%C3%B6ttinger_Minischwein_qtl1.jpg",
      author: "Quartl",
      license: "CC BY-SA 3.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
      source: "https://commons.wikimedia.org/wiki/File:G%C3%B6ttinger_Minischwein_qtl1.jpg",
    },
    sound: {
      url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/a/ac/Pig_grunt_-_Erdie.ogg/Pig_grunt_-_Erdie.ogg.mp3",
      author: "erdie",
      license: "CC BY 3.0",
      licenseUrl: "https://creativecommons.org/licenses/by/3.0",
      source: "https://commons.wikimedia.org/wiki/File:Pig_grunt_-_Erdie.ogg",
    },
  },
  {
    id: "horse",
    name: "кінь",
    lookalikes: "horses",
    photo: {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/White_horse_portrait.jpg/500px-White_horse_portrait.jpg",
      author: "Saffron Blaze",
      license: "CC BY-SA 3.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
      source: "https://commons.wikimedia.org/wiki/File:White_horse_portrait.jpg",
    },
    sound: {
      url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/0/07/Mares-Prefer-the-Voices-of-Highly-Fertile-Stallions-pone.0118468.s002.oga/Mares-Prefer-the-Voices-of-Highly-Fertile-Stallions-pone.0118468.s002.oga.mp3",
      author: "Lemasson A, Remeuf K, Trabalon M, Cuir F, Hausberger M",
      license: "CC BY 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by/4.0",
      source:
        "https://commons.wikimedia.org/wiki/File:Mares-Prefer-the-Voices-of-Highly-Fertile-Stallions-pone.0118468.s002.oga",
    },
  },
  {
    id: "donkey",
    name: "віслюк",
    lookalikes: "horses",
    photo: {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Donkey_%28Equus_africanus_asinus%29_at_Dev%C3%ADn_Castle_%28Bratislava%2C_Slovakia%29_julesvernex2.jpg/500px-Donkey_%28Equus_africanus_asinus%29_at_Dev%C3%ADn_Castle_%28Bratislava%2C_Slovakia%29_julesvernex2.jpg",
      author: "Jules Verne Times Two / www.julesvernex2.com",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      source:
        "https://commons.wikimedia.org/wiki/File:Donkey_(Equus_africanus_asinus)_at_Dev%C3%ADn_Castle_(Bratislava,_Slovakia)_julesvernex2.jpg",
    },
    sound: {
      url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/2/25/157763_felix-blume_a-donkey-is-braying-in-his-enclosure-in-south-of-france.wav/157763_felix-blume_a-donkey-is-braying-in-his-enclosure-in-south-of-france.wav.mp3",
      start: 8,
      end: 12,
      author: "felix-blume",
      license: "CC0",
      licenseUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
      source:
        "https://commons.wikimedia.org/wiki/File:157763_felix-blume_a-donkey-is-braying-in-his-enclosure-in-south-of-france.wav",
    },
  },
  {
    id: "sheep",
    name: "вівця",
    lookalikes: "sheepAndGoats",
    photo: {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Ovis_aries_in_Bowness-on-Windermere%2C_England.jpg/500px-Ovis_aries_in_Bowness-on-Windermere%2C_England.jpg",
      author: "Michal Klajban",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      source:
        "https://commons.wikimedia.org/wiki/File:Ovis_aries_in_Bowness-on-Windermere,_England.jpg",
    },
    sound: {
      url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/1/13/Sheep_bleating.ogg/Sheep_bleating.ogg.mp3",
      start: 2,
      end: 6,
      author: "earthcalling",
      license: "Public domain",
      source: "https://commons.wikimedia.org/wiki/File:Sheep_bleating.ogg",
    },
  },
  {
    id: "goat",
    name: "коза",
    lookalikes: "sheepAndGoats",
    photo: {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Capra_aegagrus_hircus%2C_Neuss_%28DE%29_--_2023_--_0009.jpg/500px-Capra_aegagrus_hircus%2C_Neuss_%28DE%29_--_2023_--_0009.jpg",
      author: "Anil Öztas",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      source:
        "https://commons.wikimedia.org/wiki/File:Capra_aegagrus_hircus,_Neuss_(DE)_--_2023_--_0009.jpg",
    },
    sound: {
      url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/b/bc/Herd_of_goats_bleating.ogg/Herd_of_goats_bleating.ogg.mp3",
      start: 26,
      end: 30,
      author: "stephan",
      license: "Public domain",
      source: "https://commons.wikimedia.org/wiki/File:Herd_of_goats_bleating.ogg",
    },
  },
  {
    id: "hen",
    name: "курка",
    lookalikes: "chickens",
    photo: {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Hen_on_street.jpg/500px-Hen_on_street.jpg",
      author: "Just chaos",
      license: "CC BY 2.0",
      licenseUrl: "https://creativecommons.org/licenses/by/2.0",
      source: "https://commons.wikimedia.org/wiki/File:Hen_on_street.jpg",
    },
    sound: {
      url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/4/44/Hen_announcing_shes_lain_an_egg.ogg/Hen_announcing_shes_lain_an_egg.ogg.mp3",
      start: 5,
      end: 9,
      author: "alys",
      license: "Public domain",
      source: "https://commons.wikimedia.org/wiki/File:Hen_announcing_shes_lain_an_egg.ogg",
    },
  },
  {
    id: "rooster",
    name: "півень",
    lookalikes: "chickens",
    photo: {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Junglefowl_on_tree.jpg/500px-Junglefowl_on_tree.jpg",
      author: "Philip Pikart",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      source: "https://commons.wikimedia.org/wiki/File:Junglefowl_on_tree.jpg",
    },
    sound: {
      url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c5/Rooster_crowing.ogg/Rooster_crowing.ogg.mp3",
      author: "Filo gèn'",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      source: "https://commons.wikimedia.org/wiki/File:Rooster_crowing.ogg",
    },
  },
  {
    id: "duck",
    name: "качка",
    lookalikes: "waterfowl",
    photo: {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Male_mallard_duck_2.jpg/500px-Male_mallard_duck_2.jpg",
      position: "10% 50%",
      author: "Acarpentier",
      license: "CC BY 3.0",
      licenseUrl: "https://creativecommons.org/licenses/by/3.0",
      source: "https://commons.wikimedia.org/wiki/File:Male_mallard_duck_2.jpg",
    },
    sound: {
      url: "https://upload.wikimedia.org/wikipedia/commons/2/28/Anas_platyrhynchos_-_Mallard_XC112828.mp3",
      start: 7,
      end: 11,
      author: "Jonathon Jongsma",
      license: "CC BY-SA 3.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
      source: "https://commons.wikimedia.org/wiki/File:Anas_platyrhynchos_-_Mallard_XC112828.mp3",
    },
  },
  {
    id: "goose",
    name: "гуска",
    lookalikes: "waterfowl",
    photo: {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Gr%C3%BCnau_Cumberland_Wildpark_Emdener_Gans-3304.jpg/500px-Gr%C3%BCnau_Cumberland_Wildpark_Emdener_Gans-3304.jpg",
      author: "Isiwal",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      source:
        "https://commons.wikimedia.org/wiki/File:Gr%C3%BCnau_Cumberland_Wildpark_Emdener_Gans-3304.jpg",
    },
    sound: {
      url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/a/aa/Geese_Honking_%28loud%29.ogg/Geese_Honking_%28loud%29.ogg.mp3",
      start: 11,
      end: 15,
      author: "U.S. Fish and Wildlife Service",
      license: "Public domain",
      source: "https://commons.wikimedia.org/wiki/File:Geese_Honking_(loud).ogg",
    },
  },
  {
    id: "turkey",
    name: "індик",
    lookalikes: "chickens",
    photo: {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Meleagris_gallopavo_displaying_at_Deer_Island_Open_Space_Preserve.jpg/500px-Meleagris_gallopavo_displaying_at_Deer_Island_Open_Space_Preserve.jpg",
      position: "50% 15%",
      author: "Frank Schulenburg",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      source:
        "https://commons.wikimedia.org/wiki/File:Meleagris_gallopavo_displaying_at_Deer_Island_Open_Space_Preserve.jpg",
    },
    sound: {
      url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/1/11/Gobbler.ogg/Gobbler.ogg.mp3",
      start: 0,
      end: 4,
      author: "bod",
      license: "Public domain",
      source: "https://commons.wikimedia.org/wiki/File:Gobbler.ogg",
    },
  },
  {
    id: "tiger",
    name: "тигр",
    lookalikes: "bigCats",
    photo: {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Bengal_tiger_%28Panthera_tigris_tigris%29_female_3.jpg/500px-Bengal_tiger_%28Panthera_tigris_tigris%29_female_3.jpg",
      position: "70% 50%",
      author: "Charles J. Sharp",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      source:
        "https://commons.wikimedia.org/wiki/File:Bengal_tiger_(Panthera_tigris_tigris)_female_3.jpg",
    },
    sound: {
      url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/2/29/439280_schots_angry-tiger.wav/439280_schots_angry-tiger.wav.mp3",
      start: 3,
      end: 7,
      author: "schots",
      license: "CC0",
      licenseUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
      source: "https://commons.wikimedia.org/wiki/File:439280_schots_angry-tiger.wav",
    },
  },
  {
    id: "lion",
    name: "лев",
    lookalikes: "bigCats",
    photo: {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Serengeti_National_Park_08_-_lion_-_Panthera_leo.jpg/500px-Serengeti_National_Park_08_-_lion_-_Panthera_leo.jpg",
      author: "Thomas Fuhrmann",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      source:
        "https://commons.wikimedia.org/wiki/File:Serengeti_National_Park_08_-_lion_-_Panthera_leo.jpg",
    },
    sound: {
      url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/d/d3/Lionroar.wav/Lionroar.wav.mp3",
      start: 22,
      end: 26,
      author:
        "Jonathan Growcott, Alex Lobora, Andrew Markham, Charlotte E. Searle, Johan Wahlström, Matthew Wijers, Benno I. Simmons",
      license: "CC BY 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by/4.0",
      source: "https://commons.wikimedia.org/wiki/File:Lionroar.wav",
    },
  },
  {
    id: "bear",
    name: "ведмідь",
    photo: {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Brown_bear_%28Ursus_arctos_arctos%29_running.jpg/500px-Brown_bear_%28Ursus_arctos_arctos%29_running.jpg",
      author: "Malene Thyssen",
      license: "CC BY 2.5",
      licenseUrl: "https://creativecommons.org/licenses/by/2.5",
      source:
        "https://commons.wikimedia.org/wiki/File:Brown_bear_(Ursus_arctos_arctos)_running.jpg",
    },
    sound: {
      url: "https://upload.wikimedia.org/wikipedia/commons/2/2b/Yellowstone_sound_library_-_Grizzly_Bear_Eating_-_003.mp3",
      start: 64,
      end: 68,
      author: "NPS & MSU Acoustic Atlas / Jennifer Jerrett",
      license: "Public domain",
      source:
        "https://commons.wikimedia.org/wiki/File:Yellowstone_sound_library_-_Grizzly_Bear_Eating_-_003.mp3",
    },
  },
  {
    id: "wolf",
    name: "вовк",
    lookalikes: "dogs",
    photo: {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Scandinavian_grey_wolf_Canis_lupus.jpg/500px-Scandinavian_grey_wolf_Canis_lupus.jpg",
      author: "Malene Thyssen",
      license: "CC BY-SA 3.0",
      licenseUrl: "http://creativecommons.org/licenses/by-sa/3.0/",
      source: "https://commons.wikimedia.org/wiki/File:Scandinavian_grey_wolf_Canis_lupus.jpg",
    },
    sound: {
      url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/8/87/Wolf_howls.ogg/Wolf_howls.ogg.mp3",
      start: 9,
      end: 13,
      author: "автор невідомий",
      license: "Public domain",
      source: "https://commons.wikimedia.org/wiki/File:Wolf_howls.ogg",
    },
  },
  {
    id: "elephant",
    name: "слон",
    photo: {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/African_elephant_%28Loxodonta_africana%29_3.jpg/500px-African_elephant_%28Loxodonta_africana%29_3.jpg",
      author: "Charles J. Sharp",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      source: "https://commons.wikimedia.org/wiki/File:African_elephant_(Loxodonta_africana)_3.jpg",
    },
    sound: {
      url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/4/40/Elephant_voice_-_trumpeting.ogg/Elephant_voice_-_trumpeting.ogg.mp3",
      author: "தகவலுழவன்",
      license: "CC0",
      licenseUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
      source: "https://commons.wikimedia.org/wiki/File:Elephant_voice_-_trumpeting.ogg",
    },
  },
  {
    id: "monkey",
    name: "мавпа",
    photo: {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Chimpanc%C3%A9_com%C3%BAn_%28Pan_troglodytes%29%2C_Tierpark_Hellabrunn%2C_M%C3%BAnich%2C_Alemania%2C_2012-06-17%2C_DD_04.jpg/500px-Chimpanc%C3%A9_com%C3%BAn_%28Pan_troglodytes%29%2C_Tierpark_Hellabrunn%2C_M%C3%BAnich%2C_Alemania%2C_2012-06-17%2C_DD_04.jpg",
      author: "Diego Delso",
      license: "CC BY-SA 3.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
      source:
        "https://commons.wikimedia.org/wiki/File:Chimpanc%C3%A9_com%C3%BAn_(Pan_troglodytes),_Tierpark_Hellabrunn,_M%C3%BAnich,_Alemania,_2012-06-17,_DD_04.jpg",
    },
    sound: {
      url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/5/56/Pant-hoot_call_made_by_a_male_chimpanzee.ogg/Pant-hoot_call_made_by_a_male_chimpanzee.ogg.mp3",
      start: 3,
      end: 7,
      author: "Pawel Fedurek et al.",
      license: "CC BY 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by/4.0",
      source:
        "https://commons.wikimedia.org/wiki/File:Pant-hoot_call_made_by_a_male_chimpanzee.ogg",
    },
  },
  {
    id: "deer",
    name: "олень",
    photo: {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Cervus_elaphus_Luc_Viatour_5.jpg/500px-Cervus_elaphus_Luc_Viatour_5.jpg",
      position: "50% 25%",
      author: "Lviatour",
      license: "CC BY-SA 3.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
      source: "https://commons.wikimedia.org/wiki/File:Cervus_elaphus_Luc_Viatour_5.jpg",
    },
    sound: {
      url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/9/95/Hirsch_roehrt.ogg/Hirsch_roehrt.ogg.mp3",
      start: 0,
      end: 4,
      author: "Jugrü",
      license: "CC BY-SA 3.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
      source: "https://commons.wikimedia.org/wiki/File:Hirsch_roehrt.ogg",
    },
  },
  {
    id: "squirrel",
    name: "білка",
    photo: {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Red_squirrel_%2821808%29.jpg/500px-Red_squirrel_%2821808%29.jpg",
      author: "Rhododendrites",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      source: "https://commons.wikimedia.org/wiki/File:Red_squirrel_(21808).jpg",
    },
    sound: {
      url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/d/d8/Grey_Squirrel_%28Sciurus_carolinensis%29_%28W1CDR0001470_BD12%29.ogg/Grey_Squirrel_%28Sciurus_carolinensis%29_%28W1CDR0001470_BD12%29.ogg.mp3",
      start: 28,
      end: 32,
      author: "The British Library",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      source:
        "https://commons.wikimedia.org/wiki/File:Grey_Squirrel_(Sciurus_carolinensis)_(W1CDR0001470_BD12).ogg",
    },
  },
  {
    id: "frog",
    name: "жаба",
    photo: {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Grenouille_verte_%28Pelophylax_kl._esculentus%29.jpg/500px-Grenouille_verte_%28Pelophylax_kl._esculentus%29.jpg",
      position: "30% 50%",
      author: "Clément Bardot",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      source:
        "https://commons.wikimedia.org/wiki/File:Grenouille_verte_(Pelophylax_kl._esculentus).jpg",
    },
    sound: {
      url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/9/9f/Single_Frog_Croak.oga/Single_Frog_Croak.oga.mp3",
      author: "MichaeltheFox8621",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      source: "https://commons.wikimedia.org/wiki/File:Single_Frog_Croak.oga",
    },
  },
  {
    id: "owl",
    name: "сова",
    photo: {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Waldkauz_Strix_aluco_%28Linnaeus%2C_1785%29.jpg/500px-Waldkauz_Strix_aluco_%28Linnaeus%2C_1785%29.jpg",
      position: "50% 16%",
      author: "Michael Gäbler",
      license: "CC BY 3.0",
      licenseUrl: "https://creativecommons.org/licenses/by/3.0",
      source: "https://commons.wikimedia.org/wiki/File:Waldkauz_Strix_aluco_(Linnaeus,_1785).jpg",
    },
    sound: {
      url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/b/bf/Strix_aluco_male.oga/Strix_aluco_male.oga.mp3",
      start: 0,
      end: 4,
      author: "Vianney Bajart",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      source: "https://commons.wikimedia.org/wiki/File:Strix_aluco_male.oga",
    },
  },
  {
    id: "crow",
    name: "ворона",
    lookalikes: "greyBirds",
    photo: {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Corneille_mantel%C3%A9e_-_Hooded_crow_-_Gri_le%C5%9F_kargas%C4%B1_03.jpg/500px-Corneille_mantel%C3%A9e_-_Hooded_crow_-_Gri_le%C5%9F_kargas%C4%B1_03.jpg",
      author: "Zeynel Cebeci",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      source:
        "https://commons.wikimedia.org/wiki/File:Corneille_mantel%C3%A9e_-_Hooded_crow_-_Gri_le%C5%9F_kargas%C4%B1_03.jpg",
    },
    sound: {
      url: "https://upload.wikimedia.org/wikipedia/commons/f/fb/Hooded_Crow_%28Corvus_cornix%29_-_B%C3%A6rum%2C_Norway_2021-04-03.mp3",
      start: 1,
      end: 5,
      author: "Ryan Hodnett",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      source:
        "https://commons.wikimedia.org/wiki/File:Hooded_Crow_(Corvus_cornix)_-_B%C3%A6rum,_Norway_2021-04-03.mp3",
    },
  },
  {
    id: "cuckoo",
    name: "зозуля",
    lookalikes: "greyBirds",
    photo: {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Common_cuckoo_in_kathmandu_valley.jpg/500px-Common_cuckoo_in_kathmandu_valley.jpg",
      position: "50% 20%",
      author: "Prasan Shrestha",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      source: "https://commons.wikimedia.org/wiki/File:Common_cuckoo_in_kathmandu_valley.jpg",
    },
    sound: {
      url: "https://upload.wikimedia.org/wikipedia/commons/6/65/Cuculus_canorus_-_Common_Cuckoo_XC84060.mp3",
      start: 9,
      end: 13,
      author: "Alexander Kurthy",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      source: "https://commons.wikimedia.org/wiki/File:Cuculus_canorus_-_Common_Cuckoo_XC84060.mp3",
    },
  },
  {
    id: "gull",
    name: "чайка",
    lookalikes: "waterfowl",
    photo: {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/European_herring_gull_%28Larus_argentatus%29._Saint-Malo%2C_France.jpg/500px-European_herring_gull_%28Larus_argentatus%29._Saint-Malo%2C_France.jpg",
      position: "70% 50%",
      author: "Ввласенко",
      license: "CC BY-SA 3.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
      source:
        "https://commons.wikimedia.org/wiki/File:European_herring_gull_(Larus_argentatus)._Saint-Malo,_France.jpg",
    },
    sound: {
      url: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Larus_argentatus_-_European_Herring_Gull_XC488995.mp3",
      start: 6,
      end: 10,
      author: "Marie-Lan Taÿ Pamart",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      source:
        "https://commons.wikimedia.org/wiki/File:Larus_argentatus_-_European_Herring_Gull_XC488995.mp3",
    },
  },
  {
    id: "bee",
    name: "бджола",
    photo: {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Apis_mellifera_2013_Zurich_2.jpg/500px-Apis_mellifera_2013_Zurich_2.jpg",
      author: "Sputniktilt",
      license: "CC BY-SA 3.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
      source: "https://commons.wikimedia.org/wiki/File:Apis_mellifera_2013_Zurich_2.jpg",
    },
    sound: {
      url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/0/0f/Bee_buzzing_sound_%28animal_noises%29.opus/Bee_buzzing_sound_%28animal_noises%29.opus.mp3",
      start: 8,
      end: 12,
      author: "Free Sounds Library User Spanac",
      license: "CC BY 3.0",
      licenseUrl: "https://creativecommons.org/licenses/by/3.0",
      source: "https://commons.wikimedia.org/wiki/File:Bee_buzzing_sound_(animal_noises).opus",
    },
  },
  {
    id: "dolphin",
    name: "дельфін",
    photo: {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Delf%C3%ADn_mular_%28Tursiops_truncatus%29%2C_isla_de_San_Crist%C3%B3bal%2C_islas_Gal%C3%A1pagos%2C_Ecuador%2C_2015-07-24%2C_DD_86.JPG/500px-Delf%C3%ADn_mular_%28Tursiops_truncatus%29%2C_isla_de_San_Crist%C3%B3bal%2C_islas_Gal%C3%A1pagos%2C_Ecuador%2C_2015-07-24%2C_DD_86.JPG",
      author: "Diego Delso",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      source:
        "https://commons.wikimedia.org/wiki/File:Delf%C3%ADn_mular_(Tursiops_truncatus),_isla_de_San_Crist%C3%B3bal,_islas_Gal%C3%A1pagos,_Ecuador,_2015-07-24,_DD_86.JPG",
    },
    sound: {
      url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/5/5a/161691_felixblume_dolphin-screaming-underwater-in-caribbean-sea-mexico.wav/161691_felixblume_dolphin-screaming-underwater-in-caribbean-sea-mexico.wav.mp3",
      start: 8,
      end: 12,
      author: "Felix Blume",
      license: "CC0",
      licenseUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
      source:
        "https://commons.wikimedia.org/wiki/File:161691_felixblume_dolphin-screaming-underwater-in-caribbean-sea-mexico.wav",
    },
  },
  {
    id: "pigeon",
    name: "голуб",
    lookalikes: "greyBirds",
    photo: {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Feral_pigeon_%28Columba_livia_domestica%29%2C_2017-05-27.jpg/500px-Feral_pigeon_%28Columba_livia_domestica%29%2C_2017-05-27.jpg",
      position: "10% 50%",
      author: "Lewis Hulbert",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      source:
        "https://commons.wikimedia.org/wiki/File:Feral_pigeon_(Columba_livia_domestica),_2017-05-27.jpg",
    },
    sound: {
      url: "https://upload.wikimedia.org/wikipedia/commons/1/1a/Columba_livia_-_Rock_Dove_XC539061.mp3",
      start: 4,
      end: 8,
      author: "Marie-Lan Taÿ Pamart",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      source: "https://commons.wikimedia.org/wiki/File:Columba_livia_-_Rock_Dove_XC539061.mp3",
    },
  },
  {
    id: "woodpecker",
    name: "дятел",
    photo: {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Greater_Spotted_Woodpecker_%2841554059345%29.jpg/500px-Greater_Spotted_Woodpecker_%2841554059345%29.jpg",
      position: "50% 35%",
      author: "Gerry Zambonini",
      license: "CC BY-SA 2.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
      source:
        "https://commons.wikimedia.org/wiki/File:Greater_Spotted_Woodpecker_(41554059345).jpg",
    },
    sound: {
      url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/4/40/Great_Spotted_Woodpecker_drum.ogg/Great_Spotted_Woodpecker_drum.ogg.mp3",
      start: 1,
      end: 5,
      author: "T.Voekler",
      license: "CC BY-SA 3.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
      source: "https://commons.wikimedia.org/wiki/File:Great_Spotted_Woodpecker_drum.ogg",
    },
  },
];

export function animalById(id: string): Animal {
  const animal = ANIMALS.find((candidate) => candidate.id === id);
  if (!animal) throw new Error(`No animal ${id}`);
  return animal;
}

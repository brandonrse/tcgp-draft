import type { Card } from '../interfaces/Card' 

const PACKS: Record<string, string> = {
  'Promo-A': 'P-A',
  'Genetic Apex': 'A1',
  'Mythical Island': 'A1a',
  'Space-Time Smackdown': 'A2',
  'Triumphant Light': 'A2a',
  'Shining Revelry': 'A2b',
  'Celestial Guardians': 'A3',
};

// const LANG: Record<string, string> = {
//   'eng': 'EN',
// }

export const getCardByName = (cards: Card[], name: string): Card | undefined =>
  cards.find((card) => card.cardName.toLowerCase() === name.toLowerCase());

export const getCardsByName = (cards: Card[], cardName: string): Card[] =>
  cards.filter((card) => card.cardName === cardName);

export const getSpeciesByName = (cards: Card[], cardName: string): Card[] => {
  // Extract the base name by removing " ex" if it exists
  const baseName = cardName.toLowerCase().split(' ex')[0];

  // Use a regex to match the base name followed by optional " ex" or nothing
  const regex = new RegExp(`^${baseName}( ex)?$`, 'i');

  // Filter cards that match the regex
  return cards.filter((card) => regex.test(card.cardName.toLowerCase()));
};

export const getAllCardsByFamily = (cards: Card[], card: Card): Card[] => {
  const family: Set<Card> = new Set();

  const findFamily = (currentCard: Card) => {
    family.add(currentCard);

    const evolvesFromCards = cards.filter((c) => c.cardName === currentCard.evolvesFrom);
    evolvesFromCards.forEach((evolvesFromCard) => {
      if (!family.has(evolvesFromCard)) {
        findFamily(evolvesFromCard);
      }
    });

    const evolvesIntoCards = cards.filter((c) => c.evolvesFrom === currentCard.cardName);
    evolvesIntoCards.forEach((evolvesIntoCard) => {
      if (!family.has(evolvesIntoCard)) {
        findFamily(evolvesIntoCard);
      }
    });
  };

  findFamily(card);

  return Array.from(family);
}

export const getEvolutionCards = (cards: Card[], card: Card): Card[] =>
  cards.filter((c) => c.evolvesFrom === card.cardName);

export const getPreEvolutionCards = (cards: Card[], card: Card): Card[] => 
  cards.filter((c) => c.cardName === card.cardName);

export const getCardVariants = (cards: Card[], card: Card): Card[] =>
  cards.filter((c) => c.cardName === card.cardName && c.hp === card.hp && JSON.stringify(c.attacks) === JSON.stringify(card.attacks) && c.weakness === card.weakness && c.retreat === card.retreat && c.evolvesFrom === card.evolvesFrom && c.type === card.type && c.ability === card.ability);

export const getCardsByPack = (cards: Card[], packName: string): Card[] =>
  cards.filter((card) => card.pack === packName);

export const getCardsByPackIds = (cards: Card[], packIds: string[]): Card[] =>
  cards.filter((card) => packIds.includes(getPackCode(card.pack)));

export const getCardsByType = (cards: Card[], type: string): Card[] =>
  cards.filter((card) => card.type === type);

export const getCardsByGeneration = (cards: Card[], generation: number): Card[] =>
  cards.filter((card) => card.generation === generation);

export const getAllTrainerCards = (cards: Card[]): Card[] =>
  cards.filter((card) => card.cardType !== 'Pokemon');

export const getCardsByCardType = (cards: Card[], cardType: string): Card[] =>
  cards.filter((card) => card.cardType === cardType);

export const getCardsByTag = (cards: Card[], tag: string): Card[] =>
  cards.filter((card) => card.tags.includes(tag));

export const getCardsWithoutTag = (cards: Card[], tag: string): Card[] =>
  cards.filter((card) => !card.tags.includes(tag));


export const getAllPacks = (cards: Card[]): string[] =>
  Array.from(new Set(cards.map((card) => card.pack)));

export const getPackCode = (packName: string): string => {
  return PACKS[packName] ?? 'Unknown';
}

export const getPackByCode = (packCode: string): string | undefined => {
  return (Object.keys(PACKS) as Array<string>).find(key => PACKS[key] === packCode);
}

export const getCardId = (card: Card): string | undefined => {
  return `${getPackCode(card.pack)}_${card.cardNum.toString().padStart(3, '0')}`;
}

export const containsType = (cards: Card[], type: string): boolean =>
  cards.some(card => card.type === type);

export const containsAnyTool = (cards: Card[]): boolean =>
  cards.some(card => card.cardType === 'Pokémon Tool');

export const isCardBanned = (cards: Card[], card: Card): boolean => 
  cards.some(c => getCardId(c) === getCardId(card));

export const getCardImageUrl = (card: Card, lang: string): string => {
  return `/assets/images/cards/${lang}/${getCardId(card)}_${lang}.png`;
}

export const containsCardName = (cards: Card[], cardName: string): boolean =>
  cards.some(c => c.cardName === cardName);

export const containsSpeciesName = (cards: Card[], cardName: string): boolean =>
  cards.some(c => c.cardName === cardName.split(' ex')[0]);

export const containsTag = (cards: Card[], tag: string): boolean =>
  cards.some(c => c.tags.includes(tag));

export const containsCardId = (cards: Card[], cardId: string): boolean =>
  cards.some(c => getCardId(c) === cardId);

export const containsStage = (cards: Card[], stage: string): boolean =>
  cards.some(card => card.stage === stage);

export const countCardTypes = (cards: Card[], cardType: string): number =>
  cards.filter(card => card.cardType === cardType).length;

export const countTrainerCards = (cards: Card[]): number =>
  cards.filter(card => card.cardType !== 'Pokemon').length;

export const isStandalone = (cards: Card[], card: Card): boolean => {
  if (card.evolvesFrom !== '') { return false; }
  return cards.some((c) => c.evolvesFrom === card.cardName);
}

export const canEvolve = (cards: Card[], card: Card): boolean =>
  cards.some((c) => c.evolvesFrom === card.cardName);

export const isEvolution = (cards: Card[], card: Card): boolean =>
  cards.some((c) => card.evolvesFrom === c.cardName);

export const getNumberOfEvolutions = (cards: Card[], card: Card): number => {
  let num = 0;
  let tempCard = card;
  while (tempCard) {
    const nextCard = cards.find((c) => c.evolvesFrom === tempCard.cardName);
    if (!nextCard) { break; }
    tempCard = nextCard;
    num += 1;
  }
  return num;
}

export const getRandomCard = (cards: Card[]): Card => {
  return cards[getRandInt(0, cards.length - 1)];
}

export const getRandomBasic = (cards:Card[]): Card => {
  const basicCards = cards.filter((card) => card.stage === 'Basic');
  return basicCards[getRandInt(0, basicCards.length - 1)];
}
// TODO: simulate pulling packs option
// export const simulatePull = (cards: Card[]): Card[] => {
//   return cards;
// }

export const getRandomPokemonCards = (cards: Card[], num: number): Card[] => {
  const cardPool: Card[] = [];
  while (cardPool.length <= num * 0.6) {
    const randPokemonCard = getRandomBasic(cards); // Pick a random basic card
    
    if (!areConditionsSatisfied(cardPool, randPokemonCard)) {
      continue;
    }

    let tempCard = randPokemonCard;

    while (tempCard) {

      let inc = 2;
      if (getNumberOfEvolutions(cards, tempCard) === 1 && tempCard.stage === 'Basic') {
        inc = 3;
      }
      else if (getNumberOfEvolutions(cards, tempCard) === 2 && tempCard.stage === 'Basic') {
        inc = 4;
      }
      else if (getNumberOfEvolutions(cards, tempCard) === 0 && tempCard.stage === 'Basic') {
        inc = 2;
      }
      else if (tempCard.stage === '1' && getNumberOfEvolutions(cards, tempCard) === 1) {
        inc = 3;
      }
      else if (tempCard.stage === '1') {
        inc = 2;
      }
      else if (tempCard.stage === '2') {
        inc = 2;
      }

      const species = getSpeciesByName(cards, tempCard.cardName);

      for (let i = 0; i < species.length; i++) {
        if (areConditionsSatisfied(cardPool, species[i])) {
          continue;
        } 
        species.splice(i, 1);
      }

      for (let i = 0; i < inc; i++) {
        const randInt = getRandInt(0, species.length - 1);
        cardPool.push(species[randInt]);
      }

      const evolutions = getEvolutionCards(cards, tempCard);
      tempCard = evolutions[getRandInt(0, evolutions.length - 1)];
    }
  }

  const trainerCards = getAllTrainerCards(cards);
  const cardPoolLength = cardPool.length;
  let i = 0;
  do {
    const randomTrainerCard = trainerCards[getRandInt(0, trainerCards.length - 1)];
    if (randomTrainerCard.tags.includes('fossil')) { 
      continue; 
    }
    if (cardPool.length > 0) {
      if (!areConditionsSatisfied(cardPool, randomTrainerCard)) { 
        continue; 
      }
    }

    if (!containsSpeciesName(cardPool, randomTrainerCard.cardName)) {
      const iterations = Math.max(2, Math.floor(0.5 * (num / 30)));
      for (let j = 0; j < iterations; j++) {
        cardPool.push(randomTrainerCard);
      }
      i += iterations;
    }
  } while (i < num - cardPoolLength)

  const randomCardPool = shuffle(cardPool);
  return shuffle(randomCardPool) as Card[];
}

function getRandInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(array: unknown[]): unknown[] {
  const copy = [...array];
  let n = copy.length, i;
  while (n) {
    i = Math.floor(Math.random() * n--);
    [copy[n], copy[i]] = [copy[i], copy[n]];
  }
  return copy;
}

//#region CONDITIONALS
export const areConditionsSatisfied = (cards: Card[], card: Card): boolean => {
  const cardId: string | undefined = getCardId(card);
  switch (cardId) {

    //#region Type Checks
    case 'A1_005': // A1 Caterpie
    case 'A1_219': // A1 Erika
    case 'A1_266':
    case 'A2b_005': // A2b Sprigatito
    case 'P-A_052':
    case 'A3_147': // Leaf Cape
      if (containsType(cards, 'Grass')) {
        return true;
      }
      return false;

    case 'A1_047': // A1 Moltres ex
    case 'A1_255': 
    case 'A1_274': 
    case 'P-A_025': 
      if (containsType(cards, 'Fire')) {
          return true;
        }
      return false;
    
    case 'A1_220': // A1 Misty
    case 'A1_267': 
    case 'A2a_72': // A2a Irida
    case 'A2a_87':
    case 'A3_143': // A3 Fishing Net
      if (containsType(cards, 'Water')) {
          return true;
        }
      return false;
    
    // A1a Mythical Slab
    case 'A1a_065':
      if (containsType(cards, 'Psychic')) {
        return true;
      }
      return false;

    // A2a Adaman
    case 'A2a_075':
    case 'A2a_090': 
      if (containsType(cards, 'Metal')) {
          return true;
        }
      return false;

    case 'A2b_025': // A2b Pachirisu
    case 'A2b_103':
    case 'P-A_058':
    case 'A3_068': // A3 Tapu Koko 
    case 'A3_166': 
      if (containsType(cards, 'Lightning')) {
          return true;
        }
      return false;

    case 'A3_249': // A3 Ilima
    case 'A3_191': 
      if (containsType(cards, 'Colorless')) {
          return true;
        }
      return false;

    //#endregion

    //#region Tag Checks
    
    // ex checks
    case 'A2a_036': // A2a Sudowoodo
    case 'A2a_079':
    case 'A2b_007': // A2b Meowscarada
    case 'A2b_073': 
    case 'A2b_071': // A2b Red
    case 'A2b_090': 
    case 'A3_066': // A3 Oricorio
    case 'A3_165': 

      if (containsTag(cards, 'ex')) {
        return true;
      }
      return false;
    case 'A1_175': // Muk
    case 'A2b_048': // A2b Clodsire ex
    case 'A2b_085':
    case 'A2b_093':
      if (containsTag(cards, 'poison')) {
        return true;
      }
      return false;

    //#endregion

    // A1 Nidoqueen
    case 'A1_168':
    case 'A1_240':
      if (containsCardName(cards, 'Nidoking')) {
        return true;
      }
      return false;

    // A1 Blaine
    case 'A1_221':
    case 'A1_268':
      if (containsCardName(cards, 'Magmar') || containsCardName(cards, 'Rapidash') || containsCardName(cards, 'Ninetales')) {
        return true;
      }
      return false;

    // A1 Koga
    case 'A1_222':
    case 'A1_269':
      if (containsCardName(cards, 'Muk') || containsCardName(cards, 'Weezing')) {
        return true;
      }
      return false;

    // A1 Brock
    case 'A1_224':
    case 'A1_271':
      if (containsCardName(cards, 'Onix') || containsCardName(cards, 'Golem')) {
        return true;
      }
      return false;

    // A1 Lt. Surge
    case 'A1_226':
    case 'A1_273':
      if (containsCardName(cards, 'Electrode') || containsCardName(cards, 'Raichu') || containsCardName(cards, 'Electabuzz')) {
        return true;
      }
      return false;

    // A1a Budding Expeditioner
    case 'A1a_066':
    case 'A1a_080':
      if (containsCardName(cards, 'Mew ex')) {
        return true;
      }
      return false;

    case 'A2_111': // A2 Skarmory
    case 'P-A_39':
    case 'A2_61': // A2 Pachirisu ex
    case 'A2_183':
    case 'A2_198':
    case 'A3_151': // A3 Guzma
    case 'A3_193':
    case 'A3_208':
      if (containsAnyTool(cards)) {
        return true;
      }
      return false;

    // A2 Uxie
    case 'A2_75':
      if (containsCardName(cards, 'Mesprit') || containsCardName(cards, 'Azelf')) { 
        return true;
      }
      return false;
    
    // A2 Mesprit
    case 'A2_76':
    case 'A2_166':
      if (containsCardName(cards, 'Uxie') && containsCardName(cards, 'Azelf')) {
        return true;
      }
      return false;

    // A2 Team Galactic Grunt
    case 'A2_151':
    case 'A2_191':
      if (containsCardName(cards, 'Glameow') || containsCardName(cards, 'Stunky') || containsCardName(cards, 'Croagunk')) {
        return true;
      }
      return false;

    // A2 Cynthia
    case 'A2_152':
    case 'A2_192':
      if (containsCardName(cards, 'Garchomp') || containsCardName(cards, 'Togekiss')) {
        return true;
      }
      return false;

    // A2 Volkner
    case 'A2_153':
    case 'A2_193':
      if (containsCardName(cards, 'Electivire') || containsCardName(cards, 'Luxray')) {
        return true;
      }
      return false;

    case 'A2a_009': // A2a Carnivine
    case 'A2a_013': // A2a Heatran
    case 'A2a_021': // A2a Abomasnow
    case 'A2a_026': // A2a Raichu
    case 'P-A_044':
    case 'A2a_035': // A2a Rotom
    case 'A2a_041': // A2a Tyranitar
    case 'A2a_050': // A2a Crobat
    case 'A2a_055': // A2a Magnezone
      if (containsCardName(cards, 'Arceus') || containsCardName(cards, 'Arceus ex')) {
        return true;
      }
      return false;

    // A2a Barry
    case 'A2a_074':
    case 'A2a_089':
      if (containsCardName(cards, 'Snorlax') || containsCardName(cards, 'Heracross') || containsCardName(cards, 'Staraptor')) {
        return true;
      }
      return false;


    // A2b Weedle
    case 'A2b_001':
      if (containsCardId(cards, 'A2b_001')) {
        return true;
      }
      return false;


    // A2b Tatsugiri
    case 'A2b_021':
    case 'A2b_075':
      if (containsCardName(cards, 'Dondozo')) {
        return true;
      }
      return false;

    case 'A3_050': // A3 Wishiwashi
    case 'A3_051': // A3 Wishiwashi ex
    case 'A3_184':
    case 'A3_202':
      if (containsCardName(cards, 'Wishiwashi') || containsCardName(cards, 'Wishiwashi ex')) {
        return true;
      }
      return false;

    case 'A3_098': // A3 Rockruff
    case 'A3_172':
      if (containsCardName(cards, 'Lycanroc')) {
        return true;
      }
      return false;

    case 'A3_144': // A3 Rare Candy
    case 'A3_155': // A3 Lillie
    case 'A3_197':
    case 'A3_209':
      if (containsStage(cards, '2')) {
        return true;
      }
      return false;

    case 'A3_148': // A3 Acerola
    case 'A3_190': 
      if (containsCardName(cards, 'Palossand') || containsCardName(cards, 'Mimikyu')) {
        return true;
      }
      return false;

    case 'A3_150': // A3 Kiawe 
    case 'A3_192': 
      if (containsCardName(cards, 'Alolan Marowak') || containsCardName(cards, 'Turtonator')) {
        return true;
      }
      return false;

   case 'A3_152': // A3 Lana 
   case 'A3_194': 
      if (containsCardName(cards, 'Araquanid')) {
        return true;
      }
      return false;

   case 'A3_153': // A3 Sophocles 
   case 'A3_195': 
      if (containsCardName(cards, 'Alolan Golem') || containsCardName(cards, 'Vikavolt') || containsCardName(cards, 'Togedemaru')) {
        return true;
      }
      return false;

   case 'A3_154': // A3 Mallow 
   case 'A3_196': 
      if (containsCardName(cards, 'Shiinotic') || containsCardName(cards, 'Tsareena')) {
        return true;
      }
      return false;

    default:
      return true;
  }
}

//#endregion
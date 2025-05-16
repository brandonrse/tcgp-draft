export interface Card {
  cardNum: number;
  cardName: string;
  type: string;
  stage: string;
  evolvesFrom: string;
  cardType: string;
  hp: number;
  weakness: string;
  retreat: number;
  illustrator: string;
  ability: string;
  attacks: string[];
  rarity: string;
  pack: string;
  subpack: string;
  generation: number;
  tags: string[];
}
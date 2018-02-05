export class Hero {
  id: number;
  name: string;
}

export type Query = {
  heroes: Hero[];
};

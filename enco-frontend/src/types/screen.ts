type HomeGroupSummary = {
  id: string;
  name: string;
  coverImage?: any;
  role?: string;
};

type HomeCardItem =
  | { type: 'group'; group: HomeGroupSummary }
  | { type: 'add' };

export type {HomeGroupSummary, HomeCardItem}
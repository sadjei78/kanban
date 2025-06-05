export type LaneType = 'Backlog' | 'In Progress' | 'On Hold' | 'Complete' | 'Archived';

export type CategoryType = 
  | 'Personal'
  | 'Work: CHS'
  | 'Work: Cargill'
  | 'Work: RBA'
  | 'Work: Other'
  | 'Church'
  | 'Other: Aglow'
  | 'Other'
  | 'Politics'
  | 'Urgent'
  | 'CHAT';

export interface Comment {
  id: string;
  text: string;
  commenter: string;
  timestamp: Date;
}

export interface Card {
  id: string;
  title: string;
  description: string;
  category: CategoryType;
  status: LaneType;
  priority: number;
  tags: string[];
  comments: Comment[];
  dueDate: Date;
  createdDate: Date;
  updatedDate: Date;
  isMinimized: boolean;
}

export interface Lane {
  id: LaneType;
  title: string;
  cards: Card[];
}

export interface SortOption {
  field: keyof Card;
  direction: 'asc' | 'desc';
} 
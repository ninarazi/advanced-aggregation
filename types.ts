
export type ColumnType = 'text' | 'boolean' | 'number' | 'date' | 'person' | 'company';

export interface Column {
  id: string;
  label: string;
  type: ColumnType;
  unit?: string; // PDR requirement: unit tracking
  width?: string;
}

export interface TableRow {
  id: string;
  name: string;
  external: boolean;
  age: number;
  experience: number; // New compatible numeric field
  score: number;
  birthday: string;
  manager: {
    name: string;
    avatar: string;
    initials: string;
  };
  company: {
    name: string;
    icon: string;
  };
}

export interface SelectionState {
  rowId: string;
  columnId: string;
}

export type AggregationFunction = 'sum' | 'avg' | 'min' | 'max' | 'count' | 'values';

export interface AggregationConfig {
  enabled: boolean;
  activeFunctions: AggregationFunction[];
}

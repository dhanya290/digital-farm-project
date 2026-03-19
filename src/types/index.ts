export type UserRole = 'admin' | 'manager' | 'worker' | 'staff';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  role: UserRole;
  farmId?: string;
}

export interface Farm {
  id: string;
  name: string;
  type: 'pig' | 'poultry';
  location: string;
  ownerId: string;
  stats: {
    totalAnimals: number;
    healthScore: number;
  };
}

export type RecordType = 'visitor' | 'vehicle' | 'sanitation' | 'disease_check';
export type RecordStatus = 'pass' | 'fail' | 'pending';

export interface BiosecurityRecord {
  id: string;
  farmId: string;
  date: string;
  type: RecordType;
  details: any;
  status: RecordStatus;
  recordedBy: string;
}

export interface Alert {
  id: string;
  farmId: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  date: string;
  resolved: boolean;
}

export interface Animal {
  id: string;
  farmId: string;
  type: 'Pig' | 'Poultry';
  breed: string;
  age: number;
  healthStatus: 'Healthy' | 'Sick' | 'Quarantined';
  lastVaccinationDate?: string;
  imageUrl?: string;
}

export interface Vaccination {
  id: string;
  animalId: string;
  vaccineName: string;
  dateAdministered: string;
  nextDueDate: string;
  recordedBy: string;
}

export interface Visitor {
  id: string;
  farmId: string;
  name: string;
  purpose: string;
  entryTime: string;
  exitTime?: string;
  protectiveGear: boolean;
  recordedBy: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Feed' | 'Medicine' | 'Sanitation' | 'Equipment';
  quantity: number;
  unit: string;
  minThreshold: number;
  lastUpdated: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string; // User UID
  dueDate: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  priority: 'Low' | 'Medium' | 'High';
  createdAt: string;
}

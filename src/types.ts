export interface CollegeData {
  id: number;
  name: string;
  tuitionInState: number;
  tuitionOutState: number;
  roomAndBoard: number;
}

export interface ChildProfile {
  id: string;
  name: string;
  initialBalance: number;
  monthlyContribution: number;
  expectedReturnRate: number;
  collegeStartDate: string; // ISO format
  targetCollege?: CollegeData;
}

export interface YearlyData {
  year: number;
  totalPrincipal: number;
  totalEarnings: number;
  balance: number;
}

export interface CalculationResult {
  yearlyData: YearlyData[];
  finalBalance: number;
  totalContributions: number;
  totalEarnings: number;
  monthsToCollege: number;
}
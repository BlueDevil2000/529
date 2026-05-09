export interface CollegeData {
  id: number;
  name: string;
  tuitionInState: number;
  tuitionOutState: number;
  roomAndBoard: number;
  costOfAttendance?: number;
}

export interface ChildProfile {
  id: string;
  name: string;
  initialBalance: number;
  monthlyContribution: number;
  expectedReturnRate: number;
  collegeStartDate: string; // ISO format
  targetCollege?: CollegeData;
  collegeInflationRate?: number;
  stopContributingAtCollege?: boolean;
  collegeDurationYears?: number;
}

export interface YearlyData {
  year: number;
  totalPrincipal: number;
  totalEarnings: number;
  totalTuitionPaid: number;
  balance: number;
  label: string;
}

export interface CalculationResult {
  yearlyData: YearlyData[];
  finalBalance: number;
  totalContributions: number;
  totalEarnings: number;
  totalTuitionPaid: number;
  monthsToCollege: number;
}
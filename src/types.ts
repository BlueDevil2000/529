export interface CollegeData {
  id: number;
  name: string;
  tuitionInState: number;
  tuitionOutState: number;
  roomAndBoard: number;
  costOfAttendance?: number;
  dataYear?: number; // The year the data was reported
}

export interface ChildProfile {
  id: string;
  name: string;
  initialBalance: number;
  initialBalanceDate: string; // ISO Month (YYYY-MM)
  monthlyContribution: number;
  expectedReturnRate: number;
  collegeStartDate: string; // ISO Month (YYYY-MM)
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
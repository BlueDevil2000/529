import { differenceInMonths, parseISO, startOfMonth, format } from 'date-fns';
import { ChildProfile, CalculationResult, YearlyData } from './types';

export function calculate529Growth(profile: ChildProfile): CalculationResult {
  const { 
    initialBalance, 
    initialBalanceDate = format(new Date(), 'yyyy-MM'),
    monthlyContribution, 
    expectedReturnRate, 
    collegeStartDate, 
    targetCollege,
    collegeInflationRate = 4.5,
    stopContributingAtCollege = true,
    collegeDurationYears = 4
  } = profile;
  
  const today = startOfMonth(new Date());
  const anchorDate = parseISO(initialBalanceDate);
  const startDate = parseISO(collegeStartDate);
  
  // Total months from Anchor -> College Start
  const totalMonthsHorizon = Math.max(0, differenceInMonths(startDate, anchorDate));
  // Months already passed (Anchor -> Today)
  const monthsPassed = Math.max(0, differenceInMonths(today, anchorDate));
  
  const monthlyRate = (expectedReturnRate / 100) / 12;
  const yearlyInflation = collegeInflationRate / 100;
  
  let currentBalance = initialBalance;
  let totalContributions = initialBalance;
  let totalEarnings = 0;
  let totalTuitionPaid = 0;
  
  const yearlyData: YearlyData[] = [];
  
  // We assume a 4-year lag for government reporting (e.g. 2022 data showing in 2026)
  const currentYear = new Date().getFullYear();
  const dataYear = targetCollege?.dataYear || (currentYear - 4); 
  const lagYears = Math.max(0, currentYear - dataYear);
  
  // This is the 'Real Today' baseline (May 2026)
  const baseCostToday = (targetCollege?.costOfAttendance || 0) * Math.pow(1 + yearlyInflation, lagYears);
  const annualBaseToday = baseCostToday / 4;

  // Year 0 (Anchor Point)
  yearlyData.push({
    year: 0,
    totalPrincipal: totalContributions,
    totalEarnings: 0,
    totalTuitionPaid: 0,
    balance: currentBalance,
    label: format(anchorDate, 'MMM yy')
  });

  // Accumulation Phase (Months from Anchor to College Start)
  for (let m = 1; m <= totalMonthsHorizon; m++) {
    currentBalance += monthlyContribution;
    totalContributions += monthlyContribution;
    const interest = currentBalance * monthlyRate;
    currentBalance += interest;
    totalEarnings += interest;

    // Add a data point every 12 months or at current date milestone
    if (m % 12 === 0 || m === monthsPassed) {
      yearlyData.push({
        year: Math.floor(m / 12),
        totalPrincipal: totalContributions,
        totalEarnings: totalEarnings,
        totalTuitionPaid: 0,
        balance: currentBalance,
        label: m === monthsPassed ? 'Today' : `Yr ${Math.floor(m / 12)}`
      });
    }
  }

  // Drawdown Phase (College Years)
  const yearsToCollegeStartFromAnchor = totalMonthsHorizon / 12;

  for (let collegeYear = 1; collegeYear <= collegeDurationYears; collegeYear++) {
    // Inflate the cost relative to the Anchor Date
    const inflatedAnnualCost = annualBaseToday * Math.pow(1 + yearlyInflation, yearsToCollegeStartFromAnchor + (collegeYear - 1));
    const semesterCost = inflatedAnnualCost / 2;

    for (let month = 1; month <= 12; month++) {
      if (!stopContributingAtCollege) {
        currentBalance += monthlyContribution;
        totalContributions += monthlyContribution;
      }

      if (month === 1 || month === 6) {
        currentBalance -= semesterCost;
        totalTuitionPaid += semesterCost;
      }

      const interest = currentBalance * monthlyRate;
      currentBalance += interest;
      totalEarnings += interest;
    }

    yearlyData.push({
      year: Math.floor(totalMonthsHorizon / 12) + collegeYear,
      totalPrincipal: totalContributions,
      totalEarnings: totalEarnings,
      totalTuitionPaid: totalTuitionPaid,
      balance: currentBalance,
      label: `College Yr ${collegeYear}`
    });
  }

  return {
    yearlyData,
    finalBalance: currentBalance,
    totalContributions,
    totalEarnings,
    totalTuitionPaid,
    monthsToCollege: totalMonthsHorizon - monthsPassed,
  };
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function calculateTotalCollegeCost(college: any): number {
  if (!college) return 0;
  const annualCost = college.costOfAttendance || 
                     ((college.tuitionInState || college.tuitionOutState || 0) + (college.roomAndBoard || 0));
  return annualCost * 4;
}

export function calculateInflatedTotalCost(college: any, yearsToCollege: number, inflationRate: number): number {
  const baseCost = calculateTotalCollegeCost(college);
  if (baseCost === 0) return 0;
  
  // Apply "Smart Bridge" to today first
  const dataYear = college.dataYear || 2022;
  const currentYear = new Date().getFullYear();
  const lagYears = Math.max(0, currentYear - dataYear);
  const inflation = inflationRate / 100;
  
  const costToday = baseCost * Math.pow(1 + inflation, lagYears);
  const annualBase = costToday / 4;
  let totalInflated = 0;
  
  for (let i = 0; i < 4; i++) {
    totalInflated += annualBase * Math.pow(1 + inflation, yearsToCollege + i);
  }
  
  return totalInflated;
}
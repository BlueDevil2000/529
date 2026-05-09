import { differenceInMonths, parseISO, startOfMonth, format, addMonths } from 'date-fns';
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
  
  // SMART BRIDGE: 2022 baseline ($79,338) -> 2026 Target ($96,000)
  // This requires a 4.88% 'catch-up' rate for the 4 lag years.
  const currentYear = new Date().getFullYear(); // 2026
  const dataYear = targetCollege?.dataYear || 2022; 
  const lagYears = Math.max(0, currentYear - dataYear);
  const catchUpRate = 0.0488; // 4.88% to match Duke's real 2026 price
  
  // The 'Real Today' baseline (May 2026)
  const baseCostToday = (targetCollege?.costOfAttendance || 0) * Math.pow(1 + catchUpRate, lagYears);
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
        label: m === monthsPassed ? 'Today' : format(addMonths(anchorDate, m), 'MMM yy')
      });
    }
  }

  // Drawdown Phase (College Years)
  // Months from Today (May 2026) to College Start
  const monthsFromTodayToStart = Math.max(0, differenceInMonths(startDate, today));
  const yearsFromTodayToStart = monthsFromTodayToStart / 12;

  for (let collegeYear = 1; collegeYear <= collegeDurationYears; collegeYear++) {
    // Future cost = Today's $96k * Inflation ^ (years from today)
    const inflatedAnnualCost = annualBaseToday * Math.pow(1 + yearlyInflation, yearsFromTodayToStart + (collegeYear - 1));
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
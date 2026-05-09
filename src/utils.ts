import { differenceInMonths, parseISO } from 'date-fns';
import { ChildProfile, CalculationResult, YearlyData } from './types';

export function calculate529Growth(profile: ChildProfile): CalculationResult {
  const { 
    initialBalance, 
    monthlyContribution, 
    expectedReturnRate, 
    collegeStartDate, 
    targetCollege,
    collegeInflationRate = 4.5,
    stopContributingAtCollege = true,
    collegeDurationYears = 4
  } = profile;
  
  const today = new Date();
  const startDate = parseISO(collegeStartDate);
  const monthsToCollege = Math.max(0, differenceInMonths(startDate, today));
  const yearsToCollegeStart = Math.ceil(monthsToCollege / 12);
  
  const monthlyRate = (expectedReturnRate / 100) / 12;
  const yearlyInflation = collegeInflationRate / 100;
  
  let currentBalance = initialBalance;
  let totalContributions = initialBalance;
  let totalEarnings = 0;
  let totalTuitionPaid = 0;
  
  const yearlyData: YearlyData[] = [];
  
  // Year 0
  yearlyData.push({
    year: 0,
    totalPrincipal: totalContributions,
    totalEarnings: 0,
    totalTuitionPaid: 0,
    balance: currentBalance,
    label: 'Now'
  });

  const baseAnnualCost = calculateTotalCollegeCost(targetCollege) / 4;

  // PHASE 1: Accumulation (Pre-College)
  for (let year = 1; year <= yearsToCollegeStart; year++) {
    const monthsInThisYear = year === yearsToCollegeStart ? (monthsToCollege % 12 || 12) : 12;
    
    for (let month = 1; month <= monthsInThisYear; month++) {
      currentBalance += monthlyContribution;
      totalContributions += monthlyContribution;
      const interest = currentBalance * monthlyRate;
      currentBalance += interest;
      totalEarnings += interest;
    }
    
    yearlyData.push({
      year,
      totalPrincipal: totalContributions,
      totalEarnings: totalEarnings,
      totalTuitionPaid: 0,
      balance: currentBalance,
      label: `Year ${year}`
    });
  }

  // PHASE 2: Drawdown (College Years)
  for (let collegeYear = 1; collegeYear <= collegeDurationYears; collegeYear++) {
    const currentYearNum = yearsToCollegeStart + collegeYear;
    // Inflate the cost to this specific future year
    const inflatedAnnualCost = baseAnnualCost * Math.pow(1 + yearlyInflation, currentYearNum);
    const semesterCost = inflatedAnnualCost / 2;

    for (let month = 1; month <= 12; month++) {
      // Contributions stop if configured
      if (!stopContributingAtCollege) {
        currentBalance += monthlyContribution;
        totalContributions += monthlyContribution;
      }

      // Tuition Deductions (Semester 1 in Month 1/Aug, Semester 2 in Month 6/Jan)
      if (month === 1 || month === 6) {
        currentBalance -= semesterCost;
        totalTuitionPaid += semesterCost;
      }

      const interest = currentBalance * monthlyRate;
      currentBalance += interest;
      totalEarnings += interest;
    }

    yearlyData.push({
      year: currentYearNum,
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
    monthsToCollege,
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
  // Use sticker price COA if available, otherwise sum tuition + room/board
  const annualCost = college.costOfAttendance || 
                     ((college.tuitionInState || college.tuitionOutState || 0) + (college.roomAndBoard || 0));
  return annualCost * 4;
}

export function calculateInflatedTotalCost(college: any, yearsToCollege: number, inflationRate: number): number {
  const baseCost = calculateTotalCollegeCost(college);
  if (baseCost === 0) return 0;
  
  const annualBase = baseCost / 4;
  let totalInflated = 0;
  
  // Sum 4 inflated years starting at yearsToCollege
  for (let i = 0; i < 4; i++) {
    totalInflated += annualBase * Math.pow(1 + (inflationRate / 100), yearsToCollege + i);
  }
  
  return totalInflated;
}
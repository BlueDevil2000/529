import { differenceInMonths, parseISO } from 'date-fns';
import { ChildProfile, CalculationResult, YearlyData } from './types';

export function calculate529Growth(profile: ChildProfile): CalculationResult {
  const { initialBalance, monthlyContribution, expectedReturnRate, collegeStartDate } = profile;
  
  const today = new Date();
  const startDate = parseISO(collegeStartDate);
  const monthsToCollege = Math.max(0, differenceInMonths(startDate, today));
  const yearsToCollege = Math.ceil(monthsToCollege / 12);
  
  const monthlyRate = (expectedReturnRate / 100) / 12;
  let currentBalance = initialBalance;
  let totalContributions = initialBalance;
  
  const yearlyData: YearlyData[] = [];
  
  yearlyData.push({
    year: 0,
    totalPrincipal: totalContributions,
    totalEarnings: 0,
    balance: currentBalance,
  });

  for (let year = 1; year <= yearsToCollege; year++) {
    const monthsInThisYear = year === yearsToCollege ? (monthsToCollege % 12 || 12) : 12;
    
    for (let month = 1; month <= monthsInThisYear; month++) {
      currentBalance += monthlyContribution;
      totalContributions += monthlyContribution;
      currentBalance += currentBalance * monthlyRate;
    }
    
    yearlyData.push({
      year,
      totalPrincipal: totalContributions,
      totalEarnings: Math.max(0, currentBalance - totalContributions),
      balance: currentBalance,
    });
  }

  return {
    yearlyData,
    finalBalance: currentBalance,
    totalContributions,
    totalEarnings: Math.max(0, currentBalance - totalContributions),
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
  // Assuming a standard 4-year degree
  const annualCost = (college.tuitionInState || college.tuitionOutState || 0) + (college.roomAndBoard || 0);
  return annualCost * 4;
}
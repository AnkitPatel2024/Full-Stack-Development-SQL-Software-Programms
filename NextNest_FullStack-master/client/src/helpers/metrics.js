function formatPct(num){
    return Number(num).toLocaleString(undefined,{style: 'percent', minimumFractionDigits:2}); 
}

function formatPctWhole(num){
    return Number(num/100).toLocaleString(undefined,{style: 'percent', minimumFractionDigits:2}); 
}

function formatNumber(num){
    return num.toLocaleString()
}

const curFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0
    // These options are needed to round to whole numbers if that's what you want.
    //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
    //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
  });

function formatCurrency(num){
    return curFormatter.format(num);
}

export const metrics = {
    "annual_cost": {
        "metric": "annual_cost",
        "display": "Annual Cost",
        "isIncome": false,
		"formatter":formatCurrency,
        "category": "Cost of Living",
        "category_rank": 0,
        "filter": "range",
        "filter_min": 0,
        "filter_max": 200000
    },
    "associates": {
        "metric": "associates",
        "display": "% Associates",
        "isIncome": false,
		"formatter":formatPct,
        "category": "Education",
        "category_rank": 1,
        "filter": "range",
        "filter_min": 0,
        "filter_max": 1
    },
    "bachelors": {
        "metric": "bachelors",
        "display": "% Bachelors",
        "isIncome": false,
		"formatter":formatPct,
        "category": "Education",
        "category_rank": 2,
        "filter": "range",
        "filter_min": 0,
        "filter_max": 1
    },
    "cost_index": {
        "metric": "cost_index",
        "display": "Cost Index",
        "isIncome": false,
		"formatter":formatNumber,
        "category": "Cost of Living",
        "category_rank": 1,
        "filter": "range",
        "filter_min": 0,
        "filter_max": 100
    },
    "crime_index": {
        "metric": "crime_index",
        "display": "Crime Index",
        "isIncome": false,
		"formatter":formatNumber,
        "category": "Quality of Life",
        "category_rank": 5,
        "filter": "range",
        "filter_min": 0,
        "filter_max": 100
    },
    "crime_per_100k": {
        "metric": "crime_per_100k",
        "display": "Crime Per 100k",
        "isIncome": false,
		"formatter":formatNumber,
        "category": "Quality of Life",
        "category_rank": 4,
        "filter": "range",
        "filter_min": 0,
        "filter_max": 10000
    },
    "doctorate": {
        "metric": "doctorate",
        "display": "% Doctorate",
        "isIncome": false,
		"formatter":formatPct,
        "category": "Education",
        "category_rank": 4,
        "filter": "range",
        "filter_min": 0,
        "filter_max": 1
    },
    "high_school": {
        "metric": "high_school",
        "display": "% High School",
        "isIncome": false,
		"formatter":formatPct,
        "category": "Education",
        "category_rank": 0,
        "filter": "range",
        "filter_min": 0,
        "filter_max": 1
    },
    "masters": {
        "metric": "masters",
        "display": "% Masters",
        "isIncome": false,
		"formatter":formatPct,
        "category": "Education",
        "category_rank": 3,
        "filter": "range",
        "filter_min": 0,
        "filter_max": 1
    },
    "mean_hours_worked": {
        "metric": "mean_hours_worked",
        "display": "Mean Hours Worked",
        "isIncome": false,
		"formatter":formatNumber,
        "category": "Quality of Life",
        "category_rank": 0,
        "filter": "range",
        "filter_min": 0,
        "filter_max": 200
    },
    "med_gross_rent_pct_hshld_income": {
        "metric": "med_gross_rent_pct_hshld_income",
        "display": "Med Gross Rent Pct Hshld Income",
        "isIncome": false,
		"formatter":formatPctWhole,
        "category": "Cost of Living",
        "category_rank": 2,
        "filter": "range",
        "filter_min": 0,
        "filter_max": 1
    },
    "med_inc_accommodation_food_services": {
        "metric": "med_inc_accommodation_food_services",
        "display": "Med Inc Accommodation Food Services",
        "isIncome": true,
		"formatter":formatCurrency,
        "category": "Income",
        "category_rank": 3,
        "filter": "range",
        "filter_min": 0,
        "filter_max": 200000
    },
    "med_inc_administrative_support_waste_management_services": {
        "metric": "med_inc_administrative_support_waste_management_services",
        "display": "Med Inc Administrative Support Waste Management Services",
        "isIncome": true,
		"formatter":formatCurrency,
        "category": "Income",
        "category_rank": 3,
        "filter": "range",
        "filter_min": 0,
        "filter_max": 200000
    },
    "med_inc_agriculture_forestry_fishing_hunting": {
        "metric": "med_inc_agriculture_forestry_fishing_hunting",
        "display": "Med Inc Agriculture Forestry Fishing Hunting",
        "isIncome": true,
		"formatter":formatCurrency,
        "category": "Income",
        "category_rank": 3,
        "filter": "range",
        "filter_min": 0,
        "filter_max": 200000
    },
    "med_inc_arts_entertainment_recreation": {
        "metric": "med_inc_arts_entertainment_recreation",
        "display": "Med Inc Arts Entertainment Recreation",
        "isIncome": true,
		"formatter":formatCurrency,
        "category": "Income",
        "category_rank": 3,
        "filter": "range",
        "filter_min": 0,
        "filter_max": 200000
    },
    "med_inc_construction": {
        "metric": "med_inc_construction",
        "display": "Med Inc Construction",
        "isIncome": true,
		"formatter":formatCurrency,
        "category": "Income",
        "category_rank": 3,
        "filter": "range",
        "filter_min": 0,
        "filter_max": 200000
    },
    "med_inc_educational_services": {
        "metric": "med_inc_educational_services",
        "display": "Med Inc Educational Services",
        "isIncome": true,
		"formatter":formatCurrency,
        "category": "Income",
        "category_rank": 3,
        "filter": "range",
        "filter_min": 0,
        "filter_max": 200000
    },
    "med_inc_finance_insurance": {
        "metric": "med_inc_finance_insurance",
        "display": "Med Inc Finance Insurance",
        "isIncome": true,
		"formatter":formatCurrency,
        "category": "Income",
        "category_rank": 3,
        "filter": "range",
        "filter_min": 0,
        "filter_max": 200000
    },
    "med_inc_health_care_social_assistance": {
        "metric": "med_inc_health_care_social_assistance",
        "display": "Med Inc Health Care Social Assistance",
        "isIncome": true,
		"formatter":formatCurrency,
        "category": "Income",
        "category_rank": 3,
        "filter": "range",
        "filter_min": 0,
        "filter_max": 200000
    },
    "med_inc_information": {
        "metric": "med_inc_information",
        "display": "Med Inc Information",
        "isIncome": true,
		"formatter":formatCurrency,
        "category": "Income",
        "category_rank": 3,
        "filter": "range",
        "filter_min": 0,
        "filter_max": 200000
    },
    "med_inc_management_of_companies_enterprises": {
        "metric": "med_inc_management_of_companies_enterprises",
        "display": "Med Inc Management Of Companies Enterprises",
        "isIncome": true,
		"formatter":formatCurrency,
        "category": "Income",
        "category_rank": 3,
        "filter": "range",
        "filter_min": 0,
        "filter_max": 200000
    },
    "med_inc_manufacturing": {
        "metric": "med_inc_manufacturing",
        "display": "Med Inc Manufacturing",
        "isIncome": true,
		"formatter":formatCurrency,
        "category": "Income",
        "category_rank": 3,
        "filter": "range",
        "filter_min": 0,
        "filter_max": 200000
    },
    "med_inc_mining_quarrying_oil_gas_extraction": {
        "metric": "med_inc_mining_quarrying_oil_gas_extraction",
        "display": "Med Inc Mining Quarrying Oil Gas Extraction",
        "isIncome": true,
		"formatter":formatCurrency,
        "category": "Income",
        "category_rank": 3,
        "filter": "range",
        "filter_min": 0,
        "filter_max": 200000
    },
    "med_inc_other_services_except_public_administration": {
        "metric": "med_inc_other_services_except_public_administration",
        "display": "Med Inc Other Services Except Public Administration",
        "isIncome": true,
		"formatter":formatCurrency,
        "category": "Income",
        "category_rank": 3,
        "filter": "range",
        "filter_min": 0,
        "filter_max": 200000
    },
    "med_inc_professional_scientific_technical_services": {
        "metric": "med_inc_professional_scientific_technical_services",
        "display": "Med Inc Professional Scientific Technical Services",
        "isIncome": true,
		"formatter":formatCurrency,
        "category": "Income",
        "category_rank": 3,
        "filter": "range",
        "filter_min": 0,
        "filter_max": 200000
    },
    "med_inc_public_administration": {
        "metric": "med_inc_public_administration",
        "display": "Med Inc Public Administration",
        "isIncome": true,
		"formatter":formatCurrency,
        "category": "Income",
        "category_rank": 3,
        "filter": "range",
        "filter_min": 0,
        "filter_max": 200000
    },
    "med_inc_real_estate_rental_leasing": {
        "metric": "med_inc_real_estate_rental_leasing",
        "display": "Med Inc Real Estate Rental Leasing",
        "isIncome": true,
		"formatter":formatCurrency,
        "category": "Income",
        "category_rank": 3,
        "filter": "range",
        "filter_min": 0,
        "filter_max": 200000
    },
    "med_inc_retail_trade": {
        "metric": "med_inc_retail_trade",
        "display": "Med Inc Retail Trade",
        "isIncome": true,
		"formatter":formatCurrency,
        "category": "Income",
        "category_rank": 3,
        "filter": "range",
        "filter_min": 0,
        "filter_max": 200000
    },
    "med_inc_transportation_warehousing": {
        "metric": "med_inc_transportation_warehousing",
        "display": "Med Inc Transportation Warehousing",
        "isIncome": true,
		"formatter":formatCurrency,
        "category": "Income",
        "category_rank": 3,
        "filter": "range",
        "filter_min": 0,
        "filter_max": 200000
    },
    "med_inc_utilities": {
        "metric": "med_inc_utilities",
        "display": "Med Inc Utilities",
        "isIncome": true,
		"formatter":formatCurrency,
        "category": "Income",
        "category_rank": 3,
        "filter": "range",
        "filter_min": 0,
        "filter_max": 200000
    },
    "med_inc_wholesale_trade": {
        "metric": "med_inc_wholesale_trade",
        "display": "Med Inc Wholesale Trade",
        "isIncome": true,
		"formatter":formatCurrency,
        "category": "Income",
        "category_rank": 3,
        "filter": "range",
        "filter_min": 0,
        "filter_max": 200000
    },
    "median_age": {
        "metric": "median_age",
        "display": "Median Age",
        "isIncome": false,
		"formatter":formatNumber,
        "category": "Demographic Info",
        "category_rank": 1,
        "filter": "range",
        "filter_min": 0,
        "filter_max": 100
    },
    "median_commute": {
        "metric": "median_commute",
        "display": "Median Commute (Minutes)",
        "isIncome": false,
		"formatter":formatNumber,
        "category": "Quality of Life",
        "category_rank": 1,
        "filter": "range",
        "filter_min": 0,
        "filter_max": 100
    },
    "median_contract_rent": {
        "metric": "median_contract_rent",
        "display": "Median Contract Rent",
        "isIncome": false,
		"formatter":formatCurrency,
        "category": "Cost of Living",
        "category_rank": 3,
        "filter": "range",
        "filter_min": 0,
        "filter_max": 10000
    },
    "median_household_income": {
        "metric": "median_household_income",
        "display": "Median Household Income",
        "isIncome": false,
		"formatter":formatCurrency,
        "category": "Income",
        "category_rank": 1,
        "filter": "range",
        "filter_min": 0,
        "filter_max": 200000
    },
    "median_monthly_housing_costs": {
        "metric": "median_monthly_housing_costs",
        "display": "Median Monthly Housing Costs",
        "isIncome": false,
		"formatter":formatCurrency,
        "category": "Cost of Living",
        "category_rank": 4,
        "filter": "range",
        "filter_min": 0,
        "filter_max": 10000
    },
    "pct_minority": {
        "metric": "pct_minority",
        "display": "% Minority",
        "isIncome": false,
		"formatter":formatPct,
        "category": "Demographic Info",
        "category_rank": 2,
        "filter": "range",
        "filter_min": 0,
        "filter_max": 1
    },
    "per_capita_income": {
        "metric": "per_capita_income",
        "display": "Per Capita Income",
        "isIncome": false,
		"formatter":formatCurrency,
        "category": "Income",
        "category_rank": 1,
        "filter": "range",
        "filter_min": 0,
        "filter_max": 200000
    },
    "total_population": {
        "metric": "total_population",
        "display": "Total Population",
        "isIncome": false,
		"formatter":formatNumber,
        "category": "Demographic Info",
        "category_rank": 0,
        "filter": "range",
        "filter_min": 0,
        "filter_max": 100000000
    },
    "unemployment_rate": {
        "metric": "unemployment_rate",
        "display": "Unemployment Rate",
        "isIncome": false,
		"formatter":formatPct,
        "category": "Quality of Life",
        "category_rank": 2,
        "filter": "range",
        "filter_min": 0,
        "filter_max": 1
    }
}

import type { Manufacturer, Distributor, Interaction, Agreement, Invoice, FilterOptions, LocationMappingData } from '../types';

// Expanded manufacturers with FMCG focus and status
export const mockManufacturers: Manufacturer[] = [
  // F&B Manufacturers
  {
    id: 'M001',
    name: 'Britannia Industries Ltd',
    city: 'Mumbai',
    district: 'Mumbai',
    state: 'Maharashtra',
    category: 'Bakery Products',
    subCategory: 'Biscuits & Cookies',
    status: 'Customer',
    registrationDate: '2023-01-15',
    daysSinceStatus: 180
  },
  {
    id: 'M002',
    name: 'Parle Products Pvt Ltd',
    city: 'Mumbai',
    district: 'Mumbai',
    state: 'Maharashtra',
    category: 'Snacks & Confectionery',
    subCategory: 'Biscuits & Cookies',
    status: 'Prospect',
    registrationDate: '2023-02-20',
    daysSinceStatus: 150
  },
  {
    id: 'M003',
    name: 'Amul (GCMMF)',
    city: 'Ahmedabad',
    district: 'Ahmedabad',
    state: 'Gujarat',
    category: 'Dairy Products',
    subCategory: 'Milk & Cream',
    status: 'Customer',
    registrationDate: '2023-03-10',
    daysSinceStatus: 135
  },
  {
    id: 'M004',
    name: 'Coca-Cola India',
    city: 'Bangalore',
    district: 'Bangalore Urban',
    state: 'Karnataka',
    category: 'Beverages',
    subCategory: 'Soft Drinks',
    status: 'Lead',
    registrationDate: '2023-04-05',
    daysSinceStatus: 110
  },
  {
    id: 'M005',
    name: 'Nestle India Ltd',
    city: 'Delhi',
    district: 'New Delhi',
    state: 'Delhi',
    category: 'Packaged Foods',
    subCategory: 'Ready-to-Eat',
    status: 'Customer',
    registrationDate: '2023-05-12',
    daysSinceStatus: 75
  },
  
  // Personal Care Manufacturers
  {
    id: 'M006',
    name: 'Hindustan Unilever Ltd',
    city: 'Mumbai',
    district: 'Mumbai',
    state: 'Maharashtra',
    category: 'Skincare',
    subCategory: 'Face Care',
    status: 'Customer',
    registrationDate: '2023-06-18',
    daysSinceStatus: 40
  },
  {
    id: 'M007',
    name: 'Procter & Gamble India',
    city: 'Mumbai',
    district: 'Mumbai',
    state: 'Maharashtra',
    category: 'Haircare',
    subCategory: 'Shampoo & Conditioner',
    status: 'Prospect',
    registrationDate: '2023-07-22',
    daysSinceStatus: 15
  },
  {
    id: 'M008',
    name: 'Colgate-Palmolive India',
    city: 'Mumbai',
    district: 'Mumbai',
    state: 'Maharashtra',
    category: 'Oral Care',
    subCategory: 'Toothpaste',
    status: 'Customer',
    registrationDate: '2023-03-25',
    daysSinceStatus: 80
  },
  {
    id: 'M009',
    name: 'Godrej Consumer Products',
    city: 'Mumbai',
    district: 'Mumbai',
    state: 'Maharashtra',
    category: 'Haircare',
    subCategory: 'Hair Oil',
    status: 'Lead',
    registrationDate: '2023-05-30',
    daysSinceStatus: 40
  },
  
  // Home Care Manufacturers
  {
    id: 'M010',
    name: 'Reckitt Benckiser India',
    city: 'Gurgaon',
    district: 'South Delhi',
    state: 'Delhi',
    category: 'Surface Cleaners',
    subCategory: 'Floor Cleaners',
    status: 'Customer',
    registrationDate: '2023-07-01',
    daysSinceStatus: 20
  },
  {
    id: 'M011',
    name: 'Henkel India',
    city: 'Mumbai',
    district: 'Mumbai',
    state: 'Maharashtra',
    category: 'Laundry Care',
    subCategory: 'Detergent Powder',
    status: 'Prospect',
    registrationDate: '2023-04-15',
    daysSinceStatus: 100
  },
  
  // Health & Wellness Manufacturers
  {
    id: 'M012',
    name: 'Dabur India Ltd',
    city: 'Delhi',
    district: 'New Delhi',
    state: 'Delhi',
    category: 'Ayurvedic Products',
    subCategory: 'Health Supplements',
    status: 'Customer',
    registrationDate: '2023-02-28',
    daysSinceStatus: 120
  },
  {
    id: 'M013',
    name: 'Abbott India Ltd',
    city: 'Mumbai',
    district: 'Mumbai',
    state: 'Maharashtra',
    category: 'Health Drinks',
    subCategory: 'Protein Drinks',
    status: 'Lead',
    registrationDate: '2023-06-10',
    daysSinceStatus: 50
  },
  
  // Baby Care Manufacturers
  {
    id: 'M014',
    name: 'Johnson & Johnson India',
    city: 'Mumbai',
    district: 'Mumbai',
    state: 'Maharashtra',
    category: 'Baby Skincare',
    subCategory: 'Baby Lotion',
    status: 'Customer',
    registrationDate: '2023-01-20',
    daysSinceStatus: 200
  },
  {
    id: 'M015',
    name: 'Procter & Gamble Baby Care',
    city: 'Mumbai',
    district: 'Mumbai',
    state: 'Maharashtra',
    category: 'Diapers',
    subCategory: 'Disposable Diapers',
    status: 'Prospect',
    registrationDate: '2023-05-05',
    daysSinceStatus: 60
  },
  {
    id: 'M016',
    name: 'ITC Limited',
    city: 'Kolkata',
    district: 'Kolkata',
    state: 'West Bengal',
    category: 'Snacks & Confectionery',
    subCategory: 'Biscuits & Cookies',
    status: 'Lead',
    registrationDate: '2023-07-25',
    daysSinceStatus: 8
  },
  {
    id: 'M017',
    name: 'Marico Limited',
    city: 'Mumbai',
    district: 'Mumbai',
    state: 'Maharashtra',
    category: 'Haircare',
    subCategory: 'Hair Oil',
    status: 'Customer',
    registrationDate: '2023-03-12',
    daysSinceStatus: 95
  },
  {
    id: 'M018',
    name: 'Emami Limited',
    city: 'Kolkata',
    district: 'Kolkata',
    state: 'West Bengal',
    category: 'Skincare',
    subCategory: 'Face Care',
    status: 'Prospect',
    registrationDate: '2023-06-08',
    daysSinceStatus: 35
  },
  {
    id: 'M019',
    name: 'Wipro Consumer Care',
    city: 'Bangalore',
    district: 'Bangalore Urban',
    state: 'Karnataka',
    category: 'Laundry Care',
    subCategory: 'Detergent Powder',
    status: 'View',
    registrationDate: '2023-02-15',
    daysSinceStatus: 110
  },
  {
    id: 'M020',
    name: 'Tata Consumer Products',
    city: 'Mumbai',
    district: 'Mumbai',
    state: 'Maharashtra',
    category: 'Beverages',
    subCategory: 'Soft Drinks',
    status: 'Lead',
    registrationDate: '2023-07-18',
    daysSinceStatus: 12
  },
  {
    id: 'M021',
    name: 'Bajaj Consumer Care',
    city: 'Mumbai',
    district: 'Mumbai',
    state: 'Maharashtra',
    category: 'Haircare',
    subCategory: 'Hair Oil',
    status: 'Customer',
    registrationDate: '2023-04-22',
    daysSinceStatus: 68
  },
  {
    id: 'M022',
    name: 'Jyothy Labs',
    city: 'Mumbai',
    district: 'Mumbai',
    state: 'Maharashtra',
    category: 'Laundry Care',
    subCategory: 'Fabric Softener',
    status: 'Prospect',
    registrationDate: '2023-05-28',
    daysSinceStatus: 45
  },
  {
    id: 'M023',
    name: 'Cavinkare Pvt Ltd',
    city: 'Chennai',
    district: 'Chennai',
    state: 'Tamil Nadu',
    category: 'Haircare',
    subCategory: 'Shampoo & Conditioner',
    status: 'Lead',
    registrationDate: '2023-07-05',
    daysSinceStatus: 20
  },
  {
    id: 'M024',
    name: 'Nirma Limited',
    city: 'Ahmedabad',
    district: 'Ahmedabad',
    state: 'Gujarat',
    category: 'Laundry Care',
    subCategory: 'Detergent Powder',
    status: 'Customer',
    registrationDate: '2023-03-08',
    daysSinceStatus: 88
  },
  {
    id: 'M025',
    name: 'Zydus Wellness',
    city: 'Ahmedabad',
    district: 'Ahmedabad',
    state: 'Gujarat',
    category: 'Health Drinks',
    subCategory: 'Protein Drinks',
    status: 'View',
    registrationDate: '2023-01-30',
    daysSinceStatus: 165
  },
  {
    id: 'M026',
    name: 'Patanjali Ayurved',
    city: 'Delhi',
    district: 'New Delhi',
    state: 'Delhi',
    category: 'Ayurvedic Products',
    subCategory: 'Health Supplements',
    status: 'Prospect',
    registrationDate: '2023-06-20',
    daysSinceStatus: 28
  },
  {
    id: 'M027',
    name: 'Himalaya Drug Company',
    city: 'Bangalore',
    district: 'Bangalore Urban',
    state: 'Karnataka',
    category: 'Baby Skincare',
    subCategory: 'Baby Lotion',
    status: 'Lead',
    registrationDate: '2023-07-12',
    daysSinceStatus: 15
  },
  {
    id: 'M028',
    name: 'Kellogg India',
    city: 'Mumbai',
    district: 'Mumbai',
    state: 'Maharashtra',
    category: 'Baby Food',
    subCategory: 'Baby Cereal',
    status: 'Customer',
    registrationDate: '2023-04-10',
    daysSinceStatus: 75
  },
  {
    id: 'M029',
    name: 'Perfetti Van Melle',
    city: 'Gurgaon',
    district: 'South Delhi',
    state: 'Delhi',
    category: 'Snacks & Confectionery',
    subCategory: 'Chocolates',
    status: 'View',
    registrationDate: '2023-02-05',
    daysSinceStatus: 125
  },
  {
    id: 'M030',
    name: 'Mondelez India',
    city: 'Mumbai',
    district: 'Mumbai',
    state: 'Maharashtra',
    category: 'Snacks & Confectionery',
    subCategory: 'Chocolates',
    status: 'Prospect',
    registrationDate: '2023-06-02',
    daysSinceStatus: 42
  }
];

// Expanded distributors with FMCG focus
export const mockDistributors: Distributor[] = [
  // F&B Distributors
  {
    id: 'D001',
    name: 'Metro Cash & Carry',
    city: 'Mumbai',
    district: 'Mumbai',
    state: 'Maharashtra',
    category: 'Bakery Products',
    subCategory: 'Biscuits & Cookies',
    status: 'Lead',
    registrationDate: '2023-04-01',
    daysSinceStatus: 25
  },
  {
    id: 'D002',
    name: 'Big Bazaar Distribution',
    city: 'Delhi',
    district: 'New Delhi',
    state: 'Delhi',
    category: 'Snacks & Confectionery',
    subCategory: 'Biscuits & Cookies',
    status: 'Prospect',
    registrationDate: '2023-03-15',
    daysSinceStatus: 45
  },
  {
    id: 'D003',
    name: 'Reliance Fresh Network',
    city: 'Mumbai',
    district: 'Mumbai',
    state: 'Maharashtra',
    category: 'Dairy Products',
    subCategory: 'Milk & Cream',
    status: 'Customer',
    registrationDate: '2023-02-10',
    daysSinceStatus: 75
  },
  {
    id: 'D004',
    name: 'Spencer\'s Retail',
    city: 'Kolkata',
    district: 'Kolkata',
    state: 'West Bengal',
    category: 'Beverages',
    subCategory: 'Soft Drinks',
    status: 'Lead',
    registrationDate: '2023-05-20',
    daysSinceStatus: 15
  },
  {
    id: 'D005',
    name: 'More Supermarkets',
    city: 'Chennai',
    district: 'Chennai',
    state: 'Tamil Nadu',
    category: 'Packaged Foods',
    subCategory: 'Ready-to-Eat',
    status: 'Customer',
    registrationDate: '2023-06-10',
    daysSinceStatus: 30
  },
  {
    id: 'D006',
    name: 'Food Bazaar',
    city: 'Pune',
    district: 'Pune',
    state: 'Maharashtra',
    category: 'Frozen Foods',
    subCategory: 'Frozen Vegetables',
    status: 'Prospect',
    registrationDate: '2023-01-25',
    daysSinceStatus: 90
  },
  
  // Personal Care Distributors
  {
    id: 'D007',
    name: 'Health & Glow',
    city: 'Bangalore',
    district: 'Bangalore Urban',
    state: 'Karnataka',
    category: 'Skincare',
    subCategory: 'Face Care',
    status: 'Customer',
    registrationDate: '2022-12-15',
    daysSinceStatus: 120
  },
  {
    id: 'D008',
    name: 'Nykaa Distribution',
    city: 'Mumbai',
    district: 'Mumbai',
    state: 'Maharashtra',
    category: 'Color Cosmetics',
    subCategory: 'Lipstick',
    status: 'Lead',
    registrationDate: '2023-07-05',
    daysSinceStatus: 10
  },
  {
    id: 'D009',
    name: 'Apollo Pharmacy',
    city: 'Hyderabad',
    district: 'Hyderabad',
    state: 'Telangana',
    category: 'Oral Care',
    subCategory: 'Toothpaste',
    status: 'Prospect',
    registrationDate: '2023-06-25',
    daysSinceStatus: 20
  },
  {
    id: 'D010',
    name: 'Shoppers Stop Beauty',
    city: 'Mumbai',
    district: 'Mumbai',
    state: 'Maharashtra',
    category: 'Fragrances',
    subCategory: 'Perfumes',
    status: 'Customer',
    registrationDate: '2023-04-12',
    daysSinceStatus: 60
  },
  
  // Home Care Distributors
  {
    id: 'D011',
    name: 'Godrej Nature\'s Basket',
    city: 'Mumbai',
    district: 'Mumbai',
    state: 'Maharashtra',
    category: 'Surface Cleaners',
    subCategory: 'Floor Cleaners',
    status: 'Lead',
    registrationDate: '2023-07-15',
    daysSinceStatus: 8
  },
  {
    id: 'D012',
    name: 'Hypercity Retail',
    city: 'Pune',
    district: 'Pune',
    state: 'Maharashtra',
    category: 'Laundry Care',
    subCategory: 'Detergent Powder',
    status: 'Prospect',
    registrationDate: '2023-05-30',
    daysSinceStatus: 35
  },
  {
    id: 'D013',
    name: 'Star Bazaar',
    city: 'Mumbai',
    district: 'Mumbai',
    state: 'Maharashtra',
    category: 'Dishwashing',
    subCategory: 'Dishwashing Liquid',
    status: 'Customer',
    registrationDate: '2023-03-20',
    daysSinceStatus: 85
  },
  
  // Health & Wellness Distributors
  {
    id: 'D014',
    name: 'Wellness Forever',
    city: 'Mumbai',
    district: 'Mumbai',
    state: 'Maharashtra',
    category: 'Vitamins & Supplements',
    subCategory: 'Multivitamins',
    status: 'Lead',
    registrationDate: '2023-07-01',
    daysSinceStatus: 12
  },
  {
    id: 'D015',
    name: 'MedPlus Health Services',
    city: 'Hyderabad',
    district: 'Hyderabad',
    state: 'Telangana',
    category: 'Health Drinks',
    subCategory: 'Protein Drinks',
    status: 'Prospect',
    registrationDate: '2023-06-15',
    daysSinceStatus: 28
  },
  {
    id: 'D016',
    name: 'Patanjali Mega Store',
    city: 'Delhi',
    district: 'New Delhi',
    state: 'Delhi',
    category: 'Ayurvedic Products',
    subCategory: 'Health Supplements',
    status: 'Customer',
    registrationDate: '2023-05-10',
    daysSinceStatus: 55
  },
  
  // Baby Care Distributors
  {
    id: 'D017',
    name: 'FirstCry Store',
    city: 'Pune',
    district: 'Pune',
    state: 'Maharashtra',
    category: 'Baby Food',
    subCategory: 'Baby Cereal',
    status: 'Customer',
    registrationDate: '2023-03-20',
    daysSinceStatus: 85
  },
  {
    id: 'D018',
    name: 'Mothercare India',
    city: 'Mumbai',
    district: 'Mumbai',
    state: 'Maharashtra',
    category: 'Diapers',
    subCategory: 'Disposable Diapers',
    status: 'Lead',
    registrationDate: '2023-07-20',
    daysSinceStatus: 5
  },
  {
    id: 'D019',
    name: 'Baby Oye Distribution',
    city: 'Bangalore',
    district: 'Bangalore Urban',
    state: 'Karnataka',
    category: 'Baby Skincare',
    subCategory: 'Baby Lotion',
    status: 'Prospect',
    registrationDate: '2023-06-30',
    daysSinceStatus: 25
  },
  
  // Additional distributors for better coverage
  {
    id: 'D020',
    name: 'DMart Distribution',
    city: 'Mumbai',
    district: 'Mumbai',
    state: 'Maharashtra',
    category: 'Bakery Products',
    subCategory: 'Biscuits & Cookies',
    status: 'Customer',
    registrationDate: '2023-05-15',
    daysSinceStatus: 50
  },
  {
    id: 'D021',
    name: 'Lifestyle Stores',
    city: 'Bangalore',
    district: 'Bangalore Urban',
    state: 'Karnataka',
    category: 'Skincare',
    subCategory: 'Face Care',
    status: 'View',
    registrationDate: '2023-02-28',
    daysSinceStatus: 95
  },
  {
    id: 'D022',
    name: 'Westside Beauty',
    city: 'Mumbai',
    district: 'Mumbai',
    state: 'Maharashtra',
    category: 'Haircare',
    subCategory: 'Shampoo & Conditioner',
    status: 'Lead',
    registrationDate: '2023-07-10',
    daysSinceStatus: 15
  },
  {
    id: 'D023',
    name: 'Central Mall Stores',
    city: 'Chennai',
    district: 'Chennai',
    state: 'Tamil Nadu',
    category: 'Air Care',
    subCategory: 'Air Fresheners',
    status: 'Prospect',
    registrationDate: '2023-06-20',
    daysSinceStatus: 35
  },
  {
    id: 'D024',
    name: 'Forum Mall Retail',
    city: 'Bangalore',
    district: 'Bangalore Urban',
    state: 'Karnataka',
    category: 'Snacks & Confectionery',
    subCategory: 'Biscuits & Cookies',
    status: 'Customer',
    registrationDate: '2023-04-25',
    daysSinceStatus: 70
  },
  {
    id: 'D025',
    name: 'Phoenix Mall Distribution',
    city: 'Pune',
    district: 'Pune',
    state: 'Maharashtra',
    category: 'Feeding Accessories',
    subCategory: 'Baby Bottles',
    status: 'View',
    registrationDate: '2023-03-30',
    daysSinceStatus: 95
  }
];

export const mockInteractions: Interaction[] = [
  {
    id: 'I001',
    interactedBy: 'John Doe',
    dateInteracted: '2024-01-15',
    timeElapsed: '2 months',
    notes: 'Initial contact made, discussed product requirements',
    mode: 'Phone',
    hasReminder: true,
    reminderDate: '2024-02-15'
  },
  {
    id: 'I002',
    interactedBy: 'Jane Smith',
    dateInteracted: '2024-02-20',
    timeElapsed: '1 month',
    notes: 'Follow-up meeting scheduled, pricing discussed',
    mode: 'FtoF',
    hasReminder: false
  }
];

export const mockAgreement: Agreement = {
  id: 'A001',
  version: 1,
  terms: [
    { id: 'T001', clause: 'Payment Terms', response: 'Net 30 days' },
    { id: 'T002', clause: 'Delivery Terms', response: 'FOB Origin' },
    { id: 'T003', clause: 'Commission Rate', response: '15%' }
  ],
  status: 'Draft',
  createdDate: '2024-01-20'
};

export const mockInvoices: Invoice[] = [
  {
    id: 'INV001',
    type: 'Proforma',
    invoiceNo: 'PRO-2024-001',
    amount: 100000,
    commissionPercent: 15,
    commissionAmount: 15000,
    uploadedBy: 'System Admin',
    uploadDate: '2024-01-25'
  },
  {
    id: 'INV002',
    type: 'Tax',
    invoiceNo: 'TAX-2024-001',
    amount: 100000,
    commissionPercent: 15,
    commissionAmount: 15000,
    uploadedBy: 'System Admin',
    uploadDate: '2024-02-05',
    durationBetween: 11
  }
];

export const filterOptions: FilterOptions = {
  cities: [
    'Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad', // Maharashtra
    'Delhi', 'New Delhi', 'Gurgaon', 'Noida', 'Faridabad', // Delhi NCR
    'Bangalore', 'Mysore', 'Hubli', 'Mangalore', 'Belgaum', // Karnataka
    'Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Tiruchirappalli', // Tamil Nadu
    'Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', // West Bengal
    'Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam', // Telangana
    'Kanpur', 'Lucknow', 'Agra', 'Varanasi', 'Meerut', 'Allahabad', // Uttar Pradesh
    'Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Udaipur', // Rajasthan
    'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar' // Gujarat
  ],
  districts: [
    'Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad', // Maharashtra
    'New Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi', // Delhi
    'Bangalore Urban', 'Mysore', 'Hubli-Dharwad', 'Dakshina Kannada', 'Belgaum', // Karnataka
    'Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Tiruchirappalli', // Tamil Nadu
    'Kolkata', 'Howrah', 'Burdwan', 'Asansol', 'Darjeeling', // West Bengal
    'Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam', // Telangana
    'Kanpur Nagar', 'Lucknow', 'Agra', 'Varanasi', 'Meerut', 'Allahabad', // Uttar Pradesh
    'Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Udaipur', // Rajasthan
    'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar' // Gujarat
  ],
  states: ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'West Bengal', 'Telangana', 'Uttar Pradesh', 'Rajasthan', 'Gujarat'],
  categories: [
    // F&B categories
    'Beverages', 'Snacks & Confectionery', 'Dairy Products', 'Packaged Foods', 'Frozen Foods', 'Bakery Products',
    // Personal Care categories
    'Skincare', 'Haircare', 'Oral Care', 'Fragrances', 'Color Cosmetics',
    // Home Care categories
    'Laundry Care', 'Dishwashing', 'Surface Cleaners', 'Air Care',
    // Health & Wellness categories
    'Vitamins & Supplements', 'Health Drinks', 'Ayurvedic Products',
    // Baby Care categories
    'Baby Food', 'Diapers', 'Baby Skincare', 'Feeding Accessories'
  ],
  subCategories: [
    // F&B sub-categories
    'Soft Drinks', 'Biscuits & Cookies', 'Milk & Cream', 'Ready-to-Eat', 'Frozen Vegetables', 'Bread & Cakes',
    // Personal Care sub-categories
    'Face Care', 'Shampoo & Conditioner', 'Toothpaste', 'Perfumes', 'Lipstick', 'Hair Oil',
    // Home Care sub-categories
    'Detergent Powder', 'Dishwashing Liquid', 'Floor Cleaners', 'Air Fresheners', 'Fabric Softener', 'Kitchen Cleaners',
    // Health & Wellness sub-categories
    'Multivitamins', 'Protein Drinks', 'Health Supplements', 'First Aid Kits',
    // Baby Care sub-categories
    'Baby Cereal', 'Disposable Diapers', 'Baby Lotion', 'Baby Shampoo', 'Baby Bottles'
  ],
  statuses: ['Registration', 'Lead', 'Prospect', 'Customer', 'View']
};

// Location mapping for dependent multiselect
export const locationMapping: LocationMappingData = {
  'Maharashtra': {
    districts: ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad'],
    cities: ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad']
  },
  'Delhi': {
    districts: ['New Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi'],
    cities: ['Delhi', 'New Delhi', 'Gurgaon', 'Noida', 'Faridabad']
  },
  'Karnataka': {
    districts: ['Bangalore Urban', 'Mysore', 'Hubli-Dharwad', 'Dakshina Kannada', 'Belgaum'],
    cities: ['Bangalore', 'Mysore', 'Hubli', 'Mangalore', 'Belgaum']
  },
  'Tamil Nadu': {
    districts: ['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Tiruchirappalli'],
    cities: ['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Tiruchirappalli']
  },
  'West Bengal': {
    districts: ['Kolkata', 'Howrah', 'Burdwan', 'Asansol', 'Darjeeling'],
    cities: ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri']
  },
  'Telangana': {
    districts: ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam'],
    cities: ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam']
  },
  'Uttar Pradesh': {
    districts: ['Kanpur Nagar', 'Lucknow', 'Agra', 'Varanasi', 'Meerut', 'Allahabad'],
    cities: ['Kanpur', 'Lucknow', 'Agra', 'Varanasi', 'Meerut', 'Allahabad']
  },
  'Rajasthan': {
    districts: ['Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Udaipur'],
    cities: ['Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Udaipur']
  },
  'Gujarat': {
    districts: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar'],
    cities: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar']
  }
};

// City to state/district mapping
export const cityToLocationMapping: Record<string, { state: string; district: string }> = {
  // Maharashtra
  'Mumbai': { state: 'Maharashtra', district: 'Mumbai' },
  'Pune': { state: 'Maharashtra', district: 'Pune' },
  'Nagpur': { state: 'Maharashtra', district: 'Nagpur' },
  'Nashik': { state: 'Maharashtra', district: 'Nashik' },
  'Aurangabad': { state: 'Maharashtra', district: 'Aurangabad' },
  
  // Delhi NCR
  'Delhi': { state: 'Delhi', district: 'New Delhi' },
  'New Delhi': { state: 'Delhi', district: 'New Delhi' },
  'Gurgaon': { state: 'Delhi', district: 'South Delhi' },
  'Noida': { state: 'Delhi', district: 'East Delhi' },
  'Faridabad': { state: 'Delhi', district: 'South Delhi' },
  
  // Karnataka
  'Bangalore': { state: 'Karnataka', district: 'Bangalore Urban' },
  'Mysore': { state: 'Karnataka', district: 'Mysore' },
  'Hubli': { state: 'Karnataka', district: 'Hubli-Dharwad' },
  'Mangalore': { state: 'Karnataka', district: 'Dakshina Kannada' },
  'Belgaum': { state: 'Karnataka', district: 'Belgaum' },
  
  // Tamil Nadu
  'Chennai': { state: 'Tamil Nadu', district: 'Chennai' },
  'Coimbatore': { state: 'Tamil Nadu', district: 'Coimbatore' },
  'Madurai': { state: 'Tamil Nadu', district: 'Madurai' },
  'Salem': { state: 'Tamil Nadu', district: 'Salem' },
  'Tiruchirappalli': { state: 'Tamil Nadu', district: 'Tiruchirappalli' },
  
  // West Bengal
  'Kolkata': { state: 'West Bengal', district: 'Kolkata' },
  'Howrah': { state: 'West Bengal', district: 'Howrah' },
  'Durgapur': { state: 'West Bengal', district: 'Burdwan' },
  'Asansol': { state: 'West Bengal', district: 'Asansol' },
  'Siliguri': { state: 'West Bengal', district: 'Darjeeling' },
  
  // Telangana
  'Hyderabad': { state: 'Telangana', district: 'Hyderabad' },
  'Warangal': { state: 'Telangana', district: 'Warangal' },
  'Nizamabad': { state: 'Telangana', district: 'Nizamabad' },
  'Karimnagar': { state: 'Telangana', district: 'Karimnagar' },
  'Khammam': { state: 'Telangana', district: 'Khammam' },
  
  // Uttar Pradesh
  'Kanpur': { state: 'Uttar Pradesh', district: 'Kanpur Nagar' },
  'Lucknow': { state: 'Uttar Pradesh', district: 'Lucknow' },
  'Agra': { state: 'Uttar Pradesh', district: 'Agra' },
  'Varanasi': { state: 'Uttar Pradesh', district: 'Varanasi' },
  'Meerut': { state: 'Uttar Pradesh', district: 'Meerut' },
  'Allahabad': { state: 'Uttar Pradesh', district: 'Allahabad' },
  
  // Rajasthan
  'Jaipur': { state: 'Rajasthan', district: 'Jaipur' },
  'Jodhpur': { state: 'Rajasthan', district: 'Jodhpur' },
  'Kota': { state: 'Rajasthan', district: 'Kota' },
  'Bikaner': { state: 'Rajasthan', district: 'Bikaner' },
  'Udaipur': { state: 'Rajasthan', district: 'Udaipur' },
  
  // Gujarat
  'Ahmedabad': { state: 'Gujarat', district: 'Ahmedabad' },
  'Surat': { state: 'Gujarat', district: 'Surat' },
  'Vadodara': { state: 'Gujarat', district: 'Vadodara' },
  'Rajkot': { state: 'Gujarat', district: 'Rajkot' },
  'Bhavnagar': { state: 'Gujarat', district: 'Bhavnagar' }
};

// Category to sub-category mapping for FMCG
export const categoryToSubCategoryMapping: Record<string, string[]> = {
  'Beverages': ['Soft Drinks', 'Juices', 'Energy Drinks'],
  'Snacks & Confectionery': ['Biscuits & Cookies', 'Chocolates', 'Chips'],
  'Dairy Products': ['Milk & Cream', 'Cheese', 'Yogurt'],
  'Packaged Foods': ['Ready-to-Eat', 'Instant Noodles', 'Canned Foods'],
  'Frozen Foods': ['Frozen Vegetables', 'Ice Cream', 'Frozen Snacks'],
  'Bakery Products': ['Bread & Cakes', 'Pastries', 'Cookies'],
  'Skincare': ['Face Care', 'Body Care', 'Sun Care'],
  'Haircare': ['Shampoo & Conditioner', 'Hair Oil', 'Hair Styling'],
  'Oral Care': ['Toothpaste', 'Mouthwash', 'Toothbrush'],
  'Fragrances': ['Perfumes', 'Deodorants', 'Body Spray'],
  'Color Cosmetics': ['Lipstick', 'Foundation', 'Eye Makeup'],
  'Laundry Care': ['Detergent Powder', 'Fabric Softener', 'Stain Removers'],
  'Dishwashing': ['Dishwashing Liquid', 'Dishwasher Tablets', 'Scrubbers'],
  'Surface Cleaners': ['Floor Cleaners', 'Glass Cleaners', 'Bathroom Cleaners'],
  'Air Care': ['Air Fresheners', 'Room Sprays', 'Candles'],
  'Vitamins & Supplements': ['Multivitamins', 'Calcium', 'Iron'],
  'Health Drinks': ['Protein Drinks', 'Energy Drinks', 'Health Tonics'],
  'Ayurvedic Products': ['Health Supplements', 'Herbal Teas', 'Natural Remedies'],
  'Baby Food': ['Baby Cereal', 'Baby Puree', 'Baby Snacks'],
  'Diapers': ['Disposable Diapers', 'Cloth Diapers', 'Training Pants'],
  'Baby Skincare': ['Baby Lotion', 'Baby Oil', 'Baby Powder'],
  'Feeding Accessories': ['Baby Bottles', 'Sippy Cups', 'Bibs']
};

// Export alias for backward compatibility
export const industryToCategoryMapping = categoryToSubCategoryMapping;

export const termsOptions = {
  clauses: [
    'Margin to distributor',
    'Margin to Super Stockist',
    'Shall provide salesmen',
    'Returns & Replacement',
    'Payment Terms',
    'Marketing materials & support'
  ],
  responses: {
    'Margin to distributor': [
      '10%',
      '15%',
      '20%',
      '25%',
      '30%',
      '35%',
      '40%',
      '45%',
      '50%'
    ],
    'Margin to Super Stockist': [
      '5%',
      '6%',
      '7%',
      '8%',
      '9%',
      '10%',
      'NA'
    ],
    'Shall provide salesmen': [
      'Yes',
      'No',
      'Shared DSR cost',
      'Based on target sales per region'
    ],
    'Returns & Replacement': [
      'Accepted for both primary and secondary',
      'Accepted only for Primary (Factory to Distributor point)',
      'Accept only manufacturing defects',
      'Do not accept returns'
    ],
    'Payment Terms': [
      '100% Advance payment',
      'Cash on Delivery (COD)',
      'Part Payment',
      'Credit (with number of days mentioned)'
    ],
    'Marketing materials & support': [
      'Yes, materials provided by brand but no manpower',
      'Manpower and material will be given by brand',
      'Marketing cost adjusted in additional margins',
      'Marketing cost reimbursement as per brand approval'
    ]
  }
};

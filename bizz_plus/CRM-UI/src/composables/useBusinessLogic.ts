import { ref, computed, reactive } from 'vue';
import type { Manufacturer, Distributor, Interaction, Agreement, Invoice } from '../types';
import { mockManufacturers, mockDistributors, mockInteractions, mockAgreement, mockInvoices, locationMapping, industryToCategoryMapping } from '../data/mockData';

// Persistent state using localStorage
const getStoredState = (key: string, defaultValue: any) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const getValidatedFiltersState = (key: string, defaultValue: any) => {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return defaultValue;
    
    const parsed = JSON.parse(stored);
    if (!parsed || typeof parsed !== 'object') return defaultValue;
    
    // Ensure all filter properties are arrays
    const validated = { ...defaultValue };
    Object.keys(defaultValue).forEach(filterKey => {
      if (Array.isArray(parsed[filterKey])) {
        validated[filterKey] = parsed[filterKey];
      } else {
        validated[filterKey] = defaultValue[filterKey];
      }
    });
    
    return validated;
  } catch {
    return defaultValue;
  }
};

const setStoredState = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage errors
  }
};

export const useBusinessLogic = () => {
  const selectedEntity = ref<'manufacturer' | 'distributor'>(
    getStoredState('selectedEntity', 'manufacturer')
  );
  const selectedManufacturer = ref<Manufacturer | null>(
    getStoredState('selectedManufacturer', null)
  );
  const selectedDistributor = ref<Distributor | null>(
    getStoredState('selectedDistributor', null)
  );
  const selectedEntityId = ref<string>(
    getStoredState('selectedEntityId', '')
  );
  
  const defaultFilters = {
    city: [] as string[],
    district: [] as string[],
    state: [] as string[],
    category: [] as string[],
    subCategory: [] as string[],
    status: [] as string[]
  };
  
  const filters = reactive(
    getValidatedFiltersState('filters', defaultFilters)
  );

  const associatedFilters = reactive(
    getValidatedFiltersState('associatedFilters', defaultFilters)
  );

  const manufacturers = ref<Manufacturer[]>(mockManufacturers);
  const distributors = ref<Distributor[]>(mockDistributors);
  const interactions = ref<Interaction[]>(mockInteractions);
  const agreement = ref<Agreement>(mockAgreement);
  const invoices = ref<Invoice[]>(mockInvoices);

  // Watch for changes and persist to localStorage
  const persistState = () => {
    setStoredState('selectedEntity', selectedEntity.value);
    setStoredState('selectedManufacturer', selectedManufacturer.value);
    setStoredState('selectedDistributor', selectedDistributor.value);
    setStoredState('selectedEntityId', selectedEntityId.value);
    setStoredState('filters', filters);
    setStoredState('associatedFilters', associatedFilters);
  };

  const filteredManufacturers = computed(() => {
    return manufacturers.value.filter(manufacturer => {
      return (!filters.city.length || filters.city.includes(manufacturer.city)) &&
             (!filters.district.length || filters.district.includes(manufacturer.district)) &&
             (!filters.state.length || filters.state.includes(manufacturer.state)) &&
             (!filters.category.length || filters.category.includes(manufacturer.category)) &&
             (!filters.subCategory.length || filters.subCategory.includes(manufacturer.subCategory)) &&
             (!filters.status.length || filters.status.includes(manufacturer.status));
    });
  });

  const filteredDistributors = computed(() => {
    return distributors.value.filter(distributor => {
      return (!filters.city.length || filters.city.includes(distributor.city)) &&
             (!filters.district.length || filters.district.includes(distributor.district)) &&
             (!filters.state.length || filters.state.includes(distributor.state)) &&
             (!filters.category.length || filters.category.includes(distributor.category)) &&
             (!filters.subCategory.length || filters.subCategory.includes(distributor.subCategory)) &&
             (!filters.status.length || filters.status.includes(distributor.status));
    });
  });

  const pairedList = computed(() => {
    if (selectedEntity.value === 'manufacturer' && selectedManufacturer.value) {
      return distributors.value.filter(d => 
        d.category === selectedManufacturer.value?.category &&
        d.subCategory === selectedManufacturer.value?.subCategory
      );
    }
    if (selectedEntity.value === 'distributor' && selectedDistributor.value) {
      return manufacturers.value.filter(m => 
        m.category === selectedDistributor.value?.category &&
        m.subCategory === selectedDistributor.value?.subCategory
      );
    }
    return [];
  });

  const addInteraction = (interaction: Omit<Interaction, 'id'>) => {
    const newInteraction = {
      ...interaction,
      id: `I${Date.now()}`
    };
    interactions.value.unshift(newInteraction);
  };

  const updateAgreement = (updatedAgreement: Agreement) => {
    agreement.value = updatedAgreement;
  };

  const addInvoice = (invoice: Omit<Invoice, 'id'>) => {
    const newInvoice = {
      ...invoice,
      id: `INV${Date.now()}`
    };
    invoices.value.unshift(newInvoice);
  };

  const updateDistributorStatus = (distributorId: string, newStatus: Distributor['status']) => {
    const distributor = distributors.value.find(d => d.id === distributorId);
    if (distributor) {
      distributor.status = newStatus;
      distributor.daysSinceStatus = 0;
    }
  };

  const updateManufacturerStatus = (manufacturerId: string, newStatus: Manufacturer['status']) => {
    const manufacturer = manufacturers.value.find(m => m.id === manufacturerId);
    if (manufacturer) {
      manufacturer.status = newStatus;
      manufacturer.daysSinceStatus = 0;
    }
  };

  const clearFilters = () => {
    Object.keys(filters).forEach(key => {
      filters[key as keyof typeof filters] = [];
    });
    persistState();
  };

  const clearAssociatedFilters = () => {
    Object.keys(associatedFilters).forEach(key => {
      associatedFilters[key as keyof typeof associatedFilters] = [];
    });
    persistState();
  };

  const updateLocationFilters = (type: 'city' | 'district' | 'state', values: string[], isAssociated = false) => {
    const targetFilters = isAssociated ? associatedFilters : filters;
    
    // Don't auto-update other location filters to prevent deselection issues
    targetFilters[type] = values;
    
    /* Commented out auto-update logic that was causing deselection issues
    if (type === 'city') {
      targetFilters.city = values;
      // Auto-update state and district based on selected cities
      const relatedStates = new Set<string>();
      const relatedDistricts = new Set<string>();
      
      values.forEach(city => {
        const location = cityToLocationMapping[city];
        if (location) {
          relatedStates.add(location.state);
          relatedDistricts.add(location.district);
        }
      });
      
      if (values.length > 0) {
        targetFilters.state = Array.from(relatedStates);
        targetFilters.district = Array.from(relatedDistricts);
      }
    } else if (type === 'state') {
      targetFilters.state = values;
      // Auto-update cities and districts based on selected states
      const relatedCities = new Set<string>();
      const relatedDistricts = new Set<string>();
      
      values.forEach(state => {
        const mapping = locationMapping[state];
        if (mapping) {
          mapping.cities.forEach(city => relatedCities.add(city));
          mapping.districts.forEach(district => relatedDistricts.add(district));
        }
      });
      
      if (values.length > 0) {
        targetFilters.city = Array.from(relatedCities);
        targetFilters.district = Array.from(relatedDistricts);
      }
    } else if (type === 'district') {
      targetFilters.district = values;
      // Auto-update state and cities based on selected districts
      const relatedStates = new Set<string>();
      const relatedCities = new Set<string>();
      
      values.forEach(district => {
        Object.entries(locationMapping).forEach(([state, mapping]) => {
          if (mapping.districts.includes(district)) {
            relatedStates.add(state);
            mapping.cities.forEach(city => {
              const cityLocation = cityToLocationMapping[city];
              if (cityLocation && cityLocation.district === district) {
                relatedCities.add(city);
              }
            });
          }
        });
      });
      
      if (values.length > 0) {
        targetFilters.state = Array.from(relatedStates);
        targetFilters.city = Array.from(relatedCities);
      }
    }
    */
    
    persistState();
  };

  const updateCategoryFilters = (type: 'category' | 'subCategory', values: string[], isAssociated = false) => {
    const targetFilters = isAssociated ? associatedFilters : filters;
    
    // Don't auto-update other category filters to prevent deselection issues
    targetFilters[type] = values;
    
    /* Commented out auto-update logic that was causing deselection issues
    if (type === 'category') {
      targetFilters.category = values;
      // Auto-update sub-categories based on selected categories
      const relatedSubCategories = new Set<string>();
      
      values.forEach(category => {
        const subCategories = industryToCategoryMapping[category];
        if (subCategories) {
          subCategories.forEach(subCategory => relatedSubCategories.add(subCategory));
        }
      });
      
      if (values.length > 0) {
        targetFilters.subCategory = Array.from(relatedSubCategories);
      }
    } else if (type === 'subCategory') {
      targetFilters.subCategory = values;
      // Auto-update categories based on selected sub-categories
      const relatedCategories = new Set<string>();
      
      values.forEach(subCategory => {
        Object.entries(industryToCategoryMapping).forEach(([category, subCategories]) => {
          if (subCategories.includes(subCategory)) {
            relatedCategories.add(category);
          }
        });
      });
      
      if (values.length > 0) {
        targetFilters.category = Array.from(relatedCategories);
      }
    }
    */
    
    persistState();
  };

  const setSelectedEntity = (entity: 'manufacturer' | 'distributor') => {
    selectedEntity.value = entity;
    persistState();
  };

  const setSelectedEntityId = (id: string) => {
    selectedEntityId.value = id;
    persistState();
  };

  const setSelectedManufacturer = (manufacturer: Manufacturer | null) => {
    selectedManufacturer.value = manufacturer;
    persistState();
  };

  const setSelectedDistributor = (distributor: Distributor | null) => {
    selectedDistributor.value = distributor;
    persistState();
  };

  return {
    selectedEntity,
    selectedManufacturer,
    selectedDistributor,
    selectedEntityId,
    filters,
    associatedFilters,
    manufacturers,
    distributors,
    interactions,
    agreement,
    invoices,
    filteredManufacturers,
    filteredDistributors,
    pairedList,
    addInteraction,
    updateAgreement,
    addInvoice,
    updateDistributorStatus,
    updateManufacturerStatus,
    clearFilters,
    clearAssociatedFilters,
    updateLocationFilters,
    updateCategoryFilters,
    setSelectedEntity,
    setSelectedEntityId,
    setSelectedManufacturer,
    setSelectedDistributor,
    persistState,
    locationMapping,
    industryToCategoryMapping
  };
};
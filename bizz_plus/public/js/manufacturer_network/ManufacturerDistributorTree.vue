<template>
  <div class="p-4">
    <h2 class="text-2xl font-bold mb-4">Manufacturer–Distributor Tree</h2>

    <div v-if="mappings.length > 0" class="mb-4">
      <div
        v-for="(distributors, manufacturer) in groupedTree"
        :key="manufacturer"
        class="mb-4 p-3 border rounded-md bg-gray-50 relative"
      >
        <div class="flex justify-between items-center mb-2">
          <div class="font-semibold text-blue-700 text-lg">{{ manufacturer }}</div>
          
          <button
            @click="toggleMenu(manufacturer)"
            class="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1"
            aria-label="Options menu"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path>
            </svg>
          </button>
        </div>

        <div
          v-if="openMenu === manufacturer"
          class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200"
        >
          <button
            @click="editManufacturer(manufacturer)"
            class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Edit Manufacturer
          </button>
          <button
            @click="addDistributorToManufacturer(manufacturer)"
            class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Add Distributor
          </button>
          <button
            @click="deleteManufacturer(manufacturer)"
            class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            Delete Manufacturer
          </button>
        </div>

        <ul class="ml-6 list-disc list-inside text-gray-800">
          <li v-for="distributor in distributors" :key="distributor" class="mb-1">{{ distributor }}</li>
        </ul>
      </div>
    </div>
    <div v-else class="text-gray-600 mb-4 p-3 border rounded-md bg-gray-50">
      No manufacturer-distributor mappings found. Add one below!
    </div>

    <div class="mt-6 p-4 border rounded-lg shadow-sm bg-white">
      <h3 class="font-medium text-xl mb-3 text-gray-800">Add New Mapping</h3>
      
      <div class="mb-3">
        <label for="manufacturer-select" class="block text-sm font-medium text-gray-700 mb-1">Manufacturer Company</label>
        <select
          id="manufacturer-select"
          v-model="manufacturer"
          class="input-box focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="" disabled selected>Select Manufacturer</option>
          <option v-for="manu in availableManufacturers" :key="manu.name" :value="manu.name">
            {{ manu.name }}
          </option>
        </select>
      </div>
      
      <div class="mb-4">
        <label for="distributor-select" class="block text-sm font-medium text-gray-700 mb-1">Distributor Company</label>
        <select
          id="distributor-select"
          v-model="distributor"
          class="input-box focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="" disabled selected>Select Distributor</option>
          <option v-for="dist in availableDistributors" :key="dist.name" :value="dist.name">
            {{ dist.name }}
          </option>
        </select>
      </div>
      
      <button
        @click="addMapping"
        class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm transition duration-150 ease-in-out"
      >
        Add Mapping
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ManufacturerDistributorTree',
  data() {
    return {
      mappings: [],
      manufacturer: "", // Will hold the selected manufacturer's name
      distributor: "",  // Will hold the selected distributor's name
      openMenu: null,
      availableManufacturers: [], // New: to store manufacturers for select dropdown
      availableDistributors: [],  // New: to store distributors for select dropdown
    };
  },
  computed: {
    groupedTree() {
      const grouped = {};
      for (const m of this.mappings) {
        const manu = m.manufacturer;
        if (!grouped[manu]) {
          grouped[manu] = [];
        }
        if (!grouped[manu].includes(m.distributor)) {
          grouped[manu].push(m.distributor);
        }
      }
      return grouped;
    }
  },
  methods: {
    toggleMenu(manufacturer) {
      this.openMenu = this.openMenu === manufacturer ? null : manufacturer;
    },

    // New: Fetches lists of Manufacturers and Distributors
    async fetchCompanies() {
      try {
        const [manufacturersRes, distributorsRes] = await Promise.all([
          frappe.call({
            method: "frappe.client.get_list",
            args: {
              doctype: "Manufacturer Company", // Ensure this DocType exists and is correct
              fields: ["name", "company_name"], // Fetch both 'name' (primary id) and 'company_name' (for display if needed)
              limit_page_length: 1000
            }
          }),
          frappe.call({
            method: "frappe.client.get_list",
            args: {
              doctype: "Distributor Company", // Ensure this DocType exists and is correct
              fields: ["name", "company_name"], // Fetch both 'name' (primary id) and 'company_name'
              limit_page_length: 1000
            }
          })
        ]);

        // Frappe's get_list returns `name` as the primary identifier.
        // Assuming your Manufacturer and Distributor DocTypes use company_name as their actual 'name'
        // (via autoname: "field:company_name"), then `manu.name` will be the company name.
        this.availableManufacturers = manufacturersRes.message || [];
        this.availableDistributors = distributorsRes.message || [];

        // Set default selected values if needed (e.g., first available)
        if (this.availableManufacturers.length > 0) {
          this.manufacturer = this.availableManufacturers[0].name;
        } else {
          this.manufacturer = ""; // No default if no manufacturers
        }
        if (this.availableDistributors.length > 0) {
          this.distributor = this.availableDistributors[0].name;
        } else {
          this.distributor = ""; // No default if no distributors
        }

      } catch (error) {
        console.error("Error fetching companies:", error);
        frappe.msgprint(__("Error fetching manufacturer/distributor lists."));
      }
    },

    // Existing methods, slightly modified for the new input types
    async fetchMappings() {
      try {
        const res = await frappe.call({
          method: "frappe.client.get_list",
          args: {
            doctype: "Manufacturer Distributor Mapping",
            fields: ["manufacturer", "distributor"],
            limit_page_length: 1000
          }
        });
        this.mappings = res.message || [];
      } catch (error) {
        console.error("Error fetching mappings:", error);
        frappe.msgprint(__("Error fetching mappings. Please check console for details."));
      }
    },
    async addMapping() {
      // Validation now checks if a selection has been made (value is not empty string from default option)
      if (!this.manufacturer || !this.distributor) {
        frappe.msgprint(__("Please select both a Manufacturer Company and a Distributor Company."));
        return;
      }

      const exists = this.mappings.some(
        // Trim not strictly necessary for select values if they come clean, but good practice
        m => m.manufacturer === this.manufacturer && m.distributor === this.distributor
      );
      if (exists) {
        frappe.msgprint(__("This mapping already exists."));
        // Reset selections to default "Select..."
        this.manufacturer = this.availableManufacturers.length > 0 ? this.availableManufacturers[0].name : "";
        this.distributor = this.availableDistributors.length > 0 ? this.availableDistributors[0].name : "";
        return;
      }

      try {
        await frappe.call({
          method: "frappe.client.insert",
          args: {
            doc: {
              doctype: "Manufacturer Distributor Mapping",
              manufacturer: this.manufacturer, // The selected 'name' (Company Name) from dropdown
              distributor: this.distributor    // The selected 'name' (Company Name) from dropdown
            }
          }
        });

        frappe.msgprint(__("Mapping Added Successfully!"));
        // Reset selections after successful addition
        this.manufacturer = this.availableManufacturers.length > 0 ? this.availableManufacturers[0].name : "";
        this.distributor = this.availableDistributors.length > 0 ? this.availableDistributors[0].name : "";
        await this.fetchMappings();
      } catch (error) {
        console.error("Error adding mapping:", error);
        const errorMessage = error.message || __("An unknown error occurred while adding mapping.");
        frappe.msgprint(__("Error adding mapping: ") + errorMessage);
      }
    },

    // --- Placeholder Methods for Menu Actions ---
    // (These remain the same as the previous version)
    editManufacturer(manufacturer) {
      frappe.msgprint(__(`Edit action for Manufacturer: ${manufacturer}`));
      // Implement your logic here:
      // - Open a dialog/modal to edit the manufacturer's details.
      // - You might use frappe.set_route to go to the Manufacturer form:
      //   frappe.set_route('Form', 'Manufacturer', manufacturer);
      this.openMenu = null;
    },
    addDistributorToManufacturer(manufacturer) {
      frappe.msgprint(__(`Add Distributor action for Manufacturer: ${manufacturer}`));
      frappe.prompt(
        { 
          fieldname: 'distributor_name', 
          fieldtype: 'Link', // Changed to Link field for selecting existing distributor
          options: 'Distributor', // Link to Distributor DocType
          label: __('Select Distributor Company'),
          reqd: 1 
        },
        async (values) => {
          if (values.distributor_name) {
            try {
              // Check if this specific manufacturer-distributor mapping already exists
              const existingMapping = this.mappings.some(
                m => m.manufacturer === manufacturer && m.distributor === values.distributor_name
              );
              if (existingMapping) {
                frappe.msgprint(__("This manufacturer-distributor mapping already exists."));
                return;
              }

              await frappe.call({
                method: "frappe.client.insert",
                args: {
                  doc: {
                    doctype: "Manufacturer Distributor Mapping",
                    manufacturer: manufacturer, // The selected manufacturer from the row
                    distributor: values.distributor_name // The selected distributor from the prompt
                  }
                }
              });
              frappe.msgprint(__("New distributor mapping added!"));
              await this.fetchMappings(); // Refresh the list
            } catch (error) {
              console.error("Error adding new distributor:", error);
              frappe.msgprint(__("Error adding new distributor."));
            }
          }
        },
        __(`Add Distributor for ${manufacturer}`),
        __('Add')
      );
      this.openMenu = null;
    },
    async deleteManufacturer(manufacturer) {
        frappe.confirm(
            __(`Are you sure you want to delete Manufacturer '${manufacturer}' and ALL its associated distributor mappings? This action cannot be undone.`),
            async () => {
                try {
                    // This requires a custom Frappe Python method
                    await frappe.call({
                        method: "bizz_plus.bizz_plus.api.delete_manufacturer_and_mappings", // Your custom method path
                        args: {
                            manufacturer_name: manufacturer
                        }
                    });
                    frappe.msgprint(__(`Manufacturer '${manufacturer}' and its mappings deleted successfully.`));
                    await this.fetchMappings(); // Re-fetch to update the UI
                } catch (error) {
                    console.error("Error deleting manufacturer and mappings:", error);
                    frappe.msgprint(__("Error deleting manufacturer and mappings. Check console."));
                }
            },
            () => {
                frappe.msgprint(__("Deletion cancelled."));
            }
        );
        this.openMenu = null;
    },
  },
  // Call both fetchMappings and fetchCompanies when the component mounts
  mounted() {
    this.fetchMappings();
    this.fetchCompanies();
  }
};
</script>

<style scoped>
/* Base styling */
.input-box {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5da;
  border-radius: 0.375rem;
  box-sizing: border-box;
  font-size: 1rem;
  line-height: 1.5;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  appearance: none; /* Remove default browser styling for select */
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e"); /* Custom arrow for select */
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1em;
  padding-right: 2.5rem; /* Make space for the arrow */
}

.input-box:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
}

/* Re-added general purpose Tailwind-like classes for clarity */
.text-2xl { font-size: 1.5rem; }
.font-bold { font-weight: 700; }
.mb-4 { margin-bottom: 1rem; }
.p-4 { padding: 1rem; }
.mt-6 { margin-top: 1.5rem; }
.border { border-width: 1px; border-style: solid; }
.rounded-md { border-radius: 0.375rem; }
.rounded-lg { border-radius: 0.5rem; }
.shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
.bg-white { background-color: #fff; }
.bg-gray-50 { background-color: #f9fafb; }
.text-gray-600 { color: #4b5563; }
.text-gray-700 { color: #374151; }
.text-gray-800 { color: #1f2937; }
.text-blue-600 { color: #2563eb; }
.text-blue-700 { color: #1d4ed8; }
.text-lg { font-size: 1.125rem; }
.font-semibold { font-weight: 600; }
.ml-4 { margin-left: 1rem; }
.ml-6 { margin-left: 1.5rem; }
.list-disc { list-style-type: disc; }
.list-inside { list-style-position: inside; }
.mb-1 { margin-bottom: 0.25rem; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-3 { margin-bottom: 0.75rem; }
.block { display: block; }

/* Flexbox and alignment utilities */
.flex { display: flex; }
.justify-between { justify-content: space-between; }
.items-center { align-items: center; }

/* Positioning for the dropdown menu */
.relative { position: relative; }
.absolute { position: absolute; }
.right-0 { right: 0; }
.mt-2 { margin-top: 0.5rem; }
.w-48 { width: 12rem; /* 192px */ }
.py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
.z-10 { z-index: 10; }
.border-gray-200 { border-color: #e5e7eb; }

/* Dropdown menu button specific styles */
.text-sm { font-size: 0.875rem; }
.px-4 { padding-left: 1rem; padding-right: 1rem; }
.py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
.text-left { text-align: left; }
.w-full { width: 100%; }
.hover\:bg-gray-100:hover { background-color: #f3f4f6; }
.text-red-600 { color: #dc2626; }
.hover\:bg-red-50:hover { background-color: #fef2f2; }

/* Button styles */
.bg-blue-600 { background-color: #2563eb; }
.hover\:bg-blue-700:hover { background-color: #1d4ed8; }
.text-white { color: #fff; }
.font-semibold { font-weight: 600; }
.py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
.px-4 { padding-left: 1rem; padding-right: 1rem; }
.transition { transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter; }
.duration-150 { transition-duration: 150ms; }
.ease-in-out { transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); }
</style>
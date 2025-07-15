<template>
  <div class="container">
    <div>
      <h1 class="title">Business Hierarchy</h1>
      <p class="subtitle">Manage brands, super stockists, and distributors</p>
    </div>

    <div class="grid">
      <div class="stat-box">
        <div class="stat-number">{{ brands.length }}</div>
        <div class="stat-label">Brands</div>
      </div>
      <div class="stat-box">
        <div class="stat-number">{{ countByRole('super_stockist') }}</div>
        <div class="stat-label">Super Stockists</div>
      </div>
      <div class="stat-box">
        <div class="stat-number">{{ countByRole('distributor') }}</div>
        <div class="stat-label">Distributors</div>
      </div>
    </div>

    <input type="text" v-model="searchTerm" placeholder="Search brands..." class="search-input" />

    <div v-for="brand in filteredBrands" :key="brand.id" class="brand-tree ml-2">
      <details :open="brand.super_stockists.length || brand.distributors.length">
        
        <summary class="section-heading font-semibold cursor-pointer">
        {{ brand.name }}
        </summary>

        <!-- <summary class="brand-header font-bold cursor-pointer flex items-center">
          ▶ <span class="ml-1 font-semibold">{{ brand.name }}</span>
        </summary> -->

        <!-- Add Super Stockist & Distributor -->
        <div class="actions mt-2 ml-4">
          <select v-model="selectedSS[brand.id]" class="select">
            <option disabled value="">+ Add Super Stockist to {{ brand.name }}</option>
            <option v-for="p in getAvailablePeople(brand, 'super_stockist')" :key="p.id" :value="p.id">
              {{ p.name }}
            </option>
          </select>
          <button @click="addSS(brand.id)" class="btn">Add Super Stockist</button>

          <select v-model="selectedDist[brand.id]" class="select ml-4">
            <option disabled value="">+ Add Distributor to {{ brand.name }}</option>
            <option v-for="p in getAvailablePeople(brand, 'distributor')" :key="p.id" :value="p.id">
              {{ p.name }}
            </option>
          </select>
          <button @click="addDistToBrand(brand.id)" class="btn">Add Distributor</button>
        </div>

        <!-- Super Stockists Tree -->
        <div v-if="brand.super_stockists.length" class="tree-section mt-4 ml-4">
          <details open>
            <summary class="section-heading font-semibold cursor-pointer">Super Stockists</summary>
            <div v-for="ss in brand.super_stockists" :key="ss.person_id" class="tree-node ml-4">
              <details open>
                <summary class="ss-name cursor-pointer">{{ getPersonName(ss.person_id) }}</summary>

                <!-- Add Distributor to Stockist to SS -->
                <div class="actions ml-4 mt-2">
                  <select v-model="selectedDistToSS[ss.person_id]" class="select">
                    <option disabled value="">+ Add Distributor to Stockist</option>
                    <option v-for="p in getAvailablePeopleToSS(brand, ss)" :key="p.id" :value="p.id">
                      {{ p.name }}
                    </option>
                  </select>
                  <button @click="assignDistToSS(brand.id, ss.person_id)" class="btn">Add Distributor to Stockist</button>
                </div>

                <ul class="distributor-list ml-6 mt-2">
                  <li v-for="distId in ss.distributors" :key="distId">
                    {{ getPersonName(distId) }}
                  </li>
                </ul>
              </details>
            </div>
          </details>
        </div>

        <!-- Direct Distributors Tree -->
        <div v-if="brand.distributors.length" class="tree-section mt-4 ml-4">
          <details open>
            <summary class="section-heading font-semibold cursor-pointer">Direct Distributors</summary>
            <ul class="distributor-list ml-6 mt-2">
              <li v-for="distId in brand.distributors" :key="distId">
                {{ getPersonName(distId) }}
              </li>
            </ul>
          </details>
        </div>
      </details>
    </div>

    <!-- Unassigned Super Stockists -->
    <div v-if="unassignedSuperStockists.length" class="tree-section mt-6 ml-2">
      <details open>
        <summary class="section-heading font-semibold cursor-pointer">Unassigned Super Stockists</summary>
        <div v-for="ss in unassignedSuperStockists" :key="ss.person_id" class="tree-node ml-4">
          <details open>
            <summary class="ss-name cursor-pointer">{{ getPersonName(ss.person_id) }}</summary>
            <ul class="distributor-list ml-6 mt-2">
              <li v-for="distId in ss.distributors" :key="distId">
                {{ getPersonName(distId) }}
              </li>
            </ul>
          </details>
        </div>
      </details>
    </div>

    <!-- Unassigned Distributors -->
    <div v-if="unassignedDistributors.length" class="tree-section mt-6 ml-2">
      <details open>
        <summary class="section-heading font-semibold cursor-pointer">Unassigned Distributors</summary>
        <ul class="distributor-list ml-6 mt-2">
          <li v-for="distId in unassignedDistributors" :key="distId">
            {{ getPersonName(distId) }}
          </li>
        </ul>
      </details>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const people = ref([])
const brands = ref([])
const unassignedSuperStockists = ref([])
const unassignedDistributors = ref([])

const searchTerm = ref('')
const selectedSS = ref({})
const selectedDist = ref({})
const selectedDistToSS = ref({})

const fetchHierarchy = async () => {
  try {
    const res = await fetch('/api/method/bizz_plus.api.pincode_api.get_company_hierarchy')
    const data = await res.json()
    console.log('Fetched Hierarchy:', data)
    if (data.message) {
      brands.value = data.message.brands
      people.value = data.message.people
      unassignedSuperStockists.value = data.message.unassigned_super_stockists || []
      unassignedDistributors.value = data.message.unassigned_distributors || []
    }
  } catch (err) {
    console.error("Failed to fetch company hierarchy", err)
  }
}

onMounted(() => {
  fetchHierarchy()
})

const filteredBrands = computed(() =>
  brands.value.filter(b => b.name.toLowerCase().includes(searchTerm.value.toLowerCase()))
)

function countByRole(role) {
  const allIds = brands.value.flatMap(b => {
    if (role === 'super_stockist') return b.super_stockists.map(ss => ss.person_id)
    if (role === 'distributor') {
      const ssDists = b.super_stockists.flatMap(ss => ss.distributors)
      return [...ssDists, ...b.distributors]
    }
    return []
  })
  return new Set(allIds).size
}

function getPersonName(id) {
  const p = people.value.find(p => p.id === id)
  return p && p.name ? p.name : '(Unknown)'
}

async function addSS(brandId) {
  const personId = selectedSS.value[brandId]
  if (!personId) return
  const brand = brands.value.find(b => b.id === brandId)
  if (brand.super_stockists.some(ss => ss.person_id === personId)) return
  if (brand.distributors.includes(personId)) {
    alert("This person is already a Distributor in this brand.")
    return
  }

  try {
    const res = await fetch('/api/method/bizz_plus.api.pincode_api.add_super_stockist_to_manufacturer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json',
         'X-Frappe-CSRF-Token': window.frappe.csrf_token
       },
      body: JSON.stringify({ manufacturer: brandId, super_stockist: personId })
    })
    const data = await res.json()
    if (data.message?.success) {
      brand.super_stockists.push({ person_id: personId, distributors: [] })
      selectedSS.value[brandId] = ''
      alert('Super Stockist added successfully!')
    } else {
      alert(data.message?.error || 'Failed to add Super Stockist.')
    }
  } catch (err) {
    console.error(err)
    alert('Network error while adding Super Stockist.')
  }
}


async function addDistToBrand(brandId) {
  const personId = selectedDist.value[brandId]
  if (!personId) return
  const brand = brands.value.find(b => b.id === brandId)
  if (brand.distributors.includes(personId)) return
  const inSS = brand.super_stockists.some(ss => ss.distributors.includes(personId))
  if (inSS) {
    alert("This person is already under a Super Stockist.")
    return
  }

  try {
    const res = await fetch('/api/method/bizz_plus.api.pincode_api.add_distributor_to_manufacturer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json',
         'X-Frappe-CSRF-Token': window.frappe.csrf_token
       },
      body: JSON.stringify({ manufacturer: brandId, distributor: personId })
    })
    const data = await res.json()
    if (data.message?.success) {
      brand.distributors.push(personId)
      selectedDist.value[brandId] = ''
      alert('Distributor added successfully!')
    } else {
      alert(data.message?.error || 'Failed to add Distributor.')
    }
  } catch (err) {
    console.error(err)
    alert('Network error while adding Distributor.')
  }
}


async function assignDistToSS(brandId, ssId) {
  const personId = selectedDistToSS.value[ssId]
  if (!personId) return
  const brand = brands.value.find(b => b.id === brandId)
  const ss = brand.super_stockists.find(s => s.person_id === ssId)
  if (!ss || ss.distributors.includes(personId)) return
  if (brand.distributors.includes(personId)) {
    alert("This distributor is already directly under the brand.")
    return
  }

  try {
    const res = await fetch('/api/method/bizz_plus.api.pincode_api.add_distributor_to_stockist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json',
         'X-Frappe-CSRF-Token': window.frappe.csrf_token
       },
      body: JSON.stringify({ stockiest: ssId, distributor: personId })
    })
    const data = await res.json()
    if (data.message?.success) {
      ss.distributors.push(personId)
      selectedDistToSS.value[ssId] = ''
      alert('Distributor mapped to Stockist successfully!')
    } else {
      alert(data.message?.error || 'Failed to map distributor to Stockist.')
    }
  } catch (err) {
    console.error(err)
    alert('Network error while mapping Distributor to Stockist.')
  }
}


// function getAvailablePeople(brand, role) {
//   const existingSS = brand.super_stockists.map(ss => ss.person_id)
//   const ssDists = brand.super_stockists.flatMap(ss => ss.distributors)
//   const allDists = [...ssDists, ...brand.distributors]
//   return people.value.filter(p =>
//     role === 'super_stockist'
//       ? !existingSS.includes(p.id) && !allDists.includes(p.id)
//       : !allDists.includes(p.id) && !existingSS.includes(p.id)
//   )
// }

function getAvailablePeople(brand, role) {
  const existingSS = brand.super_stockists.map(ss => ss.person_id)
  const ssDists = brand.super_stockists.flatMap(ss => ss.distributors)
  const allDists = [...ssDists, ...brand.distributors]

  if (role === 'super_stockist') {
    return unassignedSuperStockists.value
      .filter(id => !existingSS.includes(id) && !allDists.includes(id))
      .map(id => people.value.find(p => p.id === id))
      .filter(Boolean)
  }

  if (role === 'distributor') {
    return unassignedDistributors.value
      .filter(id => !existingSS.includes(id) && !allDists.includes(id))
      .map(id => people.value.find(p => p.id === id))
      .filter(Boolean)
  }

  return []
}


function getAvailablePeopleToSS(brand, ss) {
  const used = new Set([
    ...brand.distributors,
    ...brand.super_stockists.flatMap(s => s.distributors),
    ...brand.super_stockists.map(s => s.person_id)
  ])
  return people.value.filter(p => !used.has(p.id))
}
</script>




<style scoped>
.section-heading {
  font-size: 1rem;
  font-weight: 600;
  padding: 0.25rem 0;
  color: #111827; /* Tailwind's gray-900 equivalent */
  text-align: left;
  margin-left: 0.5rem;
}

details summary {
  list-style: none;
  cursor: pointer;
}

details[open] > summary::before {
  content: "▼";
  display: inline-block;
  margin-right: 0.5rem;
}

details:not([open]) > summary::before {
  content: "▶";
  display: inline-block;
  margin-right: 0.5rem;
}

.folder-title {
  font-weight: bold;
  font-size: 18px;
  cursor: pointer;
}

.tree-section, .tree-node {
  margin-left: 20px;
}

.distributor-list {
  list-style-type: none;
  padding-left: 20px;
}

.ss-name {
  font-weight: 500;
  cursor: pointer;
}

.summary-heading {
  font-size: 16px;
}


.container {
  padding: 24px;
  max-width: 1100px;
  margin: 0 auto;
}

.title {
  font-size: 28px;
  font-weight: bold;
  color: black;
}

.subtitle {
  font-size: 14px;
  color: black;
}

.grid {
  display: flex;
  gap: 16px;
  margin: 20px 0;
}

.stat-box {
  flex: 1;
  background-color: #e5e7eb;
  text-align: center;
  padding: 16px;
  border-radius: 8px;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: black;
}

.stat-label {
  font-size: 14px;
  color: black;
}

.search-input {
  width: 100%;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #ccc;
  margin-bottom: 16px;
}

.brand-card {
  background-color: white;
  border: 1px solid #ddd;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.brand-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brand-name {
  font-size: 18px;
  font-weight: bold;
  color: black;
}

.actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.select {
  width: 260px;
  padding: 6px;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 14px;
}

.btn {
  font-size: 12px;
  background-color: black;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  border: none;
}

.section-heading {
  font-weight: 600;
  color: black;
  margin-top: 16px;
}

.super-stockist {
  padding-left: 16px;
  margin-top: 10px;
}

.ss-name {
  font-size: 14px;
  font-weight: 500;
  color: black;
}

.distributor-list {
  padding-left: 32px;
  font-size: 14px;
  color: black;
  list-style-type: disc;
}
</style>

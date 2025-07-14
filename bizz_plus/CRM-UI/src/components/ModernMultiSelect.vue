<template>
  <div class="modern-multiselect" ref="dropdown">
    <div 
      class="multiselect-trigger" 
      @click="toggleDropdown"
      @mousedown.prevent
      :class="{ 
        open: isOpen, 
        'has-selections': selected.length > 0
      }"
    >
      <div class="trigger-content">
        <span v-if="selected.length === 0" class="placeholder">{{ placeholder }}</span>
        <div v-else class="selected-display">
          <span class="selected-count">{{ selected.length }} SELECTED</span>
        </div>
      </div>
      <div class="trigger-icon" :class="{ rotated: isOpen }">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
          <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        </svg>
      </div>
    </div>

    <!-- Portal the dropdown to body to avoid clipping -->
    <Teleport to="body" v-if="isOpen" :disabled="false">
      <div 
        class="dropdown-panel" 
        ref="panel"
        :style="panelStyles"
        @mousedown.prevent
        @click.stop
        @wheel.stop
        @touchmove.prevent
      >
        <div class="search-container" v-if="searchable">
          <div class="search-input-wrapper">
            <svg class="search-icon" width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <path d="M11.742 10.344a6.5 6.5 0 10-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 001.415-1.414l-3.85-3.85a1.007 1.007 0 00-.115-.1zM12 6.5a5.5 5.5 0 11-11 0 5.5 5.5 0 0111 0z"/>
            </svg>
            <input 
              type="text" 
              v-model="searchTerm" 
              placeholder="Search options..." 
              class="search-input"
              @mousedown.stop
              @click.stop
              ref="searchInput"
            />
          </div>
        </div>

        <div class="options-container">
          <div class="options-header" v-if="filteredOptions.length > 0">
            <button 
              class="select-all-btn" 
              @mousedown.prevent
              @click="selectAll($event)"
              v-if="filteredOptions.length > selected.length"
            >
              SELECT ALL ({{ filteredOptions.length }})
            </button>
            <button 
              class="clear-all-btn" 
              @mousedown.prevent
              @click="clearAll($event)"
              v-if="selected.length > 0"
            >
              CLEAR ALL
            </button>
          </div>

          <div class="options-list" ref="optionsList">
            <div 
              v-for="option in filteredOptions" 
              :key="option" 
              class="option-item"
              :class="{ selected: isSelected(option) }"
              @mousedown.prevent
              @click="toggleOption(option, $event)"
            >
              <div class="option-checkbox">
                <div class="checkbox-custom" :class="{ checked: isSelected(option) }">
                  <svg v-if="isSelected(option)" class="check-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
              </div>
              <span class="option-text">{{ option }}</span>
            </div>
          </div>

          <div v-if="filteredOptions.length === 0" class="no-options">
            <div class="no-options-content">
              <p>No options found</p>
              <span v-if="searchTerm">Try adjusting your search</span>
            </div>
          </div>
        </div>

        <div class="dropdown-footer" v-if="selected.length > 0">
          <div class="selected-summary">
            <span class="summary-text">{{ selected.length }} item{{ selected.length !== 1 ? 's' : '' }} selected</span>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'

const props = withDefaults(defineProps<{
  options: string[]
  selected: string[]
  placeholder?: string
  searchable?: boolean
}>(), {
  placeholder: 'Select options...',
  searchable: true
})

const emit = defineEmits<{
  'update:selected': [value: string[]]
  'dropdown-opened': []
}>()

const dropdown = ref<HTMLElement>()
const panel = ref<HTMLElement>()
const searchInput = ref<HTMLInputElement>()
const optionsList = ref<HTMLElement>()
const isOpen = ref(false)
const searchTerm = ref('')
const localSelected = ref<string[]>([])
const panelStyles = ref({})

const filteredOptions = computed(() => {
  if (!searchTerm.value) return props.options
  return props.options.filter(option =>
    option.toLowerCase().includes(searchTerm.value.toLowerCase())
  )
})

const isSelected = (option: string) => {
  return localSelected.value.includes(option)
}

const toggleOption = (option: string, event?: Event) => {
  // Prevent default behavior and scrolling
  if (event) {
    event.preventDefault()
    event.stopPropagation()
  }
  
  const index = localSelected.value.indexOf(option)
  let newSelected: string[]
  
  if (index > -1) {
    newSelected = localSelected.value.filter(item => item !== option)
  } else {
    newSelected = [...localSelected.value, option]
  }
  
  localSelected.value = newSelected
  // Emit immediately to prevent reactivity issues in production
  emit('update:selected', newSelected)
}

const toggleDropdown = (event?: Event) => {
  // Prevent default behavior and scrolling
  if (event) {
    event.preventDefault()
    event.stopPropagation()
  }
  
  if (isOpen.value) {
    closeDropdown()
  } else {
    openDropdown()
  }
}

const openDropdown = () => {
  // Prevent page scroll when opening dropdown
  const currentScrollPosition = window.pageYOffset || document.documentElement.scrollTop
  
  isOpen.value = true
  searchTerm.value = ''
  
  // Emit dropdown opened event for lazy loading
  emit('dropdown-opened')
  
  // Add body class to prevent scrolling (optional, but helpful for mobile)
  document.body.style.setProperty('--scroll-y', `${currentScrollPosition}px`)
  
  nextTick(() => {
    positionDropdown()
    
    // Ensure page doesn't scroll
    window.scrollTo(0, currentScrollPosition)
    
    // Focus search input if searchable, but prevent scroll
    if (props.searchable && searchInput.value) {
      searchInput.value.focus({ preventScroll: true })
    }
  })
}

const closeDropdown = () => {
  isOpen.value = false
  searchTerm.value = ''
  panelStyles.value = {}
  
  // Restore scrolling capability
  document.body.style.removeProperty('--scroll-y')
}

const positionDropdown = () => {
  if (!dropdown.value || !panel.value) return
  
  try {
    const triggerRect = dropdown.value.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const viewportWidth = window.innerWidth
    
    // Calculate available space
    const spaceBelow = viewportHeight - triggerRect.bottom - 10
    const spaceAbove = triggerRect.top - 10
    const maxPanelHeight = 320
    const minPanelHeight = 200
    
    let top = 0
    let maxHeight = maxPanelHeight
    
    // Determine if dropdown should open above or below
    if (spaceBelow >= minPanelHeight || spaceBelow >= spaceAbove) {
      // Position below
      top = triggerRect.bottom + 4
      maxHeight = Math.min(maxPanelHeight, spaceBelow - 10)
    } else {
      // Position above
      top = triggerRect.top - Math.min(maxPanelHeight, spaceAbove - 10) - 4
      maxHeight = Math.min(maxPanelHeight, spaceAbove - 10)
    }
    
    // Ensure minimum height
    maxHeight = Math.max(maxHeight, 150)
    
    // Calculate horizontal position
    let left = triggerRect.left
    const panelWidth = triggerRect.width
    
    // Ensure panel doesn't go off screen horizontally
    if (left + panelWidth > viewportWidth - 10) {
      left = viewportWidth - panelWidth - 10
    }
    if (left < 10) {
      left = 10
    }
    
    panelStyles.value = {
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      width: `${triggerRect.width}px`,
      maxHeight: `${maxHeight}px`,
      zIndex: '999999',
      transform: 'none'
    }
  } catch (error) {
    console.warn('Error positioning dropdown:', error)
    // Fallback positioning
    panelStyles.value = {
      position: 'fixed',
      top: '100px',
      left: '50px',
      width: '200px',
      maxHeight: '300px',
      zIndex: '999999',
      transform: 'none'
    }
  }
}

const selectAll = (event?: Event) => {
  if (event) {
    event.preventDefault()
    event.stopPropagation()
  }
  
  const newSelected = [...new Set([...localSelected.value, ...filteredOptions.value])]
  localSelected.value = newSelected
  emit('update:selected', newSelected)
}

const clearAll = (event?: Event) => {
  if (event) {
    event.preventDefault()
    event.stopPropagation()
  }
  
  localSelected.value = []
  emit('update:selected', [])
}

const handleClickOutside = (event: Event) => {
  try {
    if (dropdown.value && !dropdown.value.contains(event.target as Node) && 
        panel.value && !panel.value.contains(event.target as Node)) {
      closeDropdown()
    }
  } catch (error) {
    console.warn('Error in click outside handler:', error)
  }
}

let resizeTimeout: number | null = null
const handleResize = () => {
  if (resizeTimeout) {
    clearTimeout(resizeTimeout)
  }
  resizeTimeout = window.setTimeout(() => {
    if (isOpen.value) {
      positionDropdown()
    }
  }, 100)
}

let scrollTimeout: number | null = null
const handleScroll = () => {
  if (scrollTimeout) {
    clearTimeout(scrollTimeout)
  }
  scrollTimeout = window.setTimeout(() => {
    if (isOpen.value) {
      positionDropdown()
    }
  }, 50)
}

// Watch for prop changes
watch(() => props.selected, (newVal) => {
  // Only update if the values are actually different to prevent loops
  if (JSON.stringify(newVal) !== JSON.stringify(localSelected.value)) {
    localSelected.value = [...newVal]
  }
}, { immediate: true })

// Remove the deep watcher that can cause infinite loops in production
// Instead, emit directly in the methods above

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('resize', handleResize)
  document.addEventListener('scroll', handleScroll, true)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('scroll', handleScroll, true)
  
  // Clean up timeouts
  if (resizeTimeout) {
    clearTimeout(resizeTimeout)
  }
  if (scrollTimeout) {
    clearTimeout(scrollTimeout)
  }
})
</script>

<style scoped>
.modern-multiselect {
  position: relative;
  width: 100%;
}

.multiselect-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: #ffffff;
  border: 1px solid #d2d2d7;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  min-height: 44px;
  user-select: none;
  /* Prevent layout shifts and scrolling */
  position: relative;
  overflow: hidden;
  contain: layout style;
}

.multiselect-trigger:hover {
  border-color: #a1a1aa;
  background: #fafafa;
}

.multiselect-trigger.open {
  border-color: #1c1c1e;
  background: #ffffff;
}

.multiselect-trigger.has-selections {
  border-color: #1c1c1e;
  background: #f5f5f7;
}

.trigger-content {
  flex: 1;
  min-width: 0;
}

.placeholder {
  color: #8e8e93;
  font-size: 14px;
  font-weight: 400;
}

.selected-display {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.selected-count {
  font-size: 12px;
  font-weight: 600;
  color: #1c1c1e;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.trigger-icon {
  color: #8e8e93;
  transition: transform 0.2s ease;
  flex-shrink: 0;
  margin-left: 8px;
}

.trigger-icon.rotated {
  transform: rotate(180deg);
}

.dropdown-panel {
  background: #ffffff;
  border: 1px solid #d2d2d7;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 150px;
  /* Ensure the panel doesn't affect page layout */
  contain: layout style;
  will-change: transform;
}

.search-container {
  padding: 12px;
  border-bottom: 1px solid #f2f2f7;
  background: #fafafa;
  flex-shrink: 0;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 10px;
  color: #8e8e93;
  pointer-events: none;
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 8px 12px 8px 32px;
  border: 1px solid #d2d2d7;
  border-radius: 6px;
  font-size: 14px;
  background: #ffffff;
  transition: all 0.15s ease;
  color: #1c1c1e;
}

.search-input:focus {
  outline: none;
  border-color: #1c1c1e;
}

.options-container {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.options-header {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background: #fafafa;
  border-bottom: 1px solid #f2f2f7;
  gap: 8px;
  flex-shrink: 0;
}

.select-all-btn,
.clear-all-btn {
  padding: 6px 10px;
  border: none;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  flex: 1;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.select-all-btn {
  background: #1c1c1e;
  color: white;
}

.select-all-btn:hover {
  background: #000000;
}

.clear-all-btn {
  background: #f2f2f7;
  color: #8e8e93;
  border: 1px solid #d2d2d7;
}

.clear-all-btn:hover {
  background: #e5e5ea;
  color: #1c1c1e;
}

.options-list {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 4px 0;
  overscroll-behavior: contain;
  min-height: 0;
  max-height: none;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  cursor: pointer;
  transition: all 0.15s ease;
  color: #1c1c1e;
  position: relative;
  user-select: none;
}

.option-item:hover {
  background: #f9f9f9;
}

.option-item.selected {
  background: #f0f8ff;
}

.option-checkbox {
  position: relative;
  flex-shrink: 0;
}

.checkbox-custom {
  width: 16px;
  height: 16px;
  border: 1.5px solid #d2d2d7;
  border-radius: 4px;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  position: relative;
}

.checkbox-custom.checked {
  background: #1c1c1e;
  border-color: #1c1c1e;
  color: #ffffff;
}

.check-icon {
  color: #ffffff;
}

.option-text {
  font-size: 14px;
  color: #1c1c1e;
  font-weight: 400;
  flex: 1;
  min-width: 0;
  word-break: break-word;
}

.no-options {
  padding: 32px 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
}

.no-options-content {
  text-align: center;
  color: #8e8e93;
}

.no-options p {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 500;
}

.no-options span {
  font-size: 12px;
  opacity: 0.7;
}

.dropdown-footer {
  padding: 8px 12px;
  background: #fafafa;
  border-top: 1px solid #f2f2f7;
  flex-shrink: 0;
}

.selected-summary {
  text-align: center;
}

.summary-text {
  font-size: 11px;
  color: #8e8e93;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Enhanced scrollbar styling */
.options-list::-webkit-scrollbar {
  width: 8px;
}

.options-list::-webkit-scrollbar-track {
  background: #f8f8f8;
  border-radius: 4px;
  margin: 4px 0;
}

.options-list::-webkit-scrollbar-thumb {
  background: #c7c7cc;
  border-radius: 4px;
  border: 1px solid #f8f8f8;
}

.options-list::-webkit-scrollbar-thumb:hover {
  background: #aeaeb2;
}

.options-list::-webkit-scrollbar-thumb:active {
  background: #8e8e93;
}

/* Firefox scrollbar */
.options-list {
  scrollbar-width: thin;
  scrollbar-color: #c7c7cc #f8f8f8;
}

@media (max-width: 768px) {
  .multiselect-trigger {
    padding: 8px 10px;
    min-height: 40px;
  }
  
  .search-input {
    font-size: 16px; /* Prevents zoom on iOS */
    padding: 8px 12px 8px 30px;
  }
  
  .option-item {
    padding: 12px;
    min-height: 44px;
  }
  
  .option-text {
    font-size: 14px;
  }
  
  .checkbox-custom {
    width: 18px;
    height: 18px;
  }
  
  .check-icon {
    width: 12px;
    height: 12px;
  }
  
  .options-header {
    padding: 12px;
  }
  
  .select-all-btn,
  .clear-all-btn {
    padding: 10px 12px;
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .multiselect-trigger {
    padding: 6px 8px;
    min-height: 36px;
  }
  
  .placeholder,
  .option-text {
    font-size: 13px;
  }
  
  .search-container {
    padding: 10px;
  }
  
  .option-item {
    padding: 10px;
  }
  
  .selected-count {
    font-size: 11px;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  * {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
</style>
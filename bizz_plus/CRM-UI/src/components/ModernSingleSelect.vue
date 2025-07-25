<template>
  <div class="modern-select" ref="dropdown">
    <div class="select-trigger" @click="toggleDropdown" :class="{ open: isOpen }" tabindex="0" @blur="closeDropdown">
      <span class="selected-text">{{ selectedLabel }}</span>
      <svg class="dropdown-icon" viewBox="0 0 24 24" width="20" height="20">
        <path d="M7 10l5 5 5-5H7z" fill="currentColor"/>
      </svg>
    </div>

    <Teleport to="body" v-if="isOpen">
      <div class="dropdown-panel" :style="panelStyles" ref="panel" @mousedown.prevent @click.stop>
        <div class="options-list">
          <div
            v-for="option in options"
            :key="option"
            class="option-item"
            :class="{ selected: option === selected }"
            @click="selectOption(option)"
          >
            {{ option }}
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  options: string[],
  selected: string,
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:selected', value: string): void
}>()

const dropdown = ref<HTMLElement>()
const panel = ref<HTMLElement>()
const isOpen = ref(false)
const panelStyles = ref({})

const selectedLabel = computed(() => {
  return props.selected || props.placeholder || 'Select...'
})

const toggleDropdown = () => {
  if (isOpen.value) {
    closeDropdown()
  } else {
    openDropdown()
  }
}

const openDropdown = () => {
  isOpen.value = true
  nextTick(() => {
    positionDropdown()
  })
}

const closeDropdown = () => {
  isOpen.value = false
  panelStyles.value = {}
}

const selectOption = (option: string) => {
  emit('update:selected', option)
  closeDropdown()
}

const positionDropdown = () => {
  if (!dropdown.value || !panel.value) return
  const rect = dropdown.value.getBoundingClientRect()
  const viewportWidth = window.innerWidth


  const top = rect.bottom + 4
  let left = rect.left
  const width = rect.width

  // Adjust if dropdown goes beyond viewport width
  if (left + width > viewportWidth - 10) {
    left = viewportWidth - width - 10
  }
  if (left < 10) {
    left = 10
  }

  panelStyles.value = {
    position: 'fixed',
    top: `${top}px`,
    left: `${left}px`,
    width: `${width}px`,
    maxHeight: '300px',
    overflowY: 'auto',
    zIndex: '9999',
    background: 'white',
    border: '1px solid #ccc',
    borderRadius: '6px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
  }
}

const onClickOutside = (event: MouseEvent) => {
  if (
    dropdown.value && !dropdown.value.contains(event.target as Node) &&
    panel.value && !panel.value.contains(event.target as Node)
  ) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', onClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', onClickOutside)
})
</script>

<style scoped>
.modern-select {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  position: relative;
  user-select: none;
}

.select-trigger {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #ddd;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  background-color: white;
  min-width: 160px;
  font-size: 14px;
  color: #444;
  transition: border-color 0.2s ease;
}

.select-trigger.open {
  border-color: #1e293b;
  box-shadow: 0 0 0 2px #1e293b;
  color: #1e293b;
}

.select-trigger:focus {
  outline: none;
  border-color: #1e293b;
  /* box-shadow: 0 0 0 2px #1e293b; */
}

.selected-text {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown-icon {
  margin-left: 8px;
  transition: transform 0.3s ease;
}

.select-trigger.open .dropdown-icon {
  transform: rotate(180deg);
}

.options-list {
  max-height: 300px;
  overflow-y: auto;
}

.option-item {
  padding: 10px 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.option-item:hover {
  background-color: #f1f5f9;
}

.option-item.selected {
  background-color: #1e293b;
  color: white;
}
</style>

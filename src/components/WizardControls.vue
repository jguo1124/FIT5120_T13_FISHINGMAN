<!-- src/components/WizardControls.vue -->
<script setup>
const props = defineProps({
  zones: { type: Array, default: () => [] },
  zone: { type: String, default: "" },
  onDate: { type: String, default: "" },
  species: { type: String, default: "" },
  speciesOptions: { type: Array, default: () => [] },
  speciesLoading: { type: Boolean, default: false },
  step: { type: Number, default: 1 },    // 1=Zone, 2=Date, 3=Species
  loading: { type: Boolean, default: false },
});
const emit = defineEmits(["update:zone", "update:onDate", "update:species"]);
</script>

<template>
  <div class="controls" role="group" aria-label="Step-by-step filters">
    <!-- Step 1: Zone -->
    <div class="control">
      <label>1) Zone</label>
      <select
        class="input"
        :value="zone"
        :disabled="loading"
        @change="e => emit('update:zone', e.target.value)"
      >
        <option value="" disabled>Select a zone</option>
        <option v-for="z in zones" :key="z.code" :value="z.code">
          {{ z.code }} - {{ z.area }}
        </option>
      </select>
    </div>

    <!-- Step 2: Date -->
    <div class="control" v-if="step >= 2">
      <label>2) Date</label>
      <input
        type="date"
        class="input"
        :value="onDate"
        :disabled="loading"
        @change="e => emit('update:onDate', e.target.value)"
      />
    </div>

    <!-- Step 3: Species (optional filter) -->
    <div class="control" v-if="step >= 3">
      <label>3) Species (optional)</label>
      <select
        class="input"
        :value="species"
        :disabled="loading || speciesLoading || !speciesOptions.length"
        @change="e => emit('update:species', e.target.value)"
      >
        <option value="">All species</option>
        <option v-for="s in speciesOptions" :key="s.code" :value="s.code">
          {{ s.common_name || s.code }} ({{ s.code }})
        </option>
      </select>
      <small v-if="speciesLoading">Loading species...</small>
      <small v-else-if="!speciesLoading && !speciesOptions.length">No species available</small>
    </div>
  </div>
</template>

<style scoped>
.controls {
  display: grid;
  grid-template-columns: repeat(2, minmax(240px, 1fr));
  gap: 16px;
  align-items: end;
}
@media (max-width: 720px) {
  .controls { grid-template-columns: 1fr; }
}
.control { min-width: 0; }
.control label {
  display: block;
  font-size: 12px;
  color: #475569;
  margin-bottom: 6px;
}
.input {
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  height: 36px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 0 10px;
  outline: none;
  background: #fff;
}
</style>
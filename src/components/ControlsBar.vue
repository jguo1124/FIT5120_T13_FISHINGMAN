<!-- src/components/ControlsBar.vue -->
<script setup>
/**
 * Props:
 *  - zones: [{code, area}]
 *  - zone, onDate, species: v-model
 *  - speciesOptions: [{code, common_name}]
 *  - loading: boolean
 *  - hideNoRestrictions: v-model
 *
 * Emits:
 *  - refresh
 *  - update:zone / update:onDate / update:species / update:hideNoRestrictions
 */
const props = defineProps({
  zones: { type: Array, default: () => [] },
  zone: { type: String, default: "" },
  onDate: { type: String, default: "" },
  species: { type: String, default: "" },
  speciesOptions: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  hideNoRestrictions: { type: Boolean, default: false },
});
const emit = defineEmits([
  "refresh",
  "update:zone",
  "update:onDate",
  "update:species",
  "update:hideNoRestrictions",
]);
</script>

<template>
  <div class="controls" role="group" aria-label="Filters">
    <div class="control">
      <label for="zone">Zone</label>
      <select
        id="zone"
        class="input"
        :disabled="loading"
        :value="zone"
        @change="e => emit('update:zone', e.target.value)"
      >
        <option v-for="z in zones" :key="z.code" :value="z.code">
          {{ z.code }} — {{ z.area }}
        </option>
      </select>
    </div>

    <div class="control">
      <label for="date">Date</label>
      <input
        id="date"
        type="date"
        class="input"
        :disabled="loading"
        :value="onDate"
        @change="e => emit('update:onDate', e.target.value)"
      />
    </div>

    <div class="control">
      <label for="species">Species (optional)</label>
      <select
        id="species"
        class="input"
        :disabled="loading || !speciesOptions.length"
        :value="species"
        @change="e => emit('update:species', e.target.value)"
      >
        <option value="">All species</option>
        <option v-for="s in speciesOptions" :key="s.code" :value="s.code">
          {{ s.common_name || s.code }} ({{ s.code }})
        </option>
      </select>
    </div>

    <div class="control toggle">
      <input
        id="hideNoRes"
        type="checkbox"
        :checked="hideNoRestrictions"
        :disabled="loading"
        @change="e => emit('update:hideNoRestrictions', e.target.checked)"
      />
      <label for="hideNoRes" title="Hide species with no size + daily limits">
        Hide no-restriction species
      </label>
    </div>

    <div class="control last">
      <label aria-hidden="true">&nbsp;</label>
      <button class="btn" :disabled="loading" @click="emit('refresh')">
        {{ loading ? "Loading…" : "Refresh" }}
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Responsive grid with enough min width to prevent overlap */
.controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  column-gap: 16px;
  row-gap: 16px;
  align-items: end;
  margin-bottom: 18px;
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

/* Checkbox + label */
.toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: auto;
  white-space: nowrap; /* avoid multi-line wrapping that pushes layout */
}

.toggle input {
  width: 16px;
  height: 16px;
}

/* Refresh button */
.control.last { min-width: 140px; }

.btn {
  width: 100%;
  height: 36px;
  border-radius: 8px;
  border: 1px solid rgba(0,0,0,.22);
  background: #fff;
  font-weight: 700;
  box-shadow: 0 6px 16px rgba(0,0,0,.08);
  cursor: pointer;
}

.btn:hover:not(:disabled) {
  color: #0d9bb5;
  text-decoration: underline;
  transform: scale(1.02);
}

.btn:disabled { opacity: 0.6; cursor: not-allowed; }

/* Break the toggle to its own row when space is tight */
@media (max-width: 1100px) {
  .toggle { grid-column: 1 / -1; }
}

/* Refresh button also full row on very small screens */
@media (max-width: 420px) {
  .control.last { grid-column: 1 / -1; }
}
</style>

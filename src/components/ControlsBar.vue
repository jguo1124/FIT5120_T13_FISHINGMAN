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
  <div class="controls">
    <div class="control">
      <label>Zone</label>
      <select
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
      <label>Date</label>
      <input
        type="date"
        class="input"
        :disabled="loading"
        :value="onDate"
        @change="e => emit('update:onDate', e.target.value)"
      />
    </div>

    <div class="control">
      <label>Species (optional)</label>
      <select
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

    <div class="control">
      <label>&nbsp;</label>
      <button class="btn" :disabled="loading" @click="emit('refresh')">
        {{ loading ? "Loading…" : "Refresh" }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.controls {
  display:grid;
  grid-template-columns:minmax(0,1fr) minmax(0,1fr) minmax(0,1fr) auto auto;
  column-gap:16px; row-gap:12px; align-items:end; margin-bottom:18px;
}
.control { min-width:0; }
.control label { display:block; font-size:12px; color:#475569; margin-bottom:6px; }
.input {
  width:100%; height:36px; border:1px solid #cbd5e1; border-radius:8px; padding:0 10px;
  outline:none;
}
.toggle { display:flex; align-items:center; gap:8px; }
.btn {
  height:36px; border-radius:8px; border:1px solid rgba(0,0,0,.22);
  background:#fff; font-weight:700; box-shadow:0 6px 16px rgba(0,0,0,.08); cursor:pointer;
}
.btn:hover:not(:disabled){ color:#0d9bb5; text-decoration:underline; transform:scale(1.03); }
</style>

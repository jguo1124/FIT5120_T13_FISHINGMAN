<script setup>
const props = defineProps({
  zones: { type: Array, default: () => [] },
  zone: { type: String, default: "" },
  onDate: { type: String, default: "" },
  species: { type: String, default: "" },
  speciesOptions: { type: Array, default: () => [] },
  speciesLoading: { type: Boolean, default: false },
  step: { type: Number, default: 1 }, // 1=zone,2=date,3=species,4=apply
  loading: { type: Boolean, default: false },
});
const emit = defineEmits([
  "update:zone",
  "update:onDate",
  "update:species",
  "apply",
]);
</script>

<template>
  <div class="controls" role="group" aria-label="Step-by-step filters">
    <!-- Step 1 -->
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
          {{ z.code }} — {{ z.area }}
        </option>
      </select>
    </div>

    <!-- Step 2 -->
    <div class="control">
      <label>2) Date</label>
      <input
        type="date"
        class="input"
        :value="onDate"
        :disabled="loading || step < 2"
        @change="e => emit('update:onDate', e.target.value)"
      />
    </div>

    <!-- Step 3 -->
    <div class="control">
      <label>3) Species</label>
      <select
        class="input"
        :value="species"
        :disabled="loading || step < 3 || speciesLoading || !speciesOptions.length"
        @change="e => emit('update:species', e.target.value)"
      >
        <option value="" disabled>Select a species</option>
        <option v-for="s in speciesOptions" :key="s.code" :value="s.code">
          {{ s.common_name || s.code }} ({{ s.code }})
        </option>
      </select>
      <small v-if="speciesLoading">Loading species…</small>
      <small v-else-if="step >= 3 && !speciesOptions.length">No species available</small>
    </div>

    <!-- Step 4 -->
    <div class="control last">
      <label aria-hidden="true">&nbsp;</label>
      <button class="btn"
              :disabled="loading || step < 3 || !zone || !onDate || !species"
              @click="$emit('apply')">
        {{ loading ? "Loading…" : "Show regulations" }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.controls{
  display:grid; grid-template-columns:repeat(auto-fit, minmax(240px,1fr));
  gap:16px; align-items:end; margin-bottom:18px;
}
.control label{ display:block; font-size:12px; color:#475569; margin-bottom:6px; }
.input{ width:100%; height:36px; border:1px solid #cbd5e1; border-radius:8px; padding:0 10px; }
.btn{ width:100%; height:36px; border-radius:8px; border:1px solid rgba(0,0,0,.22); background:#fff; font-weight:700; box-shadow:0 6px 16px rgba(0,0,0,.08); cursor:pointer; }
.btn:disabled{ opacity:.6; cursor:not-allowed; }
</style>

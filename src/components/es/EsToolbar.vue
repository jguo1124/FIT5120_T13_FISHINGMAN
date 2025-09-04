<template>
  <!-- Top toolbar with filters and optional pager slot -->
  <header class="toolbar">
    <div class="controls">
      <!-- Zone dropdown -->
      <div class="control">
        <label>Zone</label>
        <select v-model="local.zone">
          <option v-for="z in zones" :key="z.code" :value="z.code">{{ z.name }}</option>
        </select>
      </div>

      <!-- Search field -->
      <div class="control">
        <label>Search species</label>
        <input
          v-model.trim="local.q"
          type="text"
          placeholder="e.g. Snapper"
          @keyup.enter="emitApply"
        />
      </div>

      <!-- Radius input -->
      <div class="control short">
        <label>Radius (km)</label>
        <input v-model.number="local.radiusKm" type="number" min="0" step="1" />
      </div>

      <!-- Apply filters button -->
      <button class="btn primary" @click="emitApply">Apply</button>
    </div>

    <!-- Pager slot (can inject pager component here) -->
    <div class="pager-slot">
      <slot name="pager"></slot>
    </div>
  </header>
</template>

<script setup>
import { reactive, watchEffect } from "vue";

// Props received from parent
const props = defineProps({
  zone: { type: String, required: true },
  q: { type: String, required: true },
  radiusKm: { type: Number, required: true },
  zones: {
    type: Array,
    default: () => ([
      { code: "VIC-BAY", name: "Victoria Bay" },
      { code: "VIC-OFF", name: "Victoria Offshore" },
    ])
  },
});

// Emit when filters are applied
const emit = defineEmits(["apply"]);

// Local reactive copy of props to allow user editing
const local = reactive({
  zone: props.zone,
  q: props.q,
  radiusKm: props.radiusKm,
});

// Sync local state when parent props change
watchEffect(() => {
  local.zone = props.zone;
  local.q = props.q;
  local.radiusKm = props.radiusKm;
});

// Emit updated filter values back to parent
function emitApply() {
  emit("apply", { ...local });
}
</script>

<style scoped>
.toolbar {
  display: flex; gap: 12px; align-items: center; justify-content: space-between;
  background: #fff; padding: 12px; border: 1px solid #e2e8f0; border-radius: 16px;
  box-shadow: 0 8px 28px rgba(2, 8, 23, .06);
}
.controls { display: flex; gap: 12px; align-items: end; flex-wrap: wrap; }
.control { display: grid; gap: 6px; }
.control.short input { width: 96px; }
.control label { font-size: 12px; color: #64748b; }
.control input, .control select {
  border: 1px solid #e2e8f0; border-radius: 10px; padding: 8px 10px; background: #fff; min-width: 200px;
}
.btn { border: 1px solid #e2e8f0; background: #fff; border-radius: 10px; padding: 8px 12px; cursor: pointer; }
.btn.primary { background: #0f172a; color: #fff; border-color: #0f172a; }
.pager-slot { display: flex; align-items: center; gap: 8px; }
</style>

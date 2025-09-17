<template>
  <header class="toolbar">
    <div class="controls">
      <div class="control">
        <label>Search species</label>
        <input
          v-model.trim="local.q"
          type="text"
          placeholder="e.g. Grayling"
          @keyup.enter="emitApply"
        />
      </div>
      <div class="control">
        <label>Status</label>
        <select v-model="local.status">
          <option value="">All</option>
          <option>Endangered</option>
          <option>Protected</option>
          <option>Prohibited</option>
          <option>Vulnerable</option>
        </select>
      </div>
      <button class="btn primary" @click="emitApply">Apply</button>
    </div>
    <div class="pager-slot"><slot name="pager"></slot></div>
  </header>
</template>

<script setup>
import { reactive, watchEffect } from "vue";

const props = defineProps({
  q: { type: String, default: "" },
  status: { type: String, default: "" },
});
const emit = defineEmits(["apply"]);

const local = reactive({
  q: props.q,
  status: props.status,
});

watchEffect(() => {
  local.q = props.q;
  local.status = props.status;
});

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
.control label { font-size: 12px; color: #64748b; }
.control input, .control select {
  border: 1px solid #e2e8f0; border-radius: 10px; padding: 8px 10px; background: #fff; min-width: 200px;
}
.btn { border: 1px solid #e2e8f0; background: #fff; border-radius: 10px; padding: 8px 12px; cursor: pointer; }
.btn.primary { background: #0f172a; color: #fff; border-color: #0f172a; }
.pager-slot { display: flex; align-items: center; gap: 8px; }
</style>

<template>
  <header class="toolbar">
    <form class="controls" @submit.prevent="emitApply" role="search" aria-label="Species search">
      <div class="control">
        <label for="q">Search species</label>
        <input
          id="q"
          v-model.trim="local.q"
          type="search"
          placeholder="e.g. Grayling"
          autocomplete="off"
        />
      </div>
      <div class="control">
        <label for="status">Status</label>
        <select id="status" v-model="local.status">
          <option value="">All</option>
          <option>Endangered</option>
          <option>Protected</option>
          <option>Prohibited</option>
          <option>Vulnerable</option>
        </select>
      </div>
      <button class="btn primary" type="submit">Apply</button>
    </form>

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

<<style scoped>
.toolbar {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: center;
  background: #fff;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  box-shadow: 0 8px 28px rgba(2, 8, 23, .06);
  overflow-x: auto;
}

.controls {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: center;
  flex-wrap: nowrap;
  white-space: nowrap;
}

.control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.control input,
.control select {
  border: 1px solid #e2e8f0;     /* ✅ 默认浅灰 */
  border-radius: 10px;
  padding: 8px 10px;
  background: #fff;
  min-width: 220px;
  height: 38px;                  /* ✅ 强制同高 */
  font-size: 0.95rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

/* ✅ 选中状态下变蓝 */
.control input:focus,
.control select:focus {
  outline: none;
  border-color: #36ade1;
  box-shadow: 0 0 0 2px rgba(54, 173, 225, 0.25);
}

.btn {
  border: 1px solid #e2e8f0;
  background: #fff;
  border-radius: 10px;
  padding: 8px 14px;
  height: 38px;                  /* ✅ 同样高度 */
  cursor: pointer;
  font-size: 0.95rem;
  transition: background-color 0.2s;
}

.btn.primary {
  background: #36ade1;
  border-color: #36ade1;
  color: #fff;
}

.btn.primary:hover {
  background: #2d9ed0;
  border-color: #2d9ed0;
}

.pager-slot {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>

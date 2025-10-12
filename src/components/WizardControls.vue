<!-- src/components/WizardControls.vue -->
<script setup>
  const props = defineProps({
    zones: { type: Array, default: () => [] },
    zone: { type: String, default: "" },
    onDate: { type: String, default: "" },
    species: { type: String, default: "" },
    speciesOptions: { type: Array, default: () => [] },
    speciesLoading: { type: Boolean, default: false },
    step: { type: Number, default: 1 },
    loading: { type: Boolean, default: false },
    hideNoRestrictions: { type: Boolean, default: false },
  });

  const emit = defineEmits([
    "update:zone",
    "update:onDate",
    "update:species",
    "update:hideNoRestrictions",
    "next",
    "back",
    "show",
    "clear-all"
  ]);

  function handleBack() {
    emit("back");
  }
  function handleNext() {
    emit("next");
  }
  function handleShow() {
    emit("show");
  }
  function handleToggleNoRestriction(e) {
    emit("update:hideNoRestrictions", e.target.checked);
  }
  </script>

<template>
  <div class="wizard">
    <div class="step-meta">Step {{ step }} of 3</div>

    <transition name="fade-slide" mode="out-in">
      <!-- STEP 1: ZONE -->
      <div v-if="step === 1" key="step1" class="step">
        <h3 class="step-title">Choose your fishing zone</h3>
        <p id="help-zone" class="step-help">
          Pick the river, lake or coastal area you'll fish in. Rules vary by zone and we'll tailor size limits, quotas and closures accordingly.
        </p>

        <label class="label" for="zone">Zone</label>
        <select
          id="zone"
          class="input"
          :aria-describedby="'help-zone'"
          :value="zone"
          :disabled="loading"
          @change="e => emit('update:zone', e.target.value)"
        >
          <option value="" disabled>Select a zone</option>
          <option v-for="z in zones" :key="z.code" :value="z.code">
            {{ z.code }} - {{ z.area }}
          </option>
        </select>

        <div class="actions">
          <button class="btn ghost" disabled @click="emit('back')">Back</button>
          <button class="btn primary" :disabled="!zone || loading" @click="emit('next')">Next</button>
        </div>
      </div>

      <!-- STEP 2: DATE -->
      <div v-else-if="step === 2" key="step2" class="step">
        <h3 class="step-title">Pick your fishing date</h3>
        <p id="help-date" class="step-help">
          Select the day you plan to fish. Some species have seasonal closures, so rules can change by date.
        </p>

        <label class="label" for="date">Date</label>
        <input
          id="date"
          type="date"
          class="input"
          :aria-describedby="'help-date'"
          :value="onDate"
          :disabled="loading"
          @change="e => emit('update:onDate', e.target.value)"
        />

        <div class="actions">
          <button class="btn ghost" :disabled="loading" @click="handleBack">Back</button>
          <button class="btn primary" :disabled="!onDate || loading" @click="handleShow">Show results</button>
        </div>
      </div>

      <!-- STEP 3: RESULTS + OPTIONAL FILTERS -->
      <div v-else key="step3" class="step">
        <h3 class="step-title">Results</h3>
        <p id="help-species" class="step-help">
          You're now viewing all species regulated in the selected zone and date. Use the filters below to focus on a single species or hide rows without restrictions.
        </p>

        <!-- Filters row -->
        <div class="filters">
          <div class="col">
            <label class="label" for="species">Filter by species (optional)</label>
            <select
              id="species"
              class="input"
              :aria-describedby="'help-species'"
              :value="species"
              :disabled="loading || speciesLoading || !speciesOptions.length"
              @change="e => emit('update:species', e.target.value)"
            >
              <option value="">All species</option>
              <option v-for="s in speciesOptions" :key="s.code" :value="s.code">
                {{ s.common_name || s.code }} ({{ s.code }})
              </option>
            </select>
            <small v-if="speciesLoading" class="muted">Loading species</small>
            <small v-else-if="!speciesLoading && !speciesOptions.length" class="muted">No species available</small>
          </div>

          <div class="col toggle">
            <input
              id="hideNo"
              type="checkbox"
              :checked="hideNoRestrictions"
              :disabled="loading"
              @change="handleToggleNoRestriction"
            />
            <label for="hideNo" title="Hide rows where both size and daily limits are effectively 'no restriction'">
              Hide no-restriction species
            </label>
          </div>
        </div>

        <div class="actions">
          <button class="btn ghost" :disabled="loading" @click="handleBack">Back</button>
          <button class="btn" :disabled="loading" @click="emit('clear-all')">Clear all filters</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.wizard { display: grid; gap: 12px; }
.step-meta { font-size: 12px; color: #64748b; }
.step { display: grid; gap: 10px; }
.step-title { margin: 2px 0 0; font-size: 18px; font-weight: 700; }
.step-help { margin: 0; color: #64748b; line-height: 1.6; }

.label { display:block; font-size:12px; color:#475569; margin-top:6px; }
.input {
  width: 100%;
  height: 25px;            
  border: 1px solid #cbd5e1;
  border-radius: 8px;           
  padding: 0 8px;
  background: #fff;
  font-size: 14px;
  line-height: 28px;         
  outline: none;
}
.muted { color: #6b7280; font-size: 12px; }

.filters {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 14px;
  align-items: end;
}
.toggle {
  display: flex; align-items: center; gap: 8px;
  white-space: nowrap;
}
.toggle input { width: 16px; height: 16px; }

.actions {
  display: flex; justify-content: flex-end; gap: 10px; margin-top: 6px;
}
.btn {
  min-width: 120px; height: 36px; padding: 0 12px;
  border-radius: 10px; border: 1px solid rgba(0,0,0,.18);
  background: #fff; font-weight: 700; cursor: pointer;
  box-shadow: 0 6px 16px rgba(0,0,0,.06);
}
.btn.primary { background: #0ea5e9; color: #fff; border-color: #0ea5e9; }
.btn.ghost   { background: #fff; color: #111827; border-color: #e5e7eb; }
.btn:disabled { opacity: .6; cursor: not-allowed; }

/* Transition (match Dashboard) */
.fade-slide-enter-active, .fade-slide-leave-active { transition: all .18s ease; }
.fade-slide-enter-from { opacity: 0; transform: translateY(6px); }
.fade-slide-leave-to   { opacity: 0; transform: translateY(-6px); }

@media (max-width: 720px) {
  .filters { grid-template-columns: 1fr; }
}

/* Hover + Active effect for Back and Clear Filter */
.btn.ghost,
.btn {
  transition: all 0.18s ease;
}

.btn.ghost:hover,
.btn:hover {
  background: #0ea5e9;
  color: #fff;
  border-color: #0ea5e9;
  transform: translateY(-1px);
}

.btn.ghost:active,
.btn:active {
  transform: scale(0.96);
}
</style>

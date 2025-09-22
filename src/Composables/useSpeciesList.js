import { ref, computed } from "vue";
import { useUserStore } from "@/stores/user";

export function useSpeciesList() {
  const userStore = useUserStore();

  const zone = ref("VIC-BAY");
  const q = ref("");
  const radiusKm = ref(20);
  const page = ref(1);
  const pageSize = ref(10);
  const total = ref(0);
  const items = ref([]);
  const loading = ref(false);

  const useMock = true;
  const API_BASE = (import.meta?.env?.VITE_API_BASE ?? "/api/v1").replace(/\/+$/, "");
  const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)));

  async function fetchList() {
    loading.value = true;
    try {
      if (useMock) {
        await new Promise(r => setTimeout(r, 150));

        const localImage = new URL("@/assets/1.jpg", import.meta.url).href;

        const base = {
          species_code: "GREENGROPER",
          common_name: "Green Groper",
          scientific_name: "Epinephelus daemelii",
          status: "Endangered",
          lawful_take: "Prohibited",
          last_synced_at: "2025-09-01T10:00:00Z",
          recent_sightings: 3,
          source_url: "https://example.org/species/greengroper",
          jurisdiction: "VIC",
          image_url: localImage,
        };

        const all = Array.from({ length: 24 }, (_, i) => ({
          ...base,
          species_code: `${base.species_code}_${i + 1}`,
          common_name: `${base.common_name} ${i + 1}`,
          recent_sightings: Math.floor(Math.random() * 15),
        }));

        const kw = q.value.trim().toLowerCase();
        const filtered = all.filter(s =>
          !kw ||
          s.common_name.toLowerCase().includes(kw) ||
          s.scientific_name.toLowerCase().includes(kw) ||
          s.species_code.toLowerCase().includes(kw)
        );

        total.value = filtered.length;
        const start = (page.value - 1) * pageSize.value;
        items.value = filtered.slice(start, start + pageSize.value);
      } else {
        if (!userStore.authToken) {
          items.value = [];
          total.value = 0;
          return;
        }
        const url = `${API_BASE}/protected/species?zone=${encodeURIComponent(
          zone.value
        )}&q=${encodeURIComponent(q.value)}&radiusKm=${radiusKm.value}&page=${page.value}&pageSize=${pageSize.value}`;

        const headers = new Headers({ Accept: "application/json" });
        headers.set("Authorization", `Bearer ${userStore.authToken}`);

        const r = await fetch(url, { headers, cache: "no-store" });
        if (r.status === 401) {
          userStore.logout();
          items.value = [];
          total.value = 0;
          return;
        }
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = await r.json();
        items.value = data.items || [];
        total.value = data.total ?? items.value.length;
      }
    } finally {
      loading.value = false;
    }
  }

  function applyFilters(next = {}) {
    if ("zone" in next) zone.value = next.zone;
    if ("q" in next) q.value = next.q;
    if ("radiusKm" in next) radiusKm.value = next.radiusKm;
    page.value = 1;
    fetchList();
  }

  function prevPage() {
    if (page.value > 1) {
      page.value--;
      fetchList();
    }
  }
  function nextPage() {
    if (page.value < totalPages.value) {
      page.value++;
      fetchList();
    }
  }

  return {
    zone, q, radiusKm, page, pageSize, total, items, loading, totalPages,
    fetchList, applyFilters, prevPage, nextPage,
  };
}

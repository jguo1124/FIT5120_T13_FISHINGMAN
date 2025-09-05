import { defineStore } from "pinia";

export const useSelectionStore = defineStore("selection", {
  state: () => ({
    species: "snapper",
    zone: "VIC-BAY",
    onDate: "", 
  }),
  actions: {
    set({ species, zone, onDate }) {
      if (species !== undefined) this.species = species;
      if (zone !== undefined) this.zone = zone;
      if (onDate !== undefined) this.onDate = onDate;
    },
  },
});

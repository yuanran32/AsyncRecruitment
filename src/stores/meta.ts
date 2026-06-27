import { defineStore } from 'pinia';

import { getCurrentPeriod, getDirections } from '@/api/meta';
import type { CurrentPeriod, Direction, PeriodType } from '@/types/api';

interface MetaState {
  currentPeriod: CurrentPeriod | null;
  directions: Direction[];
  loading: boolean;
}

export const useMetaStore = defineStore('meta', {
  state: (): MetaState => ({
    currentPeriod: null,
    directions: [],
    loading: false
  }),
  getters: {
    period: (state): PeriodType | undefined => state.currentPeriod?.currentPeriod,
    isRegistration: (state) => state.currentPeriod?.currentPeriod === 'REGISTRATION',
    isSelection: (state) => state.currentPeriod?.currentPeriod === 'SELECTION'
  },
  actions: {
    async fetchCurrentPeriod() {
      this.currentPeriod = await getCurrentPeriod();
      return this.currentPeriod;
    },
    async fetchDirections(force = false) {
      if (this.directions.length && !force) {
        return this.directions;
      }

      this.directions = await getDirections(true);
      return this.directions;
    },
    async bootstrap() {
      this.loading = true;
      try {
        await Promise.all([this.fetchCurrentPeriod(), this.fetchDirections()]);
      } finally {
        this.loading = false;
      }
    }
  }
});

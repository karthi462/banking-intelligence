import React, { createContext, useContext, useState, useEffect } from 'react';
import { FilterParams, DatasetSummary } from '../types';
import { api } from '../services/api';

interface FilterContextType {
  filters: FilterParams;
  setFilters: React.Dispatch<React.SetStateAction<FilterParams>>;
  appliedFilters: FilterParams;
  applyFilters: () => void;
  resetFilters: () => void;
  datasetSummary: DatasetSummary | null;
  refreshDatasetSummary: () => Promise<void>;
  isLoadingSummary: boolean;
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const defaultFilters: FilterParams = {
  start_date: '',
  end_date: '',
  transaction_type: 'All',
  payment_mode: 'All',
  transaction_status: 'All',
  branch: 'All',
  account_type: 'All',
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [filters, setFilters] = useState<FilterParams>(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState<FilterParams>(defaultFilters);
  const [datasetSummary, setDatasetSummary] = useState<DatasetSummary | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState<boolean>(true);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const fetchSummary = async () => {
    try {
      setIsLoadingSummary(true);
      const summary = await api.getDatasetSummary();
      setDatasetSummary(summary);
      // Auto-set initial date filters based on dataset boundary if not set
      if (summary.start_date && summary.end_date && !appliedFilters.start_date) {
        const sDate = summary.start_date.split(' ')[0];
        const eDate = summary.end_date.split(' ')[0];
        setFilters((prev) => ({ ...prev, start_date: sDate, end_date: eDate }));
        setAppliedFilters((prev) => ({ ...prev, start_date: sDate, end_date: eDate }));
      }
    } catch (err) {
      console.error('Failed to load dataset summary', err);
    } finally {
      setIsLoadingSummary(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [refreshTrigger]);

  const applyFilters = () => {
    setAppliedFilters({ ...filters });
  };

  const resetFilters = () => {
    if (datasetSummary?.start_date && datasetSummary?.end_date) {
      const sDate = datasetSummary.start_date.split(' ')[0];
      const eDate = datasetSummary.end_date.split(' ')[0];
      const reset = { ...defaultFilters, start_date: sDate, end_date: eDate };
      setFilters(reset);
      setAppliedFilters(reset);
    } else {
      setFilters(defaultFilters);
      setAppliedFilters(defaultFilters);
    }
  };

  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <FilterContext.Provider
      value={{
        filters,
        setFilters,
        appliedFilters,
        applyFilters,
        resetFilters,
        datasetSummary,
        refreshDatasetSummary: fetchSummary,
        isLoadingSummary,
        refreshTrigger,
        triggerRefresh,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};

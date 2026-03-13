import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PatientState } from './patient.reducer';

export const selectPatientState =
  createFeatureSelector<PatientState>('patients');

export const selectPatients = createSelector(
  selectPatientState,
  (state) => state.patients
);

export const selectPatientsLoading = createSelector(
  selectPatientState,
  (state) => state.loading
);

export const selectPatientById = (id: number) =>
  createSelector(
    selectPatients,
    (patients) => patients.find(p => p.id === id)
  );
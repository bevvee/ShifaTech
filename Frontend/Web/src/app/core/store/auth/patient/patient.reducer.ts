import { createReducer, on } from '@ngrx/store';
import * as PatientActions from './patient.actions';
import { PatientDto } from '../../models/patient.model';

export interface PatientState {
  patients: PatientDto[];
  loading: boolean;
}

export const initialState: PatientState = {
  patients: [],
  loading: false,
};

export const patientReducer = createReducer(

  initialState,

  on(PatientActions.loadPatients, (state) => ({
    ...state,
    loading: true,
  })),

  on(PatientActions.loadPatientsSuccess, (state, { patients }) => ({
    ...state,
    patients,
    loading: false,
  })),

  on(PatientActions.createPatientSuccess, (state, { patient }) => ({
    ...state,
    patients: [patient, ...state.patients],
  })),

  on(PatientActions.deletePatientSuccess, (state, { id }) => ({
    ...state,
    patients: state.patients.filter(p => p.id !== id),
  }))
);
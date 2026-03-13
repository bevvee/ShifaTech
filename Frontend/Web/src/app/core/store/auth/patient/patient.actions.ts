import { createAction, props } from '@ngrx/store';
import { PatientDto, PatientCreateDto } from '../../models/patient.model';

export const loadPatients = createAction(
  '[Patient] Load Patients'
);

export const loadPatientsSuccess = createAction(
  '[Patient] Load Patients Success',
  props<{ patients: PatientDto[] }>()
);

export const createPatient = createAction(
  '[Patient] Create Patient',
  props<{ patient: PatientCreateDto }>()
);

export const createPatientSuccess = createAction(
  '[Patient] Create Patient Success',
  props<{ patient: PatientDto }>()
);

export const deletePatient = createAction(
  '[Patient] Delete Patient',
  props<{ id: number }>()
);

export const deletePatientSuccess = createAction(
  '[Patient] Delete Patient Success',
  props<{ id: number }>()
);
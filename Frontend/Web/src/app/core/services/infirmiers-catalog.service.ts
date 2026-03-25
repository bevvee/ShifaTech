// import { Injectable } from '@angular/core';
// import { InfirmierRow, InfirmierDto } from '../models/infirmier.model';

// const STORAGE_KEY = 'shifatech.infirmiers.v1';

// const DEFAULT_INFIRMIERS: InfirmierRow[] = [
//   {
//     id: 1,
//     nom: 'Haddad',
//     prenom: 'Imane',
//     cin: 'IN123456',
//     email: 'imane.haddad@shifatech.test',
//     role: 'INFIRMIER',
//     sexe: 'F',
//     statut: true,
//     dateNaissance: '1995-03-19',
//     telephone: '+212644444444',
//     adresse: 'Fès',
//     idService: 1,
//     idSpecialite: 1,
//   },
// ];

// @Injectable({ providedIn: 'root' })
// export class InfirmiersCatalogService {
//   getAll(): InfirmierRow[] {
//     if (typeof window === 'undefined') return [...DEFAULT_INFIRMIERS];

//     try {
//       const raw = window.localStorage.getItem(STORAGE_KEY);
//       if (!raw) return [...DEFAULT_INFIRMIERS];

//       const parsed = JSON.parse(raw) as unknown;
//       if (!Array.isArray(parsed)) return [...DEFAULT_INFIRMIERS];

//       const normalized: InfirmierRow[] = parsed
//         .map((i: any) => ({
//           id: Number(i?.id),
//           nom: String(i?.nom ?? ''),
//           prenom: String(i?.prenom ?? ''),
//           cin: String(i?.cin ?? ''),
//           email: String(i?.email ?? ''),
//           role: 'INFIRMIER' as const,
//           sexe: (i?.sexe === 'F' ? 'F' : 'M') as any,
//           statut: Boolean(i?.statut),
//           dateNaissance: String(i?.dateNaissance ?? ''),
//           telephone: String(i?.telephone ?? ''),
//           adresse: String(i?.adresse ?? ''),
//           idService: Number(i?.idService ?? 0),
//           idSpecialite: Number(i?.idSpecialite ?? 0),
//         }))
//         .filter((i) => Number.isFinite(i.id) && i.id > 0 && i.nom.trim().length > 0);

//       return normalized.length ? normalized : [...DEFAULT_INFIRMIERS];
//     } catch {
//       return [...DEFAULT_INFIRMIERS];
//     }
//   }

//   saveAll(infirmiers: InfirmierRow[]): void {
//     if (typeof window === 'undefined') return;

//     try {
//       window.localStorage.setItem(STORAGE_KEY, JSON.stringify(infirmiers));
//     } catch {
//       // ignore
//     }
//   }

//   nextId(infirmiers: InfirmierRow[]): number {
//     const maxId = infirmiers.reduce((max, i) => (i.id > max ? i.id : max), 0);
//     return maxId + 1;
//   }

//   getById(id: number): InfirmierRow | null {
//     const items = this.getAll();
//     return items.find((i) => i.id === id) ?? null;
//   }
// }

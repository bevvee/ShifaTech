import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ApiService } from './api.service';
import { RdvCreateDto, RdvDto } from '../models/rdv.model';

@Injectable({
  providedIn: 'root'
})
export class RdvService extends ApiService {

    private base = environment.api.rdv;

  create(dto: RdvCreateDto) {
    return this.post<RdvDto>(`${this.base}`, dto);
  }
  getAll() {
    return this.get(`${this.base}`);
  }

	deleteById(id: number) {
		return super.delete(`${this.base}/${id}`);
	}
}

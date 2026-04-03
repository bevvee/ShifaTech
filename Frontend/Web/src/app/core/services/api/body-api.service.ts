import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { BodySection } from '../../models/body-map.model';

@Injectable({
  providedIn: 'root'
})
export class BodyApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.api.body;

  getBodyMap(): Observable<BodySection[]> {
    return this.http.get<BodySection[]>(`${this.baseUrl}/body-map`);
  }

  getPartLabel(sectionCode: string, partCode: string): Observable<{ error: boolean, label: string }> {
    return this.http.get<{ error: boolean, label: string }>(
      `${this.baseUrl}/body-map/part-label`,
      { params: { section: sectionCode, part: partCode } }
    );
  }
}

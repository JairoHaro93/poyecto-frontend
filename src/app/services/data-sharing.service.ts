import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataSharingService {
  private dataSource = new BehaviorSubject<{ pendientes: number; noc: number }>(
    {
      pendientes: 0,
      noc: 0,
    }
  );

  currentData = this.dataSource.asObservable();

  constructor() {}

  updateData(pendientes: number, noc: number) {
    this.dataSource.next({ pendientes, noc });
  }
}

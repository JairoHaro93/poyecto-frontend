// src/app/core/loading.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private httpCount = 0;
  private httpBusy$ = new BehaviorSubject(false);
  private routeBusy$ = new BehaviorSubject(false);

  incHttp() {
    if (++this.httpCount === 1) this.httpBusy$.next(true);
  }
  decHttp() {
    if (this.httpCount > 0 && --this.httpCount === 0)
      this.httpBusy$.next(false);
  }

  setRouteBusy(v: boolean) {
    this.routeBusy$.next(v);
  }

  isBusy$ = combineLatest([this.httpBusy$, this.routeBusy$]).pipe(
    map(([h, r]) => h || r)
  );
}

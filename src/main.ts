/// <reference types="@angular/localize" />

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err)
);

//scp -r es// root@192.168.0.180:/var/www/html/poyecto-frontend/dist/frontend/browser
//sudo systemctl restart nginx

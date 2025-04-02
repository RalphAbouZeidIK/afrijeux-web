import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { Buffer } from 'buffer';

// Assign Buffer to window's Buffer property using a direct property assignment
(window as any).Buffer = Buffer;

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));

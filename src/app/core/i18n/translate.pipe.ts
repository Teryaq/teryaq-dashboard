import { Pipe, PipeTransform, inject } from '@angular/core';

import { I18nService } from './i18n.service';

@Pipe({
  name: 'translate',
  pure: false,
})
export class TranslatePipe implements PipeTransform {
  private readonly i18n = inject(I18nService);

  transform(key: string, params?: Record<string, string>): string {
    this.i18n.locale();
    this.i18n.ready();
    return this.i18n.translate(key, params);
  }
}

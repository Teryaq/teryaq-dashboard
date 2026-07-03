import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';

import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { extractErrorMessage } from '../../../core/api/utils/api-error.mapper';
import { NotificationService } from '../../../core/notifications/notification.service';
import { DrugImportSummary } from '../models/catalog.model';
import { CatalogApiService } from '../services/catalog-api.service';

const CSV_TEMPLATE_HEADER =
  'TradeNameAr,TradeNameEn,GenericName,DosageForm,Strength,PackSize,Price,Barcode,ManufacturerAr,ManufacturerEn';

@Component({
  selector: 'app-drug-import-page',
  imports: [TranslatePipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './drug-import-page.html',
  styleUrl: './drug-import-page.css',
})
export class DrugImportPage {
  private readonly api = inject(CatalogApiService);
  private readonly notifications = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly importing = signal(false);
  protected readonly isDragOver = signal(false);
  protected readonly lastImportSummary = signal<DrugImportSummary | null>(null);

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (file) {
      this.importCsv(file);
    }
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(true);
  }

  protected onDragLeave(): void {
    this.isDragOver.set(false);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.importCsv(file);
    }
  }

  protected downloadTemplate(): void {
    const blob = new Blob([`${CSV_TEMPLATE_HEADER}\n`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'teryaq-drugs-template.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  }

  protected countParam(value: number): Record<string, string> {
    return { count: String(value) };
  }

  private importCsv(file: File): void {
    this.importing.set(true);
    this.lastImportSummary.set(null);

    this.api
      .importDrugs(file)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          const detail = extractErrorMessage(err);
          if (detail) {
            this.notifications.showErrorDetail(detail);
          } else {
            this.notifications.showError('catalog.import.upload_error');
          }
          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(summary => {
        this.importing.set(false);
        if (!summary) return;
        this.lastImportSummary.set(summary);
      });
  }
}

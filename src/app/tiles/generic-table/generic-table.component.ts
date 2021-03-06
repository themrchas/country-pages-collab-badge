import { Input, Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';

import { MatTableDataSource } from '@angular/material';
import { MatPaginator} from '@angular/material';
import { MatSort } from '@angular/material';

// Modal
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material';

import { TileComponent } from '../tile/tile.component';
import { BehaviorSubject, of } from 'rxjs';
import { Country } from '../../model/country';
import { DataLayerService } from '../../services/data-layer.service';
import { MDBModalService, MDBModalRef } from 'angular-bootstrap-md';
import { IframeModalComponent } from '../../modals/iframe-modal/iframe-modal.component';
import { SpRestService } from 'src/app/services/sp-rest.service';
import { ConfigProvider } from '../../providers/configProvider';
import { SourceResult, DataSource } from '../../model/dataSource';

@Component({
  selector: 'app-generic-table',
  templateUrl: './generic-table.component.html',
  styleUrls: ['./generic-table.component.css']
})

export class GenericTableComponent implements OnInit, AfterViewInit, OnDestroy, TileComponent {

  @Input() settings: any;
  @Input() country: BehaviorSubject<Country>;


  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  subscription: any;
  settingsSource: any;

  //Control component logging to console
  doLog: boolean = false;


  modalRef: MDBModalRef;

  /*** mat-table start ***/

  // Data source used to control the table
  dataSource  = new MatTableDataSource<any>();

  /* Holds the column names to be displayed in the table.  In addition, the order in which the column names appear in this array
  determines the left to right column sequence in table
  Example - columnsToDisplay = ['Created','Title'];
  */
  columnsToDisplay: Array<string>;

  /* Holds information for each column in table.
  Example entry- {columnName: "Created", displayName: "Created Date", columnOrder: 1}
  */
  matTableCols: Array<any>;
  rawResults: Array<SourceResult>;

  // Fire off when row in table clicked
  onRowClicked(event: any, index: number) {
    if (!this.settings.disableModal) {
      console.log('Row clicked with event:', event);
      this.openTableItemDialog(index);
    }
  }

  // Used to filter rows based on user provided input
  doFilter(value: string): void  {
    // console.log('filtering on',value);
    this.dataSource.filter = value.trim();
  }

  /*** mat-table end ***/

  constructor(private dataLayerService: DataLayerService,
    private spRestService: SpRestService, private dialog: MatDialog, private modalService: MDBModalService) { }

  openTableItemDialog(index) {
    index = this.dataSource.paginator.pageSize * this.dataSource.paginator.pageIndex + index;
    const rawResult = this.rawResults[index];

    this.modalRef = this.modalService.show(IframeModalComponent, {
      class: 'modal-lg',
      data: {
        modalTitle: this.settings.modal && this.settings.modal.titleColumn ?
          rawResult.processedColumns[this.settings.modal.titleColumn] :
          rawResult.title,
        settings: {
          itemUrl$: rawResult.itemUrl$,
          downloadUrl$: rawResult.downloadUrl$,
          previewUrl$: rawResult.previewUrl$,
          fullScreenUrl$: rawResult.fullScreenUrl$,
          fileType: rawResult.fileType
        }
      }
    });
  }

   ngOnInit() {
    this.doLog = ConfigProvider.settings.debugLog;
    this.dataSource.paginator = this.paginator;
    this.settingsSource = new DataSource(this.settings.source);

    // Get columns to display
    this.matTableCols = this.settings.columns;

    this.doLog && console.log('generic-table.ts this.settings', this.settings);

    this.columnsToDisplay = this.matTableCols.map((columnEntry) => columnEntry.columnName );

    this.subscription = this.country.subscribe(selectedCountry => {
      this.loadTable(selectedCountry);
    });

   // this.data
  }

  loadTable(country) {
    // this.listItems = Array<any>();
    const listItems: Array<any> = Array<any>();
    this.dataLayerService.getItemsFromSource(this.settingsSource,
      country,
      this.settings.columns).subscribe({

      next: results => {

        this.rawResults = results;

        // Loop over raw results
        for (const result of results) {

          // Add formated object to list of items to be returned
         listItems.push(result.processedColumns);

         this.doLog && console.log('dataSource in generic-table.components is ', listItems);

        } // for

        // Update the table datasource info
        this.dataSource.data = listItems;

      } // next

    });
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;  // TODO: this should probably be done after each time country changes
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
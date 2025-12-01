import { Component, OnInit, OnDestroy } from '@angular/core';
import { takeUntil, Subject, Observable, map } from 'rxjs';
import { Person } from '../models/person';
import { PersonenlisteBereitstellenService } from '../services/personenliste-bereitstellen.service';
import { StammbaumBereitstellenService } from '../services/stammbaum-bereitstellen.service';
import { stammbaumGraph } from '../models/graph';


@Component({
  selector: 'app-uebersicht',
  standalone: false,
  templateUrl: './uebersicht.component.html',
  styleUrl: './uebersicht.component.css'
})
export class UebersichtComponent implements OnInit, OnDestroy {

  allePersonen: Person[] = [];
  stammbaumGraph$!: Observable<stammbaumGraph> |null;
  maxGeneration$!: Observable<number> | null;
  private destroy$ = new Subject<void>();

  constructor(private personenBereitstellen: PersonenlisteBereitstellenService,
              private stammbaumBereitstellenService: StammbaumBereitstellenService) { }

  getMaxGeneration(graph$: Observable<stammbaumGraph>): Observable<number> {
    return graph$.pipe(
    map(stammbaum => {
      if (!stammbaum || !stammbaum.graph || stammbaum.graph.length === 0) {
        return 0;
      }
      let maxGen: number = 0;
      
      for (const node of stammbaum.graph) {
        if (node.generation > maxGen) {
          maxGen = node.generation;
        }
      }
      return maxGen;
    })
  );
  }

  ngOnInit(): void {
    this.personenBereitstellen.getAllePersonen()
      .pipe(takeUntil(this.destroy$))
      .subscribe(personen => {
        this.allePersonen = personen;
      });
    this.stammbaumGraph$ = this.stammbaumBereitstellenService.getStammbaum();
    if (this.stammbaumGraph$) {
        this.maxGeneration$ = this.getMaxGeneration(this.stammbaumGraph$);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

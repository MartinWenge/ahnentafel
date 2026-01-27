import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject, map } from 'rxjs';
import { stammbaumGraph } from '../models/graph';
import { displayPersonInGraph } from '../models/display-person-in-graph';
import { StammbaumBereitstellenService } from '../services/stammbaum-bereitstellen.service';

@Component({
  selector: 'display-graph',
  standalone: false,
  templateUrl: './display-graph.component.html',
  styleUrl: './display-graph.component.css'
})
export class DisplayGraphComponent implements OnInit, OnDestroy {
  stammbaumGraph$!: Observable<stammbaumGraph> | null;
  displayPeople: displayPersonInGraph[] = [];
  maxGeneration$!: Observable<number> | null;
  private destroy$ = new Subject<void>();

  constructor(private stammbaumBereitstellenService: StammbaumBereitstellenService) { }

  readonly nodeWidth = 220;
  readonly rowHeight = 100;
  readonly horizontalGap = 40;
  svgWidth: number = 800;
  svgHeight: number = 400;

  ngOnInit(): void {
    this.stammbaumGraph$ = this.stammbaumBereitstellenService.getStammbaum();
    if (this.stammbaumGraph$) {
      this.maxGeneration$ = this.getMaxGeneration(this.stammbaumGraph$);
      this.stammbaumGraph$.pipe(
        map(data => this.transformAndLayout(data))
      ).subscribe(layoutedData => {
        this.displayPeople = layoutedData;
      });
    }

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

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
    )
  }

  private transformAndLayout(rawNodes: stammbaumGraph): displayPersonInGraph[] {
    const nodes: displayPersonInGraph[] = rawNodes.graph.map(graph => ({
      id: graph.id,
      name: graph.name,
      generation: graph.generation,
      parents: graph.vorgaenger || [],
      partnerIds: graph.partner || [],
      x: 0,
      y: 0
    }));

    const generations = [...new Set(nodes.map(n => n.generation))].sort((a, b) => a - b);

    generations.forEach(gen => {
      const nodesInGen = nodes.filter(n => n.generation === gen);
      let currentX = 50;

      nodesInGen.forEach((node, index) => {
        // Einfache Logik: Partner nacheinander platzieren
        node.y = (gen - Math.min(...generations)) * this.rowHeight + 50;
        node.x = currentX;

        currentX += this.nodeWidth + this.horizontalGap;
      });
    });

    const maxX = Math.max(...nodes.map(n => n.x || 0)) + this.nodeWidth + 50;
    const maxY = Math.max(...nodes.map(n => n.y || 0)) + this.rowHeight + 50;

    this.svgWidth = Math.max(800, maxX);
    this.svgHeight = Math.max(400, maxY);

    return nodes;
  }

  // Hilfsmethode für die Linien (Eltern zu Kind)
  getLines() {
    const lines: any[] = [];
    this.displayPeople.forEach(person => {
      person.parents.forEach(pId => {
        const parent = this.displayPeople.find(p => p.id === pId);
        if (parent) {
          lines.push({
            x1: parent.x + this.nodeWidth / 2,
            y1: parent.y + 40, // Unterkante Eltern
            x2: person.x + this.nodeWidth / 2,
            y2: person.y // Oberkante Kind
          });
        }
      });
    });
    return lines;
  }
}

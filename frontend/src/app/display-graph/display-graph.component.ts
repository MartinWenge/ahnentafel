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
  readonly horizontalGap = 50;
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
      name: graph.name.split(',')[0],
      birthday: graph.name.split(',')[1],
      generation: graph.generation,
      parents: graph.vorgaenger || [],
      partnerIds: graph.partner || [],
      x: 0,
      y: 0
    }));

    const generations = [...new Set(nodes.map(n => n.generation))].sort((a, b) => a - b);
    const placedIds = new Set<string>();

    generations.forEach(gen => {
      const nodesInGen = nodes.filter(n => n.generation === gen);
      let currentX = 50;

      nodesInGen.forEach((node, index) => {
        if (placedIds.has(node.id)) return;
        // y- Wert: nur abhängig von generation
        node.y = (gen - Math.min(...generations)) * this.rowHeight + 50;
        // x-Wert einfach hintereinander weg
        node.x = currentX;
        placedIds.add(node.id);

        // Partner: sofort daneben platzieren
        node.partnerIds.forEach(pId => {
          const partner = nodes.find(n => n.id === pId);
          if (partner && !placedIds.has(partner.id)) {
            currentX += this.nodeWidth + 10; // Kleinerer Abstand für Partner
            partner.y = node.y;
            partner.x = currentX;
            placedIds.add(partner.id);
          }
        });

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
    const processedFamilies = new Set<string>();

    this.displayPeople.forEach(child => {
      // Eindeutiger Schlüssel für die Elternkombination (z.B. "ID1,ID2" oder nur "ID1")
      const parentIds = child.parents.sort().join(',');
      if (!parentIds) return;

      if (!processedFamilies.has(parentIds)) {
        const parents = child.parents
          .map(id => this.displayPeople.find(p => p.id === id))
          .filter(p => !!p) as displayPersonInGraph[];

        const childrenOfThisCouple = this.displayPeople.filter(
          p => p.parents.sort().join(',') === parentIds
        );

        // --- BERECHNUNG DES ANKERPUNKTS ---
        // X ist der Durchschnitt der Eltern-Mitten
        const avgParentX = parents.reduce((sum, p) => sum + p.x, 0) / parents.length + this.nodeWidth / 2;
        // Y liegt genau zwischen der Eltern-Ebene und der Kinder-Ebene (z.B. 30px unter Eltern)
        const anchorY = parents[0].y + 40 + 20;

        // 1. Linien von allen Eltern zum Ankerpunkt
        parents.forEach(p => {
          lines.push({
            x1: p.x + this.nodeWidth / 2,
            y1: p.y + 40,
            x2: avgParentX,
            y2: anchorY,
            type: 'parent-link'
          });
        });

        // 2. Linien vom Ankerpunkt zu allen Kindern
        childrenOfThisCouple.forEach(c => {
          lines.push({
            x1: avgParentX,
            y1: anchorY,
            x2: c.x + this.nodeWidth / 2,
            y2: c.y,
            type: 'child-link'
          });
        });

        processedFamilies.add(parentIds);
      }
    });
    return lines;
  }
}

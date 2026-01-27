export interface stammbaumKnoten {
    id: string;
    generation: number;
    name: string;
    vorgaenger: string[];
    nachfolger: string[];
    partner: string[];
}

export interface stammbaumGraph {
    graph: stammbaumKnoten[];
}
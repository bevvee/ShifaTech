export interface BodyPart {
    id?: number | null;
    code: string;
    /** Répète le code section parent (API) — utile pour véifier qu’il n’y a pas de mélange. */
    section_code?: string;
    label: string;
    shape: 'path' | 'ellipse';
    coords: any; // { d: string } ou { cx, cy, rx, ry }
    is_clickable: boolean;
}

export interface BodySection {
    code: string;
    name: string;
    order: number;
    height: number;
    width: number;
    background_image: string;
    parts: BodyPart[];
}

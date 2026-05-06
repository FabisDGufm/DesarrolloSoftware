/** Metadatos de un espacio de ayuda (catálogo MVP en código). */
export interface HelpSpaceMeta {
    slug: string;
    title: string;
    description: string;
}

/** Mensaje dentro de un espacio (tabla Dynamo `Messages`, PK `SPACE#<slug>`). */
export interface HelpSpaceMessage {
    id: string;
    spaceSlug: string;
    fromUserId: number;
    text: string;
    createdAt: Date;
}

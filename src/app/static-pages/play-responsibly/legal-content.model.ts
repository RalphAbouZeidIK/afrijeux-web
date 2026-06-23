export interface LegalSection {
    id: string;
    title: string;
    paragraphs: string[];
}

export interface LegalPageContent {
    title: string;
    subtitle: string;
    sections: LegalSection[];
}

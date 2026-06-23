import { AfterViewInit, Component, HostListener, Input } from '@angular/core';
import { LegalPageContent } from '../legal-content.model';

@Component({
    selector: 'app-legal-page-content',
    standalone: false,
    templateUrl: './legal-page-content.component.html',
    styleUrl: './legal-page-content.component.scss'
})
export class LegalPageContentComponent {
    @Input() content!: LegalPageContent;

    activeSectionId = '';

    ngAfterViewInit(): void {
        if (this.content?.sections?.length) {
            this.activeSectionId = this.content.sections[0].id;
        }
        this.updateActiveSectionByScroll();
    }

    @HostListener('window:scroll')
    onWindowScroll(): void {
        this.updateActiveSectionByScroll();
    }

    setActiveSection(sectionId: string): void {
        this.activeSectionId = sectionId;
    }

    onTocClick(event: MouseEvent, sectionId: string): void {
        event.preventDefault();

        const element = document.getElementById(sectionId);
        if (!element) {
            return;
        }

        const headerOffset = 120;
        const elementTop = element.getBoundingClientRect().top + window.scrollY;
        const targetTop = Math.max(0, elementTop - headerOffset);

        this.activeSectionId = sectionId;
        window.scrollTo({ top: targetTop, behavior: 'smooth' });
    }

    private updateActiveSectionByScroll(): void {
        if (!this.content?.sections?.length) {
            return;
        }

        const offset = 180;
        let current = this.content.sections[0].id;

        for (const section of this.content.sections) {
            const element = document.getElementById(section.id);
            if (!element) {
                continue;
            }

            const top = element.getBoundingClientRect().top;
            if (top <= offset) {
                current = section.id;
            }
        }

        this.activeSectionId = current;
    }
}

import { Component } from '@angular/core';
import { ShowcaseItem } from './components/branding-showcase-block/branding-showcase-block.component';

interface ShowcaseSection {
    title: string;
    imageUrl: string;
    reverse: boolean;
    items: ShowcaseItem[];
}

interface BenefitCard {
    title: string;
    description: string;
    icon: 'customize' | 'quality' | 'lightning';
}

interface HeroContent {
    title: string;
    description: string;
    imageUrl: string;
    imageAlt: string;
}

@Component({
    selector: 'app-branded-products',
    standalone: false,
    templateUrl: './branded-products.component.html',
    styleUrls: ['./branded-products.component.scss']
})

export class BrandedProductsComponent {

    showContactUs = false

    readonly heroContent: HeroContent = {
        title: 'Branded Products & Customization',
        description: 'High-quality apparel and stationery tailored to your brand with flexible ordering, precise customization, and fast turnaround.',
        imageUrl: 'assets/images/products-hero.jpg',
        imageAlt: 'Branded Products fulfilment centre'
    };

    sections: ShowcaseSection[] = [
        {
            title: 'Branding',
            imageUrl: 'assets/images/branding-image-1.jpg',
            reverse: false,
            items: [
                { label: 'Caps', text: 'Branded caps with embroidered logo for everyday visibility and a polished team look.' },
                { label: 'T-Shirts', text: 'Premium branded T-shirts offering comfort and cohesive brand presence for staff and promotions.' },
                { label: 'Uniforms', text: 'Tailored corporate uniforms that ensure a professional, consistent brand identity and easy staff recognition.' }
            ]
        },
        {
            title: 'Customization',
            imageUrl: 'assets/images/branding-image-2.jpg',
            reverse: true,
            items: [
                { label: 'Custom Notebooks', text: 'Elegant notebooks with embossed logo for meetings, giveaways, and branded note-taking.' },
                { label: 'Premium Branded Pens', text: 'High-quality pens featuring the logo for a lasting, professional impression.' },
                { label: 'Stationary', text: 'Coordinated branded stationery (letterheads, envelopes) to reinforce brand identity in every correspondence.' }
            ]
        }
    ];

    benefits: BenefitCard[] = [
        {
            title: 'Customization Options',
            description: 'Choose embroidery, screen print, full-color transfer, placement, and Pantone-matched colors to match your brand exactly.',
            icon: 'customize'
        },
        {
            title: 'Quality & Materials:',
            description: 'Premium fabrics and finishes (breathable cotton, moisture-wicking blends, durable stitching, and high-grade paper/printing) for lasting, professional results.',
            icon: 'quality'
        },
        {
            title: 'Flexible Ordering & Fast Turnaround',
            description: 'Low-minimum runs, bulk discounts, mockup approval, and expedited production/shipping to meet campaign deadlines.',
            icon: 'lightning'
        }
    ];
}

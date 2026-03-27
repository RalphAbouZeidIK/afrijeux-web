import { Component } from '@angular/core';
import { LegalPageContent } from '../legal-content.model';

@Component({
    selector: 'app-privacy-policy',
    standalone: false,
    templateUrl: './privacy-policy.component.html'
})
export class PrivacyPolicyComponent {
    content: LegalPageContent = {
        title: 'Privacy Policy',
        subtitle: 'We respect your privacy and are committed to protecting your personal information, using it only to provide and improve our services in accordance with applicable data protection laws.',
        sections: [
            {
                id: 'information-we-collect',
                title: 'Information We Collect',
                paragraphs: [
                    'We collect information that you provide directly to us, including when you create an account, make a purchase, participate in our games, or communicate with us. This may include:',
                    'Personal identification information (name, email address, phone number)',
                    'Account credentials and profile information',
                    'Payment and transaction information',
                    'Gaming activity and preferences'
                ]
            },
            {
                id: 'how-we-use-your-information',
                title: 'How We Use Your Information',
                paragraphs: [
                    'We use the information we collect to:',
                    'Provide, maintain, and improve our services',
                    'Process transactions and send related information',
                    'Send you technical notices and support messages',
                    'Respond to your comments and questions',
                    'Monitor and analyze trends, usage, and activities'
                ]
            },
            {
                id: 'information-sharing',
                title: 'Information Sharing',
                paragraphs: [
                    'We do not sell, trade, or rent your personal information to third parties. We may share your information with service providers who assist us in operating our platform, conducting our business, or serving our users, as long as those parties agree to keep this information confidential.'
                ]
            },
            {
                id: 'data-security',
                title: 'Data Security',
                paragraphs: [
                    'We implement appropriate technical and organizational measures to protect your personal information against unauthorized or unlawful processing, accidental loss, destruction, or damage. However, no method of transmission over the Internet is 100% secure.'
                ]
            },
            {
                id: 'your-rights',
                title: 'Your Rights',
                paragraphs: [
                    'You have the right to:',
                    'Access and receive a copy of your personal data',
                    'Rectify inaccurate personal data',
                    'Request deletion of your personal data',
                    'Object to processing of your personal data',
                    'Request restriction of processing your personal data'
                ]
            },
            {
                id: 'contact-us',
                title: 'Contact Us',
                paragraphs: [
                    'If you have any questions about this Privacy Policy, please contact us at privacy@example.com'
                ]
            }
        ]
    };
}

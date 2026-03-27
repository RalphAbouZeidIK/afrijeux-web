import { Component } from '@angular/core';
import { LegalPageContent } from '../legal-content.model';

@Component({
    selector: 'app-terms-of-service',
    standalone: false,
    templateUrl: './terms-of-service.component.html'
})
export class TermsOfServiceComponent {
    content: LegalPageContent = {
        title: 'Terms of Service',
        subtitle: 'Last updated: March 26, 2026',
        sections: [
            {
                id: 'acceptance-of-terms',
                title: 'Acceptance of Terms',
                paragraphs: [
                    'By accessing and using this gaming platform, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use our service.'
                ]
            },
            {
                id: 'age-requirement',
                title: 'Age Requirement',
                paragraphs: [
                    'You must be at least 18 years old to use this service. By using this platform, you represent and warrant that you are of legal age to form a binding contract. We reserve the right to request proof of age at any time.'
                ]
            },
            {
                id: 'user-account',
                title: 'User Account',
                paragraphs: [
                    'When you create an account with us, you must provide accurate, complete, and current information. You are responsible for:',
                    'Maintaining the confidentiality of your account and password',
                    'All activities that occur under your account',
                    'Notifying us immediately of any unauthorized use'
                ]
            },
            {
                id: 'responsible-gaming',
                title: 'Responsible Gaming',
                paragraphs: [
                    'We are committed to promoting responsible gaming. You agree to play within your means and set appropriate limits. If you feel you may have a gambling problem, we encourage you to use our self-exclusion tools or seek professional help.'
                ]
            },
            {
                id: 'prohibited-activities',
                title: 'Prohibited Activities',
                paragraphs: [
                    'You agree not to:',
                    'Use the service for any illegal purpose',
                    'Attempt to gain unauthorized access to any portion of the service',
                    'Use any automated system to access the service',
                    'Interfere with or disrupt the service or servers',
                    'Engage in any form of cheating or collusion'
                ]
            },
            {
                id: 'payments-and-withdrawals',
                title: 'Payments and Withdrawals',
                paragraphs: [
                    'All deposits and withdrawals are subject to our payment policies. We reserve the right to request additional documentation before processing withdrawals. Processing times may vary depending on the payment method selected.'
                ]
            },
            {
                id: 'limitation-of-liability',
                title: 'Limitation of Liability',
                paragraphs: [
                    'We shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use the service. This includes any loss of profits, revenue, or data.'
                ]
            },
            {
                id: 'changes-to-terms',
                title: 'Changes to Terms',
                paragraphs: [
                    'We reserve the right to modify or replace these Terms at any time. We will provide notice of any material changes by posting the new Terms on this page. Your continued use of the service after any such changes constitutes your acceptance of the new Terms.'
                ]
            },
            {
                id: 'contact-information',
                title: 'Contact Information',
                paragraphs: [
                    'For questions about these Terms, please contact us at legal@example.com'
                ]
            }
        ]
    };
}

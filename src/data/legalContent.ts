export type LegalModalType = 'legal' | 'privacy' | 'cookies';

export interface LegalSection {
  title: string;
  paragraphs: string[];
}

export const LEGAL_CONTENT: Record<LegalModalType, LegalSection> = {
  legal: {
    title: 'Legal Notice',
    paragraphs: [
      'Config Security Audit is a demonstration tool built for portfolio purposes. It performs static analysis of configuration files entirely inside your browser.',
      'It is provided "as is", without warranty of any kind. No guarantee is made about the completeness or accuracy of the findings it reports, and it should not be treated as a substitute for a professional security review.',
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    paragraphs: [
      'This application does not collect, store, or transmit any personal data to a server. There is no backend: every file you drop or paste is analyzed locally in your browser and never leaves your device.',
      'The only information persisted is your last analysis result and your cookie-notice preference, both stored in your browser\'s local storage.',
    ],
  },
  cookies: {
    title: 'Cookie Policy',
    paragraphs: [
      'This site does not use tracking cookies, advertising cookies, or third-party analytics of any kind.',
      'It uses your browser\'s local storage — not cookies — to remember your last analysis result and whether you\'ve dismissed this notice. You can clear this at any time by clearing your browser\'s site data.',
    ],
  },
};

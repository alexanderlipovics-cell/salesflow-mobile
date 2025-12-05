export interface FollowUpTask {
  dayOffset: number;
  title: string;
  type: 'MESSAGE' | 'CALL';
  scriptContext: string;
}

export const CUSTOMER_LIFECYCLE: FollowUpTask[] = [
  { dayOffset: 3, title: 'Unboxing Support', type: 'MESSAGE', scriptContext: 'Paket sollte angekommen sein. Frage ob alles okay ist.' },
  { dayOffset: 14, title: 'Erste Ergebnisse', type: 'MESSAGE', scriptContext: 'Nach 2 Wochen erste Ergebnisse erfragen. Motivation aufbauen.' },
  { dayOffset: 30, title: 'Empfehlungsanfrage', type: 'CALL', scriptContext: 'Nach Empfehlungen fragen. Social Proof sammeln.' },
  { dayOffset: 60, title: 'Upsell Check', type: 'MESSAGE', scriptContext: 'Weitere Produkte vorstellen. Cross-Sell Möglichkeit.' },
  { dayOffset: 90, title: 'Reaktivierung', type: 'MESSAGE', scriptContext: 'Falls inaktiv: Reaktivieren. Nachbestellen anregen.' },
];


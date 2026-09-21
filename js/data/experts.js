/* Fundstore onboarding prototype · mock data for the Esperti section
   Keywords drive the filter chips; each expert's `tags` decide which keywords match them.
   Experts without a `photo` get an initials avatar. */
window.FS.data.KEYWORDS = ['Iniziare ad investire', 'Pianificazione Patrimoniale', 'Pensione', 'Non residente', 'Famiglia', 'Ottimizzazione Fiscale', 'Eredità', 'Budgeting e Risparmio'];

window.FS.data.EXPERTS = [
  { name: 'Alberto Mercati', first: 'Alberto', role: 'Consulente Finanziario · Firenze', photo: 'assets/images/experts/alberto-mercati.jpg', band: 'sky',
    quote: 'Mi specializzo in investitori che hanno costruito un buon patrimonio in autonomia e vogliono strutturarlo meglio per il lungo periodo',
    langs: 'Italiano, Inglese', focus: 'Pianificazione Patrimoniale, ELTIF', tags: ['Pianificazione Patrimoniale', 'Eredità'] },
  { name: 'Dr.ssa Monica Ferretti', first: 'Monica', role: 'Consulente Finanziario · Firenze', photo: 'assets/images/experts/monica-ferretti.jpg', band: 'sky',
    quote: 'Aiuto investitori ambiziosi a trasformare il risparmio regolare in un patrimonio solido. La costanza batte la fortuna, sempre.',
    langs: 'Italiano, Inglese, Francese', focus: 'Crescita capitale, PAC', tags: ['Iniziare ad investire', 'Budgeting e Risparmio', 'Non residente'] },
  { name: 'Carlo Ratti', first: 'Carlo', role: 'Financial Coach · Milano', photo: 'assets/images/experts/carlo-ratti.jpg', band: 'pearl',
    quote: 'Lavoro soprattutto con chi si avvicina agli investimenti per la prima volta o vuole capire meglio cosa ha già in portafoglio.',
    langs: 'Italiano', focus: 'Pianificazione Pensione, Famiglie', tags: ['Iniziare ad investire', 'Pensione', 'Famiglia'] },
  { name: 'Giulia Santoro', first: 'Giulia', role: 'Consulente Finanziario · Roma', band: 'sky',
    quote: 'Ogni euro risparmiato in tasse è un euro che lavora per te. Rendo la fiscalità semplice e su misura.',
    langs: 'Italiano, Spagnolo', focus: 'Ottimizzazione fiscale, PIR', tags: ['Ottimizzazione Fiscale', 'Pianificazione Patrimoniale'] },
  { name: 'Marco De Luca', first: 'Marco', role: 'Consulente Patrimoniale · Torino', band: 'sky',
    quote: 'Accompagno le famiglie nel passaggio generazionale, perché il patrimonio resti un valore condiviso nel tempo.',
    langs: 'Italiano, Inglese, Tedesco', focus: 'Passaggio generazionale, Gestioni', tags: ['Eredità', 'Famiglia', 'Pianificazione Patrimoniale'] },
  { name: 'Francesca Galli', first: 'Francesca', role: 'Financial Coach · Bologna', band: 'pearl',
    quote: 'Parto sempre dal bilancio di casa: piccoli passi costanti costruiscono grandi obiettivi.',
    langs: 'Italiano, Inglese', focus: 'Budget familiare, PAC', tags: ['Budgeting e Risparmio', 'Famiglia', 'Iniziare ad investire'] },
  { name: 'Luca Bernardi', first: 'Luca', role: 'Consulente Finanziario · Londra', band: 'sky',
    quote: 'Seguo gli italiani che vivono all’estero e vogliono continuare a investire con serenità, senza sorprese fiscali.',
    langs: 'Italiano, Inglese', focus: 'Non residenti, Fiscalità estera', tags: ['Non residente', 'Ottimizzazione Fiscale'] },
  { name: 'Sara Colombo', first: 'Sara', role: 'Consulente Previdenziale · Milano', band: 'pearl',
    quote: 'La pensione si costruisce oggi. Aiuto a colmare il divario previdenziale con un piano chiaro e sostenibile.',
    langs: 'Italiano, Francese', focus: 'Previdenza complementare, Risparmio', tags: ['Pensione', 'Budgeting e Risparmio'] },
  { name: 'Paolo Rinaldi', first: 'Paolo', role: 'Consulente Patrimoniale · Napoli', band: 'sky',
    quote: 'Per me la pianificazione è ascolto: capire le priorità di una famiglia prima di parlare di prodotti.',
    langs: 'Italiano, Inglese', focus: 'Successioni, Pensione', tags: ['Eredità', 'Pianificazione Patrimoniale', 'Pensione'] }
];

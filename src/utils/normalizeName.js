// utils/normalizeName.js
// Corrige nomes em MAIÚSCULAS sem acento para o padrão português brasileiro
// Sem dependências externas — puro JavaScript

// Preposições que ficam em minúsculo no meio do nome
const PREPOSICOES = new Set(['da', 'de', 'do', 'das', 'dos', 'e']);

// Dicionário de nomes comuns com acentuação correta
// Adicione mais nomes conforme sua base de dados exigir
const NOMES_ACENTUADOS = {
  // A
  'Abrao':      'Abrão',
  'Adao':       'Adão',
  'Adriano':    'Adriano',
  'Agnes':      'Agnès',
  'Airton':     'Airton',
  'Alanio':     'Alânio',
  'Aldemir':    'Aldemir',
  'Alessandra': 'Alessandra',
  'Alex':       'Alex',
  'Alexsandro': 'Alexsandro',
  'Alice':      'Alice',
  'Aline':      'Aline',
  'Altair':     'Altair',
  'Alvaro':     'Álvaro',
  'Amanda':     'Amanda',
  'Amelia':     'Amélia',
  'Ana':        'Ana',
  'Anderson':   'Anderson',
  'Andre':      'André',
  'Andrea':     'Andréa',
  'Andreia':    'Andréia',
  'Angelo':     'Ângelo',
  'Angela':     'Ângela',
  'Antonia':    'Antônia',
  'Antonio':    'Antônio',
  'Aparecida':  'Aparecida',
  'Ariadne':    'Ariadne',
  'Arthur':     'Arthur',
  'Augusto':    'Augusto',

  // B
  'Barbara':    'Bárbara',
  'Beatriz':    'Beatriz',
  'Benedito':   'Benedito',
  'Bruna':      'Bruna',
  'Bruno':      'Bruno',

  // C
  'Caio':       'Caio',
  'Camila':     'Camila',
  'Carlos':     'Carlos',
  'Carmen':     'Carmen',
  'Carolina':   'Carolina',
  'Celia':      'Célia',
  'Cesar':      'César',
  'Cicero':     'Cícero',
  'Claudia':    'Cláudia',
  'Claudio':    'Cláudio',
  'Cleiton':    'Cleiton',
  'Cleusa':     'Cleusa',
  'Cristiana':  'Cristiana',
  'Cristiane':  'Cristiane',
  'Cristiano':  'Cristiano',

  // D
  'Daniel':     'Daniel',
  'Daniela':    'Daniela',
  'Danilo':     'Danilo',
  'Davi':       'Davi',
  'David':      'David',
  'Debora':     'Débora',
  'Denis':      'Denis',
  'Diego':      'Diego',

  // E
  'Eder':       'Éder',
  'Edson':      'Edson',
  'Eduardo':    'Eduardo',
  'Elaine':     'Elaine',
  'Elias':      'Elias',
  'Elisangela': 'Elisângela',
  'Elvis':      'Elvis',
  'Emilia':     'Emília',
  'Erick':      'Erick',
  'Erik':       'Erik',

  // F
  'Fabiana':    'Fabiana',
  'Fabiano':    'Fabiano',
  'Fabio':      'Fábio',
  'Felipe':     'Felipe',
  'Fernanda':   'Fernanda',
  'Fernando':   'Fernando',
  'Flavia':     'Flávia',
  'Flavio':     'Flávio',
  'Francisco':  'Francisco',

  // G
  'Gabriel':    'Gabriel',
  'Gabriela':   'Gabriela',
  'Gilberto':   'Gilberto',
  'Gilmar':     'Gilmar',
  'Giovana':    'Giovana',
  'Giovanna':   'Giovanna',
  'Gisele':     'Gisele',
  'Gustavo':    'Gustavo',

  // H
  'Helio':      'Hélio',
  'Henrique':   'Henrique',
  'Hugo':       'Hugo',

  // I
  'Igor':       'Igor',
  'Inacia':     'Inácia',
  'Inacio':     'Inácio',
  'Inaia':      'Inaía',
  'Ines':       'Inês',
  'Ione':       'Ione',
  'Irene':      'Irene',
  'Isabel':     'Isabel',
  'Isabela':    'Isabela',
  'Isabelle':   'Isabelle',
  'Isadora':    'Isadora',

  // J
  'Janaina':    'Janaína',
  'Jaqueline':  'Jaqueline',
  'Jessica':    'Jéssica',
  'Joao':       'João',
  'Jonas':      'Jonas',
  'Jonathan':   'Jonathan',
  'Jorge':      'Jorge',
  'Jose':       'José',
  'Josiane':    'Josiane',
  'Juliana':    'Juliana',
  'Juliano':    'Juliano',
  'Julio':      'Júlio',

  // K
  'Karen':      'Karen',
  'Karina':     'Karina',
  'Katia':      'Kátia',
  'Kelly':      'Kelly',

  // L
  'Larissa':    'Larissa',
  'Laura':      'Laura',
  'Leandro':    'Leandro',
  'Leonardo':   'Leonardo',
  'Leticia':    'Letícia',
  'Lidia':      'Lídia',
  'Lidiane':    'Lidiane',
  'Luan':       'Luan',
  'Luana':      'Luana',
  'Lucas':      'Lucas',
  'Lucia':      'Lúcia',
  'Luciana':    'Luciana',
  'Luciano':    'Luciano',
  'Luis':       'Luís',
  'Luisa':      'Luísa',
  'Luiz':       'Luiz',
  'Luiza':      'Luíza',

  // M
  'Marcela':    'Marcela',
  'Marcelo':    'Marcelo',
  'Marcia':     'Márcia',
  'Marcio':     'Márcio',
  'Marco':      'Marco',
  'Marcos':     'Marcos',
  'Maria':      'Maria',
  'Mariana':    'Mariana',
  'Marina':     'Marina',
  'Mario':      'Mário',
  'Marisa':     'Marisa',
  'Mateus':     'Mateus',
  'Matheus':    'Matheus',
  'Mauricio':   'Maurício',
  'Mauro':      'Mauro',
  'Mayara':     'Mayara',
  'Mayko':      'Mayko',
  'Miguel':     'Miguel',
  'Monica':     'Mônica',

  // N
  'Natalia':    'Natália',
  'Nathalia':   'Nathália',
  'Nelson':     'Nelson',
  'Nicolas':    'Nicolas',
  'Nicole':     'Nicole',

  // O
  'Odair':      'Odair',
  'Olivia':     'Olívia',
  'Orlando':    'Orlando',
  'Oscar':      'Oscar',
  'Otavio':     'Otávio',

  // P
  'Paola':      'Paola',
  'Paolla':     'Paolla',
  'Patricia':   'Patrícia',
  'Paulo':      'Paulo',
  'Pedro':      'Pedro',
  'Pricila':    'Prícila',
  'Priscila':   'Priscila',

  // R
  'Rafael':     'Rafael',
  'Rafaela':    'Rafaela',
  'Raquel':     'Raquel',
  'Reginaldo':  'Reginaldo',
  'Renata':     'Renata',
  'Renato':     'Renato',
  'Ricardo':    'Ricardo',
  'Roberto':    'Roberto',
  'Rodrigo':    'Rodrigo',
  'Rogerio':    'Rogério',
  'Rosa':       'Rosa',
  'Rosana':     'Rosana',
  'Rosangela':  'Rosângela',
  'Rosario':    'Rosário',

  // S
  'Samuel':     'Samuel',
  'Sandra':     'Sandra',
  'Sergio':     'Sérgio',
  'Silvia':     'Sílvia',
  'Silvio':     'Sílvio',
  'Simone':     'Simone',
  'Solange':    'Solange',

  // T
  'Tamara':     'Tamara',
  'Tatiana':    'Tatiana',
  'Thiago':     'Thiago',
  'Tiago':      'Tiago',

  // V
  'Vagner':     'Vagner',
  'Valeria':    'Valéria',
  'Valerio':    'Valério',
  'Vanessa':    'Vanessa',
  'Victor':     'Victor',
  'Vinicius':   'Vinícius',
  'Vitor':      'Vitor',
  'Vitoria':    'Vitória',

  // W
  'Wagner':     'Wagner',
  'Wanderson':  'Wanderson',
  'Wellington': 'Wellington',
  'William':    'William',

  // Z
  'Zelia':      'Zélia',
};

/**
 * Normaliza um nome para o padrão do português brasileiro.
 * - Converte MAIÚSCULAS para Title Case
 * - Corrige acentuação com base no dicionário
 * - Mantém preposições (da, de, do...) em minúsculo
 *
 * @param {string} name - Nome bruto (ex: "JOAO PAULO", "vinicius wieck carneiro")
 * @returns {string} - Nome normalizado (ex: "João Paulo", "Vinícius Wieck Carneiro")
 */
function normalizeName(name) {
  if (!name || typeof name !== 'string') return '';

  return name
    .trim()
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((word, index) => {
      // Preposições no meio do nome ficam minúsculas
      if (index > 0 && PREPOSICOES.has(word)) return word;

      // Capitaliza a primeira letra
      const capitalized = word.charAt(0).toUpperCase() + word.slice(1);

      // Busca no dicionário (sem acento como chave)
      return NOMES_ACENTUADOS[capitalized] ?? capitalized;
    })
    .join(' ');
}

module.exports = { normalizeName };

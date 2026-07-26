import type { Exercise } from '../types/exercise'

export const exercises: Exercise[] = [
  {
    id: 'agachamento-livre',
    name: 'Agachamento livre',
    muscle: 'Quadríceps e glúteos',
    equipment: 'Barra',
    description:
      'Exercício composto para pernas, com forte participação dos quadríceps, glúteos e músculos estabilizadores.',
    instructions: [
      'Mantenha os pés aproximadamente na largura dos ombros.',
      'Desça mantendo o tronco firme e os joelhos alinhados aos pés.',
      'Empurre o chão para retornar à posição inicial.',
    ],
  },
  {
    id: 'leg-press-45',
    name: 'Leg press 45°',
    muscle: 'Quadríceps',
    equipment: 'Máquina',
    description:
      'Movimento de empurrar a plataforma utilizando principalmente os quadríceps e glúteos.',
    instructions: [
      'Mantenha as costas totalmente apoiadas.',
      'Desça a plataforma de maneira controlada.',
      'Evite travar completamente os joelhos ao estender as pernas.',
    ],
  },
  {
    id: 'cadeira-extensora',
    name: 'Cadeira extensora',
    muscle: 'Quadríceps',
    equipment: 'Máquina',
    description:
      'Exercício isolado para extensão dos joelhos e trabalho dos quadríceps.',
    instructions: [
      'Ajuste o encosto para manter as costas apoiadas.',
      'Posicione o apoio acima dos tornozelos.',
      'Estenda os joelhos sem movimentar o quadril.',
    ],
  },
  {
    id: 'mesa-flexora',
    name: 'Mesa flexora',
    muscle: 'Posterior de coxa',
    equipment: 'Máquina',
    description:
      'Exercício isolado para flexão dos joelhos e trabalho da região posterior das coxas.',
    instructions: [
      'Mantenha o quadril apoiado durante todo o movimento.',
      'Flexione os joelhos de maneira controlada.',
      'Retorne lentamente à posição inicial.',
    ],
  },
  {
    id: 'supino-reto',
    name: 'Supino reto',
    muscle: 'Peitoral',
    equipment: 'Barra',
    description:
      'Exercício composto para peitoral, com participação dos tríceps e ombros.',
    instructions: [
      'Mantenha as escápulas apoiadas e levemente retraídas.',
      'Desça a barra em direção à região média do peito.',
      'Empurre a barra mantendo os punhos alinhados.',
    ],
  },
  {
    id: 'supino-inclinado-halteres',
    name: 'Supino inclinado com halteres',
    muscle: 'Peitoral superior',
    equipment: 'Halteres',
    description:
      'Variação do supino com maior ênfase na região superior do peitoral.',
    instructions: [
      'Ajuste o banco em uma inclinação moderada.',
      'Mantenha os pés firmes no chão.',
      'Empurre os halteres sem bater um contra o outro.',
    ],
  },
  {
    id: 'puxada-alta',
    name: 'Puxada alta',
    muscle: 'Costas',
    equipment: 'Máquina',
    description:
      'Exercício de puxada vertical para trabalhar principalmente os músculos das costas.',
    instructions: [
      'Mantenha o peito elevado e o tronco estável.',
      'Puxe a barra em direção à parte superior do peito.',
      'Retorne controlando a subida da carga.',
    ],
  },
  {
    id: 'remada-baixa',
    name: 'Remada baixa',
    muscle: 'Costas',
    equipment: 'Máquina',
    description:
      'Movimento de puxada horizontal para dorsais, romboides e região média das costas.',
    instructions: [
      'Mantenha a coluna neutra.',
      'Puxe o pegador em direção ao abdômen.',
      'Evite balançar excessivamente o tronco.',
    ],
  },
  {
    id: 'rosca-direta',
    name: 'Rosca direta',
    muscle: 'Bíceps',
    equipment: 'Barra',
    description:
      'Exercício de flexão dos cotovelos para trabalho direto dos bíceps.',
    instructions: [
      'Mantenha os cotovelos próximos ao corpo.',
      'Evite usar o balanço do tronco.',
      'Desça a barra de maneira controlada.',
    ],
  },
  {
    id: 'elevacao-lateral',
    name: 'Elevação lateral',
    muscle: 'Ombros',
    equipment: 'Halteres',
    description:
      'Exercício para a região lateral dos ombros, realizado com elevação dos braços.',
    instructions: [
      'Mantenha uma pequena flexão nos cotovelos.',
      'Eleve os braços até aproximadamente a linha dos ombros.',
      'Controle a descida dos halteres.',
    ],
  },
]
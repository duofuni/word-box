import {
  createRouter,
  createWebHistory
} from 'vue-router'
import Home from '../views/Home.vue'
import WordFlashcard from '../views/WordFlashcard.vue'
import WordMemory from '../views/WordMemory.vue'
import WordLink from '../views/WordLink.vue'
import WordSpot from '../views/WordSpot.vue'
import WordQuiz from '../views/WordQuiz.vue'
import WordEliminate from '../views/WordEliminate.vue'

const routes = [{
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/word-flashcard',
    name: 'WordFlashcard',
    component: WordFlashcard
  },
  {
    path: '/word-memory',
    name: 'WordMemory',
    component: WordMemory
  },
  {
    path: '/word-link',
    name: 'WordLink',
    component: WordLink
  },
  {
    path: '/word-spot',
    name: 'WordSpot',
    component: WordSpot
  },
  {
    path: '/word-quiz',
    name: 'WordQuiz',
    component: WordQuiz
  },
  {
    path: '/word-eliminate',
    name: 'WordEliminate',
    component: WordEliminate
  },

]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
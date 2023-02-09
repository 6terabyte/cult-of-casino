import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

import Home from '@/views/Home.vue';
import Roulette from '@/views/game/Roulette.vue';
import Blackjack from '@/views/game/Blackjack.vue';
import NotFound from '@/views/NotFound.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: Home,
  },
  {
    path: '/game/roulette',
    name: 'Roulette',
    component: Roulette,
  },
  {
    path: '/game/blackjack',
    name: 'Blackjack',
    component: Blackjack,
  },
  { path: '/:catchAll(.*)', name: 'NotFound', component: NotFound },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;

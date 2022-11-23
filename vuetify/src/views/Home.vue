<template>
  <div :id="$style.home" class="home">
    <h1>WHELCOME TO THE CULT OF CASINO-R</h1>
    <v-row>
      <v-col cols="3"></v-col>
      <a v-for="game of games" :key="game.title" :href="game.url">
        <v-col cols="3">
          <h3>{{ game.title }}</h3>
        </v-col>
      </a>
      <v-col cols="3"></v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from 'vue';

export default defineComponent({
  name: 'Home',
  setup() {
    const games = reactive([
      { title: 'roulette', url: '/roulette' },
      { title: 'poker', url: '/poker' },
    ]);
    return {
      games,
    };
  },
  components: {},
});
</script>

<style module>
#home {
  text-align: center;
}
</style>
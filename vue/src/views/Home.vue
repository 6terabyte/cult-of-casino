<template>
  <div class="home">
    <h1>WELCOME TO THE CULT OF CASION-R</h1>
    <el-row>
      <el-col v-for="game of gameList" :key="game.name">
        <router-link tag="div" :to="game.link">{{ game.name }}</router-link>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from 'vue';
import { GameList } from '../constants/constant';
export default defineComponent({
  async setup() {
    const gameList = reactive({ ...GameList });
    return {
      gameList,
    };
  },
});
</script>

<style lang="scss" module></style>

<template>
  <div :id="$style.all">
    <el-page-header title="casion-R" :icon="null">
      <template #content>
        <router-link tag="div" to="/">top</router-link>
        <router-link tag="div" to="/game/roulette">Roulette</router-link>
        <router-link tag="div" to="/game/blackjack">Blackjack</router-link>
        <a href="/game/roulette">a-roulette</a>
      </template>
      <template #extra>
        <router-link tag="div" to="/user/login">ログイン</router-link>
      </template>
    </el-page-header>

    <Suspense>
      <router-view></router-view>
    </Suspense>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();

export default defineComponent({
  setup() {
    const goTop = () => {
      alert('gotop');
      router.push('/home');
    };
    return {
      goTop,
    };
  },
});
</script>

<style lang="scss" module>
@use '@/constants/color';

body {
  position: relative;
  height: 100%;
  width: 100%;
  background-color: color.$BACKGROUND_COLOR;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>

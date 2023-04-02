<template>
  <div :id="$style.parent" :class="$style[card.color]">
    <div :id="$style.children">
      {{ card.str }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { Trump } from '@/../../@types/type';

export default defineComponent({
  props: {
    card: {
      type: Object as PropType<Trump>,
      required: true,
    },
  },
});
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" module>
#parent {
  position: relative;
  width: 100px;
  height: 200px;
  background-color: white;
  font-size: 25px;
  text-align: center;
}
#children {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translateY(-50%) translateX(-50%);
}

.red {
  color: red;
}
.black {
  color: black;
}
</style>

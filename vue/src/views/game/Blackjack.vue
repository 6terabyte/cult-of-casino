<template>
  <div>
    <div>
      <p>dealer</p>
      <div :class="$style.card_area">
        <TrumpFront v-for="card of state.dealer" :key="card.str" :card="card" />
      </div>
    </div>
    <el-row>
      <el-col :span="3">{{ state.step }} {{ state.displayTime }} </el-col>
      <el-col :span="3">
        nowTurn: {{ state.nowTurn }}
        {{ state.turnNum !== -1 ? 'YourTurn:' + state.turnNum : '[watching]' }}
      </el-col>
      <el-col :span="6">
        Dealer
        {{ state.status.dealer.number }}
        {{ state.status.dealer.blackjack ? '[NaturalBlackJack]' : '' }}
        {{ state.status.dealer.burst ? '[burst]' : '' }}
      </el-col>
      <el-col :span="6">
        You
        {{ state.status.your.number }}
        {{ state.status.your.blackjack ? '[NaturalBlackJack]' : '' }}
        {{ state.status.your.burst ? '[burst]' : '' }}
      </el-col>
      <el-col :span="6">
        Next exit
        <el-switch
          v-model="state.nextGameJoin"
          @change="nextGameJoin"
        ></el-switch>
        join
      </el-col>
    </el-row>
    <el-button @click="hit">hit</el-button>
    <el-button @click="stand">stand</el-button>
    <el-row>
      <el-col :span="4">
        <span v-if="state.memberData[0]">
          {{ state.memberData[0].userName }}
        </span>
      </el-col>
      <el-col :span="4">
        <span v-if="state.memberData[1]">
          {{ state.memberData[1].userName }}
        </span>
      </el-col>
      <el-col :span="8" v-if="state.turnNum !== -1">You</el-col>
      <el-col :span="8" v-if="state.turnNum === -1">
        <span v-if="state.memberData[4]">
          {{ state.memberData[4].userName }}
        </span>
      </el-col>
      <el-col :span="4">
        <span v-if="state.memberData[2]">
          {{ state.memberData[2].userName }}
        </span>
      </el-col>
      <el-col :span="4">
        <span v-if="state.memberData[3]">
          {{ state.memberData[3].userName }}
        </span>
      </el-col>
    </el-row>
    <el-row :id="$style.handArea">
      <el-col :span="4">
        <div
          v-if="state.memberData[0]"
          :id="$style.member1"
          :class="$style.card_area"
        >
          <TrumpFront
            v-for="card of state.memberData[0].handCard"
            :key="card.str"
            :card="card"
            :class="$style.member_card"
          />
        </div>
      </el-col>
      <el-col :span="4">
        <div
          v-if="state.memberData[1]"
          :id="$style.member2"
          :class="$style.card_area"
        >
          <TrumpFront
            v-for="card of state.memberData[1].handCard"
            :key="card.str"
            :card="card"
            :class="$style.member_card"
          />
        </div>
      </el-col>
      <el-col
        v-if="state.turnNum !== -1"
        :span="8"
        :id="$style.myHand"
        :class="$style.card_area"
      >
        <TrumpFront
          v-for="card of state.handCard"
          :key="card.str"
          :card="card"
        />
      </el-col>
      <el-col
        v-if="state.turnNum === -1"
        :span="8"
        :id="$style.myHand"
      >
        <span v-if="state.memberData[4]" :class="$style.card_area">
          <TrumpFront
            v-for="card of state.memberData[4].handCard"
            :key="card.str"
            :card="card"
          />
        </span>
      </el-col>

      <el-col :span="4">
        <div
          v-if="state.memberData[2]"
          :id="$style.member3"
          :class="$style.card_area"
        >
          <TrumpFront
            v-for="card of state.memberData[2].handCard"
            :key="card.str"
            :card="card"
            :class="$style.member_card"
          />
        </div>
      </el-col>
      <el-col :span="4">
        <div
          :id="$style.member4"
          :class="$style.card_area"
          v-if="state.memberData[3]"
        >
          <TrumpFront
            v-for="card of state.memberData[3].handCard"
            :key="card.str"
            :card="card"
            :class="$style.member_card"
          />
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import { io } from 'socket.io-client';
import { Trump } from '@/../../@types/type';
import { GameResult } from '@/../../src/games/blackjack/bj_modules';
import TrumpFront from '@/components/TrumpFront.vue';
import * as notification from '@/components/notification';

export default defineComponent({
  components: {
    TrumpFront,
  },
  //beforeRouteLeave(to, from, next) {
  //
  //  next();
  //},
  async setup() {
    const state = reactive<{
      handCard: Trump[];
      dealer: Trump[];
      hitTurn: boolean;
      timeout: number;
      displayTime: number;
      status: {
        your: GameResult;
        dealer: GameResult;
      };
      nextGameJoin: boolean;
      step: string;
      memberData: { userName: string; handCard: Trump[] }[];
      turnNum: number;
      nowTurn: number;
    }>({
      handCard: [],
      dealer: [],
      hitTurn: false,
      timeout: 0,
      displayTime: 0,
      status: {
        your: {
          number: 0,
          blackjack: false,
          burst: false,
        },
        dealer: {
          number: 0,
          blackjack: false,
          burst: false,
        },
      },
      nextGameJoin: true,
      step: 'step',
      memberData: [],
      turnNum: 0,
      nowTurn: 0,
    });

    const socket = io('/');
    socket.on('connect', async () => {
      await socket.emit(
        'init',
        JSON.stringify({
          userId: 'dumyId',
          game: 'blackjack',
        })
      );

      socket.emit('blackjack', JSON.stringify({ type: 'join' }));

      socket.on('table_change', (message) => {
        const data = JSON.parse(message);
        state.handCard = data.yourCard;
        state.dealer = data.dealer;
        state.timeout = data.timeout;
        state.status = data.status;
        state.step = data.step;
        state.memberData = data.memberData;
        state.turnNum = data.turnNum;
        state.nowTurn = data.nowTurn;
      });

      socket.on('your_hit_turn', () => {
        notification.info({
          title: 'あなたのターンです',
          message: 'ヒットとスタンドをしてください',
        });
        state.hitTurn = true;
      });

      socket.on('your_stand', (message) => {
        const data = JSON.parse(message);
        notification.info({
          title: 'スタンドしました。',
          message: `あなたの数字は${data.result.number}
        ${data.result.blackjack ? '、ナチュラルブラックジャックです' : ''}
        ${data.result.burst ? '、バーストです' : ''}。`,
        });
        state.hitTurn = true;
      });

      socket.on('result', (message) => {
        const data = JSON.parse(message);
        notification.info({ title: data.title, message: data.result });
      });

      socket.on('error', (message) => {
        const data = JSON.parse(message);
        notification.error({ title: data.title, message: data.message });
      });
    });

    const hit = () => {
      socket.emit('blackjack', JSON.stringify({ type: 'hit' }));
    };
    const stand = () => {
      socket.emit('blackjack', JSON.stringify({ type: 'stand' }));
      state.hitTurn = false;
    };

    const nextGameJoin = () => {
      socket.emit(
        'blackjack',
        JSON.stringify({
          type: 'next_game_join',
          join: state.nextGameJoin,
        })
      );
    };

    setInterval(() => {
      const time =
        Math.floor((state.timeout - new Date().getTime()) / 100) / 10;
      state.displayTime = 0 < time ? time : 0;
    }, 100);

    onBeforeRouteLeave(() => {
      socket.disconnect();
    });

    return {
      state,
      hit,
      stand,
      nextGameJoin,
    };
  },
});
</script>

<style lang="scss" module>
.card_area {
  position: relative;
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
}

#handArea {
  margin-top: 100px;
}
#member1 {
  transform: rotate(90deg);
}
#member2 {
  transform: rotate(45deg) translate(75px, 100px);
}
#myHand {
  transform: translate(0, 100px);
}
#member3 {
  transform: rotate(-45deg) translate(-75px, 100px);
}
#member4 {
  transform: rotate(-90deg);
}

.member_card {
  transform: scale(0.7);
  margin-left: -20px;
}
</style>

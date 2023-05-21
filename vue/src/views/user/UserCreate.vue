<template>
  <div class="home">
    <div :id="$style.userCreateParent">
      <el-row>
        <el-col :span="6"> 名前 </el-col>
        <el-col :span="18">
          <el-input v-model="userData.name" placeholder="なまえ"></el-input>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="6"> スクリーンネーム </el-col>
        <el-col :span="18">
          <el-input
            v-model="userData.screenName"
            placeholder="@screenName"
            :formatter="(value: string) => `$ ${value}`.replace(/\W/g, '')"
          ></el-input>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="6"> メールアドレス </el-col>
        <el-col :span="18">
          <el-input
            v-model="userData.email"
            placeholder="mail@example.com"
            :formatter="(value: string) => `${value}`.replace(/[^@|\w|\.|\-]/g, '')"
          ></el-input>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="6"> パスワード </el-col>
        <el-col :span="18">
          <el-input
            v-model="userData.password"
            type="password"
            placeholder="password"
            :formatter="(value: string) => `$ ${value}`.replace(/\W/g, '')"
          ></el-input>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="6"> パスワード(確認) </el-col>
        <el-col :span="18">
          <el-input
            v-model="userData.passwordCheck"
            type="password"
            placeholder="password(再入力)"
            :formatter="(value: string) => `$ ${value}`.replace(/\W/g, '')"
          ></el-input>
        </el-col>
      </el-row>
      <el-button @click="create"> アカウントを作成 </el-button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from 'vue';
import * as notification from '@/components/notification';
import { addUser } from '@/api/user';

export default defineComponent({
  name: 'UserCreate',
  async setup() {
    const userData = reactive({
      name: '',
      screenName: '',
      email: '',
      password: '',
      passwordCheck: '',
    });
    const create = async () => {
      const res = await addUser({
        name: userData.name,
        screenName: userData.screenName,
        email: userData.email,
        pass: userData.password,
      });
      if (res) {
        notification.success({
          title: '成功',
          message: 'アカウントが作成されました メールを確認してください',
        });
        setTimeout(() => {
          location.href = '/';
        }, 3000);
      } else {
        notification.error({
          title: 'エラー',
          message: 'アカウント作成に失敗しました',
        });
      }
    };
    return {
      userData,
      create,
    };
  },
});
</script>

<style lang="scss" module>
#userCreateParent {
  margin: 0 auto;
  width: 70%;
  text-align: center;
  padding: 20px;
}

@media screen and (max-width: 700px) {
  #userCreateParent {
    width: 100%;
  }
}
</style>

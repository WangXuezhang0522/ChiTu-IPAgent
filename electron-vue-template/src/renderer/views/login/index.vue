<template>
  <div class="content">
    <div class="left">
      <img src="./asset/img2.png" class="people p-animtion" alt="people" />
      <img src="./asset/img1.png" class="sphere s-animtion" alt="sphere" />
    </div>
    <div class="right">
      <div class="top"></div>
      <div class="form-wrappepr" ref="loginFormRef"> 
        <h1 class="logo-name">赤兔IP代理助手</h1>

        <input name="username" type="text" class="inputs user" 
          v-model="loginForm.username"
           autocomplete="on" placeholder="请输入账号" />
        <input name="password" class="inputs pwd" 
          type="password "
          @keyup.enter="handleLogin" 
          v-model="loginForm.password"
          autocomplete="on" placeholder="请输入密码" />

        <button @click="handleLogin">登录</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from "@/store/user";
import { ref,onMounted } from "vue";
import { useRouter } from "@/hooks/use-router";

const { login } = useUserStore();

const loginForm = ref({
  username: localStorage.getItem("username") || "",
  password: localStorage.getItem("password") || "",
});

const router = useRouter();

const handleLogin = () => {
  //将用户名,密码放入到localstorage中
  localStorage.setItem("username", loginForm.value.username);
  localStorage.setItem("password", loginForm.value.password);
  //设置一个登录状态
  sessionStorage.setItem("isLogin", true);
  console.log("loginForm");
  //跳转到首页
  login(loginForm.value).then(() => {
        
        router.push({ path: "/" }).catch((err) => { });
      }).catch(() => { 
        
      })
};

onMounted(() => {
  document.querySelector(".people").addEventListener('animationend', function () {
    this.classList.remove('p-animtion');
    this.classList.add('p-other-animtion')
  });
  document.querySelector(".sphere").addEventListener('animationend', function () {
    this.classList.remove('s-animtion');
    this.classList.add('s-other-animtion')
  });
});
</script>

<style lang="scss" scoped>
@import "login_style.css";
.logo-name {
  font-weight: bold; 
  background: linear-gradient(to right, rgb(70, 130, 233), rgb(240, 99, 191)); 
  -webkit-background-clip: text; 
  background-clip: text; 
  -webkit-text-fill-color: transparent; 
  display: inline-block; 
}
</style> 

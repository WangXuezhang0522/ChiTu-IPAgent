import Router from 'vue-router'
// import Layout from '@/layout'
// 引入路由表
import asyncRouterMap from './constantRouterMap'




export const constantRouterMap = [
  //   {
  //   path: '/',
  //   component: Layout,
  //   redirect: '/dashboard',
  //   name: '主页',
  //   hidden: true,
  //   children: [{
  //     path: 'dashboard',
  //     name: '总览',
  //     component: () => import('@/components/LandingPage')
  //   }]
  // }, 
  {
    path: '/',
    component: () => import('@/views/home'),
    // hidden: true// 隐藏路由
  },
  {
    path: '/login',
    component: () => import('@/views/login'),
    hidden: true
  }, {
    path: '*',
    component: () => import('@/views/404'),
    hidden: true
  }]
export const asyncRoutes = asyncRouterMap

const createRouter = () => new Router({
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRouterMap
})

export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher
}
const router = createRouter()
//判断localStorage中是否有Username,没有则跳转到登录页面有则跳转到主页
router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
      if (!isAuthenticated()) {
          next({
              path: '/Login',
              query: { redirect: to.fullPath }
          });
      } else {
          next();
      }
  } else {
      next();
 
      
  }
});

function isAuthenticated() {
  //从session中获取登录状态
  return sessionStorage.getItem('isLogin') === 'true';
}



export default router

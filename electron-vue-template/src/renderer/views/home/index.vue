<template>
  <div class="content">
    <div class="Hleft">
      <!-- <el-button class="reload-btn">刷新</el-button> -->
      <el-table
        :data="tableData"
        style="width: 100%; height: 100%; border-radius: 2%"
        height="720"
      >
        <el-table-column label="网点名称" width="300">
          <template slot-scope="scope">
            <i class="el-icon-box"></i>
            <span style="margin-left: 10px">{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="直连设备" width="300">
          <template slot-scope="scope">
            <div slot="reference" class="name-wrapper">
              <el-tag size="medium">{{ scope.row.equipment }}</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button size="mini" @click="openBrowser(scope.row)"
              >打开</el-button
            >
          </template>
        </el-table-column>
        <el-table-column align="right">
          <template slot="header">
            <el-button
              @click="reloadData"
              icon="el-icon-refresh-right"
              size="small"
              circle
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="Hright">
      <div class="Hright-top">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>公告</span>
          </div>
          <div>
            <p>{{ announcement }}</p>
          </div>
        </el-card>
      </div>
      <div class="Hright-senter">
        <div class="Chrome-box">
          <span>chrome:</span>
          <!-- <el-tag v-if="isChromeInstalled"> 已安装</el-tag>

          <el-tooltip v-else content="请先安装chrome浏览器" placement="top">
            <el-tag type="danger" @click="openChrome" style="cursor: pointer"
              >去安装</el-tag
            >
          </el-tooltip> -->
          <transition name="fade" mode="out-in">
            <div :key="isChromeInstalled">
              <el-tag v-if="isChromeInstalled">已安装</el-tag>
              <el-tooltip v-else content="请先安装chrome浏览器" placement="top">
                <el-tag
                  type="danger"
                  @click="openChrome"
                  style="cursor: pointer"
                  >去安装</el-tag
                >
              </el-tooltip>
            </div>
          </transition>
        </div>
        <div class="Chrome-box">
          <span>组网服务:</span>
          <transition name="fade" mode="out-in">
            <div :key="isXedgeInstalled">
              <el-tooltip
                content="xedge组网服务已安装"
                v-if="isXedgeInstalled"
                placement="top"
              >
                <el-tag type="success">正常</el-tag>
              </el-tooltip>
              <el-tooltip
                content="请先安装并登录xedge组网服务"
                v-else
                placement="top"
              >
                <el-tag type="danger" @click="openXedge" style="cursor: pointer"
                  >去安装</el-tag
                >
              </el-tooltip>
            </div>
          </transition>
        </div>
      </div>
      <div class="chrome-exec-path">
        <el-tooltip
          content="右键点击Chrome图标-> 选择“属性”->查看“目标”字段，获取可执行路径"
          placement="top"
        >
          <span style="color: rgba(0, 0, 0, 0.7)">chrome执行路径:</span>
        </el-tooltip>
        <el-input v-model="chromeExecPath"></el-input>
      </div>
      <div class="Hright-bottom">
        <!-- 当前账号 -->
        <div class="user_tag">
          <span>当前账号:</span>
          <el-tag>{{ username }}</el-tag>
        </div>
        <el-button type="danger" size="small" round plain @click="handleLogout"
          >退出登录</el-button
        >
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import router from "../../router";
import { ipcRenderer } from "electron";

const tableData = ref([
  {
    name: "重庆渝北",
    equipment: "重庆 杨家坪[100.64.0.2]",
    network_name_dir: "ykf001",
    proxy: "100.64.0.1",
  },
  {
    name: "重庆渝中",
    equipment: "设备2",
    network_name_dir: "ykf002",
    proxy: "100.64.0.1",
  },
  {
    name: "重庆巴南",
    equipment: "设备3",
    network_name_dir: "ykf003",
    proxy: "100.64.0.1",
  },
  {
    name: "重庆江北",
    equipment: "设备4",
    network_name_dir: "ykf004",
    proxy: "100.64.0.1",
  },
  {
    name: "重庆江北",
    equipment: "设备4",
    network_name_dir: "ykf004",
    proxy: "100.64.0.1",
  },
  {
    name: "重庆江北",
    equipment: "设备4",
    network_name_dir: "ykf004",
    proxy: "100.64.0.1",
  },
  {
    name: "重庆江北",
    equipment: "设备4",
    network_name_dir: "ykf004",
    proxy: "100.64.0.1",
  },
  {
    name: "重庆江北",
    equipment: "设备4",
    network_name_dir: "ykf004",
    proxy: "100.64.0.1",
  },
  {
    name: "重庆江北",
    equipment: "设备4",
    network_name_dir: "ykf004",
    proxy: "100.64.0.1",
  },
  {
    name: "重庆江北",
    equipment: "设备4",
    network_name_dir: "ykf004",
    proxy: "100.64.0.1",
  },
  {
    name: "重庆江北",
    equipment: "设备5",
    network_name_dir: "ykf004",
    proxy: "100.64.0.1",
  },
]);

const chromeExecPath = ref(
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
);
const announcement = ref("暂无公告");

const handleEdit = (index, row) => {
  console.log(index, row);
};
//刷新数据
const reloadData = () => {
  //重新获取数据
  console.log("reloadData");
};

// const username = localStorage.getItem("username");
const username = "优客服001";

// 退出登录
const handleLogout = () => {
  localStorage.removeItem("username");
  localStorage.removeItem("password");
  sessionStorage.removeItem("isLogin");
  router.go({ path: "login" }).catch((err) => {
    console.log("/login is err", err);
  });
};
//在页面加载时就判断Chrome是否安装,这是一个异步函数
const checkChromeInstalled = async () => {
  try {
    const isInstalled = await ipcRenderer.invoke("is-chrome-installed");
    console.log("Chrome 是否安装:", isInstalled);
    return isInstalled;
  } catch (error) {
    console.error("检查 Chrome 安装状态时出错:", error);
    return false; // 出错时假设未安装
  }
};
//判断xedge是否安装is-xedge-installed
const checkXedgeInstalled = async () => {
  try {
    const isInstalled = await ipcRenderer.invoke("is-xedge-installed");
    console.log("xedge 是否安装:", isInstalled);
    return isInstalled;
  } catch (error) {
    console.error("检查 xedge 安装状态时出错:", error);
    return false; // 出错时假设未安装
  }
};
//判断是否安装
const isXedgeInstalled = ref(false);
const isChromeInstalled = ref(false);
onMounted(async () => {
  isChromeInstalled.value = await checkChromeInstalled();
  isXedgeInstalled.value = await checkXedgeInstalled();
});

// 打开浏览器
const openBrowser = (row) => {
  console.log("openBrowser", row);
  let sendData = {
    ...row,
    chromeExecPath: chromeExecPath.value,
  };
  ipcRenderer.invoke("open-browser", sendData).then((res) => {
    console.log(res);
  });
};

// 打开xedge安装地址
const openXedge = () => {
  ipcRenderer.invoke("open-xedge").then((res) => {
    console.log(res);
  });
};

// 打开chrome安装地址
const openChrome = () => {
  ipcRenderer.invoke("open-chrome").then((res) => {
    console.log(res);
  });
};
</script>


<style lang='scss' scoped>
.Hleft {
  width: 70%;
  height: 100%;
  // border: 1px solid #000;
}
.Hright {
  width: 30%;
  margin-left: 10px;

  // border: 1px solid #000;
}
.Hright-top {
  height: 70%;
  // border: 1px solid #000;
}
.Hright-senter {
  height: 10%;
  // border: 1px solid #000;
  // margin-top: 5px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  color: rgba(0, 0, 0, 0.6);
}
.chrome-exec-path {
  height: 10%;
  width: 87%;
  margin-left: 22px;
}
.Hright-bottom {
  height: 10%;
  // margin-top: 5px;
  // border: 1px solid #000;
  display: flex;
  justify-content: space-around;
  align-items: center;
  color: rgba(0, 0, 0, 0.6);
}
.clearfix {
  text-align: center;
}
.box-card {
  height: 100%;
}
.reload-btn {
  float: left;
}
.Chrome-box {
  display: flex;
  justify-content: space-around;
  align-items: center;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active in <2.1.8 */ {
  opacity: 0;
}
</style>
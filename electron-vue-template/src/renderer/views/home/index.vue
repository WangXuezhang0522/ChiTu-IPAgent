<template>
  <div class="content">
    <div class="Hleft">
      <el-table
        :data="tableData"
        style="width: 100%; height: 100%; border-radius: 2%"
        height="720"
      >
        <el-table-column label="网点名称" width="300">
          <template slot-scope="scope">
            <i class="el-icon-box"></i>
            <span style="margin-left: 10px">{{ scope.row.network_name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="直连设备" width="300">
          <template slot-scope="scope">
            <div slot="reference" class="name-wrapper">
              <el-tag size="medium">{{ scope.row.device_name }}</el-tag>
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
          <span>Chrome:</span>
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
        <el-tooltip content="当前设备MAC地址" placement="top">
          <span style="color: rgba(0, 0, 0, 0.7); font-size: small"
            >MAC地址:</span
          >
        </el-tooltip>
        <transition name="fade" mode="out-in">
          <el-input
            v-model="macAdd"
            :disabled="true"
            style="width: 60%"
          ></el-input>
        </transition>
        <el-tooltip content="复制MAC地址" placement="top">
          <el-button
            type="primary"
            size="mini"
            icon="el-icon-document-copy"
            circle
            @click="copyMacAdd"
          ></el-button>
        </el-tooltip>
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
import { getNotice } from "../../api/getNotice";
import { getAccountAgentBind } from "../../api/getAccountAgentBind";

const tableData = ref([
  {
    network_name: "重庆渝北",
    device_id: "重庆 杨家坪[100.64.0.2]",
    account_name: "ykf001",
    proxy: "100.64.0.1",
  },
]);

const getTableData = async () => {
  try {
    const requestData = { MacID: macAdd.value };
    const res = await getAccountAgentBind(requestData);
    console.log("获取数据成功:", res.data.data);
    // 检查返回的数据是否是对象
    if (res.data && typeof res.data.data === 'object') {
      // 将对象转换为数组
      const dataObject = res.data.data.data;
      const device_name = res.data.data.device_name;
      tableData.value = [{
        network_name: dataObject.network_name,
        device_name: device_name , // 根据需要格式化
        account_name: dataObject.account_name,
        proxy: dataObject.network_code,
      }];
    } else {
      console.warn("返回的数据格式不正确");
      tableData.value = []; // 如果格式不正确，设置为空数组
    }
  } catch (error) {
    console.error("获取数据失败:", error);
    tableData.value = []; // 处理错误时也设置为空数组
  }
}; 

const macAdd = ref("00-00-00-00-00-00");
//点击复制mac地址
const copyMacAdd = () => {
  //copyMac
  ipcRenderer.invoke("copyMac", macAdd.value).then((res) => {
    console.log(res);
  });
};

const announcement = ref("暂无公告");
//刷新数据
const reloadData = () => {
  //重新获取数据
  try {
    getTableData();
    console.log("刷新数据成功");
  } catch (error) {
    console.error("刷新数据失败:", error);
  }
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
  macAdd.value = await ipcRenderer.invoke("getMac");
  // 获取数据
  try {
    getTableData();
  } catch (error) {
    console.error("获取数据失败:", error);
  }
  // 获取公告
  try {
    const res = await getNotice();
    announcement.value = res.data.data;
  } catch (error) {
    console.error("获取公告失败:", error);
  }
});

// 打开浏览器
const openBrowser = (row) => {
  
  let sendData = {
    ...row,
    // chromeExecPath: chromeExecPath.value,
  };
  console.log("sendData", sendData);
  ipcRenderer.invoke("open-browser", sendData).then((res) => {
    console.log("res",res);
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
  width: 80%;
  margin-left: 30px;
  display: flex;
  justify-content: space-around;
  align-items: center;
}
.Hright-bottom {
  height: 10%;
  margin-top: -15px;
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
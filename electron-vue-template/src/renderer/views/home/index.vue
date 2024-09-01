<template>
  <div class="content">
    <div class="Hleft">
      <el-table
        :data="tableData"
        style="width: 100%; height: 100%; border-radius: 2%"
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
        <div>
          <span>设备总量:</span>
          <el-tag> {{ requimentTotal }}</el-tag>
        </div>
        <div>
          <span>账号总量:</span>
          <el-tag>{{ userRequiment }}</el-tag>
        </div>
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
import { ref } from "vue";
import router from "../../router";
import {ipcRenderer} from "electron";

const tableData = ref([
  {
    name: "重庆渝北",
    equipment: "重庆 杨家坪[100.64.0.2]",
    username: "ykf001",

  },
  {
    name: "重庆渝中",
    equipment: "设备2",
    username: "ykf002",
  },
  {
    name: "重庆巴南",
    equipment: "设备3",
    username: "ykf003",
  },
  {
    name: "重庆江北",
    equipment: "设备4",
    username: "ykf004",
  },
]);

const requimentTotal = ref(100);
const userRequiment = ref(100);
const announcement = ref("暂无公告");

const handleEdit = (index, row) => {
  console.log(index, row);
};


// const username = localStorage.getItem("username");
const username = "优客服001";

// 退出登录
const handleLogout = () => {
  localStorage.removeItem("username");
  localStorage.removeItem("password");
  sessionStorage.removeItem("isLogin");
  router.go({ path: "login" }).catch((err) => {
    console.log('/login is err',err);
  });
};

const openBrowser = (row) => {
  console.log("openBrowser",row);
  let sendData={
    userDir:row.username,
    // cmd:"start chrome --proxy-server=\"socks5://100.64.0.43:1080\" --user-data-dir=\"D:\\chitu\\user1\" \"https://wd.jtexpress.com.cn/\" \"https://tool.lu/ip/\"\n",
    // cmd:"start chrome  \"https://wd.jtexpress.com.cn/\" \"https://tool.lu/ip/\" ",
  }
  ipcRenderer.invoke("open-browser",sendData).then((res) => {
    console.log(res)
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
  height: 15%;
  // border: 1px solid #000;
  margin-top: 5px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  color: rgba(0,0,0,.6);
}
.Hright-bottom {
  height: 13%;
  margin-top: 5px;
  // border: 1px solid #000;
  display: flex;
  justify-content: space-around;
  align-items: center;
  color: rgba(0,0,0,.6);
}
.clearfix {
  text-align: center;
}
.box-card {
  height: 100%;
}
</style>
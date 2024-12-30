const crypto = require("crypto");
const axios = require("axios");

// 接口地址
const API_URL = "http://127.0.0.1:40000";

// API ID
const API_ID = "1572895413944462";

// API Key
const API_KEY = "b25c05220ba0435cbcc809db201c174a";

/**
 * 计算字符串的 MD5 哈希值
 * @param {string} data - 要计算哈希的字符串
 * @returns {string} - 计算后的 MD5 哈希值
 */
function getMD5(data) {
  return crypto.createHash("md5").update(data, "utf8").digest("hex");
}

/**
 * 获取全局唯一 ID
 * @returns {string}
 */
function getNonceId() {
  const timestamp = Date.now();
  const randomUuid = crypto.randomUUID();
  return `${timestamp}:${randomUuid}`;
}

function start() {
  // 全局唯一 ID
  const nonceId = getNonceId();

  // Header 信息
  const headers = {
    "Content-Type": "application/json",
    "X-Api-Id": API_ID,
    "X-Nonce-Id": nonceId,
    Authorization: getMD5(API_ID + nonceId + API_KEY),
  };

  // 发送数据
  const data = { envId: "1844724498201485312" };

  axios
    .post(`${API_URL}/api/env/start`, data, { headers })
    .then((response) => {
      console.log("Response:", response.data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

start();

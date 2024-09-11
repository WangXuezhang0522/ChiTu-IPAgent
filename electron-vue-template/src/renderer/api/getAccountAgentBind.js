import request from '@/utils/request'

export function getAccountAgentBind(data) {
    return request({
        url: '/api/agent/getAccountAgentBind',
        method: 'post',
        // 使用 data 字段来传递请求体
        data: data, // 这里将传递的 data 作为请求体
        // 如果需要设置 Content-Type，可以在 headers 中指定
        headers: {
            'Content-Type': 'application/json' // 确保使用 JSON 格式
        }
    })
}

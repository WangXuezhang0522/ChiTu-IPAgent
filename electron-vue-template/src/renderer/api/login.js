// 仅示例
import request from '@/utils/request'
export function toLogin (data) {
  return request({
    url: '/api/agent/login',
    method: 'post',
    data
  })
}

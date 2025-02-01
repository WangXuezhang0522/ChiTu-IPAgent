import request from '@/utils/request'
export function addUseLog (data) {
  return request({
    url: '/api/agent/saveUseLog',
    method: 'post',
    data
  })
}
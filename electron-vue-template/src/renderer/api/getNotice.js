import request from '@/utils/request'
// api/agent/getNotice

export function getNotice () {
    return request({
        url: '/api/agent/getNotice',
        method: 'post'
    })
}
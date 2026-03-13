import { request } from '@/services/http'

export type UserLoginVO = {
  id: number
  avatar: string
  username: string
  nickname: string
  roles: string[]
  permissions: string[]
  accessToken: string
  refreshToken: string
  expires: number
  curCompanyId: number
  companyList: Array<any>
}

export function wechatLogin(code: string) {
  return request<UserLoginVO>({ url: 'wechat/login', data: { code } })
}

export function wechatBind(code: string, username: string, password: string) {
  return request<UserLoginVO>({ url: 'wechat/bind', data: { code, username, password } })
}

export function passwordLogin(username: string, password: string) {
  return request<UserLoginVO>({ url: 'login', data: { username, password } })
}

export function smsLogin(phone: string, verifyCode: string) {
  return request<UserLoginVO>({ url: 'login/sms', data: { phone, verifyCode } })
}

export function sendSmsCode(phone: string, captcha: string) {
  return request<boolean>({ url: `login/sms/send?phone=${phone}&captcha=${captcha}`, method: 'POST', data: {} })
}

export function resetPassword(phone: string, verifyCode: string, password: string) {
  return request<boolean>({ url: 'login/update', data: { phone, verifyCode, password } })
}

export function getCurrentUser() {
  return request<UserLoginVO>({ url: 'login/current', method: 'POST', data: {} })
}

export function switchCompany(companyId: number) {
  return request<UserLoginVO>({ url: 'switchCompany', method: 'POST', data: { companyId } })
}

export type UserProfileUpdateDTO = {
  avatar?: string
  nickname?: string
  gender?: number
  birthday?: string
  remark?: string
}

export function getUserProfile() {
  return request<UserProfileUpdateDTO>({ url: 'login/profile/get', method: 'POST', data: {} })
}

export function updateUserProfile(data: UserProfileUpdateDTO) {
  return request<boolean>({ url: 'login/profile/update', method: 'POST', data })
}

export function updateAccountPassword(data: { oldPassword: string; newPassword: string }) {
  return request<boolean>({ url: 'account/password/update', method: 'POST', data })
}

export function sendAccountOldPhoneSms() {
  return request<boolean>({ url: 'account/phone/old/sms/send', method: 'POST', data: {} })
}

export function sendAccountNewPhoneSms(data: { phone: string }) {
  return request<boolean>({ url: 'account/phone/new/sms/send', method: 'POST', data })
}

export function updateAccountPhone(data: { oldVerifyCode: string; newPhone: string; newVerifyCode: string }) {
  return request<boolean>({ url: 'account/phone/update', method: 'POST', data })
}

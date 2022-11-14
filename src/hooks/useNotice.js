import React, { useState, useEffect, useRef } from 'react'
import axios from "axios"
const { remote } = window.require('electron')
const { Menu, MenuItem } = remote
const Store = window.require('electron-store')
const userStore = new Store({ name: 'userStore' })
// 通知

var baseUrl = process.env.REACT_APP_BASE_URL
var notice = () => {
  let option = {
    title: "消息通知",
    body: "electron消息通知弹出"
  }
  const myNotification = new window.Notification(option.title, option)
  myNotification.onclick = () => {
    console.log('aaassaa')
  }
}

const getData = (url) => {
  
    const user = userStore.get('user')
    console.log('aaaa----')
    console.log(user)
    axios({
      url,
      data: {  },
      method: 'POST',
      responseType: 'stream',
      headers: { 'Session-Id': user.token }
    }).then(response => {
      console.log(response)

    }).catch(err => {
    //  message.info(err.message)
    })
}

setInterval(() => {

}, 3000)

const useNotice = (url) => {

}

export default useNotice
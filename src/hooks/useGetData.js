import React, { useState, useEffect, useRef } from 'react'
import { Button, message } from 'antd'
import axios from "axios"
const { remote } = window.require('electron')
const { Menu, MenuItem } = remote
const Store = window.require('electron-store')
const userStore = new Store({ name: 'userStore' })
// 通知

var baseUrl = process.env.REACT_APP_BASE_URL


const useGetData = (setReq, req,  active,canscroll,setCanscroll) => {

  const [rows, setRows] = useState([])
  const user = userStore.get('user')
  // let url = baseUrl + "/api/merchant/message/order"
  const status = ''


  useEffect(() => {

    if(!canscroll || req.pageNo === 0){
      console.log('太心急了')
      return;
    }
    setCanscroll(false)

    console.log('active-req--', req)
    let url = baseUrl + "/api/merchant/message/price"
    switch (active) {
      case 1:
        url = baseUrl + "/api/merchant/message/price"
        break;
      case 2:
        url = baseUrl + "/api/merchant/message/goods"
        break;
      case 3:
        url = baseUrl + "/api/merchant/message/order"
        break;
      case 4:
        url = baseUrl + "/api/merchant/message/other"
        break;

    }
    axios({
      url,
      data: { ...req },
      method: 'POST',
      responseType: 'stream',
      headers: { 'Session-Id': user.token }
    }).then(response => {
      console.log(response)

      if (response.data.resultCode != "00000") {
        message.info(response.data.returnMsg)
      } else {
        //response.data.data.time = new Date().getTime()
        //setRows(response.data.data.rows)
        if(response.data.data.rows.length > 0) {

          console.log('push add rows....',response.data.data.rows)
          response.data.data.rows.forEach(x=>{rows.push(x)})
          const ttt=rows
          setRows(ttt)
          setCanscroll(true)
        }
      }

    }).catch(err => {
      message.info(err.message)
    })

  },[req])
  useEffect(() => {

    console.log('active---', active)

    const reqq = {pageSize:10,pageNo:0}
    setReq(reqq)
    console.log('initreq',req)
    const rowwww=[]
    setRows(rowwww)
    console.log('rowww',rows)
    setCanscroll(true)


    let url = baseUrl + "/api/merchant/message/price"
    switch (active) {
      case 1:
        url = baseUrl + "/api/merchant/message/price"
        break;
      case 2:
        url = baseUrl + "/api/merchant/message/goods"
        break;
      case 3:
        url = baseUrl + "/api/merchant/message/order"
        break;
      case 4:
        url = baseUrl + "/api/merchant/message/other"
        break;

    }
    axios({
      url,
      data: { pageNo:0,pageSize:10 },
      method: 'POST',
      responseType: 'stream',
      headers: { 'Session-Id': user.token }
    }).then(response => {
      console.log(response)
      console.log('active请求后',req)
      if (response.data.resultCode != "00000") {
        message.info(response.data.returnMsg)
      } else {
        //response.data.data.time = new Date().getTime()
        //setRows(response.data.data.rows)
        console.log('active-rows',response.data.data.rows)
        setRows(response.data.data.rows)
      }

    }).catch(err => {
      message.info(err.message)
    })


  }, [active])

  return {
    rows:rows,
  }

}

export default useGetData
import React, { useState, useEffect, useRef } from 'react'
import axios from "axios"
import { BrowserRouter as Router, useNavigate, Route, Navigator, useLocation, Routes, Link } from 'react-router-dom'
import { Button, message } from 'antd'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { faMarkdown } from '@fortawesome/free-brands-svg-icons'
import PropTypes from 'prop-types'
import "../css/indexContent/one.scss"
const Store = window.require('electron-store')
const userStore = new Store({ name: 'userStore' })
var baseUrl = "https://api-vbox.jpqapro.com"


//const navigate=useNavigate();
//navigate("/test");

const Notice = ({ rows }) => {
  const dataParam = useLocation()
  console.log(dataParam.state)
  const [editStatus, setEditStatus] = useState(false)
  const [active, setActive] = useState(1)
  const [req, setReq] = useState({ pageNo: 0, pageSize: 10 })
  const [value, setValue] = useState('')
  let node = useRef(null)
  console.log('--9999999999')
  // 通知
  const notice = () => {
    let option = {
      title: "消息通知",
      body: "electron消息通知弹出"
    }
    const myNotification = new window.Notification(option.title, option)
    myNotification.onclick = () => {
      console.log('aaassaa')
    }
  }
//  notice()

  return (
    <div class="row-content bd-highlight">
      <div class="attention">
        *数据来自第三方仅供参考
      </div>
      {rows.map((item, key) => (
        <div class="wrapper">
          <div class="one-item">
            <div class="content-img">
              <img src="images/t1.png" />
            </div>
            <div class="content-text">
              <div class="title">{item.title}</div>
              <div class="price">最新价格：{item.price}€</div>
              <div class="article">
                {item.code}
              </div>
            </div>
            <div class="content-bigimg">
              <img src={item.photo} />
            </div>
          </div>
        </div>
      ))
      }
    </div>
  )
}

Notice.propTypes = {
  rows: PropTypes.array,
}

export default Notice
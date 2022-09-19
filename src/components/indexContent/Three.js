import React, { useState, useEffect, useRef } from 'react'
import axios from "axios"
import { BrowserRouter as Router, useNavigate, Route, Navigator, useLocation, Routes, Link } from 'react-router-dom'
import { Button, message } from 'antd'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { faMarkdown } from '@fortawesome/free-brands-svg-icons'
import PropTypes from 'prop-types'
import "../css/indexContent/three.scss"
const Store = window.require('electron-store')
const userStore = new Store({ name: 'userStore' })
var baseUrl = "https://api-vbox.jpqapro.com"


//const navigate=useNavigate();
//navigate("/test");
const Four = ({ rows}) => {
  const dataParam = useLocation()
  console.log(dataParam.state)
  const [editStatus, setEditStatus] = useState(false)
  const [active, setActive] = useState(1)
  const [req, setReq] = useState({ pageNo: 0, pageSize: 10 })
  const [value, setValue] = useState('')
  let node = useRef(null)

  return (
    <div class="row-content bd-highlight">
      {rows.map((item,key)=> (
        <div class="wrapper">
          <div class="three-item">
            <div class="content-img">
              <img src="images/t2.png" />
            </div>
            <div class="content-text">
              <div class="title">新订单通知 </div>
              <div class="price">
                <div class="price1">
                  €{item.money}
                </div>
                <div class="price2">
                  共{item.count}件商品
                </div>
              </div>

              <div class="article">
                No：{item.orderNo}
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

Four.propTypes = {
  rows: PropTypes.array,
}

export default Four
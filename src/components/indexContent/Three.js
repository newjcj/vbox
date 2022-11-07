import React, { useState, useEffect, useRef } from 'react'
import axios from "axios"
import { BrowserRouter as Router, useNavigate, Route, Navigator, useLocation, Routes, Link } from 'react-router-dom'
import { findDOMNode } from 'react-dom';
import { Button, message } from 'antd'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { faMarkdown } from '@fortawesome/free-brands-svg-icons'
import PropTypes from 'prop-types'
import "../css/indexContent/three.scss"
import useGetData from '../../hooks/useGetData'
const Store = window.require('electron-store')
const userStore = new Store({ name: 'userStore' })
var baseUrl = "https://api-vbox.jpqapro.com"



//const navigate=useNavigate();
//navigate("/test");
const Three = ({ rows,fun,req,setReq,canscroll,setCanscroll}) => {

  const sss = useRef(null)
  const dataParam = useLocation()
  console.log(dataParam.state)


  const [editStatus, setEditStatus] = useState(false)
  const [value, setValue] = useState('')



  const onScroll = (e) => {
    let divEl = e.target
    
    if (divEl.scrollTop + divEl.clientHeight+1 > divEl.scrollHeight && canscroll) {
    console.log("--999 ")

      //setReq({...req,pageNo:req.pageNo+1})
      req = {...req,pageNo:req.pageNo+1}
      setReq(req)
    }else{
      console.log("哈哈-----")
    }
  }

  useEffect(() => {

    console.log('9999')
    sss.current.addEventListener("scroll", onScroll)
  }, [sss.current])

  return (
    <div class="row-content bd-highlight" id="three-wrapper" ref={sss}>
      {rows.map((item, key) => (
        <div class="wrapper" key={key}>
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

Three.propTypes = {
  rows: PropTypes.array,
}

export default Three
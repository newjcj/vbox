import React, { useState, useEffect, useRef } from 'react'
import axios from "axios"
import { BrowserRouter as Router, useNavigate, Route, Navigator, useLocation, Routes, Link } from 'react-router-dom'
import { Button, message } from 'antd'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { faMarkdown } from '@fortawesome/free-brands-svg-icons'
import PropTypes from 'prop-types'
import useKeyPress from '../hooks/useKeyPress'
import useContextMenu from '../hooks/useContextMenu'
import { getParentNode } from '../utils/helper'
import "./css/JcjIndex.scss"
const Store = window.require('electron-store')
const userStore = new Store({name: 'userStore'})
var baseUrl = "https://api-vbox.jpqapro.com"


//const navigate=useNavigate();
//navigate("/test");
const Index = ({ files, onFileClick, onSaveEdit, onFileDelete }) => {
  const dataParam = useLocation()
  console.log(dataParam.state)
  const [editStatus, setEditStatus] = useState(false)
  const [active, setActive] = useState(1)
  const [value, setValue] = useState('')
  let node = useRef(null)
  const enterPressed = useKeyPress(13)
  const escPressed = useKeyPress(27)
  const closeSearch = (editItem) => {
    setEditStatus(false)
    setValue('')
    // if we are editing a newly created file, we should delete this file when pressing esc
    if (editItem.isNew) {
      onFileDelete(editItem.id)
    }
  }
  const getData = (index) => {
    console.log(index)
    let url = baseUrl + "/api/merchant/message/price"
    const user = userStore.get('user')
    console.log(22222222222)
    console.log(user)
   axios({
        url,
        data:{},
        method: 'POST',
        responseType: 'stream',
        headers: {'Session-Id': user.token}
      }).then(response => {
        console.log(response)

        if(response.data.resultCode != "00000"){
          message.info(response.data.returnMsg)
        }else{
          response.data.data.time = new Date().getTime()
        }

    }).catch(err => {
          message.info(err.message)
    })
  }
  const selectItem = (index) => {
    console.log("aaaa----", index)
    setActive(index)
  }
  const clickedItem = useContextMenu([
    {
      label: '打开',
      click: () => {
        const parentElement = getParentNode(clickedItem.current, 'file-item')
        if (parentElement) {
          onFileClick(parentElement.dataset.id)
        }
      }
    },
    {
      label: '重命名',
      click: () => {
        const parentElement = getParentNode(clickedItem.current, 'file-item')
        if (parentElement) {
          const { id, title } = parentElement.dataset
          setEditStatus(id)
          setValue(title)
        }
      }
    },
    {
      label: '删除',
      click: () => {
        const parentElement = getParentNode(clickedItem.current, 'file-item')
        if (parentElement) {
          onFileDelete(parentElement.dataset.id)
        }
      }
    },
  ], '.file-list', [files])

  useEffect(() => {
    const editItem = files.find(file => file.id === editStatus)
    if (enterPressed && editStatus && value.trim() !== '') {
      onSaveEdit(editItem.id, value, editItem.isNew)
      setEditStatus(false)
      setValue('')
    }
    if (escPressed && editStatus) {
      closeSearch(editItem)
    }
  })
  useEffect(() => {
    const newFile = files.find(file => file.isNew)
    if (newFile) {
      setEditStatus(newFile.id)
      setValue(newFile.title)
    }
  }, [files])
  useEffect(() => {
    console.log("设置了active")
    console.log(active)
    getData(active)
  }, [active])
  return (
    <div class="main1">
      <div class="row content-index">
        <div class="col-md-12 navigate-index">
          <div class="row-top">
            <div class="nav text">应用工具</div>
            <div class="nav actionsico">∧</div>
          </div>
          <div class="row-nav d-flex flex-row bd-highlight">
            <div class="item">
              <div class="wrap-jcj">
                <div class="image">
                  <img src="images/1.png" />
                </div>
                <div class="text">扫码查价</div>
              </div>
            </div>
            <div class="item">
              <div class="wrap-jcj">
                <div class="image">
                  <img src="images/2.png" />
                </div>
                <div class="text">线上店铺</div>
              </div>
            </div>
            <div class="item">
              <div class="wrap-jcj">
                <div class="image">
                  <img src="images/3.png" />
                </div>
                <div class="text">更多服务</div>
              </div>
            </div>
            <div class="item">
              <div class="wrap-jcj">
                <div class="image">
                  <img src="images/4.png" />
                </div>
                <div class="text">系统设置</div>
              </div>
            </div>
          </div>
          <div class="row-nav d-flex flex-row bd-highlight check">
            <div class="item">
              <div class="wrap-jcj">
                <div class="image">
                </div>
                <div class="text" onClick={() => { selectItem(1) }}>价格提醒</div>
                <div className={`${active}` == 1 ? 'line active' : 'line'}></div>
              </div>
            </div>
            <div class="item">
              <div class="wrap-jcj">
                <div class="image">
                </div>
                <div class="text" onClick={() => { selectItem(2) }} >特价商品</div>
                <div className={`${active}` == 2 ? 'line active' : 'line'}></div>
              </div>
            </div>
            <div class="item">
              <div class="wrap-jcj">
                <div class="image">
                </div>
                <div class="text" onClick={() => { selectItem(3) }} >订单通知</div>
                <div className={`${active}` == 3 ? 'line active' : 'line'}></div>
              </div>
            </div>
            <div class="item">
              <div class="wrap-jcj">
                <div class="image">
                </div>
                <div class="text" onClick={() => { selectItem(4) }} >其它</div>
                <div className={`${active}` == 4 ? 'line active' : 'line'}></div>
              </div>
            </div>
          </div>
          <div class="row-content bd-highlight">
            <div class="wrapper">
              <div class="item">
                <div class="content-img">
                  <img src="images/3.png" />
                </div>
                <div class="content-text">
                  <div class="title">供应商消息</div>
                  <div class="article">
                    <p>供供应应商消息供应商消息供应商消息应商消息供应商消息供应商消息应商消息供应商消息供应商消息商消息供应商消息供应商消息供应商消息供应商消息供应商消息供应商消息应商消ddsdfsdsdfsff息</p>
                  </div>
                </div>
                <div class="content-bigimg">
                  <img src="images/2.png" />
                </div>
              </div>
            </div>
            <div class="wrapper">
              <div class="item">
                <div class="content-img">
                  <img src="images/3.png" />
                </div>
                <div class="content-text">
                  <div class="title">供应商消息</div>
                  <div class="article">供供应商消息供应商消息供应商消息供应商消息供应商消息供应商消息供应商消息应商消息</div>
                </div>
                <div class="content-bigimg">
                  <img src="images/2.png" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

Index.propTypes = {
  files: PropTypes.array,
  onFileClick: PropTypes.func,
  onFileDelete: PropTypes.func,
  onSaveEdit: PropTypes.func,
}

export default Index
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
import Top from './indexContent/Top'
import One from './indexContent/One'
import Two from './indexContent/Two'
import Three from './indexContent/Three'
import Four from './indexContent/Four'
import { getParentNode } from '../utils/helper'
import "./css/JcjIndex.scss"
const Store = window.require('electron-store')
const userStore = new Store({ name: 'userStore' })
var baseUrl = "https://api-vbox.jpqapro.com"


//const navigate=useNavigate();
//navigate("/test");
const Index = ({ files, onFileClick, onSaveEdit, onFileDelete }) => {
  const dataParam = useLocation()
  console.log(dataParam.state)
  const [editStatus, setEditStatus] = useState(false)
  const [active, setActive] = useState(1)
  const [rows, setRows] = useState([])
  const [req, setReq] = useState({ pageNo: 0, pageSize: 10 })
  const [value, setValue] = useState('')
  const [top, setTop] = useState(0)
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
    switch (index) {
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
    const user = userStore.get('user')
    console.log(user)
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
        response.data.data.time = new Date().getTime()
        setRows(response.data.data.rows)
      }

    }).catch(err => {
      message.info(err.message)
    })
  }
  const showTop = () => {
    setTop(top == 1 ? 0 : 1)
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
  useEffect(() => {
    console.log("top------")
    console.log(top)
  }, [top])
  return (
    <div class="main1">
      <Top rows={rows} />
      <div class="row content-index">
        <div class="col-md-12 navigate-index">
          <div class="row-top">
            <div class="nav text">应用工具</div>

            <div class="nav actionsico">
              <div className={`${top}` == true ? 'arrow top' : 'arrow bottom'} onClick={() => { setTop(top == 1 ? 0 : 1) }}></div>
            </div>
          </div>
          <div className={`${top}` == true ? "show no" : "show"}>
            <div className={`${top}` == true ? "row-nav d-flex flex-row bd-highlight" : "row-nav d-flex flex-row bd-highlight show"}>
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
          </div>
          <div class="row-nav d-flex flex-row bd-highlight check">
            <div class="item">
              <div class="wrap-jcj">
                <div class="image">
                </div>
                <div class="text lineee" onClick={() => { selectItem(1) }}>价格提醒</div>
                <div className={`${active}` == 1 ? 'line active' : 'line'}></div>
              </div>
            </div>
            <div class="item">
              <div class="wrap-jcj">
                <div class="image">
                </div>
                <div class="text lineee" onClick={() => { selectItem(2) }} >特价商品</div>
                <div className={`${active}` == 2 ? 'line active' : 'line'}></div>
              </div>
            </div>
            <div class="item">
              <div class="wrap-jcj">
                <div class="image">
                </div>
                <div class="text lineee" onClick={() => { selectItem(3) }} >订单通知</div>
                <div className={`${active}` == 3 ? 'line active' : 'line'}></div>
              </div>
            </div>
            <div class="item">
              <div class="wrap-jcj">
                <div class="image">
                </div>
                <div class="text lineee" onClick={() => { selectItem(4) }} >其它</div>
                <div className={`${active}` == 4 ? 'line active' : 'line'}></div>
              </div>
            </div>
          </div>
          <div>
            {active == 1 && <One rows={rows} />}
            {active == 2 && <Two rows={rows} />}
            {active == 3 && <Three rows={rows} />}
            {active == 4 && <Four rows={rows} />}
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
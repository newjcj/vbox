import React, { useState, useEffect, useRef } from 'react'
import { BrowserRouter as Router, useNavigate, Routes, Link } from 'react-router-dom'
import axios from "axios"
import { DatePicker } from 'antd'
import { Button, message } from 'antd'
import 'antd/dist/antd.css'; // or 'antd/dist/antd.less'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { faMarkdown } from '@fortawesome/free-brands-svg-icons'
import PropTypes from 'prop-types'
import useKeyPress from '../hooks/useKeyPress'
import useContextMenu from '../hooks/useContextMenu'
import { getParentNode } from '../utils/helper'
import "./css/Login.scss"
var baseUrl = "https://api-vbox.jpqapro.com"
const { remote, ipcRenderer } = window.require('electron')
const Store = window.require('electron-store')
const userStore = new Store({ name: 'userStore' })
// 配置登录过期时间（秒）
//const EXPIRE_TIME = 3600*24*30
const EXPIRE_TIME = 3600

const Login = ({ files, onFileClick, onSaveEdit, onFileDelete }) => {
  const navigate = useNavigate()
  function login() {
    console.log(user)
    console.log("-----a", userStore.get('user'))
    let url = baseUrl + "/api/merchant/user/login"

    axios({
      url,
      data: { ...user },
      method: 'POST',
      responseType: 'stream',
      headers: { 'Cache-Control': 'no-cache' }
    }).then(response => {
      console.log(response)

      if (response.data.resultCode != "00000") {
        message.info(response.data.returnMsg)
      } else {
        response.data.data.time = new Date().getTime()
        ipcRenderer.send("save-user", response.data.data)
        //userStore.set('user',response.data.data)
        navigate("/index", { state: "aaaa" });
      }

    }).catch(err => {
      message.info(err.message)
    })
  }
  const [editStatus, setEditStatus] = useState(false)
  const [user, setUser] = useState({ nationCode: "+34", userName: "", password: "" })
  const [value, setValue] = useState('')
  let node = useRef(null)
  const enterPressed = useKeyPress(13)
  const escPressed = useKeyPress(27)
  const closeWindow = () => {
    remote.getCurrentWindow().close()
  }
  const closeSearch = (editItem) => {
    setEditStatus(false)
    setValue('')
    // if we are editing a newly created file, we should delete this file when pressing esc
    if (editItem.isNew) {
      onFileDelete(editItem.id)
    }
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
    if (editStatus) {
      node.current.focus()
    }
  }, [editStatus])
  useEffect(() => {
    let user = userStore.get('user')
    const timeStamp = new Date().getTime()
    if (user != undefined && user.token != undefined && user.time != undefined && ((timeStamp - user.time) < (EXPIRE_TIME * 1000))) {
      navigate("/index", { state: "aaaa" });
    }
  }, [])
  return (
    <div class="main">
      <div id="main-delete" onClick={() => { closeWindow() }}>
        x
      </div>
      <div class="logo">
        <img src="images/logo2x.png" />

      </div>
      <div class='row row-nav'>
        <form>
          <div class="form-group username">
            <label for='username'>账号名</label>
            <input type="text" id="username" value={user.userName} onChange={e => { setUser({ ...user, userName: e.target.value }) }} class="form-control" placeholder="请输入您的账号"></input>
          </div>
          <div class="form-group password">
            <label for="password">密码</label>
            <input type="password" id="passowrd" value={user.password} onChange={e => { setUser({ ...user, password: e.target.value }) }} class="form-control" placeholder="请输入密码"></input>
          </div>
        </form>
        <div class="col-m-12 logindiv">
          <button type="button" class="btn btn-primary login" onClick={login}>登录</button>
        </div>
        <div class="words">还没有账号，去注册。</div>
      </div>
    </div>
  )
}

Login.propTypes = {
  files: PropTypes.array,
  onFileClick: PropTypes.func,
  onFileDelete: PropTypes.func,
  onSaveEdit: PropTypes.func,
}
export default Login